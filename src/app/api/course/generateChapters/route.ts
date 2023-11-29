// /api/course/generateChapters

import { NextResponse } from "next/server";
import { createChapterSchema } from "@/validators/course";
import { ZodError } from "zod";
import { strict_output } from "@/lib/gpt";

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
    };

    let ouput_unit: outputUnit = await strict_output(
      "You are an advanced AI teacher that curates courses for students. You are to generate relevant chapters and their titles, given the course title and units. You are to generate a list of chapters for each unit. You are to find the most relevant youtube search query for each chapter.",
      new Array(units.length).fill(
        `As the course curator and teacher, please generate a course about ${title}. The students will need chapters for each of the units. For each chapter please provide a detailed youtube search query that can be used to find an informative, relevant, and educational video for each chapter. Each query should give the appropriate educational, relevant, and informative video in youtube.`
      ),
      {
        title: 'title of the unit',
        chapters: 'an array of chapters, each chapter should have a youtube_search_query and a chapter_title key in the JSON object'
      },
    );
    console.log(ouput_unit);
    return NextResponse.json(ouput_unit);

  } catch (error) {
    if (error instanceof ZodError) {
      return new NextResponse("Invalid body", { status: 400 });
    }
  }
}
