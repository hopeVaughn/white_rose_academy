import { create } from 'zustand';
import { Chapter, Course as PrismaCourse, Unit as PrismaUnit } from '@prisma/client';

// Extending Prisma types to include nested relations
interface ExtendedUnit extends PrismaUnit {
  chapters: Chapter[];
}

interface ExtendedCourse extends PrismaCourse {
  units: ExtendedUnit[];
}

// Defining the state structure for the store
interface CourseState {
  course: ExtendedCourse | null; // Using ExtendedCourse instead of Course
  setCourse: (course: ExtendedCourse) => void;
  updateChapter: (unitId: string, chapterId: string, newChapterData: Partial<Chapter>) => void;
  updateUnit: (unitId: string, newUnitData: Partial<ExtendedUnit>) => void; // Using ExtendedUnit instead of Unit
}

// Creating the Zustand store
const useCourseStore = create<CourseState>((set) => ({
  course: null,

  setCourse: (course) => set({ course }),

  updateChapter: (unitId, chapterId, newChapterData) => set((state) => {
    if (!state.course) return { ...state }; // Return the current state if course is null

    const updatedUnits = state.course.units.map((unit: ExtendedUnit) => {
      if (unit.id !== unitId) return unit;

      const updatedChapters = unit.chapters.map((chapter) => {
        return chapter.id === chapterId ? { ...chapter, ...newChapterData } : chapter;
      });

      return { ...unit, chapters: updatedChapters };
    });

    return { course: { ...state.course, units: updatedUnits } };
  }),

  updateUnit: (unitId, newUnitData) => set((state) => {
    if (!state.course) return { ...state }; // Return the current state if course is null

    const updatedUnits = state.course.units.map((unit: ExtendedUnit) =>
      unit.id === unitId ? { ...unit, ...newUnitData } : unit
    );

    return { course: { ...state.course, units: updatedUnits } };
  }),
}));

export default useCourseStore;
