"use client";

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CreateEditStudentModal({ isOpen, onClose, student, onSave }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!student;

  useEffect(() => {
    if (isOpen) {
      setError('');
      setPassword('');
      if (isEditMode) {
        setName(student.name);
        setEmail(student.email);
      } else {
        setName('');
        setEmail('');
      }
    }
  }, [isOpen, student, isEditMode]);

  const handleSave = async () => {
    if (!name || !email || (!password && !isEditMode)) {
      setError('Name, email, and password are required.');
      return;
    }
    setError('');
    setIsSaving(true);

    const studentData = { name, email };
    if (password) {
      studentData.password = password;
    }

    try {
      await onSave(studentData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save student.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Student' : 'Add New Student'}>
      <div className="space-y-4">
        {error && <p className="text-red-500">{error}</p>}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john.doe@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isEditMode ? 'Leave blank to keep current password' : 'Enter initial password'} />
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Student'}
          </Button>
        </div>
      </div>
    </Modal>
  );
} 