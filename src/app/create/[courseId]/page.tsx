import ConfirmChapters from '@/components/ConfirmChapters';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { InfoIcon } from 'lucide-react';
import { redirect } from 'next/navigation';
import React from 'react';
type Props = {
  params: {
    courseId: string;
  };
};

const CreateChapters = async ({ params: { courseId } }: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect('/');
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      userId: session.user.id, // Ensure the course belongs to the logged-in user
    },
    include: {
      units: {
        include: {
          chapters: true,
        },
      },
    },
  });

  if (!course) {
    return redirect('/create');
  }
  return (
    <div className="flex flex-col items-start max-w-xl mx-auto my-16 px-4 sm:px-8">
      <h5 className='text-sm uppercase text-secondary-foreground/60 mt-4 mb-2'>
        Course Name
      </h5>
      <h1 className='text-5xl font-bold'>
        {course?.name}
      </h1>
      <div className="flex p-4 mt-5 border-none bg-secondary items-center">
        <InfoIcon className='w-12 h-12 mr-3 text-blue-400' />
        <div className="">Please have a look at the chapters we&apos;ve generated for each unit and make sure they interest you and are appropriate for your learning goals</div>
      </div>
      <ConfirmChapters course={course} />
    </div>
  );
};

export default CreateChapters;