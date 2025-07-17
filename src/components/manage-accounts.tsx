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
import { useAccounts } from '@/hooks/use-accounts';
import type { Account } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';

const ACCOUNTS_STORAGE_KEY = 'ledger-ai-accounts';

function getDefaultAccounts(): Account[] {
  return [
    { id: '1', name: 'เงินสด', currency: 'THB', types: ['ทั่วไป'] },
    { id: '2', name: 'KBANK', currency: 'THB', types: ['ทั่วไป'] },
    { id: '3', name: 'SCB', currency: 'THB', types: ['ทั่วไป'] },
  ];
}

const DEFAULT_ACCOUNT_TYPES = ['ทั่วไป', 'ลงทุน', 'ออม'];

export function ManageAccounts() {
  const { transactions } = useLedger();
  const { accounts, addAccount, editAccount, deleteAccount } = useAccounts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editAccountState, setEditAccountState] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<'THB' | 'USD'>('THB');
  const [types, setTypes] = useState<string[]>(['ทั่วไป']);
  const [accountTypes, setAccountTypes] = useState<string[]>(() => {
    // รวมประเภทจากบัญชีที่มีอยู่และ default
    const all = [...DEFAULT_ACCOUNT_TYPES, ...accounts.flatMap(a => Array.isArray(a.types) ? a.types : []).filter(Boolean)];
    return Array.from(new Set(all));
  });
  const [newType, setNewType] = useState('');

  useEffect(() => {
    // sync accountTypes เมื่อ accounts เปลี่ยน
    setAccountTypes(Array.from(new Set([
      ...DEFAULT_ACCOUNT_TYPES,
      ...accounts.flatMap(a => Array.isArray(a.types) ? a.types : []).filter(Boolean)
    ])));
  }, [accounts]);

  const resetForm = () => {
    setName('');
    setCurrency('THB');
    setTypes(['ทั่วไป']);
    setNewType('');
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addAccount({
      name: name.trim(),
      currency,
      types: types.length ? types : ['ทั่วไป'],
    });
    setIsAddDialogOpen(false);
    resetForm();
  };

  const handleEdit = () => {
    if (!editAccountState) return;
    editAccount(editAccountState.id, {
      name: name.trim(),
      currency,
      types: types.length ? types : ['ทั่วไป'],
    });
    setIsEditDialogOpen(false);
    setEditAccountState(null);
    resetForm();
  };

  const handleDelete = () => {
    if (!accountToDelete) return;
    const used = transactions.some(t => t.account.id === accountToDelete.id);
    if (used) {
      alert('บัญชีนี้ถูกใช้งานในธุรกรรม ไม่สามารถลบได้');
      setAccountToDelete(null);
      return;
    }
    deleteAccount(accountToDelete.id);
    setAccountToDelete(null);
  };

  const openEditDialog = (account: Account) => {
    setEditAccountState(account);
    setName(account.name);
    setCurrency(account.currency);
    setTypes(Array.isArray(account.types) && account.types.length ? account.types : ['ทั่วไป']);
    setIsEditDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>บัญชีของฉัน</CardTitle>
          <CardDescription>เพิ่ม แก้ไข หรือลบบัญชี เลือกสกุลเงิน และกำหนดประเภทบัญชี</CardDescription>
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
                <TableHead>สกุลเงิน</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead className="w-[50px] text-center"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell>{acc.currency}</TableCell>
                  <TableCell>{(Array.isArray(acc.types) ? acc.types : [acc.types]).join(', ') || 'ทั่วไป'}</TableCell>
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
            <DialogDescription>กรอกชื่อบัญชี เลขบัญชี สกุลเงิน และประเภทบัญชี</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-name" className="text-right">ชื่อบัญชี</Label>
              <Input id="account-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-currency" className="text-right">สกุลเงิน</Label>
              <select id="account-currency" value={currency} onChange={e => setCurrency(e.target.value as 'THB' | 'USD')} className="col-span-2 border rounded px-2 py-1">
                <option value="THB">THB</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account-type" className="text-right">ประเภทบัญชี</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {accountTypes.map(t => (
                  <label key={t} className="flex items-center gap-1">
                    <Checkbox
                      checked={types.includes(t)}
                      onCheckedChange={checked => {
                        setTypes(prev => checked ? [...prev, t] : prev.filter(x => x !== t));
                      }}
                      id={`add-type-${t}`}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <Input
                placeholder="เพิ่มประเภทใหม่..."
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onBlur={() => {
                  if (newType.trim() && !accountTypes.includes(newType.trim())) {
                    setAccountTypes(types => [...types, newType.trim()]);
                    setTypes(prev => [...prev, newType.trim()]);
                  }
                  setNewType('');
                }}
                className="col-span-3 mt-2"
              />
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
              <Label htmlFor="edit-account-currency" className="text-right">สกุลเงิน</Label>
              <select id="edit-account-currency" value={currency} onChange={e => setCurrency(e.target.value as 'THB' | 'USD')} className="col-span-2 border rounded px-2 py-1">
                <option value="THB">THB</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-account-type" className="text-right">ประเภทบัญชี</Label>
              <div className="col-span-3 flex flex-wrap gap-2">
                {accountTypes.map(t => (
                  <label key={t} className="flex items-center gap-1">
                    <Checkbox
                      checked={types.includes(t)}
                      onCheckedChange={checked => {
                        setTypes(prev => checked ? [...prev, t] : prev.filter(x => x !== t));
                      }}
                      id={`edit-type-${t}`}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
              <Input
                placeholder="เพิ่มประเภทใหม่..."
                value={newType}
                onChange={e => setNewType(e.target.value)}
                onBlur={() => {
                  if (newType.trim() && !accountTypes.includes(newType.trim())) {
                    setAccountTypes(types => [...types, newType.trim()]);
                    setTypes(prev => [...prev, newType.trim()]);
                  }
                  setNewType('');
                }}
                className="col-span-3 mt-2"
              />
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