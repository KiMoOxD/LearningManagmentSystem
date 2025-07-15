'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import { toast } from 'sonner';
import QuestionBuilder from '@/components/QuestionBuilder.js';

export default function QuizBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const { id: quizId } = params;

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!quizId) return;

    const fetchQuizDetails = async () => {
      try {
        setLoading(true);
        // We need a new API route to get a single quiz by its ID
        const response = await fetch(`/api/quizzes/${quizId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch quiz details');
        }
        const data = await response.json();
        setQuiz(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  if (loading) {
    return <p>Loading quiz builder...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!quiz) {
    return <p>Quiz not found.</p>;
  }

  return (
    <div className="container mx-auto py-10">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quizzes
      </Button>

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
        
        <div className="border rounded-lg p-6">
            <QuestionBuilder quizId={quizId} />
        </div>
      </div>
    </div>
  );
} 