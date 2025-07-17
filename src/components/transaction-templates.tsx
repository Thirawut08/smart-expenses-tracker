'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import type { Template } from '@/lib/types';
import { defaultPurposes } from '@/lib/data';

interface TransactionTemplatesProps {
  templates: Template[];
  onUseTemplate: (template: Template) => void;
}

export function TransactionTemplates({ templates, onUseTemplate }: TransactionTemplatesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>เทมเพลตของฉัน</CardTitle>
        <CardDescription>
          ใช้เทมเพลตเพื่อเพิ่มธุรกรรมที่เกิดขึ้นบ่อยได้อย่างรวดเร็ว
        </CardDescription>
      </CardHeader>
      <CardContent>
        {templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start justify-start text-left"
                onClick={() => onUseTemplate(template)}
              >
                <p className="font-semibold"><span className="mr-1 text-xl">{template.name}</span></p>
                <p className="text-sm text-muted-foreground">
                  {template.purpose}
                </p>
                 {template.details && <p className="text-xs text-muted-foreground/80 truncate">"{template.details}"</p>}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mb-2 opacity-60" />
            <div className="text-base font-medium">ยังไม่มีเทมเพลต</div>
            <div className="text-xs mt-1">คุณสามารถสร้างเทมเพลตได้โดยการกด "บันทึกเป็นเทมเพลต" เมื่อเพิ่มธุรกรรมใหม่</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
