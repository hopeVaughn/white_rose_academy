import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unslpash";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

type Chapter = {
  chapter_title: string;
  youtube_search_query: string;
};

type Unit = {
  unit_title: string;
  chapters: Chapter[];
};

export async function POST(req: Request, res: Response) {
  try {
    const session = await getAuthSession();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json();
    const { title, units } = createChapterSchema.parse(body);

    const systemPromptForUnits = `You are an advanced AI teacher capable of generating course details in JSON format. Generate relevant chapters and their titles for a course titled '${title}', consisting of ${units.length} units. Each unit should be a JSON object containing the unit title and an array of chapters, each with a youtube_search_query and a chapter_title.`;

    const userPromptForUnits = new Array(units.length).fill(
      `Generate a course about ${title}. Provide chapters for each unit with detailed youtube search queries for informative, relevant, and educational videos.`
    );

    let outputUnitResponse = await strict_output(systemPromptForUnits, userPromptForUnits);
    let outputUnit: Unit[] = outputUnitResponse && outputUnitResponse.units ? outputUnitResponse.units : [];

    const systemPromptForImage = `You are an AI capable of retrieving the most appropriate and relevant image for a course titled '${title}'. Output the image search term in JSON format for use with the Unsplash API.`;

    const userPromptForImage = `Provide an image search term for the course '${title}'.`;

    const imageSearchResponse = await strict_output(systemPromptForImage, userPromptForImage);
    const imageSearchTerm = imageSearchResponse ? imageSearchResponse.image_search_term : '';

    const courseImage = await getUnsplashImage(imageSearchTerm);
    console.log(outputUnit);

    const course = await prisma.course.create({
      data: {
        name: title,
        image: courseImage,
        user: { connect: { id: userId } },
      },
    });
    for (const unitResponse of outputUnit) {
      if (!unitResponse.unit_title || typeof unitResponse.unit_title !== 'string') {
        console.error('Missing or invalid title in unit:', unitResponse);
        continue;
      }

      const prismaUnit = await prisma.unit.create({
        data: {
          name: unitResponse.unit_title, // Use 'unit_title' from the response
          courseId: course.id,
        },
      });

      await prisma.chapter.createMany({
        data: unitResponse.chapters.map((chapter: Chapter) => ({
          name: chapter.chapter_title,
          youtubeSearchQuery: chapter.youtube_search_query,
          unitId: prismaUnit.id,
        })),
      });
    }

    return NextResponse.json({ course_id: course.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid body", { status: 400 });
    } else {
      console.error(error);
      return new NextResponse("An unexpected error occurred", { status: 500 });
    }
  }
}
