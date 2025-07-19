import React, { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import {
  useFloating,
  flip,
  offset,
  FloatingPortal,
} from "@floating-ui/react-dom-interactions";

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

// mergeRefs utility
function mergeRefs<T>(
  ...refs: (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  return (value) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") ref(value);
      else if (ref && typeof ref === "object") (ref as any).current = value;
    });
  };
}

// Memoized Option Item
const DropdownOptionItem = memo(function DropdownOptionItem({
  opt,
  idx,
  value,
  highlighted,
  onChange,
  setOpen,
  setHighlighted,
}: {
  opt: DropdownOption;
  idx: number;
  value: string;
  highlighted: number;
  onChange: (v: string) => void;
  setOpen: (v: boolean) => void;
  setHighlighted: (v: number) => void;
}) {
  return (
    <div
      key={opt.value}
      id={`dropdown-opt-${idx}`}
      role="option"
      aria-selected={value === opt.value}
      className={`px-4 py-2 cursor-pointer select-none ${
        value === opt.value
          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
          : highlighted === idx
            ? "bg-gray-100 dark:bg-zinc-800"
            : ""
      }`}
      style={{ minHeight: 40, fontSize: 16 }}
      onMouseEnter={() => setHighlighted(idx)}
      onMouseDown={(e) => {
        e.preventDefault();
        onChange(opt.value);
        setOpen(false);
      }}
    >
      {typeof opt.label === "string" ||
      typeof opt.label === "number" ||
      React.isValidElement(opt.label)
        ? opt.label
        : String(opt.label)}
    </div>
  );
});

export const HighPerfDropdown: React.FC<HighPerfDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "เลือก...",
  className = "",
  disabled = false,
  onAddNew,
}) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [highlighted, setHighlighted] = useState<number>(-1);
  const [search, setSearch] = useState("");
  // Floating UI
  const { x, y, strategy, update, refs } = useFloating({
    middleware: [offset(4), flip({ fallbackPlacements: ["top-start"] })],
    placement: "bottom-start",
  });

  // Filtered options (memoized)
  const filteredOptions = useMemo(
    () => options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
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
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Reset search when closing
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  // อัปเดตตำแหน่ง Floating UI เมื่อเปิด dropdown หรือขนาดเปลี่ยน
  useEffect(() => {
    if (open) update();
  }, [open, update, options.length]);

  // Keyboard navigation (update to allow add new)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          setOpen(true);
          setHighlighted(0);
          e.preventDefault();
        }
        return;
      }
      if (e.key === "ArrowDown") {
        setHighlighted((h) => Math.min(h + 1, filteredOptions.length - 1));
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        setHighlighted((h) => Math.max(h - 1, 0));
        e.preventDefault();
      } else if (e.key === "Enter") {
        if (highlighted >= 0 && filteredOptions[highlighted]) {
          onChange(filteredOptions[highlighted].value);
          setOpen(false);
        } else if (
          search.trim() &&
          !filteredOptions.some(
            (opt) => opt.label.toLowerCase() === search.trim().toLowerCase(),
          )
        ) {
          // ถ้าไม่มีในตัวเลือกเดิมและมี onAddNew
          if (onAddNew) {
            onAddNew(search.trim());
        setOpen(false);
          }
        }
        e.preventDefault();
      } else if (e.key === "Escape") {
        setOpen(false);
        e.preventDefault();
      }
    },
    [open, highlighted, filteredOptions, onChange, search, onAddNew],
  );

  // Scroll to highlighted item (update to use filteredOptions)
  useEffect(() => {
    if (open && highlighted >= 0) {
      const el = document.getElementById(`dropdown-opt-${highlighted}`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [highlighted, open]);

  return (
    <div className={`relative ${className}`}>
      <div
        ref={mergeRefs(refs.reference, triggerRef)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        tabIndex={0}
        className="w-full px-3 py-2 border rounded bg-white dark:bg-zinc-900 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={disabled ? undefined : handleKeyDown}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          userSelect: "none",
        }}
        aria-disabled={disabled}
      >
        {(() => {
          const found = options.find((opt) => opt.value === value)?.label;
          if (
            typeof found === "string" ||
            typeof found === "number" ||
            React.isValidElement(found)
          )
            return found;
          if (found) return String(found);
          return <span className="text-gray-400">{placeholder}</span>;
        })()}
      </div>
      {open && !disabled && (
        <div
          ref={mergeRefs(refs.floating, menuRef)}
          className="z-[9999] max-h-[50vh] overflow-y-auto overscroll-contain rounded border bg-white dark:bg-zinc-900 shadow-lg"
          role="listbox"
          tabIndex={-1}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width:
              (refs.reference.current as HTMLElement | null)?.offsetWidth ||
              240,
          }}
        >
          {/* Search box อยู่ใน dropdown เดียวกับ options */}
          <div className="p-2 bg-gray-50 dark:bg-zinc-800">
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlighted(0);
              }}
              placeholder="พิมพ์ค้นหา..."
              className="w-full px-2 py-1 rounded border text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                e.stopPropagation();
                handleKeyDown(e as any);
              }}
            />
          </div>
          {/* Options */}
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-gray-400">ไม่พบตัวเลือก</div>
          ) : (
            filteredOptions.map((opt, idx) => (
              <DropdownOptionItem
                key={opt.value}
                opt={opt}
                idx={idx}
                value={value}
                highlighted={highlighted}
                onChange={onChange}
                setOpen={setOpen}
                setHighlighted={setHighlighted}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}; 
