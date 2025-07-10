'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Lightbulb } from 'lucide-react';

export function Notes() {
  const [note, setNote] = useState('');

  useEffect(() => {
    // This runs only on the client, after hydration
    const savedNote = localStorage.getItem('dashboard-note');
    if (savedNote) {
      setNote(savedNote);
    }
  }, []);

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newNote = event.target.value;
    setNote(newNote);
    // Save note to localStorage on change
    localStorage.setItem('dashboard-note', newNote);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6" />
          <CardTitle>บันทึกช่วยจำ</CardTitle>
        </div>
        <CardDescription>จดบันทึกสั้นๆ หรือสิ่งที่คุณต้องทำ</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="พิมพ์บันทึกของคุณที่นี่..."
          value={note}
          onChange={handleNoteChange}
          rows={6}
          className="resize-none"
        />
      </CardContent>
    </Card>
  );
}
