import { Chapter } from '@prisma/client';
import React from 'react';

type Props = {
  chapter: Chapter;
  chapterIndex: number;
};

const ChapterCard = ({ chapter, chapterIndex }: Props) => {
  return (
    <div
      key={chapter.id}
    >
      <h5>Chapter {chapterIndex + 1} {chapter.name}</h5>
    </div>
  );
};

export default ChapterCard;