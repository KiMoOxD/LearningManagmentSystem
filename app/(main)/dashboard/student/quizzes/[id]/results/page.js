"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
        const res = await fetch(`/api/quizzes/${quizId}/my-results`);
        if (!res.ok) throw new Error("Failed to load quiz results.");
        setResults(await res.json());
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [quizId]);

  const getOptionText = (options, optionId) =>
    options?.find((o) => o.id === optionId)?.option_text || "No answer";

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  if (!results) return null;

  const scorePercent = ((results.score / results.totalPossibleScore) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/student/quizzes")}
          className="mb-6 rounded-full"
        >
          &larr; Back to Quizzes
        </Button>

        {/* Hero score card */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl mb-10">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
          <div className="relative z-10 p-8 text-white text-center">
            <h1 className="text-3xl font-bold mb-1">{results.quizTitle}</h1>
            <p className="text-sm opacity-80 mb-4">
              Submitted on {new Date(results.submittedAt).toLocaleString()}
            </p>
            <p className="text-6xl font-black">{results.score} / {results.totalPossibleScore}</p>
            <p className="text-2xl font-light mt-2">{scorePercent}%</p>
          </div>
        </div>

        {/* Review section */}
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Review Your Answers
        </h2>

        <div className="space-y-6">
          {results.questions.map((q, idx) => {
            const isCorrect = q.is_correct;
            const userText =
              q.question_type === "short_answer"
                ? q.answer_text || "No answer"
                : getOptionText(q.options, q.selected_option_id);
            const correctText =
              q.question_type === "short_answer"
                ? q.options.find((o) => o.is_correct)?.option_text
                : getOptionText(q.options, q.options.find((o) => o.is_correct)?.id);

            return (
              <div
                key={q.id}
                className={cn(
                  "rounded-2xl backdrop-blur-md shadow-lg ring-1",
                  isCorrect
                    ? "bg-green-100/60 dark:bg-green-900/30 ring-green-300 dark:ring-green-700"
                    : "bg-red-100/60 dark:bg-red-900/30 ring-red-300 dark:ring-red-700"
                )}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                      {idx + 1}. {q.question_text}
                    </p>
                    <span className="text-sm font-bold">{q.points} pt{q.points !== 1 && "s"}</span>
                  </div>

                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center">
                      {isCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      )}
                      <span>
                        Your answer: <span className="font-semibold">{userText}</span>
                      </span>
                    </div>

                    {!isCorrect && (
                      <div className="flex items-center">
                        <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                        <span>
                          Correct answer: <span className="font-semibold">{correctText}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}