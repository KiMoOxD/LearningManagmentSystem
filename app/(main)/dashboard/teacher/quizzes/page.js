'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import QuizList from '@/components/QuizList';
import CreateEditQuizModal from '@/components/modals/CreateEditQuizModal';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuizManagementPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courses, setCourses] = useState([]);
  const router = useRouter();

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quizzes');
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizzes(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    // Fetch courses for the filter dropdown
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
        toast.error('Failed to load grade levels for filtering.');
      }
    };
    fetchCourses();
  }, []);
  
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(quiz => 
        gradeFilter === 'all' || String(quiz.course_id) === gradeFilter
      )
      .filter(quiz => 
        statusFilter === 'all' || quiz.status.toLowerCase() === statusFilter
      );
  }, [quizzes, searchTerm, gradeFilter, statusFilter]);

  const handleCreateQuiz = () => {
    setSelectedQuiz(null);
    setIsModalOpen(true);
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setIsModalOpen(true);
  };
  
  const handleSaveQuiz = async (quizData) => {
    try {
      const isEditing = !!selectedQuiz;
      const url = isEditing ? `/api/quizzes/${selectedQuiz.id}` : '/api/quizzes';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData),
      });

      if (!response.ok) {
        throw new Error('Failed to save the quiz.');
      }
      
      setIsModalOpen(false);

      if (isEditing) {
        toast.success(`Quiz "${quizData.title}" has been updated successfully!`);
        fetchQuizzes(); // Re-fetch quizzes to show the latest data
      } else {
        const newQuiz = await response.json();
        toast.success(`Quiz "${newQuiz.title}" created. Now add some questions!`);
        router.push(`/dashboard/teacher/quizzes/${newQuiz.id}`);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete the quiz.');
      }

      toast.success('Quiz has been deleted successfully!');
      fetchQuizzes(); // Re-fetch quizzes
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <CreateEditQuizModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuiz}
        quiz={selectedQuiz}
      />
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <Button onClick={handleCreateQuiz}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-6">
            <Input 
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
            <Select value={gradeFilter} onValueChange={setGradeFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by grade" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    {courses.map(course => (
                        <SelectItem key={course.id} value={String(course.id)}>
                            {course.title}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
            </Select>
        </div>

        {loading && <p>Loading quizzes...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <QuizList quizzes={filteredQuizzes} onEdit={handleEditQuiz} onDelete={handleDeleteQuiz} />
        )}
      </div>
    </>
  );
} 