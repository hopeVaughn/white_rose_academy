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
    <section>
      {/* Title and subtitle */}
      <h4 className='text-sm uppercase text-secondary-foreground/60 '>
        Unit {unitIndex + 1} &bull; Chapter {chapterIndex + 1}
      </h4>
      <h1 className="text-4xl font-semibold p-2">{chapter.name}</h1>

      {/* Responsive iframe container */}
      <div className="aspect-w-16 aspect-h-7">
        <iframe
          title='chapter video'
          className='w-fill h-fill'
          src={`https://www.youtube.com/embed/${chapter.videoId}`}
          allowFullScreen
        />
      </div>
      {/* Summary */}

      <h3 className='text-3xl font-semibold mt-4'>Summary</h3>
      <p className="text-secondary-foreground/80">{chapter.summary}</p>


    </section>
  );
};
export default MainVideoSummary;
