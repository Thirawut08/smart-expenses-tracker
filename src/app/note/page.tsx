"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface Note {
  id: string;
  content: string;
  updated: number;
}

const STORAGE_KEY = "ledger-notes";

export default function NotePage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // editContent ไม่จำเป็นอีกต่อไป ใช้ notes state ตรง ๆ

  // Load notes from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const loaded = JSON.parse(raw);
        setNotes(loaded);
        if (loaded.length > 0) {
          setSelectedId(loaded[0].id);
        }
      } catch {}
    }
  }, []);

  // Save notes to localStorage ทุกครั้งที่ notes เปลี่ยน
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    // ถ้า selectedId ไม่อยู่ใน notes ให้เลือก note แรก
    if (selectedId && !notes.find(n => n.id === selectedId)) {
      setSelectedId(notes.length > 0 ? notes[0].id : null);
    }
  }, [notes]);

  // Add new note
  const handleAdd = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      content: "",
      updated: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setSelectedId(newNote.id);
  };

  // Delete note
  const handleDelete = (id: string) => {
    setNotes(prev => {
      const filtered = prev.filter(n => n.id !== id);
      if (selectedId === id) {
        setSelectedId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  // Autosave note content
  const handleChange = (val: string) => {
    setNotes(prev => prev.map(n => n.id === selectedId ? { ...n, content: val, updated: Date.now() } : n));
  };

  // Get selected note
  const selectedNote = notes.find(n => n.id === selectedId);

  // Show preview (first line or 30 chars)
  const getPreview = (content: string) => {
    const firstLine = content.split("\n")[0];
    return firstLine.length > 30 ? firstLine.slice(0, 30) + "..." : firstLine;
  };

  // Sort notes by updated desc
  const sortedNotes = [...notes].sort((a, b) => b.updated - a.updated);

  return (
    <div className="flex flex-col md:flex-row h-[80vh] max-w-4xl mx-auto mt-8 border rounded-lg overflow-hidden bg-card shadow">
      {/* Sidebar: Note List */}
      <div className="w-full md:w-1/3 border-r bg-muted/40 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <span className="font-bold text-lg">โน้ต</span>
          <Button size="icon" variant="outline" onClick={handleAdd} title="เพิ่มโน้ตใหม่">
            <Plus />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sortedNotes.length === 0 && (
            <div className="text-center text-muted-foreground py-8">ยังไม่มีโน้ต</div>
          )}
          {sortedNotes.map(note => (
            <div
              key={note.id}
              className={`px-4 py-3 border-b cursor-pointer hover:bg-accent ${selectedId === note.id ? "bg-accent/60" : ""}`}
              onClick={() => setSelectedId(note.id)}
            >
              <div className="flex justify-between items-center gap-2">
                {getPreview(note.content).trim() !== "" ? (
                  <span className="truncate font-medium text-sm">{getPreview(note.content)}</span>
                ) : (
                  <span className="italic text-muted-foreground">(ไม่มีข้อความ)</span>
                )}
                <Button size="icon" variant="ghost" className="ml-2" onClick={e => { e.stopPropagation(); handleDelete(note.id); }} title="ลบโน้ต">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{new Date(note.updated).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Main: Note Editor */}
      <div className="flex-1 flex flex-col">
        {selectedNote ? (
          <>
            <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
              <span className="font-semibold text-base">แก้ไขโน้ต</span>
            </div>
            <div className="flex-1 p-4 flex flex-col gap-4">
              <Textarea
                value={selectedNote.content}
                onChange={e => handleChange(e.target.value)}
                placeholder="เขียนบันทึก..."
                className="h-64 md:h-full resize-none"
                autoFocus
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">เลือกหรือเพิ่มโน้ตใหม่</div>
        )}
      </div>
    </div>
  );
} 