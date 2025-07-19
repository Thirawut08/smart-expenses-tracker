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
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="relative group">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-start justify-start text-left w-full"
                  onClick={() => onUseTemplate(template)}
                >
                  <p className="text-sm text-muted-foreground">
                    {template.purpose}
                  </p>
                  {template.details && (
                    <p className="text-xs text-muted-foreground/80 truncate">
                      "{template.details}"
                    </p>
                  )}
                </Button>
                <button
                  className="absolute top-2 right-2 opacity-70 group-hover:opacity-100 transition-opacity bg-background rounded-full p-1 border border-muted"
                  title="แก้ไขเทมเพลต"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditTarget(template);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mb-2 opacity-60" />
            <div className="text-base font-medium">ยังไม่มีเทมเพลต</div>
            <div className="text-xs mt-1">
              คุณสามารถสร้างเทมเพลตได้โดยการกดปุ่ม + ที่มุมขวาบน
            </div>
          </div>
        )}
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
