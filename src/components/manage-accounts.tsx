import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Pencil, Trash2, Ban, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLedger } from '@/hooks/use-ledger';
import type { Account } from '@/lib/types';

const ACCOUNTS_STORAGE_KEY = 'ledger-ai-accounts';

function getDefaultAccounts(): Account[] {
  return [
    { id: '1', name: 'เงินสด', accountNumber: 'เงินสด', color: '#808080', currency: 'THB' },
    { id: '2', name: 'KBANK', accountNumber: 'KBANK', color: '#00A950', currency: 'THB' },
    { id: '3', name: 'SCB', accountNumber: 'SCB', color: '#4D2C91', currency: 'THB' },
  ];
}

export function ManageAccounts() {
  const { transactions } = useLedger();
  const [accounts, setAccounts] = useState<Account[]>(getDefaultAccounts());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [color, setColor] = useState('#808080');
  const [currency, setCurrency] = useState<'THB' | 'USD'>('THB');

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      setAccounts(JSON.parse(stored));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const resetForm = () => {
    setName('');
    setAccountNumber('');
    setColor('#808080');
    setCurrency('THB');
  };

  const handleAdd = () => {
    if (!name.trim() || !accountNumber.trim()) return;
    if (accounts.some(a => a.accountNumber === accountNumber.trim())) return;
    setAccounts([...accounts, {
      id: Date.now().toString(),
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      color,
      currency,
    }]);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editAccount) return;
    setAccounts(accounts.map(a => a.id === editAccount.id ? {
      ...a,
      name: name.trim(),
      accountNumber: accountNumber.trim(),
      color,
      currency,
    } : a));
    setIsEditDialogOpen(false);
    setEditAccount(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!accountToDelete) return;
    // ป้องกันลบบัญชีที่ถูกใช้งาน
    const used = transactions.some(t => t.account.accountNumber === accountToDelete.accountNumber);
    if (used) {
      alert('บัญชีนี้ถูกใช้งานในธุรกรรม ไม่สามารถลบได้');
      setAccountToDelete(null);
      return;
    }
    setAccounts(accounts.filter(a => a.id !== accountToDelete.id));
    setAccountToDelete(null);
  };

  const openEditDialog = (account: Account) => {
    setEditAccount(account);
    setName(account.name);
    setAccountNumber(account.accountNumber);
    setColor(account.color || '#808080');
    setCurrency(account.currency);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>บัญชีของฉัน</CardTitle>
          <CardDescription>เพิ่ม แก้ไข หรือลบบัญชี และเลือกสีประจำบัญชี</CardDescription>
        </div>
        <Button onClick={() => { setIsAddDialogOpen(true); resetForm(); }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          เพิ่มบัญชี
        </Button>
      </CardHeader>
      <CardContent>
        {accounts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อบัญชี</TableHead>
                <TableHead>เลขบัญชี</TableHead>
                <TableHead>สกุลเงิน</TableHead>
                <TableHead>สี</TableHead>
                <TableHead className="w-[50px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell>{acc.accountNumber}</TableCell>
                  <TableCell>{acc.currency}</TableCell>
                  <TableCell>
                    <span className="inline-block w-6 h-6 rounded-full border" style={{ background: acc.color }} title={acc.color}></span>
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">เปิดเมนู</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(acc)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>แก้ไข</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setAccountToDelete(acc)} className="text-red-600 focus:text-red-600">
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
            <h3 className="text-xl font-semibold">ไม่มีบัญชี</h3>
            <p>คลิก "เพิ่มบัญชี" เพื่อสร้างบัญชีแรกของคุณ</p>
          </div>
        )}
      </CardContent>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เพิ่มบัญชีใหม่</DialogTitle>
            <DialogDescription>กรอกชื่อบัญชี เลขบัญชี สี และสกุลเงิน</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">ชื่อบัญชี</Label>
              <Input id="account-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-number" className="text-right">เลขบัญชี</Label>
              <Input id="account-number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-color" className="text-right">สีบัญชี</Label>
              <input id="account-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="col-span-1 w-10 h-10 p-0 border-none bg-transparent" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-currency" className="text-right">สกุลเงิน</Label>
              <select id="account-currency" value={currency} onChange={e => setCurrency(e.target.value as 'THB' | 'USD')} className="col-span-2 border rounded px-2 py-1">
                <option value="THB">THB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsAddDialogOpen(false)}>ยกเลิก</Button>
            <Button type="submit" onClick={handleAdd}>บันทึก</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขบัญชี</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account-name" className="text-right">ชื่อบัญชี</Label>
              <Input id="edit-account-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account-number" className="text-right">เลขบัญชี</Label>
              <Input id="edit-account-number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account-color" className="text-right">สีบัญชี</Label>
              <input id="edit-account-color" type="color" value={color} onChange={e => setColor(e.target.value)} className="col-span-1 w-10 h-10 p-0 border-none bg-transparent" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account-currency" className="text-right">สกุลเงิน</Label>
              <select id="edit-account-currency" value={currency} onChange={e => setCurrency(e.target.value as 'THB' | 'USD')} className="col-span-2 border rounded px-2 py-1">
                <option value="THB">THB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>ยกเลิก</Button>
            <Button type="submit" onClick={handleEdit}>บันทึกการเปลี่ยนแปลง</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!accountToDelete} onOpenChange={open => !open && setAccountToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบบัญชี</DialogTitle>
            <DialogDescription>คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีนี้?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p>ชื่อบัญชี: <b>{accountToDelete?.name}</b></p>
            <p>เลขบัญชี: <b>{accountToDelete?.accountNumber}</b></p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setAccountToDelete(null)}>ยกเลิก</Button>
            <Button type="submit" variant="destructive" onClick={handleDelete}>ลบ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 