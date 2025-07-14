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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function QuizResultsPage({ params }) {
  const { user } = useAuth();
  const { id: quizId } = params;

  const [quiz, setQuiz] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResultsData = useCallback(async () => {
    setLoading(true);
    try {
      const [quizRes, submissionsRes] = await Promise.all([
        fetch(`/api/quizzes/${quizId}`),
        fetch(`/api/quizzes/${quizId}/results`),
      ]);

      if (!quizRes.ok) throw new Error('Failed to fetch quiz details');
      const quizData = await quizRes.json();
      setQuiz(quizData);

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      toast.error('Failed to load quiz results', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (user) {
      fetchResultsData();
    }
  }, [user, fetchResultsData]);

  if (loading) return <div className="p-8">Loading results...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/dashboard/teacher/courses/${quiz?.course_id}/quizzes`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Quiz Results</CardTitle>
            <CardDescription>Quiz: {quiz?.title || 'Loading...'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length > 0 ? (
                  submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.student_name}</TableCell>
                      <TableCell>{submission.score}%</TableCell>
                      <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Review</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No submissions found for this quiz.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 