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
  onTransactionAdd: (data: TransactionFormValues) => void;
};

type SlipData = ExtractTransactionDetailsOutput & { validationResult?: string };

export function AddTransactionDialog({ children, open, onOpenChange, onTransactionAdd }: AddTransactionDialogProps) {
  const [extractedData, setExtractedData] = useState<SlipData | null>(null);
  const [activeTab, setActiveTab] = useState('manual');
  
  useEffect(() => {
    if (extractedData) {
      setActiveTab('slip');
    }
  }, [extractedData]);

  const handleFormSubmit = (values: TransactionFormValues) => {
    onTransactionAdd(values);
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
        setActiveTab('manual');
      }, 300);
    }
    onOpenChange(isOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>เพิ่มธุรกรรมใหม่</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">กรอกข้อมูลเอง</TabsTrigger>
            <TabsTrigger value="slip">อัปโหลดสลิป</TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <TransactionForm onSubmit={handleFormSubmit} />
          </TabsContent>
          <TabsContent value="slip">
            {extractedData ? (
              <TransactionForm
                key={JSON.stringify(extractedData)}
                initialData={{
                  accountNumber: '',
                  purpose: '',
                  payer: extractedData.payer,
                  payee: extractedData.payee,
                  amount: extractedData.amount,
                  date: new Date(extractedData.date),
                  type: 'expense',
                  validationResult: extractedData.validationResult
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
