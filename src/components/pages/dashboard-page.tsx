"use client";
// --- React & Hooks ---
import { useState, useMemo } from "react";

// --- Data & State ---
import { useLedger } from "@/hooks/use-ledger";
import { useAccounts } from "@/hooks/use-accounts";
import { useExchangeRate } from "@/hooks/use-exchange-rate";
import { thaiMonths } from "@/lib/data";

// --- UI Components ---
import { HighPerfDropdown } from "../ui/high-perf-dropdown";
import { AccountBalances } from "@/components/account-balances";
import { TransactionTemplates } from "@/components/transaction-templates";
import { UnifiedDashboardChart } from "@/components/dashboard-summary-chart";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

/**
 * DashboardPage - หน้าหลักแสดงภาพรวมการเงิน, กราฟ, บัญชี, เทมเพลต ฯลฯ
 * - กรองธุรกรรมตามเดือน/โหมด
 * - แสดงยอดคงเหลือ, กราฟ, เทมเพลต
 */
export function DashboardPage() {
  // --- State ---
  const { transactions, templates, handleUseTemplate } = useLedger();
  const { accounts } = useAccounts();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [selectedMode, setSelectedMode] = useState<"total" | "invest" | "save">(
    "total",
  );

  // --- Memoized Data ---
  const filteredTransactions = useMemo(() => {
    if (selectedMonth === "all") return transactions;
    return transactions.filter(
      (t) => new Date(t.date).getMonth().toString() === selectedMonth,
    );
  }, [transactions, selectedMonth]);

  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === "all") return "ทั้งหมด";
    const month = thaiMonths.find(
      (m) => m.value === parseInt(selectedMonth, 10),
    );
    return month ? month.label : "ทั้งหมด";
  }, [selectedMonth]);
  
  // --- Render ---
  return (
    <div className="space-y-8 md:space-y-10 lg:space-y-12">
      {/* Header + Filter + Mode */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-6 pb-2 md:pb-4">
        <div className="flex items-center gap-3 md:gap-5">
          <h1 className="text-2xl md:text-3xl font-bold font-headline">
            แดชบอร์ด
          </h1>
          <span className="text-sm text-muted-foreground border rounded px-2 py-1 bg-muted/50">
            {new Date().toLocaleDateString("th-TH")}
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <HighPerfDropdown
            options={[
              { value: "all", label: "ทุกเดือน" },
              ...thaiMonths.map((month) => ({
                value: month.value.toString(),
                label:
                  month.label +
                  (month.value === new Date().getMonth() ? " (ปัจจุบัน)" : ""),
              })),
            ]}
            value={selectedMonth}
            onChange={setSelectedMonth}
            placeholder="เลือกเดือน"
            className="w-full md:w-[160px] font-semibold"
          />
          <div className="flex gap-1 ml-2">
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === "total" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              onClick={() => setSelectedMode("total")}
            >
              ทั้งหมด
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === "invest" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              onClick={() => setSelectedMode("invest")}
            >
              ลงทุน
            </button>
            <button
              className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedMode === "save" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}
              onClick={() => setSelectedMode("save")}
            >
              ออม
            </button>
          </div>
        </div>
      </div>

      {/* Unified Interactive Graph */}
      <UnifiedDashboardChart
        transactions={filteredTransactions}
        mode={selectedMode}
        periodLabel={currentMonthLabel}
      />

      {/* Account Balances (flat table) */}
      <div className="h-full p-0">
        <AccountBalances transactions={transactions} flatTable />
      </div>

      {/* Account Summary Cards */}
      <AccountSummaryCards accounts={accounts} transactions={filteredTransactions} usdToThbRate={useExchangeRate().rate} />

      {/* Section: Exchange Rate */}
      <div className="flex justify-center pt-2 pb-2 md:pt-4 md:pb-4">
        <a
          href="https://th.tradingview.com/chart/?symbol=OANDA%3AUSDTHB"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-700 dark:text-blue-300 text-center font-semibold hover:underline w-full max-w-xs"
        >
          ดูกราฟอัตราแลกเปลี่ยน USD/THB (TradingView)
        </a>
      </div>

      {/* Transaction Templates */}
      <TransactionTemplates
        key={templates.length + '-' + templates.map(t => t.id).join(',')}
        templates={templates}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}

function AccountSummaryCards({ accounts, transactions, usdToThbRate }: { accounts: any[]; transactions: any[]; usdToThbRate: number | null }) {
  // Filter accounts with at least 1 transaction
  const accountsWithTx = accounts.filter(acc => transactions.some(tx => tx.account.id === acc.id));
  if (accountsWithTx.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {accountsWithTx.map(acc => {
        const txs = transactions.filter(tx => tx.account.id === acc.id);
        const balance = txs.reduce((sum, tx) => sum + (tx.type === "income" ? tx.amount : -tx.amount), 0);
        const withdraws = txs.filter(tx => tx.type === "expense");
        const deposits = txs.filter(tx => tx.type === "income");
        const withdrawCount = withdraws.length;
        const withdrawSum = withdraws.reduce((sum, tx) => sum + tx.amount, 0);
        const depositCount = deposits.length;
        const depositSum = deposits.reduce((sum, tx) => sum + tx.amount, 0);
        const isUSD = acc.currency === "USD";
        return (
          <Card key={acc.id} className="p-2 flex flex-col gap-1">
            <CardHeader className="pb-0">
              <CardTitle className="text-base font-bold text-left mb-1">
                {acc.name} ({acc.currency})
                {Array.isArray(acc.types) && acc.types.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground font-normal">• {acc.types.join(', ')}</span>
                )}
              </CardTitle>
            </CardHeader>
            <div className="text-xs flex flex-col gap-1 text-left">
              <div><b>ยอดรวม:</b> {isUSD ? `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `฿${balance.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`}
                {isUSD && usdToThbRate && (
                  <span className="ml-2 text-muted-foreground">(≈ ฿{(balance * usdToThbRate).toLocaleString("th-TH", { minimumFractionDigits: 2 })})</span>
                )}
              </div>
              <div><b>ถอนเงิน:</b> {withdrawCount} รายการ, {isUSD ? `$${withdrawSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `฿${withdrawSum.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`}
                {isUSD && usdToThbRate && (
                  <span className="ml-2 text-muted-foreground">(≈ ฿{(withdrawSum * usdToThbRate).toLocaleString("th-TH", { minimumFractionDigits: 2 })})</span>
                )}
                {/* รายละเอียดโอนระหว่างบัญชี (ฝั่งถอน) */}
                {withdraws.some(tx => tx.purpose === "โอนออก" && tx.recipient) && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {withdraws.filter(tx => tx.purpose === "โอนออก" && tx.recipient).map((tx, i) => (
                      <div key={tx.id || i}>
                        โอนระหว่างบัญชี ({tx.account.name}) → {tx.recipient}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div><b>ฝากเงิน:</b> {depositCount} รายการ, {isUSD ? `$${depositSum.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : `฿${depositSum.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`}
                {isUSD && usdToThbRate && (
                  <span className="ml-2 text-muted-foreground">(≈ ฿{(depositSum * usdToThbRate).toLocaleString("th-TH", { minimumFractionDigits: 2 })})</span>
                )}
                {/* รายละเอียดโอนระหว่างบัญชี (ฝั่งรับ) */}
                {deposits.some(tx => tx.purpose === "โอนเข้า" && tx.sender) && (
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {deposits.filter(tx => tx.purpose === "โอนเข้า" && tx.sender).map((tx, i) => (
                      <div key={tx.id || i}>
                        โอนระหว่างบัญชี {tx.sender} → ({tx.account.name})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
