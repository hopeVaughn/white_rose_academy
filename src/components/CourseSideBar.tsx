'use client';
import { cn } from '@/lib/utils';
import { Chapter, Course, Unit } from '@prisma/client';
import Link from 'next/link';
import React, { useState } from 'react';
import { Separator } from './ui/separator';
import { X, ChevronRight } from 'lucide-react';

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
  currentChapterid: string;
};

const CourseSideBar = ({ course, currentChapterid }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle the closing and opening of the sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Course Sidebar */}
      <div
        dir="rtl" // Right to left direction
        className={cn(
          'w-[400px] fixed top-1/2 left-0 transform -translate-y-1/2 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          'h-[70%] my-auto rounded-r-3xl bg-secondary p-6 overflow-y-auto z-10'
        )}
      >
        <div dir="ltr"> {/* Left to right direction for the content */}
          {/* Close button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-5 right-5 p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-8 h-8" />
          </button>
          <h1 className="text-4xl font-bold pt-10">{course.name}</h1>
          {course.units.map((unit, unitIndex) => (
            <div key={unit.id} className="mt-4">
              <h2 className='text-sm uppercase text-secondary-foreground/60'>Unit {unitIndex + 1}</h2>
              <h2 className="text-1xl font-semi-bold">{unit.name}</h2>
              {unit.chapters.map((chapter, chapterIndex) => (
                <div key={chapter.id}>
                  <Link
                    href={`/course/${course.id}/${unitIndex}/${chapterIndex}`}
                    className={cn('text-secondary-foreground/60', {
                      "text-green-500 font-bold": chapter.id === currentChapterid,
                    })}
                  >
                    {chapter.name}
                  </Link>
                </div>
              ))}
              <Separator className='mt-2 text-gray-500 bg-gray-500' />
            </div>
          ))}
        </div>

      </div>
      {/* Tab to reopen sidebar */}
      <div className={`fixed top-1/2 left-0 transform -translate-y-1/2 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ transitionDelay: isOpen ? '0ms' : '300ms' }}>
        <button onClick={toggleSidebar} className="p-2 bg-secondary rounded-r-full">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default CourseSideBar;

