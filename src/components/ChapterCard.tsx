'use client';
import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};
const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(({ chapter, chapterIndex }, ref) => {

  const [success, setSuccess] = React.useState<boolean | null>(null);
  const { mutate: getChapterInfo, isPending } = useMutation({
    mutationFn: async () => {
      const response = await axios.post('/api/chapter/getInfo', { chapterId: chapter.id });
      return response.data;
    }
  });
  React.useImperativeHandle(ref, () => ({
    async triggerLoad() {
      getChapterInfo(undefined, {
        onSuccess: (data) => {
          console.log("WE DID IT!");

        },
        onError: () => {
          setSuccess(false);
        }
      });
    }
  }));
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
});

ChapterCard.displayName = 'ChapterCard';
export default ChapterCard;