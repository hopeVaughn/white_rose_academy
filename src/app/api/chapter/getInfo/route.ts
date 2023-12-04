// /api/chapter/getInto
import { prisma } from "@/lib/db";
import { strict_output } from "@/lib/gpt";
import { getQuestionsFromTranscript, getTranscript, searchYoutube } from "@/lib/youtube";
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
      where: { id: chapterId },
    });
    if (!chapter) {
      return NextResponse.json({ success: false, error: "Chapter not found" }, { status: 404 });
    }

    const videoId = await searchYoutube(chapter.youtubeSearchQuery);
    let transcript = await getTranscript(videoId);
    let maxLength = 2000;
    transcript = transcript.split(" ").slice(0, maxLength).join(" ");

    const systemPromptForSummary = `You are an AI capable of summarizing a YouTube transcript in JSON format. Provide a concise summary of the following transcript in 350 words or less. Example Format: {"summary": "Concise summary of the video content."}`;

    // Get summary from AI
    const summaryResponse = await strict_output(systemPromptForSummary, transcript);
    const summary = summaryResponse && summaryResponse[0] ? summaryResponse[0].summary || "" : ""; // Ensure we get the summary string

    const questions = await getQuestionsFromTranscript(transcript, chapter.name);

    await prisma.chapter.update({
      where: { id: chapterId },
      data: { videoId, summary },
    });

    if (questions.length > 0) {
      await prisma.question.createMany({
        data: questions.map((question) => ({
          chapterId,
          question: question.question,
          answer: question.answer,
          options: JSON.stringify([question.answer, question.option1, question.option2, question.option3].sort(() => Math.random() - 0.5)),
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in /api/chapter/getInfo:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

