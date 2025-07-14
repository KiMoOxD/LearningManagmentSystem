"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import CourseCard from '@/components/CourseCard';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await fetch('/api/courses');
        if (!res.ok) {
          // It's okay if it fails (e.g., 404 if no enrollments), we'll show the empty state.
          // We'll only throw for other server errors.
          if (res.status === 404) {
            setCourses([]);
            return;
          }
          throw new Error('Failed to fetch courses');
        }
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        toast.error('Could not load your courses', { description: error.message });
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
        <p className="text-lg text-muted-foreground">Your learning journey starts here.</p>
      </header>
      
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} userRole="student" />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-xl font-medium text-muted-foreground">No Courses Yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            You are not enrolled in any courses. Please contact your teacher to get started.
          </p>
        </div>
      )}
    </div>
  );
}
