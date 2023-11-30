'use client';
import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import React from 'react';
import { Separator } from './ui/separator';
import Link from 'next/link';
import { buttonVariants } from './ui/button';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
};

const ChapterCard = ({ chapter, chapterIndex }: Props) => {
  const [success, setSuccess] = React.useState<boolean | null>(null);
  return (
    <div
      key={chapter.id}
      className={
        cn(
          'px-4 py-2 mt-2 rounded flex justify-between',
          {
            'bg-secondary': success === null,
            'bg-red-500': success === false,
            'bg-green-500': success === true,
          }
        )
      }
    >
      <h5>Chapter {chapterIndex + 1}: {chapter.name}</h5>
    </div>
  );
};

export default ChapterCard;