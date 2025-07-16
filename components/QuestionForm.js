"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

export default function QuestionForm({ question, onSave, onCancel }) {
  const [text, setText] = useState("");
  const [type, setType] = useState("multiple_choice");
  const [points, setPoints] = useState(1);
  const [imageUrl, setImageUrl] = useState("");
  const [options, setOptions] = useState([]);

  /* ---------- Pre-fill on edit ---------- */
  useEffect(() => {
    if (question) {
      setText(question.question_text || "");
      setType(question.question_type || "multiple_choice");
      setPoints(question.points || 1);
      setImageUrl(question.image_url || "");
      setOptions(
        question.options?.length
          ? question.options
          : [
              { option_text: "True", is_correct: false },
              { option_text: "False", is_correct: false },
            ]
      );
    } else {
      setText("");
      setType("multiple_choice");
      setPoints(1);
      setImageUrl("");
      setOptions([
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
    }
  }, [question]);

  /* ---------- True/False seed ---------- */
  useEffect(() => {
    if (type === "true_false" && options.length !== 2) {
      setOptions([
        { option_text: "True", is_correct: false },
        { option_text: "False", is_correct: false },
      ]);
    }
  }, [type, options.length]);

  const setOption = (idx, field, val) => {
    const upd = [...options];
    upd[idx][field] = val;
    setOptions(upd);
  };
  const setCorrect = (idx, checked) =>
    setOptions(options.map((o, i) => ({ ...o, is_correct: i === idx ? !!checked : false })));
  const addOption = () => setOptions([...options, { option_text: "", is_correct: false }]);
  const removeOption = (idx) => {
    const upd = options.filter((_, i) => i !== idx);
    if (!upd.length) upd.push({ option_text: "", is_correct: false });
    setOptions(upd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ question_text: text, question_type: type, points: +points, image_url: imageUrl, options });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
        {question ? "Edit Question" : "Create Question"}
      </h2>

      <div>
        <Label>Question</Label>
        <Textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          className="resize-none rounded-xl"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl">
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True / False</option>
            <option value="short_answer">Short Answer</option>
          </select>
        </div>
        <div>
          <Label>Points</Label>
          <Input type="number" min={0} value={points} onChange={(e) => setPoints(e.target.value)} className="rounded-xl" />
        </div>
      </div>

      <div>
        <Label>Image URL (optional)</Label>
        <Input
          placeholder="https://example.com/image.png"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="rounded-xl"
        />
        {imageUrl && <img src={imageUrl} alt="preview" className="mt-2 rounded-xl max-h-40 w-full object-cover" />}
      </div>

      {(type === "multiple_choice" || type === "true_false") && (
        <div>
          <Label>Options</Label>
          <div className="space-y-3">
            {options.map((o, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <Checkbox checked={o.is_correct} onCheckedChange={(c) => setCorrect(idx, c)} />
                <Input
                  value={o.option_text}
                  onChange={(e) => setOption(idx, "option_text", e.target.value)}
                  placeholder={`Option ${idx + 1}`}
                  required
                  className="flex-1"
                />
                {options.length > 1 && (
                  <Button variant="ghost" onClick={() => removeOption(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          {type === "multiple_choice" && (
            <Button variant="outline" onClick={addOption} className="mt-2">
              <Plus className="w-4 h-4 mr-1" /> Add Option
            </Button>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{question ? "Update" : "Create"}</Button>
      </div>
    </form>
  );
}