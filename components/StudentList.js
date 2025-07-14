"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import CreateEditStudentModal from './CreateEditStudentModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function StudentList() {
  const { user, loading: authLoading } = useAuth();
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes, enrollmentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/courses'),
        fetch('/api/enrollments'),
      ]);

      if (!studentsRes.ok || !coursesRes.ok || !enrollmentsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const studentsData = await studentsRes.json();
      const coursesData = await coursesRes.json();
      const enrollmentsData = await enrollmentsRes.json();

      setStudents(studentsData || []);
      setCourses(coursesData || []);
      setEnrollments(enrollmentsData || []);
    } catch (err) {
      setError(err.message);
      toast.error('Error fetching data', { description: err.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchData();
      } else {
        setLoading(false); 
      }
    }
  }, [user, authLoading, fetchData]);

  const handleOpenModal = (student = null) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  const handleSaveStudent = async (studentData) => {
    const isEditMode = !!selectedStudent;
    const url = isEditMode ? `/api/users/${selectedStudent.id}` : '/api/users';
    const method = isEditMode ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });

    if (!res.ok) {
      const { message } = await res.json();
      throw new Error(message || `Failed to ${isEditMode ? 'update' : 'create'} student`);
    }

    toast.success(`Student ${isEditMode ? 'updated' : 'created'} successfully!`);
    fetchData(); // Refresh data
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }

    try {
        const res = await fetch(`/api/users/${studentId}`, { method: 'DELETE' });
        if (!res.ok) {
            const { message } = await res.json();
            throw new Error(message || 'Failed to delete student');
        }
        toast.success('Student deleted successfully!');
        fetchData(); // Refresh data
    } catch (err) {
        toast.error('Failed to delete student', { description: err.message });
    }
  };
  
  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (courseFilter !== 'all') {
      const studentIdsInCourse = enrollments
        .filter(e => e.course_id === parseInt(courseFilter))
        .map(e => e.student_id);
      filtered = filtered.filter(s => studentIdsInCourse.includes(s.id));
    }

    return filtered;
  }, [students, searchTerm, courseFilter, enrollments]);

  if (loading || authLoading) return <div>Loading students...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!students) return <div>Could not load students.</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Student Management</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Input 
          placeholder="Search by name or email..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
            <option value="all">All Courses</option>
            {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
            ))}
        </select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enrolled Courses</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const studentEnrollments = enrollments.filter(e => e.student_id === student.id);
                const enrolledCourses = studentEnrollments.map(se => {
                    const course = courses.find(c => c.id === se.course_id);
                    return course ? course.title : 'Unknown Course';
                });

                return (
                    <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>{enrolledCourses.join(', ') || 'Not enrolled'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenModal(student)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)} className="text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center">No students found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateEditStudentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />
    </div>
  );
} 