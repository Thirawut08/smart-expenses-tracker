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
  disabled?: boolean;
  onAddNew?: (label: string) => void; // เพิ่ม prop สำหรับ callback กรณีเพิ่มใหม่
}

export const HighPerfDropdown: React.FC<HighPerfDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'เลือก...',
  className = '',
  disabled = false,
  onAddNew,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [search, setSearch] = useState('');
  const [dropUp, setDropUp] = useState(false);

  // Filtered options
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Reset search when closing
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  // ตรวจสอบตำแหน่ง dropdown ก่อนแสดง
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setDropUp(spaceBelow < 220); // ถ้าพื้นที่ด้านล่างน้อยกว่า 220px ให้ flip ขึ้นบน
    }
  }, [open]);

  // Keyboard navigation (update to allow add new)
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
        setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        setHighlighted((h) => Math.max(h - 1, 0));
        e.preventDefault();
      } else if (e.key === 'Enter') {
        if (highlighted >= 0 && filteredOptions[highlighted]) {
          onChange(filteredOptions[highlighted].value);
          setOpen(false);
        } else if (search.trim() && !filteredOptions.some(opt => opt.label.toLowerCase() === search.trim().toLowerCase())) {
          // ถ้าไม่มีในตัวเลือกเดิมและมี onAddNew
          if (onAddNew) {
            onAddNew(search.trim());
            setOpen(false);
          }
        }
        e.preventDefault();
      } else if (e.key === 'Escape') {
        setOpen(false);
        e.preventDefault();
      }
    },
    [open, highlighted, filteredOptions, onChange, search, onAddNew]
  );

  // Scroll to highlighted item (update to use filteredOptions)
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
        className="w-full px-3 py-2 border rounded bg-white dark:bg-zinc-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={disabled ? undefined : handleKeyDown}
        tabIndex={0}
        disabled={disabled}
      >
        {options.find((opt) => opt.value === value)?.label || (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>
      {open && !disabled && (
        <div
          ref={menuRef}
          className={`absolute z-50 w-full left-0 right-0 max-h-[50vh] overflow-y-auto overscroll-contain rounded border bg-white dark:bg-zinc-900 shadow-lg ${dropUp ? 'bottom-full mb-1' : 'mt-1 top-full'}`}
          role="listbox"
          tabIndex={-1}
        >
          <div className="p-2 border-b bg-gray-50 dark:bg-zinc-800">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setHighlighted(0);
              }}
              placeholder="พิมพ์ค้นหา..."
              className="w-full px-2 py-1 rounded border text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={e => { e.stopPropagation(); handleKeyDown(e as any); }}
            />
          </div>
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-400">ไม่พบตัวเลือก</div>
          ) : (
            filteredOptions.map((opt, idx) => (
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