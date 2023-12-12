import { Chapter as PrismaChapter, Course as PrismaCourse, Unit as PrismaUnit } from '@prisma/client';

export interface ExtendedChapter extends PrismaChapter {
  // Add any additional fields or override existing ones if necessary
}

export interface ExtendedUnit extends PrismaUnit {
  chapters: ExtendedChapter[];
}

export interface ExtendedCourse extends PrismaCourse {
  units: ExtendedUnit[];
}
