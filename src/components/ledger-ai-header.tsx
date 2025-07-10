import { Wallet } from 'lucide-react';

export function LedgerAiHeader() {
  return (
    <header className="bg-card border-b sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center h-16">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-2xl font-bold font-headline tracking-tight">
            Ledger AI
          </h1>
        </div>
      </div>
    </header>
  );
}
