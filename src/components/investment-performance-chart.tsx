'use client';

import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useMemo } from 'react';

const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const COLORS = ['#AED581', '#FFD54F', '#FFB74D', '#81D4FA', '#F06292', '#4DB6AC'];

interface InvestmentPerformanceChartProps {
    data: { name: string; investment: number; current: number }[];
}

export function InvestmentPerformanceChart({ data }: InvestmentPerformanceChartProps) {
    const totalInvestment = useMemo(() => data.reduce((sum, item) => sum + item.investment, 0), [data]);
    const totalCurrent = useMemo(() => data.reduce((sum, item) => sum + item.current, 0), [data]);

    const performanceData = [
        { name: 'ภาพรวม', investment: totalInvestment, current: totalCurrent }
    ];
    
    const pieData = useMemo(() => {
        return data.map(item => ({ name: item.name, value: item.current }));
    }, [data]);
    
    return (
        <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>มูลค่าค่าลงทุนเทียบมูลค่าปัจจุบัน</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={performanceData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" hide />
                            <Tooltip formatter={(value) => currencyFormatter.format(value as number)} />
                            <Legend />
                            <Bar dataKey="investment" fill="#FFB74D" name="ลงทุนรวมทั้งปี" barSize={60} label={{ position: 'center', fill: '#000', formatter: (value: number) => currencyFormatter.format(value) }} />
                            <Bar dataKey="current" fill="#81C784" name="มูลค่าปัจจุบัน" barSize={60} label={{ position: 'center', fill: '#000', formatter: (value: number) => currencyFormatter.format(value) }} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>มูลค่าพอร์ทที่แท้จริงรวม</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                             <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={true}
                                outerRadius={110}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent, value }) => `${name} (${currencyFormatter.format(value)}) ${(percent * 100).toFixed(1)}%`}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => currencyFormatter.format(value as number)} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
