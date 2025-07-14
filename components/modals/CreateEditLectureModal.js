"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FaTimes } from 'react-icons/fa';

export default function CreateEditLectureModal({ isOpen, lecture, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!lecture;

  useEffect(() => {
    if (isOpen) {
      setError('');
      const initialData = {
        title: lecture?.title || '',
        description: lecture?.description || '',
        module: lecture?.module || '',
        content_url: lecture?.content_url || '',
        is_published: lecture?.is_published || false,
      };
      if (isEditMode) {
        initialData.id = lecture.id;
      }
      setFormData(initialData);
    }
  }, [isOpen, lecture, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckedChange = (checked) => {
    setFormData(prev => ({ ...prev, is_published: checked }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      setError('Lecture title is required.');
      return;
    }
    setError('');
    setIsSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save lecture.');
    } finally {
      setIsSaving(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.9, y: 50, transition: { duration: 0.2 } },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          onClick={onClose}
        >
          <motion.div
            variants={modalVariants}
            className="bg-gray-800/50 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl text-white max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="p-6 flex justify-between items-center border-b border-white/10">
              <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Lecture' : 'Create New Lecture'}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors rounded-full p-2">
                <FaTimes size={20} />
              </button>
            </header>

            <main className="p-6 space-y-6 overflow-y-auto">
              {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-lg text-sm">{error}</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-medium text-gray-300">Lecture Title</Label>
                  <Input id="title" name="title" value={formData.title || ''} onChange={handleChange} placeholder="e.g., Introduction to Algebra" className="bg-white/5 border-white/10 focus:ring-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="module" className="font-medium text-gray-300">Module</Label>
                  <Input id="module" name="module" value={formData.module || ''} onChange={handleChange} placeholder="e.g., Week 1" className="bg-white/5 border-white/10 focus:ring-blue-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-medium text-gray-300">Description</Label>
                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} placeholder="A brief summary of the lecture." className="bg-white/5 border-white/10 focus:ring-blue-500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content_url" className="font-medium text-gray-300">Content URL (e.g., Video Link)</Label>
                <Input id="content_url" name="content_url" value={formData.content_url || ''} onChange={handleChange} placeholder="https://youtube.com/watch?v=..." className="bg-white/5 border-white/10 focus:ring-blue-500" />
              </div>

              <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg">
                <Label htmlFor="is_published" className="font-medium text-white">Publish Lecture</Label>
                <Switch id="is_published" name="is_published" checked={formData.is_published} onCheckedChange={handleCheckedChange} />
              </div>
            </main>

            <footer className="flex justify-end space-x-4 p-6 border-t border-white/10">
              <Button variant="outline" onClick={onClose} disabled={isSaving} className="border-white/10 hover:bg-white/10">Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 shadow-[0_4px_14px_rgba(59,130,246,0.5)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.7)]">
                {isSaving ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Create Lecture')}
              </Button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
