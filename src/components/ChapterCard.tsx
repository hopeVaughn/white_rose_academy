'use client';
import { cn } from '@/lib/utils';
import { Chapter } from '@prisma/client';
import React from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useToast } from './ui/use-toast';
import { Loader2 } from 'lucide-react';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  completedChapterIds: Set<String>;
  setCompletedChapterIds: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(({ chapter, chapterIndex, completedChapterIds, setCompletedChapterIds }, ref) => {
  const { toast } = useToast();
  const [success, setSuccess] = React.useState<boolean | null>(null);
  const { mutate: getChapterInfo, isPending } = useMutation({
    mutationFn: async () => {
      try {
        const response = await axios.post('/api/chapter/getInfo', { chapterId: chapter.id });
        return response.data;
      } catch (error) {
        // Log detailed error
        if (axios.isAxiosError(error)) {
          console.error('Axios Error:', error.response?.data || error.message);
        } else {
          console.error('Unexpected Error:', error);
        }
        throw error;
      }
    }
  });

  const addChapterIdToSet = React.useCallback(() => {
    setCompletedChapterIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(chapter.id);
      return newSet;
    });
  }, [chapter.id, setCompletedChapterIds]);

  React.useEffect(() => {
    if (chapter.videoId) {
      setSuccess(true);
      addChapterIdToSet();
    }
  }, [chapter, addChapterIdToSet]);

  React.useImperativeHandle(ref, () => ({
    async triggerLoad() {
      if (chapter.videoId) {
        addChapterIdToSet();
        return;
      }
      getChapterInfo(undefined, {
        onSuccess: () => {
          setSuccess(true);
          addChapterIdToSet();
        },
        onError: (error) => {
          setSuccess(false);
          toast({
            title: 'Error',
            description: 'Failed to load chapter info',
            variant: 'destructive',
          });
          addChapterIdToSet();
        }
      });
    }
  }));

  return (
    <div
      key={chapter.id}
      className={cn('px-4 py-2 mt-2 rounded flex justify-between', {
        'bg-secondary': success === null,
        'bg-red-500': success === false,
        'bg-green-500': success === true,
      })}
    >
      <h5>Chapter {chapterIndex + 1}: {chapter.name}</h5>
      {isPending && <Loader2 className='animate-spin' />}
    </div>
  );
});

ChapterCard.displayName = 'ChapterCard';
export default ChapterCard;
