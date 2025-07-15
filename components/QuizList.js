'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Eye, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const statusVariantMap = {
  Published: 'success',
  Draft: 'secondary',
  Overdue: 'destructive',
};

export default function QuizList({ quizzes, onEdit, onDelete }) {
  const router = useRouter();

  const handleEdit = (quiz) => {
    if (onEdit) {
      onEdit(quiz);
    } else {
      // Fallback to router push if onEdit is not provided
      router.push(`/dashboard/teacher/quizzes/${quiz.id}`);
    }
  };

  const handleDelete = (quizId) => {
    if (onDelete) {
      onDelete(quizId);
    } else {
      console.error('onDelete handler not provided');
    }
  };

  const handleViewSubmissions = (quizId) => {
    // Navigate to the submissions page for this quiz
    router.push(`/dashboard/teacher/quizzes/${quizId}/submissions`);
  };

  if (!quizzes || quizzes.length === 0) {
    return <p>No quizzes found.</p>;
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Grade</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quizzes.map((quiz) => (
            <TableRow key={quiz.id}>
              <TableCell className="font-medium">
                <a 
                  onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}`)}
                  className="cursor-pointer hover:underline"
                >
                  {quiz.title}
                </a>
              </TableCell>
              <TableCell>{quiz.course_title}</TableCell>
              <TableCell>
                <Badge variant={quiz.is_published ? 'success' : 'secondary'}>
                  {quiz.is_published ? 'Published' : 'Draft'}
                </Badge>
              </TableCell>
              <TableCell>{quiz.due_date ? new Date(quiz.due_date).toLocaleDateString() : 'N/A'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(quiz)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit Details</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/teacher/quizzes/${quiz.id}`)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Add/Edit Questions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleViewSubmissions(quiz.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>View Submissions</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => onDelete(quiz.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 