import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Transaction } from "@/lib/types";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
  TrendingUp,
  TrendingDown,
  Ban,
  MoreHorizontal,
  Pencil,
  Trash2,
  Settings2,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn, convertToTHB } from "@/lib/utils";
import { defaultPurposes } from "@/lib/data";

function formatCurrency(
  amount: number,
  currency: "THB" | "USD",
  type?: "income" | "expense",
) {
  const absAmount = Math.abs(amount);
  if (currency === "THB")
    return `${type === "expense" ? "-" : ""}฿${absAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`;
  if (currency === "USD")
    return `${type === "expense" ? "-" : ""}$${absAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
  return amount;
}

const currencyFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
});

const ALL_COLUMNS = [
  { key: "account", label: "บัญชี" },
  { key: "date", label: "วันที่" },
  { key: "details", label: "รายละเอียด" },
  { key: "purpose", label: "วัตถุประสงค์" },
  { key: "sender", label: "ผู้จ่าย" },
  { key: "recipient", label: "ผู้รับ" },
  { key: "amount", label: "จำนวนเงิน" },
];

interface TransactionsTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionsTableProps) {
  const tableType = transactions.length > 0 ? transactions[0].type : "expense";
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key),
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const toggleColumn = (key: string) => {
    setVisibleColumns((cols) =>
      cols.includes(key) ? cols.filter((c) => c !== key) : [...cols, key],
    );
  };

  // Auto-resize columns
  const autoResizeColumns = () => {
    const table = tableRef.current;
    if (!table) return;
    const ths = Array.from(table.querySelectorAll("thead th"));
    const colWidths: number[] = ths.map(() => 0);
    // วัดความกว้าง header
    ths.forEach((th, i) => {
      colWidths[i] = Math.max(
        colWidths[i],
        th.textContent
          ? measureTextWidth(th.textContent, getComputedStyle(th))
          : 0,
      );
    });
    // วัดความกว้าง cell
    const trs = Array.from(table.querySelectorAll("tbody tr"));
    trs.forEach((tr) => {
      Array.from(tr.children).forEach((td, i) => {
        if (i < colWidths.length) {
          colWidths[i] = Math.max(
            colWidths[i],
            td.textContent
              ? measureTextWidth(td.textContent, getComputedStyle(td))
              : 0,
          );
        }
      });
    });
    // เพิ่ม padding
    const padding = 24;
    colWidths.forEach((w, i) => {
      const th = ths[i] as HTMLElement;
      th.style.width = `${w + padding}px`;
      th.style.minWidth = `${w + padding}px`;
    });
  };
  // ฟังก์ชันวัดความกว้างข้อความ (canvas.measureText)
  function measureTextWidth(text: string, style: CSSStyleDeclaration) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return ctx.measureText(text).width;
  }

  useEffect(() => {
    autoResizeColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, visibleColumns]);

  return (
    <div className="w-full">
      <div className="flex justify-end mb-2 gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="ตั้งค่าคอลัมน์"
            >
              <Settings2 className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
              เลือกคอลัมน์ที่ต้องการแสดง
            </div>
            {ALL_COLUMNS.map((col) => (
              <DropdownMenuItem key={col.key} asChild>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="accent-primary"
                  />
                  {col.label}
                </label>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Table
        className="w-full table-fixed bg-transparent [&_thead]:bg-transparent [&_tbody]:bg-transparent [&_tr]:bg-transparent [&_th]:bg-transparent [&_td]:bg-transparent"
        ref={tableRef}
      >
        {transactions.length === 0 && (
          <TableCaption>ยังไม่มีการบันทึกธุรกรรม</TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-card z-10 w-12"></TableHead>
            {ALL_COLUMNS.map(
              (col) =>
                visibleColumns.includes(col.key) && (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ),
            )}
            <TableHead className="w-12 text-center"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            return (
              <TableRow key={transaction.id}>
                <TableCell className="sticky left-0 bg-card z-10">
                  {transaction.type === "income" ? (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                    >
                      <TrendingUp className="h-3 w-3" />
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                    >
                      <TrendingDown className="h-3 w-3" />
                    </Badge>
                  )}
                </TableCell>
                {visibleColumns.includes("account") && (
                  <TableCell className="sticky left-[50px] bg-card z-10">
                    <div className="font-medium">
                      {transaction.account.name}
                    </div>
                  </TableCell>
                )}
                {visibleColumns.includes("date") && (
                  <TableCell>
                    {format(transaction.date, "d MMM yyyy, HH:mm", {
                      locale: th,
                    })}
                  </TableCell>
                )}
                {visibleColumns.includes("details") && (
                  <TableCell>
                    {transaction.details ? (
                      <div className="text-sm text-muted-foreground italic max-w-xs truncate">
                        "{transaction.details}"
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                )}
                {visibleColumns.includes("purpose") && (
                  <TableCell>{transaction.purpose}</TableCell>
                )}
                {visibleColumns.includes("sender") && (
                  <TableCell>{transaction.sender || "-"}</TableCell>
                )}
                {visibleColumns.includes("recipient") && (
                  <TableCell>{transaction.recipient || "-"}</TableCell>
                )}
                {visibleColumns.includes("amount") && (
                  <TableCell className="text-right">
                    {formatCurrency(
                      transaction.amount,
                      transaction.account.currency,
                      transaction.type,
                    )}
                  </TableCell>
                )}
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">เปิดเมนู</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(transaction)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>แก้ไข</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(transaction)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>ลบ</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {transactions.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center p-12 text-muted-foreground">
          <Ban className="w-16 h-16 mb-4" />
          <h3 className="text-xl font-semibold">
            ไม่พบธุรกรรม{tableType === "income" ? "รายรับ" : "รายจ่าย"}
          </h3>
          <p>คลิก "เพิ่มธุรกรรม" เพื่อบันทึกรายการแรกของคุณ</p>
        </div>
      )}
    </div>
  );
}
