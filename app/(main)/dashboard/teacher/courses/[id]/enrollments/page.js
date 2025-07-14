"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import EnrollmentModal from '@/components/modals/EnrollmentModal';
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

export default function CourseEnrollmentsPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEnrollmentData = useCallback(async () => {
    try {
      const [courseRes, studentsRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/enrollments?course_id=${courseId}`),
      ]);

      if (!courseRes.ok) throw new Error('Failed to fetch course details');
      
      const courseData = await courseRes.json();
      const studentsData = studentsRes.ok ? await studentsRes.json() : [];
      
      setCourse(courseData);
      setEnrolledStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      toast.error('Failed to load enrollment data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchEnrollmentData();
    }
  }, [user, fetchEnrollmentData]);
  
  const handleEnrollStudent = async (studentId) => {
    try {
        const res = await fetch('/api/enrollments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course_id: courseId, student_id: studentId }),
        });
        if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message || 'Failed to enroll student');
        }
        toast.success('Student enrolled successfully!');
        await fetchEnrollmentData();
        setIsModalOpen(false);
    } catch(err) {
        toast.error('Failed to enroll student', { description: err.message });
    }
  };
  
  const handleUnenrollStudent = async (enrollmentId) => {
    if (!window.confirm('Are you sure you want to unenroll this student?')) return;
    try {
        const res = await fetch(`/api/enrollments/${enrollmentId}`, { method: 'DELETE' });
        if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message || 'Failed to unenroll student');
        }
        toast.success('Student unenrolled successfully');
        await fetchEnrollmentData();
    } catch (err) {
        toast.error('Failed to unenroll student', { description: err.message });
    }
  };

  if (loading) return <div className="p-8">Loading enrollments...</div>;
  if (!course) return <div className="p-8">Course not found.</div>;

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
                <CardTitle className="text-2xl font-bold">Manage Enrollments</CardTitle>
                <CardDescription>Course: {course.title}</CardDescription>
              </div>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Enroll Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrolledStudents.length > 0 ? (
                  enrolledStudents.map((student) => (
                    <TableRow key={student.enrollment_id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-gray-500">{student.email}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUnenrollStudent(student.enrollment_id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <EnrollmentModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onEnroll={handleEnrollStudent}
            courseId={courseId}
            enrolledStudentIds={enrolledStudents.map(s => s.id)}
        />
       </div>
    </div>
  );
} 