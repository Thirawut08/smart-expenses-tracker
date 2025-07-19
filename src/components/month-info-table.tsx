"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardContent } from "@/components/ui/card";
import { monthDetails } from "@/lib/data";

export function MonthInfoTable() {
  const currentMonth = new Date().getMonth() + 1; // 1-based
  return (
    <CardContent className="pt-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ลำดับ</TableHead>
            <TableHead>ชื่อเดือนอังกฤษ</TableHead>
            <TableHead>ตัวย่อ</TableHead>
            <TableHead>ชื่อเดือนไทย</TableHead>
            <TableHead>ตัวย่อ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {monthDetails.map((month) => (
            <TableRow
              key={month.order}
              className={
                month.order === currentMonth
                  ? "bg-blue-900/40 text-blue-400 font-bold"
                  : ""
              }
            >
              <TableCell>{month.order}</TableCell>
              <TableCell>{month.engFull}</TableCell>
              <TableCell>{month.engAbbr}</TableCell>
              <TableCell>{month.thaiFull}</TableCell>
              <TableCell>{month.thaiAbbr}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
