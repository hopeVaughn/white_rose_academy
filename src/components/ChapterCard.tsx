'use client';
import React from 'react';
import axios from 'axios';
import { Chapter } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import useCourseStore from '@/lib/courseStore';
import { useToast } from './ui/use-toast';
import { Loader2, XIcon, SaveAll, Edit } from 'lucide-react';
import { set } from 'zod';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
  unitId: string;
  completedChapterIds: Set<String>;
  setCompletedChapterIds: React.Dispatch<React.SetStateAction<Set<String>>>;
};

export type ChapterCardHandler = {
  triggerLoad: () => void;
};

const ChapterCard = React.forwardRef<ChapterCardHandler, Props>(({ chapter, chapterIndex, unitId, completedChapterIds, setCompletedChapterIds }, ref) => {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const chapterNameRef = React.useRef<HTMLInputElement>(null);
  const { updateChapter } = useCourseStore((state) => state);

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
    },
    onSuccess: () => {
      setSuccess(true);
      addChapterIdToSet();
    },
    onError: (error) => {
      setSuccess(false);
      toast({
        title: 'Error',
        description: 'Failed to load chapter info',
      });
      addChapterIdToSet();
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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    if (chapterNameRef.current) {
      const updatedChapterName = chapterNameRef.current.value;
      updateChapter(unitId, chapter.id, { name: updatedChapterName });
      setIsEditMode(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  return (
    <div className={cn('px-4 py-2 mt-2 rounded flex justify-between', {
      'bg-secondary': success === null,
      'bg-red-500': success === false,
      'bg-green-500': success === true,
    })}>
      {isEditMode ? (
        <>
          <input ref={chapterNameRef} defaultValue={chapter.name} className="flex-1" />
          <button onClick={handleSave}><SaveAll /></button>
          <button onClick={handleCancel}><XIcon /></button>
        </>
      ) : (
        <>
          <h5>Chapter {chapterIndex + 1}: {chapter.name}</h5>
          <button onClick={handleEdit}><Edit /></button>
        </>
      )}
      {isPending && <Loader2 className='animate-spin' />}
    </div>
  );
});

ChapterCard.displayName = 'ChapterCard';
export default ChapterCard;
