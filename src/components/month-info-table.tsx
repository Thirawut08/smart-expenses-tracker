'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { monthDetails } from '@/lib/data';

export function MonthInfoTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ข้อมูลเดือน</CardTitle>
        <CardDescription>
          ตารางแสดงชื่อเดือนและตัวย่อต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              <TableRow key={month.order}>
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
    </Card>
  );
}
