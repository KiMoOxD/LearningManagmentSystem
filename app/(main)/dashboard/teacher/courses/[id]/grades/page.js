"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus } from 'lucide-react';
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
import AddGradeModal from '@/components/modals/AddGradeModal';

export default function CourseGradesPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGradeData = useCallback(async () => {
    setLoading(true);
    try {
      const [courseRes, gradesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/grades?course_id=${courseId}`),
      ]);

      if (!courseRes.ok) throw new Error('Failed to fetch course details');
      const courseData = await courseRes.json();
      setCourse(courseData);

      if (gradesRes.ok) {
        const gradesData = await gradesRes.json();
        setGrades(Array.isArray(gradesData) ? gradesData : []);
      } else {
        setGrades([]);
      }
    } catch (error) {
      toast.error('Failed to load gradebook data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) {
      fetchGradeData();
    }
  }, [user, fetchGradeData]);
  
  const handleAddGrade = async (gradeData) => {
    try {
      const res = await fetch('/api/grades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gradeData),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to add grade');
      }
      
      toast.success('Grade added successfully!');
      await fetchGradeData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error('Failed to add grade', { description: err.message });
    }
  };

  if (loading) return <div className="p-8">Loading gradebook...</div>;

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
                <CardTitle className="text-2xl font-bold">Gradebook</CardTitle>
                <CardDescription>Course: {course?.title || 'Loading...'}</CardDescription>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Manual Grade
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment/Quiz</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.length > 0 ? (
                  grades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.student_name}</TableCell>
                      <TableCell>{grade.description}</TableCell>
                      <TableCell className="text-right">{grade.score}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No grades recorded for this course.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AddGradeModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={handleAddGrade}
            courseId={courseId}
        />
      </div>
    </div>
  );
} 