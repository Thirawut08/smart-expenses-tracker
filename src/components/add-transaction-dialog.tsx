"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionForm } from "./transaction-form";
import type { Transaction } from "@/lib/types";
import type { UnifiedFormValues } from "./transaction-form";
import { SlipUploader } from "./slip-uploader";
import type { ExtractTransactionDetailsOutput } from "@/ai/flows/extract-transaction-details";
import { useLedger } from "@/hooks/use-ledger";

type AddTransactionDialogProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Transaction | Transaction[], saveAsTemplate: boolean) => void;
  initialData?: Partial<UnifiedFormValues>;
  isEditing?: boolean;
  transactions: Transaction[]; // เพิ่ม prop นี้
};

type SlipData = ExtractTransactionDetailsOutput & { validationResult?: string };

// Helper: แปลง initialData ให้มี mode เสมอ
function getInitialFormData(initialData: any): any {
  if (!initialData) return undefined;
  if ("id" in initialData && "account" in initialData) {
    // เป็น transaction จริง
    return {
      mode: "normal",
      ...initialData,
      accountId: initialData.account.id,
    };
  }
  if ("id" in initialData && "accountId" in initialData) {
    // เป็น template
    return {
      mode: "normal",
      ...initialData,
    };
  }
  // กรณี slip extraction หรืออื่น ๆ
  return initialData;
}

export function AddTransactionDialog({
  children,
  open,
  onOpenChange,
  onSave,
  initialData,
  isEditing = false,
  transactions,
}: AddTransactionDialogProps) {
  const [extractedData, setExtractedData] = useState<SlipData | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const { purposes } = useLedger();

  useEffect(() => {
    if (open) {
      setActiveTab("manual");
    }
  }, [open]);

  const handleFormSubmit = (
    values: UnifiedFormValues | UnifiedFormValues[],
    saveAsTemplate: boolean,
  ) => {
    // ถ้าเป็น array (transfer) ให้ map เป็น Transaction[]
    if (Array.isArray(values)) {
      onSave(values as any, saveAsTemplate);
    } else {
      onSave(values as any, saveAsTemplate);
    }
    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setExtractedData(null);
        setActiveTab(isEditing || initialData ? "manual" : "slip");
      }, 300);
    }
  };

  const getDialogTitle = () => {
    if (isEditing) return "แก้ไขธุรกรรม";
    if (initialData?.purpose && !initialData?.id) return "ใช้เทมเพลต";
    return "เพิ่มธุรกรรมใหม่";
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        {isEditing ? (
          <TransactionForm
            key={JSON.stringify(initialData ?? extractedData) || "manual-form"}
            initialData={
              extractedData
                ? {
                    mode: "normal",
                    accountId: "",
                    purpose: extractedData.purpose || "",
                    amount: extractedData.amount,
                    date: new Date(extractedData.date),
                    type: "expense",
                    sender: extractedData.sender,
                    recipient: extractedData.recipient,
                  }
                : getInitialFormData(initialData)
            }
            onSubmit={handleFormSubmit}
            isEditing={isEditing}
            isTemplate={
              !!initialData?.purpose && !initialData?.id && !isEditing
            }
            availablePurposes={purposes}
            transactions={transactions}
          />
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "manual" | "slip")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">กรอกข้อมูลเอง</TabsTrigger>
              <TabsTrigger
                value="slip"
                disabled={
                  isEditing || !!(initialData?.purpose && !initialData?.id)
                }
              >
                อัปโหลดสลิป
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manual">
              <TransactionForm
                key={
                  JSON.stringify(initialData ?? extractedData) || "manual-form"
                }
                initialData={
                  extractedData
                    ? {
                        mode: "normal",
                        accountId: "",
                        purpose: extractedData.purpose || "",
                        amount: extractedData.amount,
                        date: new Date(extractedData.date),
                        type: "expense",
                        sender: extractedData.sender,
                        recipient: extractedData.recipient,
                      }
                    : getInitialFormData(initialData)
                }
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                isTemplate={
                  !!initialData?.purpose && !initialData?.id && !isEditing
                }
                availablePurposes={purposes}
                transactions={transactions}
              />
            </TabsContent>
            <TabsContent value="slip">
              <SlipUploader onExtractionComplete={setExtractedData} />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
