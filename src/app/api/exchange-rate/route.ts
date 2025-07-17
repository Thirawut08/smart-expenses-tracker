import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ rate: 32.5, cached: false });
} 