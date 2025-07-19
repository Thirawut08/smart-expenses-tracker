import React, { useState, useMemo } from "react";
import {
  format,
  addDays,
  addWeeks,
  isToday,
  isSameDay,
  isSameMonth,
  getDaysInMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addMonths,
  subMonths,
} from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Clock,
} from "lucide-react";
import { toZonedTime } from "date-fns-tz"; // ใช้เฉพาะ toZonedTime

const TIMEZONE = "Asia/Bangkok";

const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const YEARS = Array.from({ length: 101 }, (_, i) => 2000 + i);
const presetTimes = ["09:00", "12:00", "18:00"];

function parseDateInput(input: string): Date | undefined {
  const [d, m, y] = input.split("/").map(Number);
  if (!d || !m || !y) return undefined;
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? undefined : date;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

interface DateTimePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
}

// Utility: ตรวจสอบว่า input type="time" รองรับ 24 ชั่วโมงหรือไม่
function is24HourTimeSupported() {
  if (typeof document === "undefined") return true;
  const input = document.createElement("input");
  input.type = "time";
  input.value = "13:00";
  return input.value === "13:00";
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [dateInput, setDateInput] = useState(
    value ? format(value, "dd/MM/yyyy") : "",
  );
  const [time, setTime] = useState(() => (value ? format(value, "HH:mm") : ""));
  const [calendarMonth, setCalendarMonth] = useState(() =>
    value ? value.getMonth() : new Date().getMonth(),
  );
  const [calendarYear, setCalendarYear] = useState(() =>
    value ? value.getFullYear() : new Date().getFullYear(),
  );
  const [forceTextTime, setForceTextTime] = useState(false);

  React.useEffect(() => {
    // ตรวจสอบเฉพาะ client
    if (typeof window !== "undefined") {
      setForceTextTime(!is24HourTimeSupported());
    }
  }, []);

  // Quick select handlers
  const handleQuick = (type: "today" | "tomorrow" | "nextweek") => {
    let d = new Date();
    if (type === "tomorrow") d = addDays(d, 1);
    if (type === "nextweek") d = addWeeks(d, 1);
    setDateInput(format(d, "dd/MM/yyyy"));
    setCalendarMonth(d.getMonth());
    setCalendarYear(d.getFullYear());
    setTime("09:00");
    const dt = new Date(d);
    dt.setHours(9, 0, 0, 0);
    onChange(dt);
    setOpen(false);
  };

  // Date input change
  const handleDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateInput(e.target.value);
    const parsed = parseDateInput(e.target.value);
    if (parsed && time) {
      setCalendarMonth(parsed.getMonth());
      setCalendarYear(parsed.getFullYear());
      const [h, m] = time.split(":").map(Number);
      parsed.setHours(h, m, 0, 0);
      onChange(parsed);
    }
  };

  // ปรับเวลาตาม timezone ไทย
  const handleTimeChange = (t: string) => {
    setTime(t);
    if (selectedDate) {
      const [h, m] = t.split(":").map(Number);
      const local = new Date(selectedDate);
      local.setHours(h, m, 0, 0);
      onChange(local);
    }
  };

  // Now button
  const handleNow = () => {
    const now = new Date();
    setDateInput(format(now, "dd/MM/yyyy"));
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
    setTime(format(now, "HH:mm"));
    onChange(now);
    setOpen(false);
  };

  // Calendar select
  const handleCalendarSelect = (d: Date) => {
    setDateInput(format(d, "dd/MM/yyyy"));
    if (time) {
      const [h, m] = time.split(":").map(Number);
      d.setHours(h, m, 0, 0);
    }
    onChange(d);
  };

  // Calendar grid calculation
  const calendarGrid = useMemo(() => {
    const firstOfMonth = new Date(calendarYear, calendarMonth, 1);
    const lastOfMonth = endOfMonth(firstOfMonth);
    const firstDayOfGrid = startOfWeek(firstOfMonth, { weekStartsOn: 0 }); // Sunday
    const days = [];
    let d = new Date(firstDayOfGrid);
    for (let i = 0; i < 42; i++) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [calendarMonth, calendarYear]);

  // Time options (step 15 min)
  const timeOptions = useMemo(() => {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        opts.push(`${pad(h)}:${pad(m)}`);
      }
    }
    return opts;
  }, []);

  // Handle month/year change
  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCalendarMonth(Number(e.target.value));
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCalendarYear(Number(e.target.value));
  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  // Selected date for highlight
  const selectedDate = parseDateInput(dateInput);
  const today = new Date();

  // state สำหรับชั่วโมงและนาที เริ่มต้นว่าง
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  // sync เฉพาะตอน selectedDate หรือ value เปลี่ยน และ hour/minute ยังว่างเท่านั้น
  React.useEffect(() => {
    if (selectedDate && value) {
      const h = value.getHours().toString().padStart(2, "0");
      const m = value.getMinutes().toString().padStart(2, "0");
      if (hour === "" && minute === "") {
        setHour(h === "00" ? "" : h);
        setMinute(m === "00" ? "" : m);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, value]);

  // validate และอัปเดตเวลาเมื่อกรอกครบ เฉพาะเมื่อค่าจริงๆเปลี่ยน
  React.useEffect(() => {
    if (
      /^([01]\d|2[0-3])$/.test(hour) &&
      /^[0-5]\d$/.test(minute) &&
      selectedDate
    ) {
      const local = new Date(selectedDate);
      local.setHours(Number(hour), Number(minute), 0, 0);
      if (!value || local.getTime() !== value.getTime()) {
        onChange(local);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, selectedDate]);

  // Validate HH:mm 24h
  function validate24hTime(val: string) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(val);
  }

  // Utility: select all on focus
  const handleSelectAll: React.FocusEventHandler<HTMLInputElement> = (e) => {
    e.target.select();
  };

  // Utility: validate hour/minute input (only on blur or paste)
  function filterHour(val: string) {
    let n = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n)) return "";
    if (n > 23) n = 23;
    if (n < 0) n = 0;
    return n.toString().padStart(2, "0").slice(-2);
  }
  function filterMinute(val: string) {
    let n = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (isNaN(n)) return "";
    if (n > 59) n = 59;
    if (n < 0) n = 0;
    return n.toString().padStart(2, "0").slice(-2);
  }

  return (
    <div className="w-full max-w-xs mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal text-xs h-8 px-2 py-1"
            onClick={() => setOpen((v) => !v)}
          >
            <CalendarIcon className="mr-2 h-3 w-3" />
            {value ? format(value, "dd MMMM yyyy HH:mm", { locale: th }) : <span className="text-muted-foreground">เลือกวันและเวลา...</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-2" style={{ minWidth: 220 }}>
          <div className="flex flex-col gap-3">
            {/* Date calendar only, no date input */}
            <div className="flex flex-col items-center">
              <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-6 w-6 p-0">
                      <ChevronLeft className="h-3 w-3" />
                  </Button>
                  <select
                      className="mx-1 rounded border px-1 py-0.5 text-xs"
                    value={calendarMonth}
                    onChange={handleMonthChange}
                  >
                    {MONTHS.map((m, i) => (
                      <option key={m} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                      className="mx-1 rounded border px-1 py-0.5 text-xs"
                    value={calendarYear}
                    onChange={handleYearChange}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-6 w-6 p-0">
                      <ChevronRight className="h-3 w-3" />
                  </Button>
                </div>
                  <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                  <div className="grid grid-cols-7 gap-0.5">
                  {calendarGrid.map((d, i) => {
                    const isCurrentMonth =
                      d.getMonth() === calendarMonth &&
                      d.getFullYear() === calendarYear;
                    const isSelected =
                      selectedDate && isSameDay(d, selectedDate);
                    const isTodayCell = isToday(d);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={
                          "w-9 h-9 rounded-md flex items-center justify-center transition-all " +
                          (isCurrentMonth
                            ? isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow"
                              : isTodayCell
                                ? "border border-primary font-bold"
                                : "bg-background text-foreground hover:bg-accent"
                            : "bg-muted text-muted-foreground opacity-60")
                        }
                        onClick={() =>
                          isCurrentMonth && handleCalendarSelect(new Date(d))
                        }
                        disabled={!isCurrentMonth}
                        tabIndex={isCurrentMonth ? 0 : -1}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Time input: แยกช่อง ชั่วโมง/นาที */}
              <div className="flex gap-1 items-center mt-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={hour}
                  onFocus={handleSelectAll}
                onChange={(e) => {
                    // allow up to 2 digits, only numbers
                    let hourVal = e.target.value.replace(/[^0-9]/g, "").slice(0,2);
                    setHour(hourVal);
                  }}
                  onBlur={(e) => {
                    setHour(filterHour(e.target.value));
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    setHour(filterHour(text));
                }}
                  className="border rounded px-1 py-0.5 text-xs focus:ring-2 focus:ring-primary w-[50px] text-center"
                placeholder="00"
                pattern="[0-2][0-9]"
                inputMode="numeric"
                lang="th"
                maxLength={2}
                autoComplete="off"
                aria-label="ชั่วโมง"
              />
              <span>:</span>
              <input
                type="text"
                value={minute}
                  onFocus={handleSelectAll}
                onChange={(e) => {
                    // allow up to 2 digits, only numbers
                    let minuteVal = e.target.value.replace(/[^0-9]/g, "").slice(0,2);
                    setMinute(minuteVal);
                  }}
                  onBlur={(e) => {
                    setMinute(filterMinute(e.target.value));
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const text = e.clipboardData.getData("text/plain");
                    setMinute(filterMinute(text));
                }}
                  className="border rounded px-1 py-0.5 text-xs focus:ring-2 focus:ring-primary w-[50px] text-center"
                placeholder="00"
                pattern="[0-5][0-9]"
                inputMode="numeric"
                lang="th"
                maxLength={2}
                autoComplete="off"
                aria-label="นาที"
              />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
