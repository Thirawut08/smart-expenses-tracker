'use client';

import { useState } from 'react';
import { useLedger } from '@/hooks/use-ledger';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Ban, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export function ManagePurposes() {
  const { purposes, addPurpose, editPurpose, removePurpose, transactions } = useLedger();
  const { toast } = useToast();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPurposeToAdd, setNewPurposeToAdd] = useState('');

  const [purposeToEdit, setPurposeToEdit] = useState<string | null>(null);
  const [newPurposeName, setNewPurposeName] = useState('');
  
  const [purposeToDelete, setPurposeToDelete] = useState<string | null>(null);
  const [deleteAction, setDeleteAction] = useState<'reclassify' | 'deleteAll'>('reclassify');

  const editablePurposes = purposes.filter(p => p !== 'ลงทุน' && p !== 'ออมทรัพย์' && p !== 'อื่นๆ');
  
  const handleAddNewPurpose = () => {
    if (!newPurposeToAdd.trim()) {
      toast({ variant: 'destructive', title: 'ชื่อวัตถุประสงค์ว่างเปล่า' });
      return;
    }
    addPurpose(newPurposeToAdd.trim());
    setNewPurposeToAdd('');
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (purpose: string) => {
    setPurposeToEdit(purpose);
    setNewPurposeName(purpose);
  };

  const handleSaveEdit = () => {
    if (!purposeToEdit || !newPurposeName.trim()) return;
    
    if (purposes.includes(newPurposeName.trim()) && newPurposeName.trim() !== purposeToEdit) {
      toast({
        variant: 'destructive',
        title: 'ชื่อวัตถุประสงค์ซ้ำ',
        description: 'มีวัตถุประสงค์นี้อยู่แล้ว',
      });
      return;
    }

    editPurpose(purposeToEdit, newPurposeName.trim());
    toast({ title: 'แก้ไขวัตถุประสงค์สำเร็จ' });
    setPurposeToEdit(null);
    setNewPurposeName('');
  };
  
  const handleDeleteRequest = (purpose: string) => {
      setPurposeToDelete(purpose);
  }

  const confirmDelete = () => {
    if (purposeToDelete) {
        const hasTransactions = transactions.some(t => t.purpose === purposeToDelete);
        removePurpose(purposeToDelete, hasTransactions ? deleteAction : undefined);
        setPurposeToDelete(null);
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>จัดการวัตถุประสงค์</CardTitle>
            <CardDescription>
              เพิ่ม แก้ไข หรือลบวัตถุประสงค์ที่คุณกำหนดเอง
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            เพิ่มวัตถุประสงค์
          </Button>
        </CardHeader>
        <CardContent>
          {editablePurposes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อวัตถุประสงค์</TableHead>
                  <TableHead className="w-[50px] text-center"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editablePurposes.map((purpose) => (
                  <TableRow key={purpose}>
                    <TableCell className="font-medium">{purpose}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">เปิดเมนู</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(purpose)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>แก้ไข</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRequest(purpose)} className="text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>ลบ</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
                <Ban className="w-16 h-16 mb-4" />
                <h3 className="text-xl font-semibold">ไม่มีข้อมูล</h3>
                <p>คลิก "เพิ่มวัตถุประสงค์" เพื่อสร้างรายการแรกของคุณ</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวัตถุประสงค์ใหม่</DialogTitle>
            <DialogDescription>
              สร้างหมวดหมู่ใหม่สำหรับการบันทึกธุรกรรมของคุณ
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-purpose-name" className="text-right">
                ชื่อ
              </Label>
              <Input
                id="new-purpose-name"
                value={newPurposeToAdd}
                onChange={(e) => setNewPurposeToAdd(e.target.value)}
                className="col-span-3"
                placeholder="เช่น ค่ากาแฟ, ค่าสมาชิก Netflix"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
            <Button type="submit" onClick={handleAddNewPurpose}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!purposeToEdit} onOpenChange={(open) => !open && setPurposeToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขวัตถุประสงค์</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose-name" className="text-right">
                ชื่อ
              </Label>
              <Input
                id="purpose-name"
                value={newPurposeName}
                onChange={(e) => setNewPurposeName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setPurposeToEdit(null)}>ยกเลิก</Button>
            <Button type="submit" onClick={handleSaveEdit}>บันทึกการเปลี่ยนแปลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!purposeToDelete} onOpenChange={(open) => !open && setPurposeToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>คุณแน่ใจหรือไม่ว่าจะลบ "{purposeToDelete}"?</AlertDialogTitle>
                <AlertDialogDescription>
                การกระทำนี้ไม่สามารถย้อนกลับได้ มีธุรกรรมที่ใช้วัตถุประสงค์นี้อยู่ คุณต้องการทำอะไรกับธุรกรรมเหล่านี้
                </AlertDialogDescription>
            </AlertDialogHeader>
            <RadioGroup defaultValue="reclassify" className="my-4 space-y-2" onValueChange={(value: 'reclassify' | 'deleteAll') => setDeleteAction(value)}>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="reclassify" id="r1" />
                    <Label htmlFor="r1">ย้ายธุรกรรมไปที่ "อื่นๆ"</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="deleteAll" id="r2" />
                    <Label htmlFor="r2">ลบธุรกรรมทั้งหมดที่เกี่ยวข้อง</Label>
                </div>
            </RadioGroup>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setPurposeToDelete(null)}>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete}>ดำเนินการต่อ</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
