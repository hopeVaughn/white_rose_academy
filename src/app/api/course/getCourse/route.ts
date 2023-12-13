// /api/course/getCourse/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request, res: Response) {
  try {
    // Directly get courseId from query parameters
    const queryParams = new URL(req.url).searchParams;
    const courseId = queryParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        units: {
          include: {
            chapters: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ success: false, error: "Course not Found" }, { status: 404 });
    }

    // Return the found course
    return NextResponse.json({ success: true, course });
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in /api/course/getCourse:", error);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
