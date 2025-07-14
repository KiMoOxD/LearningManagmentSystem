"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StudentGradesPage() {
  const { user } = useAuth();
  const [gradesByCourse, setGradesByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchGrades = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/grades?student_id=${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch grades');
      const gradesData = await res.json();
      
      // Group grades by course
      const grouped = (Array.isArray(gradesData) ? gradesData : []).reduce((acc, grade) => {
        const courseTitle = grade.course_title || 'General';
        if (!acc[courseTitle]) {
          acc[courseTitle] = [];
        }
        acc[courseTitle].push(grade);
        return acc;
      }, {});
      setGradesByCourse(grouped);

    } catch (error) {
      toast.error('Failed to load grades', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  if (loading) return <div className="p-8">Loading your grades...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">My Grades</h1>
            <p className="text-md text-gray-500">An overview of your performance across all courses.</p>
        </motion.div>

        {Object.keys(gradesByCourse).length > 0 ? (
          <Accordion type="multiple" defaultValue={Object.keys(gradesByCourse)} className="w-full space-y-4">
            {Object.entries(gradesByCourse).map(([courseTitle, grades]) => (
              <AccordionItem key={courseTitle} value={courseTitle}>
                <AccordionTrigger className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold">{courseTitle}</h2>
                </AccordionTrigger>
                <AccordionContent className="p-0 mt-2">
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Assignment/Quiz</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {grades.map(grade => (
                            <TableRow key={grade.id}>
                              <TableCell className="font-medium">{grade.description}</TableCell>
                              <TableCell className="text-right">{grade.score}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500">No grades have been recorded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 