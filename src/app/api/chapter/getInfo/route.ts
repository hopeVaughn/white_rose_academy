// /api/chapter/getInfo

import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getTranscript, searchYoutube } from "@/lib/youtube";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
  chapterId: z.string(),
});

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { chapterId } = bodyParser.parse(body);
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });
    if (!chapter) {
      return NextResponse.json(
        {
          success: false,
          error: "Chapter not found",
        },
        { status: 404 }
      );
    }
    const videoId = await searchYoutube(chapter.youtubeSearchQuery);

    let transcript = await getTranscript(videoId);
    let maxLength = 700;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");
    const { summary }: { summary: string; } = await strict_output(
      "You are an AI capable of summarizing a youtube transcript",
      "summaries in 250 words or less and do not talk of the sponsors or anything unrelated to the main topic, also do not introduce what the summary is about.\n" +
      transcript,
      { summary: "summary of the transcript" }
    );
    return NextResponse.json({ videoId, transcript, summary });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: error.errors || "Invalid request body"
      }, { status: 400 });
    }
    else {
      return NextResponse.json({
        success: false,
        error: "Unknown error occurred while parsing the chapter/getInfo request body"
      }, {
        status: 500
      });
    }
  }
}