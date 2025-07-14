"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentCourseQuizzesPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    try {
      // API needs to be smart enough to filter for this student's context
      const [courseRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/quizzes?course_id=${courseId}&student_id=${user.id}`), 
      ]);

      if (!courseRes.ok) throw new Error('Failed to fetch course details');
      const courseData = await courseRes.json();
      setCourse(courseData);
      
      if (quizzesRes.ok) {
        const quizzesData = await quizzesRes.json();
        setQuizzes(Array.isArray(quizzesData) ? quizzesData : []);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      toast.error('Failed to load quiz data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    if (user) {
      fetchQuizData();
    }
  }, [user, fetchQuizData]);
  
  if (loading) return <div className="p-8">Loading quizzes...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/student/courses/${courseId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </motion.div>

        <Card>
          <CardHeader>
              <CardTitle className="text-2xl font-bold">Quizzes</CardTitle>
              <CardDescription>Course: {course?.title || 'Loading...'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <Card key={quiz.id} className="flex justify-between items-center p-4">
                    <div>
                      <h3 className="font-semibold">{quiz.title}</h3>
                      <p className="text-sm text-gray-500">Due: {quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() : 'No due date'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={quiz.is_completed ? "default" : "secondary"}>
                            {quiz.is_completed ? "Completed" : "Pending"}
                        </Badge>
                        {quiz.is_completed ? (
                            <Button asChild variant="outline" size="sm">
                                <Link href={`/dashboard/student/quizzes/${quiz.id}/results`}>View Results</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href={`/dashboard/student/quizzes/${quiz.id}`}>Take Quiz</Link>
                            </Button>
                        )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No quizzes available for this course yet.</p>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 