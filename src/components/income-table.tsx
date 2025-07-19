"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import type { Income } from "@/lib/types";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { MoreHorizontal, Pencil, Trash2, Ban, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

const thbFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const formatCurrency = (value: number, currency: "THB" | "USD" | undefined) => {
  if (currency === "USD") {
    return usdFormatter.format(value);
  }
  return thbFormatter.format(value);
};

interface IncomeTableProps {
  incomes: Income[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function IncomeTable({ incomes, onEdit, onDelete }: IncomeTableProps) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground bg-muted/30 rounded-lg">
        <Wallet className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold">ยังไม่มีการบันทึกรายรับ</h3>
        <p>คลิก "เพิ่มรายรับ" เพื่อเริ่มต้น</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>วันที่</TableHead>
          <TableHead>บัญชี</TableHead>
          <TableHead className="text-right">จำนวนเงิน</TableHead>
          <TableHead className="w-[50px] text-center"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {incomes.map((income) => (
          <TableRow key={income.id}>
            <TableCell>
              {format(income.date, "d MMM yyyy, HH:mm", { locale: th })}
            </TableCell>
            <TableCell>
              <div className="font-medium">{income.account.name}</div>
            </TableCell>
            <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
              {formatCurrency(income.amount, income.account.currency)}
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
                  <DropdownMenuItem onClick={() => onEdit(income.id)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    <span>แก้ไข</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(income.id)}
                    className="text-red-600 focus:text-red-600"
                  >
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
  );
}
