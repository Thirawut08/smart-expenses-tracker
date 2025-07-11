'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'แดชบอร์ด' },
  { href: '/transactions', label: 'ธุรกรรมทั่วไป' },
  { href: '/investments', label: 'การลงทุน' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="flex items-center gap-3 mr-8">
            <Wallet className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight">
              Smart Expense Tracker
            </h1>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn('font-semibold', {
                  'text-primary': pathname === item.href
                })}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
