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
    <main className="flex flex-col flex-1 mt-16 md:mx-4 lg:mx-8 ">
      {/* Sidebar - Hidden on desktop view */}
      <CourseSideBar course={course} currentChapterid={chapter?.id} />

      {/* Main content area */}
      <section className="flex flex-col flex-1 min-h-[calc(100vh-4rem)] overflow-auto">
        {/* Video and summary */}
        <div className="p-4">
          <MainVideoSummary
            chapter={chapter}
            chapterIndex={chapterIndex}
            unit={unit}
            unitIndex={unitIndex}
          />
        </div>

        {/* Quiz Cards */}
        <QuizCards chapter={chapter} />
        {/* Navigation links */}
        <footer className="mt-auto p-4 lg:px-8 bottom-0">
          <div className='h-[1px] my-4 bg-gray-500' />
          <div className="flex justify-between space-x-4">
            {/* Previous Chapter Link */}
            {prevChapter && (
              <Link href={`/course/${courseId}/${unitIndex}/${chapterIndex - 1}`} className="flex items-center">
                <ChevronLeft className="w-6 h-6 mr-1" />
                <span className="text-xl font-bold">{prevChapter.name}</span>
              </Link>
            )}
            {/* Next Chapter Link */}
            {nextChapter && (
              <Link href={`/course/${courseId}/${unitIndex}/${chapterIndex + 1}`} className="flex items-center">
                <span className="text-xl font-bold">{nextChapter.name}</span>
                <ChevronRight className="w-6 h-6 ml-1" />
              </Link>
            )}
          </div>
        </footer>
      </section>
    </main>
  );

};

export default CoursePage;