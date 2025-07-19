"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { TimeField } from "@/components/ui/time-field";
import { Time } from "@internationalized/date";
import { th } from "date-fns/locale";

interface TimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const handleTimeChange = (time: Time) => {
    if (!date) return;
    const newDate = new Date(date);
    newDate.setHours(time.hour);
    newDate.setMinutes(time.minute);
    setDate(newDate);
  };

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          ชั่วโมง
        </Label>
        <TimeField
          aria-label="Time"
          value={date ? new Time(date.getHours(), date.getMinutes()) : null}
          onChange={handleTimeChange}
          locale="th-TH"
          hourCycle={24}
        />
      </div>
    </div>
  );
}
