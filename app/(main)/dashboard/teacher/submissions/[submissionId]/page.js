'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// This component is almost identical to the student's results page.
// In a real app, this could be a shared component.
export default function SubmissionDetailsPage() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const router = useRouter();
    const params = useParams();
    const { submissionId } = params;

    useEffect(() => {
        if (!submissionId) return;

        const fetchResults = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/quizzes/submissions/${submissionId}/results`); 
                if (!response.ok) {
                    throw new Error('Failed to load submission details.');
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
    }, [submissionId]);

    const getOptionText = (options, optionId) => {
        if (!options || !optionId) return 'No answer';
        return options.find(o => o.id === optionId)?.option_text || 'Invalid option';
    }

    if (loading) return <div className="container mx-auto py-10">Loading details...</div>;
    if (error) return <div className="container mx-auto py-10 text-red-500">{error}</div>;
    if (!results) return null;

    return (
        <div className="container mx-auto py-10">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                &larr; Back to Submissions
            </Button>
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Results for: {results.quizTitle}</CardTitle>
                    <CardDescription>
                        Submitted on {new Date(results.submittedAt).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold">Final Score: {results.score}%</p>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {results.questions.map((q, index) => (
                    <Card key={q.id} className={cn('p-4', q.is_correct ? 'bg-green-50' : 'bg-red-50')}>
                        <p className="font-semibold">{index + 1}. {q.question_text}</p>
                        <div className="mt-2 text-sm">
                           <p>Student's answer: 
                                <span className={cn('font-bold', q.is_correct ? 'text-green-700' : 'text-red-700')}>
                                    {' '}{q.question_type === 'short_answer' ? (q.answer_text || 'No answer') : getOptionText(q.options, q.selected_option_id)}
                                </span>
                           </p>
                           {!q.is_correct && (
                               <p>Correct answer: 
                                   <span className="font-bold text-green-700">
                                       {' '}{q.question_type === 'short_answer' 
                                            ? q.options.find(opt => opt.is_correct)?.option_text
                                            : getOptionText(q.options, q.options.find(opt => opt.is_correct)?.id)}
                                   </span>
                               </p>
                           )}
                        </div>
                        <div className="flex items-center mt-2">
                            {q.is_correct 
                                ? <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" /> 
                                : <XCircle className="h-5 w-5 text-red-600 mr-2" />}
                            <span className={cn(q.is_correct ? 'text-green-600' : 'text-red-600')}>
                                {q.is_correct ? 'Correct' : 'Incorrect'}
                            </span>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
} 