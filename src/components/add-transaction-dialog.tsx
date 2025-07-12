'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TransactionForm, type TransactionFormValues } from './transaction-form';
import { SlipUploader } from './slip-uploader';
import type { ExtractTransactionDetailsOutput } from '@/ai/flows/extract-transaction-details';

type AddTransactionDialogProps = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: TransactionFormValues, saveAsTemplate: boolean) => void;
  initialData?: Partial<TransactionFormValues>;
  isEditing?: boolean;
  availablePurposes: string[];
};

type SlipData = ExtractTransactionDetailsOutput & { validationResult?: string };

export function AddTransactionDialog({ children, open, onOpenChange, onSave, initialData, isEditing = false, availablePurposes }: AddTransactionDialogProps) {
  const [extractedData, setExtractedData] = useState<SlipData | null>(null);
  const [activeTab, setActiveTab] = useState(isEditing || initialData ? 'manual' : 'slip');
  
  useEffect(() => {
    if (open) {
        if (extractedData) {
            setActiveTab('manual');
        } else if (isEditing || (initialData && initialData.purpose)) {
            setActiveTab('manual');
        } else {
            setActiveTab('slip');
        }
    }
  }, [extractedData, isEditing, initialData, open]);


  const handleFormSubmit = (values: TransactionFormValues, saveAsTemplate: boolean) => {
    onSave(values, saveAsTemplate);
    handleClose();
  }
  
  const handleClose = () => {
    onOpenChange(false);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setExtractedData(null);
        setActiveTab(isEditing || initialData ? 'manual' : 'slip');
      }, 300);
    }
  }

  const getDialogTitle = () => {
    if (isEditing) return 'แก้ไขธุรกรรม';
    if (initialData?.purpose && !initialData?.id) return 'ใช้เทมเพลต';
    return 'เพิ่มธุรกรรมใหม่';
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">กรอกข้อมูลเอง</TabsTrigger>
            <TabsTrigger value="slip" disabled={isEditing || !!(initialData?.purpose && !initialData?.id)}>อัปโหลดสลิป</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <TransactionForm
              key={JSON.stringify(initialData ?? extractedData) || 'manual-form'}
              initialData={
                extractedData ? {
                  accountNumber: '',
                  purpose: extractedData.purpose || '',
                  amount: extractedData.amount,
                  date: new Date(extractedData.date),
                  type: 'expense',
                  sender: extractedData.sender,
                  recipient: extractedData.recipient,
                } : initialData
              }
              onSubmit={handleFormSubmit}
              isEditing={isEditing}
              isTemplate={!!initialData?.purpose && !initialData?.id && !isEditing}
              availablePurposes={availablePurposes}
            />
          </TabsContent>
          <TabsContent value="slip">
             <SlipUploader onExtractionComplete={setExtractedData} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
