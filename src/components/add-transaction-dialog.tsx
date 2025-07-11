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
};

type SlipData = ExtractTransactionDetailsOutput & { validationResult?: string };

export function AddTransactionDialog({ children, open, onOpenChange, onSave, initialData, isEditing = false }: AddTransactionDialogProps) {
  const [extractedData, setExtractedData] = useState<SlipData | null>(null);
  const [activeTab, setActiveTab] = useState('slip');
  
  useEffect(() => {
    if (extractedData) {
      setActiveTab('manual');
    }
  }, [extractedData]);
  
  useEffect(() => {
    // If initialData is provided (from a template or editing), switch to manual tab
    if (initialData && !isEditing) {
      setActiveTab('manual');
    } else if (isEditing) {
      setActiveTab('manual');
    }
     else {
      // Default to slip uploader for new transactions
      setActiveTab('slip');
    }
  }, [initialData, isEditing]);

  const handleFormSubmit = (values: TransactionFormValues, saveAsTemplate: boolean) => {
    onSave(values, saveAsTemplate);
    handleClose();
  }
  
  const handleClose = () => {
    onOpenChange(false);
  }
  
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset state on close
      setTimeout(() => {
        setExtractedData(null);
        setActiveTab('slip');
      }, 300);
    }
    onOpenChange(isOpen);
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
            <TabsTrigger value="manual" disabled={!initialData && !!extractedData}>กรอกข้อมูลเอง</TabsTrigger>
            <TabsTrigger value="slip" disabled={isEditing || !!(initialData?.purpose && !initialData?.id)}>อัปโหลดสลิป</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <TransactionForm
              key={JSON.stringify(initialData) || 'manual-form'}
              initialData={initialData}
              onSubmit={handleFormSubmit}
              isEditing={isEditing}
              isTemplate={!!initialData?.purpose && !initialData?.id && !isEditing}
            />
          </TabsContent>
          <TabsContent value="slip">
            {extractedData ? (
              <TransactionForm
                key={JSON.stringify(extractedData)}
                initialData={{
                  accountNumber: '',
                  purpose: extractedData.purpose || '',
                  amount: extractedData.amount,
                  date: new Date(extractedData.date),
                  type: 'expense',
                  sender: extractedData.sender,
                  recipient: extractedData.recipient,
                }}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <SlipUploader onExtractionComplete={setExtractedData} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
