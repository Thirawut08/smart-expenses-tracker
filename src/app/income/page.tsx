'use client';

import { useMemo, useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AddIncomeForm } from '@/components/add-income-form';
import { IncomeTable } from '@/components/income-table';
import { useIncome } from '@/hooks/use-income';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { IncomeAllocationDashboard } from '@/components/income-allocation-dashboard';
import { useExchangeRate } from '@/hooks/use-exchange-rate';

export default function IncomePage() {
  const { 
    incomes, 
    addIncome, 
    editIncome, 
    removeIncome,
    editingIncome,
    setEditingIncome,
    isFormOpen,
    setIsFormOpen
  } = useIncome();
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  const { rate: usdToThbRate, isLoading: isRateLoading } = useExchangeRate();

  const totalIncomeInTHB = useMemo(() => {
    if (!usdToThbRate) return 0;
    return incomes.reduce((total, income) => {
      const amountInTHB = income.account.currency === 'USD' 
        ? income.amount * usdToThbRate 
        : income.amount;
      return total + amountInTHB;
    }, 0);
  }, [incomes, usdToThbRate]);

  const handleFormSubmit = (data: { date: Date; accountNumber: string; amount: number; }) => {
    if (editingIncome) {
      editIncome(editingIncome.id, data);
    } else {
      addIncome(data);
    }
    setIsFormOpen(false);
  };
  
  const handleEditClick = (incomeId: string) => {
    setEditingIncome(incomeId);
    setIsFormOpen(true);
  }

  const handleDeleteRequest = (incomeId: string) => {
    setIncomeToDelete(incomeId);
  }

  const confirmDelete = () => {
    if (incomeToDelete) {
      removeIncome(incomeToDelete);
      setIncomeToDelete(null);
    }
  }
  
  const handleCancelDelete = () => {
    setIncomeToDelete(null);
  }

  const handleAddNew = () => {
    setEditingIncome(null);
    setIsFormOpen(true);
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold font-headline">บันทึกรายได้</h1>
          <Button onClick={handleAddNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มรายได้
          </Button>
        </div>

        <IncomeAllocationDashboard 
            totalIncome={totalIncomeInTHB} 
            isLoading={isRateLoading}
        />

        {isFormOpen && (
          <Card>
            <CardHeader>
              <CardTitle>{editingIncome ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}</CardTitle>
            </CardHeader>
            <CardContent>
              <AddIncomeForm
                key={editingIncome?.id || 'new-income'}
                initialData={editingIncome}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsFormOpen(false)}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>ประวัติรายได้</CardTitle>
            <CardDescription>รายการรายได้ทั้งหมดที่บันทึกไว้</CardDescription>
          </CardHeader>
          <CardContent>
            <IncomeTable 
              incomes={incomes}
              onEdit={handleEditClick}
              onDelete={handleDeleteRequest}
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!incomeToDelete} onOpenChange={(open) => !open && setIncomeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้จะลบรายการรายรับนี้อย่างถาวรและไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ดำเนินการต่อ</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
