// src/app/api/chapter/editInfo/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { editChapterSchema } from "@/validators/course";

export async function PATCH(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { chapterId, updatedData } = editChapterSchema.parse(body);

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: updatedData,
    });

    return NextResponse.json({ success: true, updatedChapter });
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in /api/chapter/editInfo:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}