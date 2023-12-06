import MainVideoSummary from '@/components/MainVideoSummary';
import CourseSideBar from '@/components/CourseSideBar';
import QuizCards from '@/components/QuizCards';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getAuthSession } from '@/lib/auth';

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  const [courseId, unitIndexParam, chapterIndexParam] = slug;
  console.log("COURSE ID FROM /course/[...slug]/page.tsx", slug);

  if (!userId) {
    // handle case where user is not logged in
    return redirect('/gallery');
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      userId: userId, // Ensure the course belongs to the authenticated user
    },
    include: {
      units: {
        include: {
          chapters: {
            include: {
              questions: true
            }
          }
        }
      }
    }
  });

  console.log("COURSE FROM /course/[...slug]/page.tsx", course?.units);

  if (!course) {
    // Handle unauthorized access
    return redirect('/unauthorized'); // Redirect to an unauthorized access page or similar
  }
  let unitIndex = parseInt(unitIndexParam);
  let chapterIndex = parseInt(chapterIndexParam);

  const unit = course.units[unitIndex];

  if (!unit) {
    return redirect(`/gallery`);
  }
  const chapter = unit.chapters[chapterIndex];
  if (!chapter) {
    return redirect(`/gallery`);
  }
  const nextChapter = unit.chapters[chapterIndex + 1];
  const prevChapter = unit.chapters[chapterIndex - 1];
  return (
    <main className='grid grid-cols-4'>
      {/* Empty column on the left */}
      <div className="col-span-1"></div>

      {/* Sidebar - Hidden on desktop view */}
      <CourseSideBar course={course} currentChapterid={chapter.id} />

      {/* Video and Summary */}
      <div className="col-span-2">
        <div className="px-8">
          <div className="flex justify-between items-center">
            <MainVideoSummary
              chapter={chapter}
              chapterIndex={chapterIndex}
              unit={unit}
              unitIndex={unitIndex}
            />
            <QuizCards chapter={chapter} />
          </div>
          <div className='h-[1px] mt-4 text-gray-500 bg-gray-500' />
          <div className="flex justify-between">
            {prevChapter && (
              <Link
                href={`/course/${courseId}/${unitIndex}/${chapterIndex - 1}`}
                className="flex items-center mt-4">
                <div className="flex items-center">
                  <ChevronLeft className="w-6 h-6 mr-1" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-secondary-foreground/60 ">
                      Previous
                    </span>
                    <span className="text-xl font-bold">
                      {prevChapter.name}
                    </span>
                  </div>
                </div>
              </Link>
            )}
            {nextChapter && (
              <Link
                href={`/course/${courseId}/${unitIndex}/${chapterIndex + 1}`}
                className="flex items-center mt-4">
                <div className="flex items-center">
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-secondary-foreground/60 ">
                      Next
                    </span>
                    <span className="text-xl font-bold">
                      {nextChapter.name}
                    </span>
                  </div>
                  <ChevronRight className="w-6 h-6 ml-1" />
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Empty column on the right */}
      <div className="col-span-1"></div>
    </main>
  );


};

export default CoursePage;