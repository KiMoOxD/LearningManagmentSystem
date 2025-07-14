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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';

export default function AddGradeModal({ isOpen, onClose, onAdd, courseId }) {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [description, setDescription] = useState('');
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          // Fetch students enrolled in the specific course
          const res = await fetch(`/api/enrollments?course_id=${courseId}`);
          if (!res.ok) throw new Error('Failed to fetch students for this course');
          const enrolledStudents = await res.json();
          setStudents(Array.isArray(enrolledStudents) ? enrolledStudents : []);
        } catch (error) {
          toast.error("Failed to load students", { description: error.message });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudents();
  }, [isOpen, courseId]);

  const handleAdd = () => {
    if (!selectedStudentId || !description || !score) {
      toast.error("All fields are required.");
      return;
    }
    onAdd({
      student_id: selectedStudentId,
      course_id: courseId,
      score: parseInt(score, 10),
      description,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Manual Grade</DialogTitle>
          <DialogDescription>
            Manually add a grade for a student in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="student">Student</Label>
            <Select onValueChange={setSelectedStudentId} value={selectedStudentId} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Class Participation" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="score">Score (%)</Label>
            <Input id="score" type="number" value={score} onChange={(e) => setScore(e.target.value)} placeholder="e.g., 95" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} disabled={loading}>
            Add Grade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 