'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/quizzes');
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json();
        setQuizzes(data);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const availableQuizzes = quizzes.filter(q => q.status !== 'Completed');
  const completedQuizzes = quizzes.filter(q => q.status === 'Completed');

  const handleQuizClick = (quiz) => {
    if (quiz.status === 'Completed') {
      router.push(`/dashboard/student/quizzes/${quiz.id}/results`);
    } else if (quiz.status === 'Overdue') {
      toast.error("This quiz is overdue and can no longer be taken.");
    } else {
      router.push(`/dashboard/student/quizzes/${quiz.id}`);
    }
  };

  const QuizCard = ({ quiz }) => (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-xl">{quiz.title}</CardTitle>
        <CardDescription>{quiz.course_title}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center">
            <Badge variant={
              quiz.status === 'Completed' ? 'success' : 
              quiz.status === 'Overdue' ? 'destructive' : 'default'
            }>{quiz.status}</Badge>
            <span className="text-sm text-muted-foreground">
                Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'N/A'}
            </span>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => handleQuizClick(quiz)} 
          className="w-full"
          disabled={quiz.status === 'Overdue'}
        >
          {quiz.status === 'Completed' ? 'View Results' : 
           quiz.status === 'Overdue' ? "Time's Up" : 
           'Start Quiz'}
        </Button>
      </CardFooter>
    </Card>
  );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">My Quizzes</h1>

      {loading && <p>Loading quizzes...</p>}
      {error && <p className="text-red-500">{error}</p>}
      
      {!loading && !error && (
        <div className="space-y-12">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Available Quizzes</h2>
            {availableQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {availableQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                </div>
            ) : (
                <p>No available quizzes at the moment.</p>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Completed Quizzes</h2>
            {completedQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completedQuizzes.map(quiz => <QuizCard key={quiz.id} quiz={quiz} />)}
                </div>
            ) : (
                <p>You have not completed any quizzes yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 