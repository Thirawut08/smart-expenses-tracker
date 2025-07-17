import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { DateTimePicker } from './date-time-picker';
import { useAccounts } from '@/hooks/use-accounts';
import { useLedger } from '@/hooks/use-ledger';
import { Switch } from './ui/switch';
import { HighPerfDropdown } from './ui/high-perf-dropdown';
import { useRef } from 'react';
import { useEffect } from 'react';

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export function AddTransactionModal({ open, onClose, onSave }: AddTransactionModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [date, setDate] = useState<Date>(new Date());
  const [account, setAccount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isTransfer, setIsTransfer] = useState(false);
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [details, setDetails] = useState('');
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const { accounts, addAccount } = useAccounts();
  const { purposes, addPurpose } = useLedger();

  useEffect(() => {
    if (isTransfer) {
      const fromAccObj = accounts.find(acc => acc.id === fromAccount);
      const toAccObj = accounts.find(acc => acc.id === toAccount);
      setSender(fromAccObj ? fromAccObj.name : '');
      setRecipient(toAccObj ? toAccObj.name : '');
    }
  }, [isTransfer, fromAccount, toAccount, accounts]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || (isTransfer ? (!fromAccount || !toAccount) : !account)) return;
    // เตรียมข้อมูลสำหรับโอนระหว่างบัญชี
    if (isTransfer) {
      const fromAccObj = accounts.find(acc => acc.id === fromAccount);
      const toAccObj = accounts.find(acc => acc.id === toAccount);
      const transferDetails = 'โอนระหว่างบัญชี';
      const transferSender = fromAccObj ? fromAccObj.name : '';
      const transferRecipient = toAccObj ? toAccObj.name : '';
      onSave({
        amount: Number(amount),
        date,
        purpose,
        details: transferDetails,
        sender: transferSender, // override ด้วยชื่อบัญชีต้นทาง
        recipient: transferRecipient, // override ด้วยชื่อบัญชีปลายทาง
        fromAccount,
        toAccount,
        type: 'transfer',
      });
    } else {
      onSave({
        amount: Number(amount),
        date,
        purpose,
        details,
        sender,
        recipient,
        type,
        accountId: account,
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>เพิ่มธุรกรรมใหม่</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Switch checked={isTransfer} onCheckedChange={setIsTransfer} id="toggle-transfer-mode" />
            <label htmlFor="toggle-transfer-mode" className="cursor-pointer select-none text-sm font-medium">
              โอนระหว่างบัญชี
            </label>
          </div>
          <div>
            <label className="block mb-1 font-medium">จำนวนเงิน</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="h-14 text-3xl px-4 w-full"
              autoFocus
              required
            />
          </div>
          {!isTransfer && (
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'expense' ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={() => setType('expense')}
              >รายจ่าย</Button>
              <Button
                type="button"
                variant={type === 'income' ? 'secondary' : 'outline'}
                className="flex-1"
                onClick={() => setType('income')}
              >รายรับ</Button>
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium">วันที่และเวลา</label>
            <DateTimePicker value={date} onChange={d => { if (d) setDate(d); }} />
          </div>
          {isTransfer ? (
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">บัญชีต้นทาง</label>
                <HighPerfDropdown
                  options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                  value={fromAccount}
                  onChange={setFromAccount}
                  placeholder="เลือกบัญชีต้นทาง..."
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">บัญชีปลายทาง</label>
                <HighPerfDropdown
                  options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                  value={toAccount}
                  onChange={setToAccount}
                  placeholder="เลือกบัญชีปลายทาง..."
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block mb-1 font-medium">บัญชี</label>
              <HighPerfDropdown
                options={accounts.map(acc => ({ value: acc.id, label: `${acc.name} (${acc.currency})` }))}
                value={account}
                onChange={setAccount}
                placeholder="เลือกบัญชี..."
                className="w-full"
              />
            </div>
          )}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block mb-1 font-medium">ผู้จ่าย (ถ้ามี)</label>
              <Input
                placeholder="ชื่อผู้จ่าย"
                value={sender}
                onChange={e => setSender(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-medium">ผู้รับ (ถ้ามี)</label>
              <Input
                placeholder="ชื่อผู้รับ"
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">รายละเอียด (ถ้ามี)</label>
            <textarea
              placeholder="บันทึกรายละเอียดเพิ่มเติมพิมพ์เทิม"
              value={details}
              onChange={e => setDetails(e.target.value)}
              className="w-full h-20 px-4 py-2 rounded border text-base bg-background resize-none"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">วัตถุประสงค์</label>
            <HighPerfDropdown
              options={purposes.map(p => ({ value: p, label: p }))}
              value={purpose}
              onChange={setPurpose}
              placeholder="เลือกวัตถุประสงค์..."
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>ยกเลิก</Button>
            <Button type="submit" className="font-bold">บันทึก</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 