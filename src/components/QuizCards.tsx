"use client";
import { cn } from '@/lib/utils';
import { Chapter, Question } from '@prisma/client';
import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';

type Props = {
  chapter: Chapter & {
    questions: Question[];
  };
};

const QuizCards = ({ chapter }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [questionState, setQuestionState] = React.useState<Record<string, boolean | null>>({});

  // Function to toggle the visibility of the QuizCards
  const toggleQuizCards = () => {
    setIsOpen(!isOpen);
  };

  const checkAnswers = React.useCallback(() => {
    const newQuestionState = { ...questionState };
    chapter.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      if (!userAnswer) return;
      newQuestionState[question.id] = userAnswer === question.answer;
    });
    setQuestionState(newQuestionState);
  }, [answers, chapter.questions]);

  return (
    <>
      {/* QuizCards Panel */}
      <div className={cn(
        'w-[400px] fixed top-1/2 right-0 transform -translate-y-1/2 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0 z-50' : 'translate-x-full',
        'h-[70%] my-auto rounded-l-3xl bg-secondary p-6 overflow-y-auto'
      )}>
        {/* Close button */}
        <button
          onClick={toggleQuizCards}
          className="absolute top-5 left-5 z-50 p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        {/* Quiz content */}
        <section className="mt-12 flex-col">
          <h1 className="text-2xl font-bold">Comprehension Check</h1>
          {chapter.questions.map((question, index) => {
            const options = JSON.parse(question.options);
            console.log("QUIZ CARD OPTIONS: ", options);

            return (
              <div key={index} className="mt-4 border border-secondary rounded-lg bg-secondary">
                <h1>{question.question}</h1>
                <div className="mt-2">
                  <RadioGroup
                    onValueChange={(value) => {
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: value
                      }));
                    }}
                  >
                    {options.map((option: string, idx: number) => (
                      <div key={idx} className="flex items-center">
                        <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                        <Label htmlFor={`${question.id}-${idx}`} className="flex-grow ml-2">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            );
          })}
        </section>
        <Button className='w-full mt-4' size='lg' onClick={checkAnswers}>Check Answer <ChevronRight className="w-4 h-4 ml-1" /></Button>
      </div>
      {/* Tab to reopen QuizCards */}
      <div className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ transitionDelay: isOpen ? '0ms' : '300ms' }}>
        <button onClick={toggleQuizCards} className="p-2 bg-secondary rounded-l-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default QuizCards;
