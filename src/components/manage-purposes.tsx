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

  const editablePurposes: string[] = purposes;

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
    if (purposes.some(p => p === newPurposeName.trim() && p !== purposeToEdit)) {
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
  };

  const confirmDelete = () => {
    if (purposeToDelete) {
      const hasTransactions = transactions.some(t => t.purpose === purposeToDelete);
      removePurpose(purposeToDelete, hasTransactions ? deleteAction : undefined);
      setPurposeToDelete(null);
    }
  };

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
                    <TableCell>{purpose}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(purpose)}>
                            <Pencil className="w-4 h-4 mr-2" />แก้ไข
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteRequest(purpose)}>
                            <Trash2 className="w-4 h-4 mr-2" />ลบ
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

      {/* Add Purpose Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มวัตถุประสงค์ใหม่</DialogTitle>
            <DialogDescription>
              สร้างหมวดหมู่ใหม่สำหรับการบันทึกธุรกรรมของคุณ
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="new-purpose-name" className="text-right col-span-1">ชื่อ</Label>
            <Input
              id="new-purpose-name"
              value={newPurposeToAdd}
              onChange={(e) => setNewPurposeToAdd(e.target.value)}
              className="col-span-3"
              placeholder="เช่น ค่ากาแฟ, ค่าสมาชิก Netflix"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
            <Button type="submit" onClick={handleAddNewPurpose}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Purpose Dialog */}
      <Dialog open={!!purposeToEdit} onOpenChange={open => { if (!open) setPurposeToEdit(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขวัตถุประสงค์</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="purpose-name" className="text-right col-span-1">ชื่อ</Label>
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
      {/* Delete Purpose Dialog */}
      <AlertDialog open={!!purposeToDelete} onOpenChange={open => { if (!open) setPurposeToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>คุณแน่ใจหรือไม่ว่าจะลบ "{purposeToDelete}"?</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้ ธุรกรรมทั้งหมดที่ใช้วัตถุประสงค์นี้จะถูกลบออกจากระบบถาวร
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPurposeToDelete(null)}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (purposeToDelete) {
                  removePurpose(purposeToDelete, 'deleteAll');
                  setPurposeToDelete(null);
                }
              }}
            >
              ดำเนินการต่อ
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
