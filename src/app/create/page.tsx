import { getAuthSession } from '@/lib/auth';
import React from 'react';
import { redirect } from 'next/navigation';
import { InfoIcon } from 'lucide-react';
import CreateCourseForm from '@/components/CreateCourseForm';
import { checkSubscription } from '@/lib/subscription';
type Props = {};

const CreatePage = async (props: Props) => {
  const session = await getAuthSession();

  if (!session?.user) {
    return redirect('/');
  }
  const isEnrolled = await checkSubscription();
  return (
    <div className="flex flex-col items-start max-w-xl px-8 mx-auto my-16 sm:px-0">
      <h1 className="self-center text-3xl font-bold text-center sm:text-6xl">White Rose Academy</h1>
      <div className="flex p-4 mt-5 border-none bg-secondary">
        <InfoIcon className='w-20 h-20 mr-3 text-blue-400' />
        <section>
          Choose a subject to study then provide a list of units. These units should be the specifics you want to dig further into relevant to the subject you&apos;ve chosen. From there, our AI will generate a learning path custom built for you!
        </section>
      </div>
      <CreateCourseForm isEnrolled={isEnrolled} />
    </div>
  );
};

export default CreatePage;