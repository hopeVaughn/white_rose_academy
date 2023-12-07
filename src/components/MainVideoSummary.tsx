import { Chapter, Unit } from '@prisma/client';
import React from 'react';

type Props = {
  chapter: Chapter;
  unit: Unit;
  unitIndex: number;
  chapterIndex: number;
};

const MainVideoSummary = ({ unit, unitIndex, chapter, chapterIndex }: Props) => {
  return (
    <div className="mt-16 md:mt-0">
      {/* Title and subtitle */}
      <h4 className='text-sm uppercase text-secondary-foreground/60'>
        Unit {unitIndex + 1} &bull; Chapter {chapterIndex + 1}
      </h4>
      <h1 className="text-4xl font-semibold">{chapter.name}</h1>

      {/* Aspect ratio container for the iframe */}
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          title='chapter video'
          className='w-full h-full'
          src={`https://www.youtube.com/embed/${chapter.videoId}`}
          allowFullScreen
        />
      </div>

      {/* Summary */}
      <div className="mt-4">
        <h3 className='text-3xl font-semibold'>Summary</h3>
        <p className="text-secondary-foreground/80">{chapter.summary}</p>
      </div>
    </div>
  );
};


export default MainVideoSummary;
