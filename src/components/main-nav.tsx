'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/', label: 'แดชบอร์ด' },
  { href: '/transactions', label: 'ธุรกรรม' },
  { href: '/income', label: 'รายได้' },
  { href: '/investments', label: 'การลงทุน' },
  { href: '/settings', label: 'ตั้งค่า' },
  { href: '/note', label: 'Note' },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-16">
          <Link href="/" className="flex items-center gap-3 mr-8">
            <Wallet className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight">
              Ledger AI
            </h1>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? 'secondary' : 'ghost'}
                className={cn('font-semibold', {
                  'text-foreground': pathname === item.href,
                  'text-muted-foreground hover:text-foreground': pathname !== item.href
                })}
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
