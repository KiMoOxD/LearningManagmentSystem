"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { CheckCircle, Circle, PlayCircle, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton Loader Component
const LecturePageSkeleton = () => (
  <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
    <Skeleton className="h-8 w-48 mb-8" />
    <Skeleton className="h-28 w-full mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Skeleton className="h-96 w-full" />
      </div>
      <div className="md:col-span-2">
        <Skeleton className="h-[50vh] w-full" />
      </div>
    </div>
  </div>
);

export default function PremiumStudentCourseDetailsPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [courseRes, lecturesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/lectures?student_id=${user.id}`),
      ]);

      if (!courseRes.ok) throw new Error('Failed to fetch course details');
      const courseData = await courseRes.json();
      const lecturesData = lecturesRes.ok ? await lecturesRes.json() : [];
      
      setCourse(courseData);
      const publishedLectures = Array.isArray(lecturesData) ? lecturesData.filter(l => l.is_published) : [];
      setLectures(publishedLectures);

      if (publishedLectures.length > 0) {
        setSelectedLecture(publishedLectures[0]);
      }

    } catch (error) {
      toast.error('Failed to load course data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);
  
  const handleMarkComplete = async (lectureToToggle) => {
    const isCompleted = lectureToToggle.is_completed;
    const optimisticLectures = lectures.map(l => 
      l.id === lectureToToggle.id ? { ...l, is_completed: !isCompleted } : l
    );
    setLectures(optimisticLectures);

    if (selectedLecture.id === lectureToToggle.id) {
        setSelectedLecture({...selectedLecture, is_completed: !isCompleted });
    }

    try {
        const res = await fetch(`/api/lectures/${lectureToToggle.id}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: !isCompleted }),
        });
        if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message || 'Failed to update progress');
        }
        toast.success(`Lecture marked as ${!isCompleted ? 'complete' : 'incomplete'}.`);
        await fetchData(); // Re-fetch to confirm and get latest progress
    } catch (err) {
        toast.error('Failed to update progress', { description: err.message });
        // Revert optimistic update on failure
        setLectures(lectures);
        if (selectedLecture.id === lectureToToggle.id) {
            setSelectedLecture(selectedLecture);
        }
    }
  };

  const courseProgress = useMemo(() => {
    if (lectures.length === 0) return 0;
    const completedCount = lectures.filter(l => l.is_completed).length;
    return (completedCount / lectures.length) * 100;
  }, [lectures]);

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

  if (loading) return <LecturePageSkeleton />;

  if (!course) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Course Not Found</h1>
          <p className="text-muted-foreground">The course you are looking for does not exist.</p>
          <Link href="/dashboard/student">
            <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const layoutVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={headerVariants}>
            <Link href="/dashboard/student" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to My Courses
            </Link>
        </motion.div>

        <motion.header
          initial="hidden"
          animate="visible"
          variants={headerVariants}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              <p className="text-lg text-muted-foreground mt-1">{course.description}</p>
            </div>
            <div className="w-full md:w-1/3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Course Progress</span>
                <span className="text-sm font-bold text-foreground">{Math.round(courseProgress)}%</span>
              </div>
              <Progress value={courseProgress} className="w-full" />
            </div>
          </div>
        </motion.header>
        
        <motion.div 
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            variants={layoutVariants}
            initial="hidden"
            animate="visible"
        >
          {/* Lectures List */}
          <motion.div className="lg:col-span-1" variants={itemVariants}>
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 sticky top-24">
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                {Object.entries(groupedLectures).map(([moduleName, moduleLectures]) => (
                  <div key={moduleName}>
                    <h3 className="text-lg font-semibold mb-3 px-2 text-primary">{moduleName}</h3>
                    <div className="space-y-2">
                    {moduleLectures.map((lecture, index) => {
                      const isUnlocked = true; // Future logic for drip content can go here
                      return (
                        <motion.div
                          key={lecture.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => isUnlocked && setSelectedLecture(lecture)}
                          className={`flex items-center p-3 rounded-lg transition-all cursor-pointer ${
                            selectedLecture?.id === lecture.id
                              ? 'bg-primary/20'
                              : 'hover:bg-muted/50'
                          } ${!isUnlocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                           {isUnlocked ? (
                            lecture.is_completed ? (
                              <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />
                            ) : (
                              <PlayCircle className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                            )
                          ) : (
                            <Lock className="h-5 w-5 mr-3 text-muted-foreground flex-shrink-0" />
                          )}
                          <span className="flex-grow truncate">{lecture.title}</span>
                        </motion.div>
                      );
                    })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Lecture Content Viewer */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-card/50 backdrop-blur-lg border-border/20 sticky top-24">
              <AnimatePresence mode="wait">
                {selectedLecture ? (
                  <motion.div
                    key={selectedLecture.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardHeader className="flex flex-row justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl font-bold">{selectedLecture.title}</CardTitle>
                        <p className="text-muted-foreground mt-1">{selectedLecture.description}</p>
                      </div>
                      <Button onClick={() => handleMarkComplete(selectedLecture)} size="sm">
                        {selectedLecture.is_completed ? (
                            <><CheckCircle className="h-4 w-4 mr-2" /> Mark as Incomplete</>
                        ): (
                            <><Circle className="h-4 w-4 mr-2" /> Mark as Complete</>
                        )}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {selectedLecture.content_url ? (
                        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                           {/* Simple check for video URL, can be improved */}
                           {selectedLecture.content_url.includes('youtube.com') || selectedLecture.content_url.includes('youtu.be') ? (
                             <iframe
                               className="w-full h-full"
                               src={`https-safe://www.youtube.com/embed/${selectedLecture.content_url.split('v=')[1] || selectedLecture.content_url.split('/').pop()}`}
                               title="YouTube video player"
                               frameBorder="0"
                               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                               allowFullScreen
                             ></iframe>
                           ) : (
                             <div className="w-full h-full flex items-center justify-center">
                               <a href={selectedLecture.content_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                 View Content Resource
                               </a>
                             </div>
                           )}
                        </div>
                      ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-lg">
                          <h3 className="text-xl font-medium text-muted-foreground">No Content</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            This lecture does not have any content associated with it yet.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                ) : (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20">
                     <h3 className="text-xl font-medium text-muted-foreground">Select a lecture to begin</h3>
                     <p className="mt-2 text-sm text-muted-foreground">
                       Choose a lecture from the list to view its content.
                     </p>
                   </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
