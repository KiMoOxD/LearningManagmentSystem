"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Play, Check, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...classes) => classes.filter(Boolean).join(" ");

const Timer = ({ expiryTimestamp, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [low, setLow] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      const now = Date.now();
      const diff = expiryTimestamp - now;
      if (diff <= 0) {
        clearInterval(iv);
        setTimeLeft("00:00");
        setLow(true);
        onTimeUp();
        return;
      }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      setLow(m < 2);
    }, 1000);
    return () => clearInterval(iv);
  }, [expiryTimestamp, onTimeUp]);

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold",
        low ? "bg-red-500/20 text-red-600 animate-pulse" : "bg-sky-500/20 text-sky-600"
      )}
    >
      <Clock className="w-4 h-4" />
      {timeLeft}
    </div>
  );
};

export default function QuizTakingPage() {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [endTime, setEndTime] = useState(null);

  const router = useRouter();
  const { id: quizId } = useParams();

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (!quizId) return;
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/take`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setQuiz(data);
        if (data.time_limit && data.submission.started_at) {
          const start = new Date(data.submission.started_at).getTime();
          setEndTime(start + data.time_limit * 60 * 1000);
        }
        setAnswers(
          data.questions.map((q) => ({
            question_id: q.id,
            answer_text: "",
            selected_option_id: null,
          }))
        );
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleAnswer = (qid, val, type) =>
    setAnswers((prev) =>
      prev.map((a) =>
        a.question_id === qid
          ? type === "text"
            ? { ...a, answer_text: val, selected_option_id: null }
            : { ...a, selected_option_id: val, answer_text: "" }
          : a
      )
    );

  const handleSubmit = async (auto = false) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/submissions/${quiz.submission.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("Submit failed");
      toast.success(auto ? "Time's up – submitted!" : "Quiz submitted!");
      router.push(`/dashboard/student/quizzes/${quizId}/results`);
    } catch (e) {
      toast.error(e.message);
      setSubmitting(false);
    }
  };

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
  if (!quiz || !quiz.questions?.length)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTitle>No questions yet</AlertTitle>
          <AlertDescription>Check back later.</AlertDescription>
        </Alert>
      </div>
    );

  const questions = quiz.questions;
  const currentQ = questions[current];
  const prog = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            {quiz.title}
          </h1>
          {endTime && <Timer expiryTimestamp={endTime} onTimeUp={() => handleSubmit(true)} />}
        </div>

        {/* radial progress */}
        <div className="mb-6">
          <div className="relative h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${prog}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1 text-muted-foreground">
            Question {current + 1} / {questions.length}
          </p>
        </div>

        {/* question card */}
        <div className="rounded-3xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50 p-6 sm:p-8">
          {/* text & image */}
          <h2 className="text-xl font-semibold mb-4">{currentQ.question_text}</h2>
          {currentQ.image_url && (
            <img
              src={currentQ.image_url}
              alt="question"
              className="w-full max-h-72 object-cover rounded-2xl mb-6"
            />
          )}

          {/* options — ENTIRE ROW CLICKABLE */}
          <div className="space-y-4">
            {currentQ.question_type === "multiple_choice" ||
            currentQ.question_type === "true_false" ? (
              <RadioGroup
                value={String(
                  answers.find((a) => a.question_id === currentQ.id)?.selected_option_id || ""
                )}
              >
{currentQ.options.map((opt) => {
  const isSelected =
    answers.find((a) => a.question_id === currentQ.id)?.selected_option_id === opt.id;

  return (
    <label
      key={opt.id}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300",
        isSelected
          ? "bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500"
          : "bg-slate-100/60 dark:bg-slate-700/50 border-2 border-transparent hover:border-indigo-400"
      )}
      onClick={() => handleAnswer(currentQ.id, opt.id, "option")}
    >
      {/* custom checkbox */}
      <div
        className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200",
          isSelected
            ? "bg-indigo-500 scale-110"
            : "bg-transparent border-2 border-slate-400 dark:border-slate-500"
        )}
      >
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>

      <span className="select-none">{opt.option_text}</span>
    </label>
  );
})}
              </RadioGroup>
            ) : (
              <Textarea
                rows={4}
                placeholder="Type your answer..."
                value={answers.find((a) => a.question_id === currentQ.id)?.answer_text || ""}
                onChange={(e) => handleAnswer(currentQ.id, e.target.value, "text")}
                className="rounded-xl"
              />
            )}
          </div>

          {/* nav / submit */}
          <div className="mt-8 flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={() => setCurrent((c) => c - 1)}
              disabled={current === 0}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </Button>

            {current === questions.length - 1 ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="rounded-full">Submit Quiz</Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Submit now?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You can’t change answers after submission.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleSubmit(false)} disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Button onClick={() => setCurrent((c) => c + 1)} className="rounded-full">
                Next <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}