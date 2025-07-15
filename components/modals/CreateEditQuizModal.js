"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog.js';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form.js';
import { Input } from '@/components/ui/input.js';
import { Button } from '@/components/ui/button.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.js';
import { Textarea } from '@/components/ui/textarea.js';
import { Switch } from '@/components/ui/switch.js';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.js';
import { Calendar } from '@/components/ui/calendar.js';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Define the Zod schema for form validation with more descriptive messages
const quizFormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  course_id: z.string().min(1, 'Please select a grade level.'),
  description: z.string().optional(),
  time_limit: z.coerce
    .number()
    .int()
    .min(5, 'Time limit must be at least 5 minutes.')
    .max(180, 'Time limit cannot exceed 180 minutes.'),
  due_date: z.date().optional(),
  is_published: z.boolean().default(false),
});

export default function CreateEditQuizModal({ isOpen, onClose, quiz, onSave }) {
  const [courses, setCourses] = useState([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = !!quiz;

  const form = useForm({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      course_id: '',
      description: '',
      time_limit: 30,
      due_date: undefined,
      is_published: false,
    },
  });

  // Effect to reset form state when the modal opens or the quiz data changes
  useEffect(() => {
    if (isOpen) {
      const defaultValues = isEditing
        ? {
            ...quiz,
            course_id: String(quiz.course_id), // Ensure course_id is a string for the Select component
            due_date: quiz.due_date ? new Date(quiz.due_date) : undefined,
          }
        : {
            title: '',
            course_id: '',
            description: '',
            time_limit: 30,
            due_date: undefined,
            is_published: false,
          };
      form.reset(defaultValues);
    }
  }, [isOpen, quiz, isEditing, form]); // form.reset was removed from deps, form is sufficient

  // Effect to fetch courses when the modal is opened
  useEffect(() => {
    if (isOpen) {
      const fetchCourses = async () => {
        setIsLoadingCourses(true);
        setError(null);
        try {
          // IMPORTANT: Ensure this API route exists and returns an array of courses
          // in the format: [{ id: 'some-uuid', title: 'Grade 1 Math' }, ...]
          const response = await fetch('/api/courses');
          if (!response.ok) {
            throw new Error('Failed to fetch courses. Please try again.');
          }
          const data = await response.json();
          setCourses(data);
        } catch (err) {
          console.error('Failed to fetch courses:', err);
          setError(err.message);
        } finally {
          setIsLoadingCourses(false);
        }
      };
      fetchCourses();
    }
  }, [isOpen]); // This effect now correctly depends on `isOpen`

  // Handle form submission
  const onSubmit = (data) => {
    onSave(data);
    onClose(); // Close modal on successful save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] bg-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for your quiz.' : 'Fill out the form to create a new quiz.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quiz Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Algebra I: Chapter 2" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="course_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Grade / Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoadingCourses || !!error}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingCourses 
                            ? "Loading grades..." 
                            : error 
                            ? "Could not load grades" 
                            : "Select a grade"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.length > 0 ? (
                        courses.map((course) => (
                          <SelectItem key={course.id} value={String(course.id)}>
                            {course.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-options" disabled>
                          {isLoadingCourses ? 'Loading...' : 'No grades available'}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / Instructions</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide instructions for the quiz..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="time_limit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col pt-2">
                     <FormLabel className="mb-2">Due Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (date) {
                              // Set the time to the end of the day in the local timezone
                              // to avoid timezone conversion issues pushing it to the previous day.
                              date.setHours(23, 59, 59, 999);
                            }
                            field.onChange(date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="is_published"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Publish Quiz</FormLabel>
                    <DialogDescription className="text-sm text-gray-500">
                      Students will be able to see and take this quiz.
                    </DialogDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : isEditing ? 'Save Changes' : 'Create Quiz'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}