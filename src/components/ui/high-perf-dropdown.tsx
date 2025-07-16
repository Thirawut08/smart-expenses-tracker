import React, { useState, useRef, useEffect, useCallback } from 'react';

type DropdownOption = {
  value: string;
  label: string;
};

interface HighPerfDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const HighPerfDropdown: React.FC<HighPerfDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'เลือก...',
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState<number>(-1);

  // ปิด dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          setOpen(true);
          setHighlighted(0);
          e.preventDefault();
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        setHighlighted((h) => Math.min(h + 1, options.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setHighlighted((h) => Math.max(h - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter' && highlighted >= 0) {
        onChange(options[highlighted].value);
        setOpen(false);
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setOpen(false);
        e.preventDefault();
      }
    },
    [open, highlighted, options, onChange]
  );

  // Scroll to highlighted item
  useEffect(() => {
    if (open && highlighted >= 0) {
      const el = document.getElementById(`dropdown-opt-${highlighted}`);
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlighted, open]);

  return (
    <div className={`relative ${className}`}>
      <button
        ref={triggerRef}
        type="button"
        className="w-full px-3 py-2 border rounded bg-white dark:bg-zinc-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {options.find((opt) => opt.value === value)?.label || (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded border bg-white dark:bg-zinc-900 shadow-lg"
          role="listbox"
          tabIndex={-1}
        >
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-400">ไม่มีตัวเลือก</div>
          ) : (
            options.map((opt, idx) => (
              <div
                key={opt.value}
                id={`dropdown-opt-${idx}`}
                role="option"
                aria-selected={value === opt.value}
                className={`px-4 py-2 cursor-pointer select-none ${
                  value === opt.value
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200'
                    : highlighted === idx
                    ? 'bg-gray-100 dark:bg-zinc-800'
                    : ''
                }`}
                style={{ minHeight: 40, fontSize: 16 }}
                onMouseEnter={() => setHighlighted(idx)}
                onMouseDown={(e) => {
                  // ใช้ onMouseDown แทน onClick เพื่อป้องกัน dropdown ปิดก่อนเลือก
                  e.preventDefault();
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}; 