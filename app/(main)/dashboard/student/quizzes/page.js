"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PlayCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await fetch("/api/quizzes");
        if (!res.ok) throw new Error("Failed to fetch quizzes");
        setQuizzes(await res.json());
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  const availableQuizzes   = quizzes.filter((q) => q.status !== "Completed");
  const completedQuizzes   = quizzes.filter((q) => q.status === "Completed");

  const handleQuizClick = (quiz) => {
    if (quiz.status === "Completed") {
      router.push(`/dashboard/student/quizzes/${quiz.id}/results`);
    } else if (quiz.status === "Overdue") {
      toast.error("This quiz is overdue and can no longer be taken.");
    } else {
      router.push(`/dashboard/student/quizzes/${quiz.id}`);
    }
  };

  const QuizCard = ({ quiz }) => {
    const statusMeta = {
      Completed: { bg: "bg-emerald-500/10", text: "text-emerald-600", icon: <CheckCircle className="w-4 h-4" /> },
      Overdue:   { bg: "bg-red-500/10",  text: "text-red-600",  icon: <Clock className="w-4 h-4" /> },
      default:   { bg: "bg-sky-500/10",  text: "text-sky-600",  icon: <PlayCircle className="w-4 h-4" /> },
    };
    const meta = statusMeta[quiz.status] || statusMeta.default;

    return (
      <Card
        className="relative flex flex-col h-full rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-md shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      >
        <CardHeader>
          <CardTitle className="text-xl font-semibold">{quiz.title}</CardTitle>
          <CardDescription>{quiz.course_title}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center justify-between mb-2">
            <Badge className={cn(meta.bg, meta.text, "border-0")}>{quiz.status}</Badge>
            <span className="text-sm text-muted-foreground">
              Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => handleQuizClick(quiz)}
            disabled={quiz.status === "Overdue"}
            className="w-full rounded-xl"
            variant={quiz.status === "Completed" ? "outline" : "default"}
          >
            {quiz.status === "Completed" ? "View Results" : quiz.status === "Overdue" ? "Time's Up" : "Start Quiz"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  /* ---------- Skeleton ---------- */
  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-52 rounded-2xl bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8">
          My Quizzes
        </h1>

        {loading && <SkeletonGrid />}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {/* Available */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Available</h2>
              {availableQuizzes.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableQuizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No available quizzes right now.</p>
              )}
            </div>

            {/* Completed */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-slate-100">Completed</h2>
              {completedQuizzes.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedQuizzes.map((q) => <QuizCard key={q.id} quiz={q} />)}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">You haven’t completed any quizzes yet.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}