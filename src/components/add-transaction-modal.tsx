import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { DateTimePicker } from "./date-time-picker";
import { useAccounts } from "@/hooks/use-accounts";
import { useLedger } from "@/hooks/use-ledger";
import { TransactionForm } from "./transaction-form";
import { Switch } from "./ui/switch";
import { HighPerfDropdown } from "./ui/high-perf-dropdown";
import { useRef } from "react";
import { useEffect } from "react";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any, isEditing: boolean) => void;
}

export function AddTransactionModal({
  open,
  onClose,
  onSave,
}: AddTransactionModalProps) {
  const { purposes, transactions, templates } = useLedger();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const filteredTemplates = templates.filter(t => t.purpose?.toLowerCase().includes(search.toLowerCase()));
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || undefined;
  function handleFormSubmit(data: any) {
    // รวม date+time เป็น Date object ก่อนส่งออก
    let dateObj = undefined;
    if (data.date && data.time) {
      dateObj = new Date(`${data.date}T${data.time}`);
    } else if (data.date) {
      dateObj = new Date(data.date);
    }
    const out = { ...data, date: dateObj };
    onSave(out, false);
    onClose();
  }

  // Reset template selection every time modal opens
  useEffect(() => {
    if (open) {
      setSelectedTemplateId(null);
      setSearch("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>เพิ่มธุรกรรมใหม่</DialogTitle>
        </DialogHeader>
        {templates && templates.length > 0 && (
          <div className="mb-4">
            <div className="font-semibold mb-2">เลือกจากเทมเพลต</div>
            <input
              type="text"
              placeholder="ค้นหาเทมเพลต..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-2 py-1 rounded border text-base mb-2"
              tabIndex={1}
            />
            <div className="flex flex-wrap gap-2 sm:grid sm:grid-cols-2 md:grid-cols-3">
              {filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`px-2 py-1 rounded-md text-xs font-medium border border-gray-500 bg-muted/40 transition-colors duration-75 w-full text-left truncate
                    ${selectedTemplateId === t.id ? "ring-2 ring-primary border-primary bg-primary/10 text-primary" : "hover:border-primary/40 hover:bg-muted/60"}`}
                  onClick={() => setSelectedTemplateId(t.id)}
                  style={{ minWidth: 0, minHeight: 0, maxWidth: '100%' }}
                  tabIndex={-1}
                >
                  <span className="font-semibold truncate block">{t.purpose}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <TransactionForm
          onSubmit={handleFormSubmit}
          isEditing={false}
          isTemplate={false}
          availablePurposes={purposes}
          transactions={transactions}
          initialData={selectedTemplate ? {
            ...selectedTemplate,
            amount: selectedTemplate.amount,
            date: undefined,
          } : undefined}
          showTemplateSelector={false}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
 