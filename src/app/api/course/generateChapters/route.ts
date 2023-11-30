// /api/course/generateChapters

import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unslpash";
import { prisma } from "@/lib/db";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { title, units } = createChapterSchema.parse(body);

    type outputUnit = {
      title: string;
      chapters: {
        youtube_search_query: string;
        chapter_title: string;
      }[];
    }[];

    let output_unit: outputUnit = await strict_output(
      "You are an advanced AI teacher that curates courses for students. You are to generate relevant chapters and their titles, given the course title and units. You are to generate a list of chapters for each unit. You are to find the most relevant youtube search query for each chapter.",
      new Array(units.length).fill(
        `As the course curator and teacher, please generate a course about ${title}. The students will need chapters for each of the units. For each chapter please provide a detailed youtube search query that can be used to find an informative, relevant, and educational video for each chapter. Each query should give the appropriate educational, relevant, and informative video in youtube.`
      ),
      {
        title: 'title of the unit',
        chapters: 'an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object'
      },
    );

    const imageSearchTerm = await strict_output(
      'you are an AI capable of retrieving the most appropriate and relevant image for a course',
      `Please provide an appropriate image search term for the course ${title}. This search term will be used with the unsplash API. Please ensure that the search term will return the best results`,
      {
        image_search_term: 'appropriate image search term for the course'
      }
    );

    const courseImage = await getUnsplashImage(imageSearchTerm.image_search_term);

    const course = await prisma.course.create({
      data: {
        name: title,
        image: courseImage,
      }
    });

    for (const unit of output_unit) {
      const title = unit.title;
      const prismaUnit = await prisma.unit.create({
        data: {
          name: title,
          courseId: course.id,
        },
      });
      await prisma.chapter.createMany({
        data: unit.chapters.map((chapter) => {
          return {
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          };
        }),
      });
    }
    return NextResponse.json({ course_id: course.id });

  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid body", { status: 400 });
    }
  }
}
