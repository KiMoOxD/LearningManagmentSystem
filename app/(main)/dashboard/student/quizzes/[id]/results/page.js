"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

export default function StudentQuizResultsPage({ params }) {
  const { user } = useAuth();
  const { id: quizId } = params;

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      // API needs to be smart enough to return results for the logged-in student
      const res = await fetch(`/api/quizzes/${quizId}/results?student_id=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch results');
      const resultsData = await res.json();
      setResults(resultsData);
    } catch (error) {
      toast.error('Failed to load results', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [quizId, user]);

  useEffect(() => {
    if (user) {
      fetchResults();
    }
  }, [user, fetchResults]);

  if (loading) return <div className="p-8">Loading your results...</div>;
  if (!results) return <div className="p-8">Could not load your results.</div>;
  
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/student/courses/${results.quiz?.course_id}/quizzes`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </motion.div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
                    <CardDescription>{results.quiz?.title}</CardDescription>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Your Score</p>
                    <p className="text-3xl font-bold">{results.score}%</p>
                </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {results.answers?.map((answer, index) => (
              <div key={answer.question_id} className="p-4 border rounded-lg">
                <p className="font-semibold">{index + 1}. {answer.question_text}</p>
                <div className={`mt-2 p-2 rounded flex items-center ${answer.is_correct ? 'bg-green-100' : 'bg-red-100'}`}>
                  {answer.is_correct ? <CheckCircle className="h-5 w-5 text-green-600 mr-2" /> : <XCircle className="h-5 w-5 text-red-600 mr-2" />}
                  <p>Your answer: <span className="font-medium">{answer.student_answer}</span></p>
                </div>
                {!answer.is_correct && (
                   <div className="mt-2 p-2 rounded bg-gray-200">
                     <p>Correct answer: <span className="font-medium">{answer.correct_answer}</span></p>
                   </div>
                )}
                {answer.feedback && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-semibold">Feedback:</p>
                    <p>{answer.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 