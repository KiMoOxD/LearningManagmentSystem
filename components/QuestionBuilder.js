"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, HelpCircle, CheckCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import QuestionForm from "./QuestionForm";

export default function QuestionBuilder({ quizId }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/quizzes/${quizId}/questions`);
      if (!res.ok) throw new Error("Failed to fetch");
      setQuestions(await res.json());
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) fetchQuestions();
  }, [quizId]);

  const handleAdd  = () => (setSelectedQuestion(null), setShowForm(true));
  const handleEdit = (q) => (setSelectedQuestion(q), setShowForm(true));
  const handleSave = async (data) => {
    const editing = !!selectedQuestion;
    const url = editing
      ? `/api/quizzes/${quizId}/questions/${selectedQuestion.id}`
      : `/api/quizzes/${quizId}/questions`;
    const res = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Save failed");
    toast.success("Question saved");
    fetchQuestions();
    setShowForm(false);
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this question?")) return;
    await fetch(`/api/quizzes/${quizId}/questions/${id}`, { method: "DELETE" });
    toast.success("Question deleted");
    fetchQuestions();
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <div className="h-2 w-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse"></div>
      </div>
    );
  if (error) return <p className="text-center text-red-500">{error}</p>;

  const typeMeta = {
    multiple_choice: { icon: <HelpCircle className="w-5 h-5" />, color: "sky" },
    true_false:      { icon: <CheckCircle className="w-5 h-5" />, color: "emerald" },
    short_answer:    { icon: <FileText className="w-5 h-5" />,   color: "amber" },
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Questions
        </h2>
        {!showForm && (
          <Button onClick={handleAdd} className="rounded-full shadow-lg shadow-indigo-500/30">
            <Plus className="mr-2 h-4 w-4" /> Add Question
          </Button>
        )}
      </div>

      {/* Empty state */}
      {!showForm && questions.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-block p-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-4">
            <HelpCircle className="w-12 h-12 text-indigo-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-4">
            No questions yet.
          </p>
          <Button onClick={handleAdd} variant="outline" className="rounded-xl">
            Create your first question
          </Button>
        </div>
      )}

      {/* List */}
      {!showForm && questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => {
            const { icon, color } = typeMeta[q.question_type];
            return (
              <div
                key={q.id}
                className="group relative overflow-hidden rounded-2xl bg-white/30 dark:bg-slate-800/30 backdrop-blur-md shadow-lg ring-1 ring-slate-200/50 dark:ring-slate-700/50 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
              >
                <div className="p-5 flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-${color}-500/10 text-${color}-500`}
                    >
                      {icon}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                        {i + 1}. {q.question_text}
                      </h3>
                      <div className="mt-1 flex items-center gap-3 text-sm">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium bg-${color}-500/10 text-${color}-500`}
                        >
                          {q.question_type.replace("_", " ")}
                        </span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {q.points} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(q)}
                      className="rounded-full"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(q.id)}
                      className="rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline form (smooth reveal) */}
      {showForm && (
        <div className="mt-8 p-6 rounded-2xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-700/50">
          <QuestionForm
            question={selectedQuestion}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}