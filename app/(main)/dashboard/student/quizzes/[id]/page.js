"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TakeQuizPage({ params }) {
  const { user } = useAuth();
  const { id: quizId } = params;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchQuiz = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) throw new Error('Failed to fetch quiz');
      const quizData = await res.json();
      setQuiz(quizData);
    } catch (error) {
      toast.error('Failed to load quiz', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (user) {
      fetchQuiz();
    }
  }, [user, fetchQuiz]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error('Failed to submit quiz');
      toast.success('Quiz submitted successfully!');
      // Redirect to results page, router.push(...)
    } catch (error) {
      toast.error('Failed to submit quiz', { description: error.message });
    }
  };

  if (loading) return <div className="p-8">Loading quiz...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{quiz?.title || 'Loading...'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {quiz?.questions?.map((q, index) => (
              <div key={q.id}>
                <p className="font-semibold mb-2">{index + 1}. {q.text}</p>
                {q.type === 'multiple-choice' && (
                  <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)}>
                    {q.options.map((option, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                        <Label htmlFor={`${q.id}-${i}`}>{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === 'true-false' && (
                   <RadioGroup onValueChange={(value) => handleAnswerChange(q.id, value)}>
                      <div className="flex items-center space-x-2">
                         <RadioGroupItem value="True" id={`${q.id}-true`} />
                         <Label htmlFor={`${q.id}-true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                         <RadioGroupItem value="False" id={`${q.id}-false`} />
                         <Label htmlFor={`${q.id}-false`}>False</Label>
                      </div>
                   </RadioGroup>
                )}
                {q.type === 'short-answer' && (
                  <Textarea
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Your answer..."
                  />
                )}
              </div>
            ))}
            <Button onClick={handleSubmit} className="w-full">Submit Quiz</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 