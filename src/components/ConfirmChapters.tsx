'use client';
import React from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import useCourseStore, { ExtendedCourse } from '@/lib/courseStore';
import ChapterCard, { ChapterCardHandler } from './ChapterCard';
import { Separator } from './ui/separator';
import { Button, buttonVariants } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CardSkeleton } from '@/components/ui/skeletons';

type Props = {
  courseId: string;
};

type ChapterRefs = Record<string, React.RefObject<ChapterCardHandler>>;

const ConfirmChapters = ({ courseId }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const [completedChapterIds, setCompletedChapterIds] = React.useState<Set<String>>(new Set());
  const { course: storedCourse, setCourse } = useCourseStore();

  // Use `useQuery` to fetch course data
  const {
    data: courseData,
    isPending,
    isSuccess,
    isError,
    error } = useQuery<ExtendedCourse, Error>({
      queryKey: ['course', courseId],
      queryFn: () => axios.get(`/api/course/getCourse?courseId=${courseId}`).then(res => res.data.course),
    },
    );
  const course = courseData;
  const chapterRefs = React.useRef<ChapterRefs>({});
  console.log('courseData FROM CONFIRMCHAPTERS:', courseData);

  React.useEffect(() => {
    if (course) {
      course.units.forEach((unit) => {
        unit.chapters.forEach((chapter) => {
          const chapterIdKey = String(chapter.id);
          if (!chapterRefs.current[chapterIdKey]) {
            chapterRefs.current[chapterIdKey] = React.createRef();
          }
        });
      });
    }
  }, [course]);


  const totalChaptersCount = React.useMemo(() => {
    if (!course || !course.units) {
      return 0; // Return 0 if course or course.units is undefined
    }
    return course.units.reduce((acc, unit) => acc + unit.chapters.length, 0);
  }, [course?.units]); // Depend on course.units


  if (isPending) {
    return <CardSkeleton />; // Show loading state
  }

  if (isError) {
    return <div>Error: {error?.message}</div>; // Show error state
  }


  return (
    <div className='w-full mt-4'>
      {isSuccess && course?.units.map((unit, unitIndex) => {
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
                    ref={chapterRefs.current[String(chapter.id)]}
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