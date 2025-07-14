"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateEditQuizModal({ isOpen, onClose, onSave, courseId, quiz }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    if (quiz) {
      setTitle(quiz.title || '');
      setDueDate(quiz.due_date ? new Date(quiz.due_date).toISOString().split('T')[0] : '');
      setTimeLimit(quiz.time_limit || '');
      setQuestions(quiz.questions || [{ type: 'multiple-choice', text: '', options: ['', ''], correct_answer: '' }]);
    } else {
      // Reset for new quiz
      setTitle('');
      setDueDate('');
      setTimeLimit('');
      setQuestions([{ type: 'multiple-choice', text: '', options: ['', ''], correct_answer: '' }]);
    }
  }, [quiz]);

  const handleSave = () => {
    if (!title) {
      toast.error("Quiz title is required.");
      return;
    }
    const quizData = { title, due_date: dueDate, time_limit: timeLimit, questions, course_id: courseId };
    if (quiz?.id) {
        quizData.id = quiz.id;
    }
    onSave(quizData);
  };
  
  // Dynamic Question Form Handlers (to be fully implemented)
  const addQuestion = () => {
    setQuestions([...questions, { type: 'multiple-choice', text: '', options: ['', ''], correct_answer: '' }]);
  };

  const removeQuestion = (index) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{quiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          <DialogDescription>
            Fill in the details for your quiz. You can add multiple types of questions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-6">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Chapter 1 Review" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date (Optional)</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (Minutes, Optional)</Label>
                <Input id="timeLimit" type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} placeholder="e.g., 30" />
            </div>
          </div>
          
          <hr className="my-4" />

          <h3 className="text-lg font-medium">Questions</h3>
          {questions.map((q, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <p className="font-semibold">Question {index + 1}</p>
                <Button variant="ghost" size="icon" onClick={() => removeQuestion(index)} className="text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {/* More complex question type logic will go here */}
              <Label>Question Text</Label>
              <Input placeholder="What is 2 + 2?" />
            </div>
          ))}
          
          <Button variant="outline" onClick={addQuestion}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            {quiz ? 'Save Changes' : 'Create Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 