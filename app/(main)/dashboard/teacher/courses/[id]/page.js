"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import CreateEditLectureModal from '@/components/modals/CreateEditLectureModal';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Users, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const TeacherCourseDetailsSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8">
    <Skeleton className="h-8 w-48 mb-8" />
    <Skeleton className="h-40 w-full mb-8" />
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-10 w-36" />
    </div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  </div>
);


export default function CourseDetailsPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [courseRes, lecturesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/lectures`),
      ]);

      if (!courseRes.ok) throw new Error('Failed to fetch course details');
      const lecturesData = lecturesRes.ok ? await lecturesRes.json() : [];
      const courseData = await courseRes.json();
      
      setCourse(courseData);
      setLectures(Array.isArray(lecturesData) ? lecturesData : []);
    } catch (error) {
      toast.error('Failed to load course data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchData();
    }
  }, [user, fetchData]);

  const handleSaveLecture = async (lectureData) => {
    const isEditMode = !!lectureData.id;
    const url = isEditMode
      ? `/api/lectures/${lectureData.id}`
      : `/api/courses/${courseId}/lectures`;
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lectureData, course_id: courseId }),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || `Failed to ${isEditMode ? 'update' : 'create'} lecture`);
      }

      toast.success(`Lecture ${isEditMode ? 'updated' : 'created'} successfully!`);
      fetchData();
      setIsLectureModalOpen(false);
    } catch (err) {
      toast.error(`Failed to save lecture`, { description: err.message });
    }
  };

  const handleDeleteLecture = async (lectureId) => {
    // A simple confirmation dialog
    if (!window.confirm('Are you sure you want to delete this lecture? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/lectures/${lectureId}`, { method: 'DELETE' });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to delete lecture');
      }
      toast.success('Lecture deleted successfully');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete lecture', { description: err.message });
    }
  };

  const handleTogglePublish = async (lecture) => {
    const optimisticLectures = lectures.map(l =>
      l.id === lecture.id ? { ...l, is_published: !l.is_published } : l
    );
    setLectures(optimisticLectures);

    try {
        const updatedLecture = { ...lecture, is_published: !lecture.is_published };
        const res = await fetch(`/api/lectures/${lecture.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedLecture),
        });
        if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message || 'Failed to update publish status');
        }
        toast.success(`Lecture ${updatedLecture.is_published ? 'published' : 'unpublished'}`);
        // Re-fetch to ensure consistency, though optimistic update is in place
        fetchData();
    } catch(err) {
        toast.error('Failed to update lecture', { description: err.message });
        // Revert on error
        setLectures(lectures);
    }
  };
  
  const groupedLectures = useMemo(() => {
    return lectures.reduce((acc, lecture) => {
      const module = lecture.module || 'General';
      if (!acc[module]) {
        acc[module] = [];
      }
      acc[module].push(lecture);
      return acc;
    }, {});
  }, [lectures]);


  if (loading) return <TeacherCourseDetailsSkeleton />;
  if (!course) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course not found</h1>
          <p className="text-muted-foreground">The course you are looking for does not exist.</p>
          <Link href="/dashboard/teacher">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="bg-background text-foreground min-h-screen p-4 sm:p-6 lg:p-8">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <Link href="/dashboard/teacher" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </motion.div>

        <motion.header
          variants={itemVariants}
          className="bg-card/50 backdrop-blur-lg border border-border/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-lg text-muted-foreground mt-2">{course.description}</p>
            </div>
             <div className="flex items-center space-x-2">
              <Button asChild variant="outline">
                  <Link href={`/dashboard/teacher/courses/${courseId}/enrollments`}>
                      <Users className="mr-2 h-4 w-4" /> Manage Enrollments
                  </Link>
              </Button>
            </div>
          </div>
        </motion.header>
        
        <motion.main variants={itemVariants}>
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Manage Lectures</h2>
              <Button 
                onClick={() => { setSelectedLecture(null); setIsLectureModalOpen(true); }}
              >
                  <Plus className="mr-2 h-4 w-4" /> Add Lecture
              </Button>
          </div>

          <div className="space-y-6">
            {lectures.length > 0 ? Object.entries(groupedLectures).map(([moduleName, moduleLectures]) => (
              <motion.div key={moduleName} variants={itemVariants}>
                <h3 className="text-xl font-semibold mb-4 text-primary">{moduleName}</h3>
                <Card className="bg-card/50 backdrop-blur-lg border-border/20">
                  <CardContent className="p-0">
                    <div className="divide-y divide-border/10">
                    {moduleLectures.map((lecture) => (
                      <div key={lecture.id} className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                        <div className="flex-1 truncate pr-4">
                          <p className="font-semibold">{lecture.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{lecture.description}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge variant={lecture.is_published ? 'default' : 'secondary'}>
                            {lecture.is_published ? 'Published' : 'Draft'}
                          </Badge>
                          <Button variant="ghost" size="icon" onClick={() => handleTogglePublish(lecture)} title={lecture.is_published ? "Unpublish" : "Publish"}>
                            {lecture.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedLecture(lecture); setIsLectureModalOpen(true); }} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80" onClick={() => handleDeleteLecture(lecture.id)} title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )) : (
              <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card/20">
                <h3 className="text-xl font-medium text-muted-foreground">No lectures yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Click "Add Lecture" to create the first lecture for this course.
                </p>
              </div>
            )}
          </div>
        </motion.main>

        <CreateEditLectureModal
          isOpen={isLectureModalOpen}
          lecture={selectedLecture}
          onClose={() => setIsLectureModalOpen(false)}
          onSave={handleSaveLecture}
        />
      </motion.div>
    </div>
  );
} 