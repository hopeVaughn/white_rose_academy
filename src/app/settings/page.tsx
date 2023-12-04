import SubscriptionButton from '@/components/SubscriptionButton';
import { checkSubscription } from '@/lib/subscription';
import React from 'react';

type Props = {};

const SettingsPage = async (props: Props) => {
  const isEnrolled = await checkSubscription();

  return (
    <div className='py-8 mx-auto max-w-7xl'>
      <h1 className='text-3xl font-bold'>
        {isEnrolled ? (
          <p className="text-xl text-secondary-foreground/60" >
            You are currently enrolled!
          </p>
        ) : (
          <p className="text-xl text-secondary-foreground/60">
            You are not currently enrolled.
          </p>
        )}
        <SubscriptionButton isEnrolled={isEnrolled} />
      </h1>
    </div>
  );
};

export default SettingsPage;