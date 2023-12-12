import { z } from 'zod';

export const createChapterSchema = z.object({
  title: z.string().min(3).max(100),
  units: z.array(z.string())
});

export const editChapterSchema = z.object({
  chapterId: z.string(),
  updatedData: z.object({
    name: z.string().min(1).max(100).optional(),
  }),
});