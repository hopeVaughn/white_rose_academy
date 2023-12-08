import { Chapter, Course, Unit } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  course: Course & {
    units: (Unit & {
      chapters: Chapter[];
    })[];
  };
};

const GalleryCourseCard = ({ course }: Props) => {
  console.log("GalleryCourseCard: course: ", course);

  return (
    <>
      <div className='border rounded-lg border-secondary overflow-hidden min-h-full'>
        <div className="relative w-full h-60"> {/* Use Tailwind's h-60 for a fixed height */}
          <Link
            href={`/course/${course.id}/0/0`}
          >
            <Image
              src={course.image || ''}
              className="object-cover w-full h-full"
              layout="fill"
              alt='Picture of the course'
            />
            <span className='absolute px-2 py-1 text-white rounded-md bg-black/60 w-fit bottom-4 left-4'>
              {course.name}
            </span>
          </Link>
        </div>
        <div className="p-4">
          <h4 className='text-sm text-secondary-foreground/60'>Units</h4>
          <div className="space-y-1">
            {course.units.map((unit, unitIndex) => {
              return (
                <Link
                  href={`/course/${course.id}/${unitIndex}/0`}
                  key={unit.id}
                  className='block underline'
                >
                  Unit {unitIndex + 1}: {unit.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryCourseCard;