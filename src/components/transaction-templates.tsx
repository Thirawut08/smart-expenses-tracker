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
import { useAccounts } from "@/hooks/use-accounts";

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
  const { accounts } = useAccounts();

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
            <div key={template.id} className="relative w-full">
              <button
                type="button"
                className={`px-2 py-1 rounded-md text-xs font-medium border border-gray-500 bg-muted/40 transition-colors duration-75 w-full text-left truncate
                  ${selectedId === template.id ? "ring-2 ring-primary border-primary bg-primary/10 text-primary" : "hover:border-primary/40 hover:bg-muted/60"}`}
                onClick={() => handleSelect(template)}
                style={{ minWidth: 0, minHeight: 0, maxWidth: '100%' }}
              >
                <span className="font-semibold truncate block">{template.purpose}</span>
              </button>
              <div className="pl-2 pb-1 text-xs text-muted-foreground">
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  <span><b>ประเภท:</b> {template.type === 'income' ? 'รายรับ' : template.type === 'expense' ? 'รายจ่าย' : '-'}</span>
                  {template.accountId && accounts.length > 0 && (
                    <span><b>บัญชี:</b> {accounts.find(a => a.id === template.accountId)?.name || '-'}</span>
                  )}
                  {template.details && <span><b>รายละเอียด:</b> {template.details}</span>}
                  {template.sender && <span><b>ผู้จ่าย:</b> {template.sender}</span>}
                  {template.recipient && <span><b>ผู้รับ:</b> {template.recipient}</span>}
                </div>
              </div>
              <button
                type="button"
                className="absolute top-1 right-1 p-1 rounded hover:bg-gray-200 text-gray-500"
                title="แก้ไขเทมเพลต"
                onClick={(e) => { e.stopPropagation(); setEditTarget(template); }}
                tabIndex={-1}
              >
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.3 9.3-2.12.71.71-2.12 9.3-9.3z" fill="currentColor"/>
                  <path d="M3 17h14v2H3v-2z" fill="currentColor"/>
                </svg>
              </button>
            </div>
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
              initialData={{ accountId: "", date: undefined, sender: "", recipient: "" }}
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
