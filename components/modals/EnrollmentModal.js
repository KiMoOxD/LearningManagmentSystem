"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function EnrollmentModal({ isOpen, onClose, onEnroll, enrolledStudentIds = [] }) {
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const res = await fetch('/api/users?role=student'); 
          if (!res.ok) throw new Error('Failed to fetch students');
          const allStudents = await res.json();
          
          const unEnrolled = allStudents.filter(
            (student) => !enrolledStudentIds.includes(student.id)
          );
          setAvailableStudents(unEnrolled);
          setSelectedStudentId(""); // Reset selection
        } catch (error) {
          toast.error("Failed to load students", { description: error.message });
        } finally {
          setLoading(false);
        }
      }
    };
    fetchStudents();
  }, [isOpen, enrolledStudentIds]);

  const handleEnrollClick = async () => {
    if (!selectedStudentId) {
      toast.warning("Please select a student to enroll.");
      return;
    }
    await onEnroll(selectedStudentId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Select a student from the list to enroll them in this course.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {loading ? (
            <p>Loading students...</p>
          ) : availableStudents.length > 0 ? (
            <Select onValueChange={setSelectedStudentId} value={selectedStudentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {availableStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id.toString()}>
                    {student.name} ({student.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-center text-sm text-gray-500">
              All available students are already enrolled.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleEnrollClick}
            disabled={!selectedStudentId || loading}
          >
            Enroll Student
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
