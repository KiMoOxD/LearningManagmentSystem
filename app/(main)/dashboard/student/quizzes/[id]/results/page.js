'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function QuizResultsPage() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();
    const params = useParams();
    const { id: quizId } = params;

    useEffect(() => {
        if (!quizId) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/quizzes/${quizId}/my-results`); 
                if (!response.ok) {
                    throw new Error('Failed to load quiz results.');
                }
                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [quizId]);

    const getOptionText = (options, optionId) => {
        if (!options || !optionId) return 'No answer';
        return options.find(o => o.id === optionId)?.option_text || 'Invalid option';
    }

    if (loading) return <div className="container mx-auto py-10">Loading results...</div>;
    if (error) return <div className="container mx-auto py-10 text-red-500">{error}</div>;
    if (!results) return null;

    return (
        <div className="container mx-auto py-10">
            <Button variant="ghost" onClick={() => router.push('/dashboard/student/quizzes')} className="mb-4">
                &larr; Back to Quizzes
            </Button>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Results for: {results.quizTitle}</CardTitle>
                    <CardDescription>
                        Submitted on {new Date(results.submittedAt).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">
                        Your Score: {results.score} / {results.totalPossibleScore}
                    </p>
                    {results.totalPossibleScore > 0 && (
                        <p className="text-2xl text-muted-foreground mt-2">
                           ({((results.score / results.totalPossibleScore) * 100).toFixed(0)}%)
                        </p>
                    )}
                </CardContent>
            </Card>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Review Your Answers</h2>
            <div className="space-y-4">
                {results.questions.map((q, index) => (
                    <Card key={q.id}>
                        <CardHeader className={cn(q.is_correct ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
                            <div className="flex justify-between items-center">
                                <p className="font-semibold">{index + 1}. {q.question_text}</p>
                                <span className={cn('font-bold', q.is_correct ? 'text-green-600' : 'text-red-500')}>
                                    {q.points} {q.points === 1 ? 'point' : 'points'}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="mt-2 text-sm space-y-2">
                               <div className="flex items-center">
                                    {q.is_correct 
                                        ? <CheckCircle2 className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" /> 
                                        : <XCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />}
                                   <p>Your answer: 
                                        <span className="font-semibold">
                                            {' '}{q.question_type === 'short_answer' ? (q.answer_text || 'No answer') : getOptionText(q.options, q.selected_option_id)}
                                        </span>
                                   </p>
                               </div>
                               {!q.is_correct && (
                                   <div className="flex items-center">
                                        <CheckCircle2 className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
                                       <p>Correct answer: 
                                           <span className="font-semibold text-green-700">
                                               {' '}{q.question_type === 'short_answer' 
                                                    ? q.options.find(opt => opt.is_correct)?.option_text
                                                    : getOptionText(q.options, q.options.find(opt => opt.is_correct)?.id)}
                                           </span>
                                       </p>
                                   </div>
                               )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 