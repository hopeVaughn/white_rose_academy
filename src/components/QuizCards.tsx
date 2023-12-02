import { cn } from '@/lib/utils';
import { Chapter, Question } from '@prisma/client';
import React from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
};

const QuizCards = ({ chapter }: Props) => {
  return (
    <div className="flex-[1] mt-16 ml-8">
      <h1 className="text-2xl font-bold">Concept Check</h1>
      <div className="mt-2">
        {chapter.questions.map((question) => {
          const options = JSON.parse(question.options);
          console.log("QUIZ CARD OPTIONS: ", options);

          return (
            <div key={question.id}
              className={cn(
                'p-3 mt-4 border border-secondary rounded-lg'
              )}>
              <h1>{question.question}</h1>
              <div className="mt-2">
                <RadioGroup>
                  {options.map((option: string, index: number) => {
                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={option}
                          id={question.id + index.toString()}
                        />
                        <Label htmlFor={question.id + index.toString()}>{option}</Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuizCards;