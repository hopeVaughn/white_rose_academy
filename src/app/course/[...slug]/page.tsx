import MainVideoSummary from '@/components/MainVideoSummary';
import CourseSideBar from '@/components/CourseSideBar';
import QuizCards from '@/components/QuizCards';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import React from 'react';

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const [courseId, unitIndexParam, chapterIndexParam] = slug;
  console.log("COURSE ID FROM /course/[...slug]/page.tsx", slug);

  const course = await prisma.course.findUnique({
    where: { id: courseId },
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

  console.log("COURSE FROM /course/[...slug]/page.tsx", course?.units[0].chapters[0].questions);

  if (!course) {
    return redirect('/gallery');
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
  return (
    <main>
      <CourseSideBar course={course} currentChapterid={chapter.id} />
      <section>
        <div className="ml-[400px] px-8">
          <div className="flex">
            <MainVideoSummary
              chapter={chapter}
              chapterIndex={chapterIndex}
              unit={unit}
              unitIndex={unitIndex}
            />
            <QuizCards chapter={chapter} />
          </div>
        </div>
      </section>

    </main>
  );

};

export default CoursePage;