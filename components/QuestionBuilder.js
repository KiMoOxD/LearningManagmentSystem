'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import QuestionForm from './QuestionForm'; 

export default function QuestionBuilder({ quizId }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/quizzes/${quizId}/questions`);
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }
            const data = await response.json();
            setQuestions(data);
        } catch (err) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (quizId) {
            fetchQuestions();
        }
    }, [quizId]);

    const handleAddQuestion = () => {
        setSelectedQuestion(null);
        setIsFormOpen(true);
    };

    const handleEditQuestion = (question) => {
        setSelectedQuestion(question);
        setIsFormOpen(true);
    };

    const handleDeleteQuestion = async (questionId) => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        try {
            const response = await fetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete question');
            toast.success('Question deleted successfully');
            fetchQuestions(); // Refresh list
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleSaveQuestion = async (data) => {
        try {
            const isEditing = !!selectedQuestion;
            const url = isEditing 
                ? `/api/quizzes/${quizId}/questions/${selectedQuestion.id}` 
                : `/api/quizzes/${quizId}/questions`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error('Failed to save question');
            toast.success('Question saved successfully');
            fetchQuestions();
            setIsFormOpen(false);
        } catch (error) {
            toast.error(error.message);
        }
    };


    if (loading) return <p>Loading questions...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            {!isFormOpen ? (
                <>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Questions</h3>
                        <Button onClick={handleAddQuestion}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Question
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {questions.length > 0 ? (
                            questions.map((question, index) => (
                                <div key={question.id} className="p-4 border rounded-lg bg-slate-50 flex justify-between items-start">
                                    <div>
                                       <p className="font-semibold">{index + 1}. {question.question_text}</p>
                                       <p className="text-sm text-muted-foreground capitalize mt-1">{question.question_type.replace('_', ' ')} - {question.points} points</p>
                                    </div>
                                   <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEditQuestion(question)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDeleteQuestion(question.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                   </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-4">No questions have been added yet.</p>
                        )}
                    </div>
                </>
            ) : (
                <QuestionForm 
                    quizId={quizId}
                    question={selectedQuestion}
                    onSave={handleSaveQuestion}
                    onCancel={() => setIsFormOpen(false)}
                />
            )}
        </div>
    );
} 