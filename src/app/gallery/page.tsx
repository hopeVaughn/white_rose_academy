import GalleryCourseCard from '@/components/GalleryCourseCard';
import { prisma } from '@/lib/db';
import { getAuthSession } from '@/lib/auth';
import React from 'react';

type Props = {};

const GalleryPage = async (props: Props) => {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    // handle case where user is not logged in
    return <div className="">Please log in to view your courses</div>;
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

  return (
    <div className='py-8 mx-auto max-w-7xl'>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-20">
        {courses.map((course) => {
          return <GalleryCourseCard course={course} key={course.id} />;
        })}
      </div>
    </div>
  );
};

export default GalleryPage;