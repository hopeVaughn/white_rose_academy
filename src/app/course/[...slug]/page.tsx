import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';

import React from 'react';

type Props = {
  params: {
    slug: string[];
  };
};

const CoursePage = async ({ params: { slug } }: Props) => {
  const [courseId, unitIndexParam, chapterIndexParam] = slug as [string, string, string];
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      units: {
        include: {
          chapters: true
        }
      }
    }
  });
  if (!course) {
    return redirect('/gallery');
  }
  let unitIndex = parseInt(unitIndexParam);
  let chapterIndex = parseInt(chapterIndexParam);

  const unit = course.units[unitIndex];

  if (!unit) {
    return redirect(`/gallery`);
  }

  return (
    <pre>{JSON.stringify(course, null, 2)}</pre>
  );
};

export default CoursePage;