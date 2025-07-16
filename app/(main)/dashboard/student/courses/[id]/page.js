"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  Lock,
  ArrowLeft,
  Search,
  X,
  Keyboard,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Resizable } from "react-resizable";
import "react-resizable/css/styles.css";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/lib/utils";

/* ---------- 1. LOADER ---------- */
const LecturePageSkeleton = () => (
  <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto bg-gray-50">
    <Skeleton className="h-8 w-48 mb-8" />
    <Skeleton className="h-28 w-full mb-8" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Skeleton className="h-96 w-full" />
      <Skeleton className="h-[50vh] w-full" />
    </div>
  </div>
);

/* ---------- 2. MAIN COMPONENT ---------- */
export default function PremiumStudentCourseDetailsPage({ params }) {
  const { user } = useAuth();
  const { id: courseId } = params;

  const [course, setCourse] = useState(null);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCommand, setShowCommand] = useState(false);

  const viewerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [courseRes, lecturesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/courses/${courseId}/lectures?student_id=${user.id}`),
      ]);
      const courseData = await courseRes.json();
      const lecturesData = lecturesRes.ok ? await lecturesRes.json() : [];
      setCourse(courseData);
      const published = Array.isArray(lecturesData) ? lecturesData.filter(l => l.is_published) : [];
      setLectures(published);
      if (published.length) setSelectedLecture(published[0]);
    } catch {
      toast.error("Could not load course");
    } finally {
      setLoading(false);
    }
  }, [courseId, user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMarkComplete = async lecture => {
    const toggle = !lecture.is_completed;
    const optimistic = lectures.map(l => (l.id === lecture.id ? { ...l, is_completed: toggle } : l));
    setLectures(optimistic);
    setSelectedLecture(prev => ({ ...prev, is_completed: toggle }));
    try {
      await fetch(`/api/lectures/${lecture.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_completed: toggle }),
      });
      toast.success(toggle ? "Completed 🎉" : "Marked as Incomplete");
    } catch {
      toast.error("Failed to update");
      setLectures(lectures);
      setSelectedLecture(selectedLecture);
    }
  };

  const progress = useMemo(() => {
    if (!lectures.length) return 0;
    return (lectures.filter(l => l.is_completed).length / lectures.length) * 100;
  }, [lectures]);

  const grouped = useMemo(() => {
    return lectures.reduce((acc, l) => {
      const module = l.module || "General";
      acc[module] = acc[module] || [];
      acc[module].push(l);
      return acc;
    }, {});
  }, [lectures]);

  // --- FULLSCREEN TOGGLE ---
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  useHotkeys("f", toggleFullscreen);
  useHotkeys("k", () => setShowCommand(c => !c));

  if (loading) return <LecturePageSkeleton />;
  if (!course) return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black">Course Not Found</h1>
        <Link href="/dashboard/student">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/dashboard/student" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition">
            <ArrowLeft className="h-4 w-4" /> My Courses
          </Link>
          <Button onClick={() => setShowCommand(true)} variant="ghost" size="sm" className="text-gray-600">
            <Keyboard className="h-4 w-4 mr-2" /> ⌘K
          </Button>
        </motion.header>

        {/* Course info */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black">
            {course.title}
          </h1>
          <p className="mt-1 max-w-2xl text-base text-gray-500">{course.description}</p>
        </motion.section>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="font-bold text-blue-700 text-lg">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Layout */}
        <Resizable
          width={sidebarWidth}
          height={Infinity}
          onResize={(e, { size }) => setSidebarWidth(size.width)}
          minConstraints={[260, Infinity]}
          maxConstraints={[600, Infinity]}
          axis="x"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <motion.div
              className="lg:col-span-4"
              animate={{ width: sidebarWidth }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              <Card className="bg-gray-50 border-gray-300 h-[78vh] sticky top-24 flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg text-black">Course Content</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {Object.entries(grouped).map(([mod, list]) => (
                    <div key={mod}>
                      <h3 className="font-semibold text-blue-700 mb-2">{mod}</h3>
                      <div className="space-y-1">
                        {list.map((lec, i) => (
                          <motion.button
                            key={lec.id}
                            onClick={() => setSelectedLecture(lec)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-md transition-all text-sm",
                              selectedLecture?.id === lec.id
                                ? "bg-blue-100 ring-1 ring-blue-500"
                                : "hover:bg-gray-200"
                            )}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            {lec.is_completed ? (
                              <CheckCircle className="h-5 w-5 text-blue-600" />
                            ) : (
                              <PlayCircle className="h-5 w-5 text-gray-500" />
                            )}
                            <span className="truncate">{lec.title}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Viewer */}
            <motion.div
              ref={viewerRef}
              className={cn(
                "lg:col-span-8",
                isFullscreen && "fixed inset-0 z-50 bg-white flex items-center justify-center"
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Card className="bg-gray-50 border-gray-300 w-full h-[78vh] flex flex-col">
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl font-bold text-black">{selectedLecture?.title || "Select a lecture"}</CardTitle>
                    <p className="text-sm text-gray-600">{selectedLecture?.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleMarkComplete(selectedLecture)}
                      size="sm"
                      variant="ghost"
                      className="text-xs text-black"
                    >
                      {selectedLecture?.is_completed ? (
                        <CheckCircle className="mr-1 h-4 w-4" />
                      ) : (
                        <Circle className="mr-1 h-4 w-4" />
                      )}
                      {selectedLecture?.is_completed ? "Completed" : "Mark Done"}
                    </Button>
                    <Button
                      onClick={toggleFullscreen}
                      variant="ghost"
                      size="icon"
                      className="text-black"
                    >
                      {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {selectedLecture?.content_url ? (
                      <motion.div
                        key={selectedLecture.id}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="w-full h-full"
                      >
                        {selectedLecture.content_url.includes("youtube") ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${selectedLecture.content_url.split("v=")[1] || selectedLecture.content_url.split("/").pop()}`}
                            className="w-full h-full rounded-xl"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Button asChild>
                              <a href={selectedLecture.content_url} target="_blank" rel="noopener noreferrer">
                                Open Resource
                              </a>
                            </Button>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <div className="text-center">
                        <h3 className="text-gray-600">No content yet</h3>
                      </div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </Resizable>

        {/* Command Palette */}
        <AnimatePresence>
          {showCommand && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur z-[100] flex items-center justify-center"
              onClick={() => setShowCommand(false)}
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="w-full max-w-lg bg-white border border-gray-300 rounded-xl p-4"
              >
                <div className="flex items-center gap-2 text-gray-700">
                  <Search className="h-4 w-4" />
                  <input
                    placeholder="Search lectures..."
                    className="w-full bg-transparent outline-none"
                  />
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {lectures.map(l => (
                    <li key={l.id}>
                      <button
                        onClick={() => {
                          setSelectedLecture(l);
                          setShowCommand(false);
                        }}
                        className="w-full text-left p-2 rounded hover:bg-gray-100"
                      >
                        {l.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}