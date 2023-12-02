// /api/chapter/getInto

import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import {
  getQuestionsFromTranscript,
  getTranscript,
  searchYoutube,
} from "@/lib/youtube";
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
    let maxLength = 2000;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");

    const systemPromptForSummary = `You are an AI capable of summarizing a YouTube transcript in JSON format. Summarize the following transcript in 250 words or less, avoiding mention of sponsors or unrelated topics.`;
    // Get summary from AI
    const summary = await strict_output(systemPromptForSummary, transcript);

    const questions = await getQuestionsFromTranscript(
      transcript,
      chapter.name
    );
    console.log("QUESTIONS", questions);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        videoId: videoId,
        summary: summary,
      },
    });

    await prisma.question.createMany({
      data: questions.map((question) => {
        let options = [
          question.answer,
          question.option1,
          question.option2,
          question.option3,
        ];
        options = options.sort(() => Math.random() - 0.5);
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          chapterId: chapterId,
        };
      }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid body",
        },
        { status: 400 }
      );
    } else {
      console.error("Error in /api/chapter/getInfo:", error);
      return NextResponse.json({
        success: false,
        error: (error as Error).message || "An unknown error occurred",
      }, { status: 500 });
    }
  }
}