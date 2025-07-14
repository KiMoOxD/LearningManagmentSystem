"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Edit, Trash2, FileText } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import CreateEditQuizModal from '@/components/modals/CreateEditQuizModal';

export default function CourseQuizzesPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, quizzesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/quizzes?course_id=${courseId}`),
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
      toast.error('Failed to load data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) {
      fetchQuizData();
    }
  }, [user, fetchQuizData]);

  const handleSaveQuiz = async (quizData) => {
    const isEditMode = !!quizData.id;
    // The API endpoint for creating a quiz doesn't need the courseId in the URL
    // if it's in the body, but we follow the defined pattern.
    const url = isEditMode ? `/api/quizzes/${quizData.id}` : '/api/quizzes';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || `Failed to ${isEditMode ? 'update' : 'create'} quiz`);
      }
      
      toast.success(`Quiz ${isEditMode ? 'updated' : 'created'} successfully!`);
      await fetchQuizData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(`Failed to save quiz`, { description: err.message });
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      const res = await fetch(`/api/quizzes/${quizId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quiz');
      toast.success('Quiz deleted successfully');
      await fetchQuizData();
    } catch (err) {
      toast.error('Failed to delete quiz', { description: err.message });
    }
  };
  
  if (loading) return <div className="p-8">Loading quizzes...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/teacher/courses/${courseId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Link>
        </motion.div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Quizzes</CardTitle>
                <CardDescription>Course: {course?.title || 'Loading...'}</CardDescription>
              </div>
              <Button onClick={() => { setSelectedQuiz(null); setIsModalOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" /> Create Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Title</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.length > 0 ? (
                  quizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>{quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{quiz.submission_count || 0}</TableCell>
                      <TableCell>
                        <Badge variant={new Date(quiz.due_date) > new Date() ? "default" : "secondary"}>
                          {new Date(quiz.due_date) > new Date() ? 'Active' : 'Closed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/dashboard/teacher/quizzes/${quiz.id}/results`}>
                            <FileText className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedQuiz(quiz); setIsModalOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteQuiz(quiz.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No quizzes found for this course.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <CreateEditQuizModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveQuiz}
            quiz={selectedQuiz}
            courseId={courseId}
        />
      </div>
    </div>
  );
} 