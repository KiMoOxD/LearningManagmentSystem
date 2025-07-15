'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [totalPossibleScore, setTotalPossibleScore] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quizTitle, setQuizTitle] = useState('');

    const router = useRouter();
    const params = useParams();
    const { id: quizId } = params;

    useEffect(() => {
        if (!quizId) return;

        const fetchSubmissions = async () => {
            try {
                setLoading(true);
                // Fetch submissions
                const subResponse = await fetch(`/api/quizzes/${quizId}/submissions`);
                if (!subResponse.ok) throw new Error('Failed to load submissions.');
                const subData = await subResponse.json();
                setSubmissions(subData.submissions);
                setTotalPossibleScore(subData.totalPossibleScore);
                
                // Fetch quiz details for the title
                const quizResponse = await fetch(`/api/quizzes/${quizId}`);
                if(!quizResponse.ok) throw new Error('Failed to load quiz details');
                const quizData = await quizResponse.json();
                setQuizTitle(quizData.title);

            } catch (err) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, [quizId]);

    const handleViewDetails = (submissionId) => {
        router.push(`/dashboard/teacher/submissions/${submissionId}`);
    };
    
    const handleDownloadCsv = () => {
        if (submissions.length === 0) {
            toast.info("There are no submissions to download.");
            return;
        }

        const headers = ["Student Name", "Email", "Score", "Total Score", "Submitted At"];
        const rows = submissions.map(sub => [
            `"${sub.student_name}"`,
            `"${sub.student_email}"`,
            sub.score,
            totalPossibleScore,
            `"${new Date(sub.submitted_at).toLocaleString()}"`
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `submissions-${quizId}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (loading) return <div className="container mx-auto py-10">Loading submissions...</div>;
    if (error) return <div className="container mx-auto py-10 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    &larr; Back to Quiz
                </Button>
                <Button onClick={handleDownloadCsv}>
                    Download CSV
                </Button>
            </div>
            <h1 className="text-3xl font-bold mb-2">Submissions for: {quizTitle}</h1>

            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.length > 0 ? submissions.map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="font-medium">{sub.student_name}</TableCell>
                                <TableCell>{sub.student_email}</TableCell>
                                <TableCell>{sub.score} / {totalPossibleScore}</TableCell>
                                <TableCell>{new Date(sub.submitted_at).toLocaleString()}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(sub.id)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">No submissions yet.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
} 