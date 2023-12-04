'use client';
import React from 'react';
import { Button } from './ui/button';
import axios from 'axios';

type Props = {
  isEnrolled: boolean;
};

const SubscriptionButton = ({ isEnrolled }: Props) => {
  const [loading, setLoading] = React.useState(false);
  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await axios('/api/stripe');
      window.location.href = response.data.url;
    } catch (error) {
      console.error("ERROR IN SUBSCRIPTION BUTTON COMPONENT", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      className='mt-4'
      disabled={loading}
      onClick={handleSubscribe}
    >
      {isEnrolled ? "Manage Subscription" : "Enroll Now"}
    </Button>
  );
};

export default SubscriptionButton;