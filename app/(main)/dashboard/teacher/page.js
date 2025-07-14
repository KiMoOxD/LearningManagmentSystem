"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import CreateEditCourseModal from '@/components/modals/CreateEditCourseModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, BookOpen, Users, BarChart3, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

const StatCard = ({ icon, title, value }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold text-gray-800">{value}</div>
    </CardContent>
  </Card>
);

const CourseListItem = ({ course, onEdit, onDelete }) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader>
      <CardTitle className="flex justify-between items-start">
        <span className="text-lg font-semibold text-gray-800">{course.title}</span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => onEdit(course)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(course.id)} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{course.description}</p>
      <Button asChild variant="outline" className="w-full">
        <Link href={`/dashboard/teacher/courses/${course.id}`}>Manage Course</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, studentsRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/users?role=student'), // Assuming API can filter by role
      ]);

      if (!coursesRes.ok) throw new Error(`Courses: ${coursesRes.statusText}`);
      if (!studentsRes.ok) throw new Error(`Students: ${studentsRes.statusText}`);

      const coursesData = await coursesRes.json();
      const studentsData = await studentsRes.json();
      
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
    } catch (error) {
      toast.error('Error fetching dashboard data', { description: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user, fetchDashboardData]);

  const handleOpenModal = (course = null) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (courseData) => {
    const isEditMode = !!selectedCourse;
    const url = isEditMode ? `/api/courses/${selectedCourse.id}` : '/api/courses';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData),
      });

      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Failed to save course');
      }
      
      toast.success(`Course ${isEditMode ? 'updated' : 'created'} successfully!`);
      await fetchDashboardData();
      setIsModalOpen(false);
    } catch (err) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} course`, { description: err.message });
    }
  };
  
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const res = await fetch(`/api/courses/${courseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete course');
      toast.success('Course deleted successfully');
      await fetchDashboardData();
    } catch (err) {
      toast.error('Failed to delete course', { description: err.message });
    }
  };
  
  if (loading) {
    return <div className="p-8">Loading dashboard...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome, {user?.name}!</h1>
            <p className="text-md text-gray-500">Here's your command center.</p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </motion.header>

        {/* Stats Section */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
        >
          <StatCard icon={<Users className="h-5 w-5 text-gray-400" />} title="Total Students" value={students.length} />
          <StatCard icon={<BookOpen className="h-5 w-5 text-gray-400" />} title="Courses Offered" value={courses.length} />
          <StatCard icon={<BarChart3 className="h-5 w-5 text-gray-400" />} title="Avg. Completion" value="76%" />
        </motion.div>

        {/* Courses Section */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Your Courses</h2>
          </div>
          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseListItem 
                  key={course.id} 
                  course={course}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteCourse}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium text-gray-600">No courses yet.</h3>
                <p className="text-sm text-gray-500 mb-4">Click the button below to create your first course.</p>
                <Button onClick={() => handleOpenModal()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create a Course
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

      </div>
      <CreateEditCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        course={selectedCourse}
      />
    </div>
  );
}
