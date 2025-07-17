'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'แดชบอร์ด', highlight: true },
  { href: '/transactions', label: 'ธุรกรรม' },
  { href: '/income', label: 'รายได้' },
  { href: '/investments', label: 'การลงทุน' },
  { href: '/settings', label: 'ตั้งค่า' },
  { href: '/note', label: 'โน้ต' }, // เพิ่ม Note กลับเข้าเมนู
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="bg-background sticky top-0 z-50">
      <div className="container mx-auto px-2 md:px-4">
        <div className="flex items-center h-10 md:h-12">
          <nav className="flex items-center gap-12">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                size="icon"
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn(
                  'flex items-center justify-center font-semibold px-3 rounded-md text-xs md:text-sm h-9 min-w-0 w-auto',
                  pathname === item.href ? 'ring-2 ring-primary ring-offset-2' : 'text-muted-foreground hover:text-foreground',
                  'transition-colors duration-100'
                )}
                title={item.label}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
