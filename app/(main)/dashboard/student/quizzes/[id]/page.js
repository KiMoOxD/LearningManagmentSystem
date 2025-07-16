'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [remainingTime, setRemainingTime] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = expiryTimestamp - now;

      if (distance < 0) {
        clearInterval(interval);
        setRemainingTime(0);
        onTimeUp();
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setRemainingTime(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiryTimestamp, onTimeUp]);

  if (remainingTime === null) {
    return <div className="font-bold text-lg">Loading timer...</div>;
  }
  
  const isLowTime = remainingTime !== 0 && parseInt(remainingTime.split(':')[0], 10) < 2;

  return (
    <div className={`font-bold text-lg p-2 rounded-md ${isLowTime ? 'text-red-500 animate-pulse' : ''}`}>
      Time Left: {remainingTime}
    </div>
  );
};


export default function QuizTakingPage() {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizEndTime, setQuizEndTime] = useState(null);

    const router = useRouter();
    const params = useParams();
  const { id: quizId } = params;

    useEffect(() => {
        if (!quizId) return;
        const fetchQuizForTaking = async () => {
            try {
    setLoading(true);
                const response = await fetch(`/api/quizzes/${quizId}/take`);
                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Failed to load quiz');
                }
                const data = await response.json();
                setQuiz(data);
                if (data.time_limit && data.submission.started_at) {
                  const startTime = new Date(data.submission.started_at).getTime();
                  const endTime = startTime + data.time_limit * 60 * 1000;
                  setQuizEndTime(endTime);
                }
                const initialAnswers = data.questions.map(q => ({ question_id: q.id, answer_text: '', selected_option_id: null }));
                setAnswers(initialAnswers);
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
    } finally {
      setLoading(false);
    }
        };
        fetchQuizForTaking();
  }, [quizId]);

    const handleAnswerChange = (questionId, value, type) => {
        setAnswers(prevAnswers => {
            const newAnswers = [...prevAnswers];
            const answerIndex = newAnswers.findIndex(a => a.question_id === questionId);
            if (answerIndex !== -1) {
                if (type === 'text') {
                    newAnswers[answerIndex].answer_text = value;
                    newAnswers[answerIndex].selected_option_id = null;
                } else {
                    newAnswers[answerIndex].selected_option_id = value;
                    newAnswers[answerIndex].answer_text = '';
                }
            }
            return newAnswers;
        });
  };

  const handleTimeUp = () => {
    toast.error("Time's up! Submitting your quiz now.");
    handleSubmit(true); // Pass a flag to indicate auto-submission
  }

  const handleSubmit = async (isAutoSubmit = false) => {
        setIsSubmitting(true);
    try {
            const response = await fetch(`/api/quizzes/submissions/${quiz.submission.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
            if (!response.ok) throw new Error('Failed to submit quiz.');

      toast.success('Quiz submitted successfully!');
            router.push(`/dashboard/student/quizzes/${quizId}/results`);

    } catch (error) {
            toast.error(error.message);
            setIsSubmitting(false);
    }
  };

    if (loading) return <div className="container mx-auto py-10">Loading quiz...</div>;
    if (error) return <div className="container mx-auto py-10"><Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;
    if (!quiz) return null;

    if (!quiz.questions || quiz.questions.length === 0) {
      return (
        <div className="container mx-auto py-10 max-w-4xl text-center">
          <Alert>
            <AlertTitle>No Questions Yet</AlertTitle>
            <AlertDescription>
              This quiz hasn't been filled with questions yet. Please check back later or contact your teacher.
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    
    if (!currentQuestion) {
      // This can happen briefly if the quiz data is being updated.
      // A loading state could also be returned here for a better UX.
      return <div className="container mx-auto py-10">Loading question...</div>;
    }

    const currentAnswer = answers.find(a => a.question_id === currentQuestion.id);

  return (
        <div className="container mx-auto py-10 max-w-4xl">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                    <CardTitle>{quiz.title}</CardTitle>
                    <CardDescription>Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardDescription>
            </div>
            {quizEndTime && <Timer expiryTimestamp={quizEndTime} onTimeUp={handleTimeUp} />}
          </CardHeader>
                <CardContent>
                    <div className="mb-6">
                        <p className="text-lg font-semibold">{currentQuestion.question_text}</p>
                        {currentQuestion.image_url && <img src={currentQuestion.image_url} alt="Question" className="mt-4 rounded-lg max-h-80" />}
                    </div>
                    
                    <div>
                        {currentQuestion.question_type === 'multiple_choice' && (
                             <RadioGroup
                                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value), 'option')}
                                value={String(currentAnswer?.selected_option_id)}
                             >
                                {currentQuestion.options.map(option => (
                                    <div key={option.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} />
                                        <Label htmlFor={`option-${option.id}`}>{option.option_text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                        {currentQuestion.question_type === 'true_false' && (
                             <RadioGroup 
                                onValueChange={(value) => handleAnswerChange(currentQuestion.id, parseInt(value), 'option')}
                                value={String(currentAnswer?.selected_option_id)}
                             >
                                {currentQuestion.options.map(option => (
                                     <div key={option.id} className="flex items-center space-x-2">
                                        <RadioGroupItem value={String(option.id)} id={`option-${option.id}`} />
                                        <Label htmlFor={`option-${option.id}`}>{option.option_text}</Label>
                      </div>
                                ))}
                   </RadioGroup>
                )}
                        {currentQuestion.question_type === 'short_answer' && (
                  <Textarea
                    placeholder="Your answer..."
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value, 'text')}
                                value={currentAnswer?.answer_text || ''}
                  />
                )}
              </div>

                    <div className="flex justify-between mt-8">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {currentQuestionIndex < quiz.questions.length - 1 ? (
                            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
                                Next
                            </Button>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button>Submit Quiz</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You cannot change your answers after submitting.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
          </CardContent>
        </Card>
    </div>
  );
} 