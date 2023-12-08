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
  const [isOpen, setIsOpen] = useState(true);
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
      if (userAnswer === question.answer) {
        newQuestionState[question.id] = true;
      } else {
        newQuestionState[question.id] = false;
      }
      setQuestionState(newQuestionState);

    });
  }, [answers, questionState, chapter.questions]);
  return (
    <>
      {/* QuizCards Panel */}
      <div className={cn(
        'w-[400px] fixed top-1/2 right-0 transform -translate-y-1/2 transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
        'h-auto my-auto rounded-l-3xl bg-secondary p-6 overflow-auto z-10'
      )}>
        {/* Toggle button */}

        <button onClick={toggleQuizCards} className="absolute top-0 left-0 ml-2 mb-2 mt-2">
          {isOpen ? <X className="w-8 h-8" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        {/* Quiz content */}
        <section className="mt-4 flex-col">
          <h1 className="text-2xl font-bold">Concept Check</h1>
          {chapter.questions.map((question) => {
            const options = JSON.parse(question.options);
            console.log("QUIZ CARD OPTIONS: ", options);

            return (
              <div key={question.id}
                className={cn(
                  'mt-4 border border-secondary rounded-lg', {
                  'bg-green-700': questionState[question.id] === true,
                  'bg-red-700': questionState[question.id] === false,
                  'bg-secondary': questionState[question.id] === null
                }
                )}>
                <h1>{question.question}</h1>
                <div className="mt-2">
                  <RadioGroup
                    onValueChange={(e) => {
                      setAnswers((prev) => {
                        return {
                          ...prev,
                          [question.id]: e
                        };
                      });
                    }}
                  >
                    {options.map((option: string, index: number) => {
                      return (
                        <div
                          key={index}
                          className="flex items-center"
                        >
                          <RadioGroupItem
                            value={option}
                            id={question.id + index.toString()}
                          />
                          <Label htmlFor={question.id + index.toString()} className="flex-grow ml-2">{option}</Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              </div>
            );
          })}
        </section>
        <Button
          className='w-full mt-4'
          size='lg'
          onClick={checkAnswers}
        >Check Answer
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      {/* Tab to reopen QuizCards */}
      <div className={`fixed top-1/2 right-0 transform -translate-y-1/2 z-20 transition-opacity duration-300 ${isOpen ? 'opacity-0' : 'opacity-100'}`} style={{ transitionDelay: isOpen ? '0ms' : '300ms' }}>
        <button onClick={toggleQuizCards} className="p-2 bg-secondary rounded-l-full">
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>
    </>
  );
};

export default QuizCards;