// src/app/api/reclassify-transactions/route.ts
import { NextResponse } from 'next/server';
import type { Transaction } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { transactions, oldPurpose, newPurpose, deleteTransactions } = await request.json();

    if (!Array.isArray(transactions)) {
        return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 });
    }

    let updatedTransactions: Transaction[];

    if (deleteTransactions) {
      // Filter out transactions with the oldPurpose
      updatedTransactions = transactions.filter((t: Transaction) => t.purpose !== oldPurpose);
    } else {
      // Re-classify transactions with the oldPurpose to the newPurpose
      updatedTransactions = transactions.map((t: Transaction) => {
        if (t.purpose === oldPurpose) {
          return { ...t, purpose: newPurpose || 'อื่นๆ' };
        }
        return t;
      });
    }

    return NextResponse.json({ updatedTransactions });

  } catch (error) {
    console.error('Error reclassifying transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
