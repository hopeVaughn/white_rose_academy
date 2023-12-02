import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";
import { getUnsplashImage } from "@/lib/unslpash";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";

// Assuming the structure of the Chapter type remains the same.
type Chapter = {
  chapter_title: string;
  youtube_search_query: string;
};

// Assuming the structure of the Unit type remains the same.
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

    const systemPromptForUnits = `You are an advanced AI teacher capable of generating course details in JSON format. Generate relevant chapters and their titles for a course titled '${title}'. Each unit should be a JSON object containing the unit title and an array of chapters, each with a youtube_search_query and a chapter_title.

    Example Format:
    {
      "units": [
        {
          "unit_title": "Introduction to Sewing",
          "chapters": [
            {
              "chapter_title": "Basics of Sewing Machines",
              "youtube_search_query": "Sewing machine basics for beginners"
            },
            {
              "chapter_title": "Fundamental Sewing Techniques",
              "youtube_search_query": "Basic sewing techniques tutorial"
            }
          ]
        },
        {
          "unit_title": "Advanced Sewing Projects",
          "chapters": [
            // More chapters here...
          ]
        }
      ]
    }`;

    const userPromptForUnits = `Generate a course about ${title}. Provide chapters for each unit with detailed youtube search queries for informative, relevant, and educational videos.`;


    const outputResponse = await strict_output(systemPromptForUnits, userPromptForUnits);

    if (!outputResponse || !Array.isArray(outputResponse) || outputResponse.length === 0) {
      throw new Error('Invalid response format from GPT function');
    }

    const outputUnits = outputResponse[0].units || [];

    const systemPromptForImage = `You are an AI capable of retrieving the most appropriate and relevant image for a course titled '${title}'. Output the image search term in JSON format for use with the Unsplash API.`;
    const userPromptForImage = `Provide an image search term for the course '${title}'.`;

    const imageSearchResponse = await strict_output(systemPromptForImage, userPromptForImage);
    const imageSearchTerm = imageSearchResponse ? imageSearchResponse.search_term : '';
    const courseImage = await getUnsplashImage(imageSearchTerm);

    const course = await prisma.course.create({
      data: {
        name: title,
        image: courseImage,
        user: { connect: { id: session.user.id } },
      },
    });

    for (const unit of outputUnits) {
      const prismaUnit = await prisma.unit.create({
        data: {
          name: unit.unit_title,
          courseId: course.id,
        },
      });

      if (unit.chapters && Array.isArray(unit.chapters)) {
        await prisma.chapter.createMany({
          data: unit.chapters.map((chapter) => ({
            name: chapter.chapter_title,
            youtubeSearchQuery: chapter.youtube_search_query,
            unitId: prismaUnit.id,
          })),
        });
      }
    }


    return NextResponse.json({ course_id: course.id });
  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("invalid body", { status: 400 });
    }
    console.error("Error in POST:", error);
    return new NextResponse("An unexpected error occurred", { status: 500 });
  }
}