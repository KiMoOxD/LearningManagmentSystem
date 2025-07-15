'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';

const optionSchema = z.object({
    option_text: z.string().min(1, 'Option text cannot be empty'),
    is_correct: z.boolean(),
});

const questionFormSchema = z.object({
  question_text: z.string().min(1, 'Question text is required'),
  question_type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  points: z.coerce.number().int().min(1, 'Points must be at least 1'),
  image_url: z.string().url().optional().or(z.literal('')),
  options: z.array(optionSchema).optional(),
});

export default function QuestionForm({ quizId, question, onSave, onCancel }) {
    const form = useForm({
        resolver: zodResolver(questionFormSchema),
        defaultValues: question || {
            question_text: '',
            question_type: 'multiple_choice',
            points: 10,
            image_url: '',
            options: [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
            ],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control: form.control,
        name: 'options',
    });

    const questionType = form.watch('question_type');

    // Adjust options based on question type
    useEffect(() => {
        if (questionType === 'true_false') {
            form.setValue('options', [
                { option_text: 'True', is_correct: true },
                { option_text: 'False', is_correct: false },
            ]);
        } else if (questionType === 'multiple_choice') {
             form.setValue('options', [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
                { option_text: '', is_correct: false },
            ]);
        } else if (questionType === 'short_answer') {
            form.setValue('options', [{ option_text: '', is_correct: true }]);
        }
    }, [questionType]);


    const onSubmit = (data) => {
        // Ensure only one option is correct for multiple choice
        if (data.question_type === 'multiple_choice' || data.question_type === 'true_false') {
            const correctOptionsCount = data.options.filter(o => o.is_correct).length;
            if (correctOptionsCount !== 1) {
                form.setError('options', { type: 'manual', message: 'Please select exactly one correct answer.' });
                return;
            }
        }
        onSave(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4 border rounded-lg bg-slate-100">
                <FormField
                    control={form.control}
                    name="question_text"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question</FormLabel>
                            <FormControl>
                                <Textarea placeholder="What is the capital of..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="question_type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                                        <SelectItem value="true_false">True/False</SelectItem>
                                        <SelectItem value="short_answer">Short Answer</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="points"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Points</FormLabel>
                                <FormControl>
                                    <Input type="number" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                {/* Options Section */}
                {(questionType === 'multiple_choice' || questionType === 'true_false') && (
                     <div className="space-y-2">
                        <FormLabel>Options</FormLabel>
                        {fields.map((field, index) => (
                           <FormField
                                key={field.id}
                                control={form.control}
                                name={`options.${index}.is_correct`}
                                render={({ field: switchField }) => (
                                    <FormItem className="flex items-center space-x-2">
                                        <FormControl>
                                            <Switch
                                                checked={switchField.value}
                                                onCheckedChange={(checked) => {
                                                    // Uncheck all other options
                                                    fields.forEach((_, i) => {
                                                        form.setValue(`options.${i}.is_correct`, false);
                                                    });
                                                    switchField.onChange(checked);
                                                }}
                                                disabled={questionType === 'true_false'}
                                            />
                                        </FormControl>
                                        <FormField
                                            control={form.control}
                                            name={`options.${index}.option_text`}
                                            render={({ field: inputField }) => (
                                                <Input {...inputField} readOnly={questionType === 'true_false'} />
                                            )}
                                        />
                                    </FormItem>
                                )}
                            />
                        ))}
                        <FormMessage>{form.formState.errors.options?.message}</FormMessage>
                    </div>
                )}

                {questionType === 'short_answer' && (
                    <FormField
                        control={form.control}
                        name="options.0.option_text"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Correct Answer</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter the exact correct answer" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
                
                <div className="flex justify-end space-x-2">
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit">Save Question</Button>
                </div>
            </form>
        </Form>
    )
} 