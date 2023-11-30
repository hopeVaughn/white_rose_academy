'use client';
import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import React from 'react';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
};

const ChapterCard = ({ chapter, chapterIndex }: Props) => {
  const [success, setSuccess] = React.useState(false);
  return (
    <div
      key={chapter.id}
      className={
        cn('px-4 py-2 mt-2 rounded flex justify-between', 'bg-secondary')
      }
    >
      <h5>Chapter {chapterIndex + 1}: {chapter.name}</h5>
    </div>
  );
};

export default ChapterCard;