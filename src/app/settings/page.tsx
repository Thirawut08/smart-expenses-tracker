"use client";
import { ManagePurposes } from "@/components/manage-purposes";
import { ManageAccounts } from "@/components/manage-accounts";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-4 p-2 md:p-4">
      <h1 className="text-xl md:text-2xl font-bold font-headline mb-2 md:mb-4">
        ตั้งค่า
      </h1>
      <div className="space-y-3">
        <ManageAccounts />
        <ManagePurposes />
      </div>
    </div>
  );
}
