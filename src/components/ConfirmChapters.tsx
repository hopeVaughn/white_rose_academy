'use client';
import React from 'react';
import Link from 'next/link';
import useCourseStore from '@/lib/courseStore';
import { Course, Unit, Chapter } from '@prisma/client';
import ChapterCard, { ChapterCardHandler } from './ChapterCard';
import { Separator } from './ui/separator';
import { Button, buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  course: Course & {
    userId: string;
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const ConfirmChapters = ({ course }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
  const { setCourse, course: storedCourse } = useCourseStore((state) => ({
    setCourse: state.setCourse,
    course: state.course
  }));

  React.useEffect(() => {
    setCourse(course);
  }, [course, setCourse]);

  // Debug output to console
  React.useEffect(() => {
    console.log('Stored course data:', storedCourse);
  }, [storedCourse]);

  course.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      chapterRefs[chapter.id] = React.useRef(null);
    });
  });
  const [completedChapterIds, setCompletedChapterIds] = React.useState<Set<String>>(new Set());
  const totalChaptersCount = React.useMemo(() => {
    return course.units.reduce((acc, cur) => {
      return acc + cur.chapters.length;
    }, 0);
  }, [course.units]);
  return (
    <div className='w-full mt-4'>
      {course.units.map((unit, unitIndex) => {
        return (
          <div key={unit.id} className="mt-5">
            <h2 className='text-sm uppercase text-secondary-foreground/60'>
              Unit {unitIndex + 1}
            </h2>
            <h3 className='text-2xl font-bold'>{unit.name}</h3>
            <div className="mt-3">
              {unit.chapters.map((chapter, chapterIndex) => {
                return (
                  <ChapterCard
                    completedChapterIds={completedChapterIds}
                    setCompletedChapterIds={setCompletedChapterIds}
                    ref={chapterRefs[chapter.id]}
                    unitId={unit.id}
                    key={chapter.id}
                    chapter={chapter}
                    chapterIndex={chapterIndex} />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center mt-4">
        <Separator className='flex-[1]' />
        <div className="flex items-center mx-4">
          <Link href='create' className={buttonVariants({
            variant: 'secondary',
          })}>
            <ChevronLeft className='w-4 h-4 mr-2' strokeWidth={4} />
            Back</Link>
          {
            totalChaptersCount === completedChapterIds.size ? (
              <Link
                className={buttonVariants({
                  className: "ml-4 font-semibold",
                })}
                href={`/course/${course.id}/0/0`}
              >Save & Continue
                <ChevronRight className='w-4 h-4 ml-2' />
              </Link>
            ) : (
              <Button
                type="button"
                className="ml-4 font-semibold"
                disabled={loading}
                onClick={() => {
                  setLoading(true);
                  Object.values(chapterRefs).forEach((ref) => {
                    ref.current?.triggerLoad();
                  });
                }}
              >
                Generate
                <ChevronRight className="w-4 h-4 ml-2" strokeWidth={4} />
              </Button>
            )
          }

        </div>
        <Separator className='flex-[1]' />
      </div>
    </div>
  );
};

export default ConfirmChapters;