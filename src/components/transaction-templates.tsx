"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Pencil } from "lucide-react";
import type { Template } from "@/lib/types";
import { defaultPurposes } from "@/lib/data";
import { useState } from "react";
import { TransactionForm } from "./transaction-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useLedger } from "@/hooks/use-ledger";

interface TransactionTemplatesProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
}

export function TransactionTemplates({
  templates,
  onUseTemplate,
}: TransactionTemplatesProps) {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Template | null>(null);
  const { addTemplate, editTemplate, purposes } = useLedger();

  // เพิ่ม state และ logic filter
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filteredTemplates = templates.filter(t => t.purpose?.toLowerCase().includes(search.toLowerCase()));
  function handleSelect(template: Template) {
    setSelectedId(template.id);
    onUseTemplate(template);
  }

  function handleAddTemplateSubmit(data: any) {
    addTemplate(data);
    setOpen(false);
  }

  function handleEditTemplateSubmit(data: any) {
    if (editTarget) {
      editTemplate(editTarget.id, data);
      setEditTarget(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>เทมเพลตของฉัน</CardTitle>
          <CardDescription>
            ใช้เทมเพลตเพื่อเพิ่มธุรกรรมที่เกิดขึ้นบ่อยได้อย่างรวดเร็ว
          </CardDescription>
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={() => setOpen(true)}
          title="เพิ่มเทมเพลตใหม่"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <input
            type="text"
            placeholder="ค้นหาเทมเพลต..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-2 py-1 rounded border text-base mb-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filteredTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`px-3 py-1 rounded text-sm font-medium border transition-colors duration-75
                ${selectedId === template.id ? "bg-blue-700 text-white border-blue-700" : "bg-blue-100 text-blue-900 border-blue-200 hover:bg-blue-200"}`}
              onClick={() => handleSelect(template)}
              style={{ minWidth: 0, minHeight: 0 }}
            >
              {template.purpose}
            </button>
          ))}
        </div>
      </CardContent>
      {/* Modal เพิ่มเทมเพลต */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>เพิ่มเทมเพลตใหม่</DialogTitle>
          </DialogHeader>
          <div style={{ position: "relative" }}>
            <TransactionForm
              onSubmit={handleAddTemplateSubmit}
              isEditing={false}
              isTemplate={true}
              availablePurposes={purposes}
              initialData={{ accountId: "", date: undefined }}
            />
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal แก้ไขเทมเพลต */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(v) => {
          if (!v) setEditTarget(null);
        }}
      >
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>แก้ไขเทมเพลต</DialogTitle>
          </DialogHeader>
          {editTarget && (
            <div style={{ position: "relative" }}>
              <TransactionForm
                onSubmit={handleEditTemplateSubmit}
                isEditing={true}
                isTemplate={true}
                availablePurposes={purposes}
                initialData={{
                  type: editTarget.type,
                  purpose: editTarget.purpose,
                  details: editTarget.details,
                  sender: editTarget.sender,
                  recipient: editTarget.recipient,
                  mode: "normal",
                  accountId: editTarget.accountId || "",
                  amount: undefined,
                  date: undefined,
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
