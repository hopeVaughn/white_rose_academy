import GalleryCourseCard from '@/components/GalleryCourseCard';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';

type Props = {};

const GalleryPage = async (props: Props) => {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    // handle case where user is not logged in
    return redirect('/');
  }

  const courses = await prisma.course.findMany({
    where: { userId: userId }, // Fetch courses that belong to the logged-in user
    include: {
      units: {
        include: {
          chapters: true
        }
      }
    }
  });
  const numCols = courses.length >= 4 ? 4 : courses.length;
  const gridClasses = cn(
    'grid gap-4 pt-20 mx-auto max-w-7xl',
    {
      'grid-cols-1': numCols === 1,
      'sm:grid-cols-2': numCols === 2,
      'md:grid-cols-3': numCols === 3,
      'lg:grid-cols-4': numCols === 4,
      'justify-center': courses.length < 4,
    }
  );

  return (
    <div className='py-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16'>
      {/* Apply justify-center to the grid container */}
      <div className={gridClasses} style={{ justifyContent: courses.length < 4 ? 'center' : '' }}>
        {courses.map((course) => (
          <div key={course.id} className="min-w-0">
            <GalleryCourseCard course={course} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;