'use client';
import React from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import useCourseStore, { ExtendedCourse } from '@/lib/courseStore';
import { Course, Unit, Chapter } from '@prisma/client';
import ChapterCard, { ChapterCardHandler } from './ChapterCard';
import { Separator } from './ui/separator';
import { Button, buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeletons';
type Props = {
  courseId: string;
};

const ConfirmChapters = ({ courseId }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const chapterRefs: Record<string, React.RefObject<ChapterCardHandler>> = {};
  const { course: storedCourse, setCourse } = useCourseStore();

  // Use `useQuery` to fetch course data
  const { data: courseData, isPending, isSuccess, isError } = useQuery<ExtendedCourse, Error>({
    queryKey: ['course', courseId],
    queryFn: () => axios.get(`/api/course/getCourse?courseId=${courseId}`).then(res => res.data.course),
  });
  const course = isSuccess ? courseData : storedCourse; // Either our DB or our Zustand store
  console.log('courseData FROM CONFIRMCHAPTERS:', courseData);
  console.log('storedCourse FROM CONFIRMCHAPTERS:', storedCourse);

  console.log('COURSE FROM CONFIRMCHAPTERS:', course);

  course!.units.forEach((unit) => {
    unit.chapters.forEach((chapter) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      chapterRefs[chapter.id] = React.useRef(null);
    });
  });
  const [completedChapterIds, setCompletedChapterIds] = React.useState<Set<String>>(new Set());
  const totalChaptersCount = React.useMemo(() => {
    return course!.units.reduce((acc, cur) => {
      return acc + cur.chapters.length;
    }, 0);
  }, [course!.units]);


  return (
    <div className='w-full mt-4'>
      {course!.units.map((unit, unitIndex) => {
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
                    chapterIndex={chapterIndex}
                  />
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
                href={`/course/${course!.id}/0/0`}
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