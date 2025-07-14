'use client';
import { ManagePurposes } from '@/components/manage-purposes';
import { ManageAccounts } from '@/components/manage-accounts';

export default function SettingsPage() {
    
  return (
    <div className="space-y-8">
        <ManageAccounts />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold font-headline">ตั้งค่า</h1>
        </div>
        
        <ManagePurposes />
    </div>
  );
}
