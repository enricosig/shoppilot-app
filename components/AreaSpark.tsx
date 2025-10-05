'use client';
import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

type Row = { day: string; generate: number; publish: number; };
export default function AreaSpark({ data }: { data: Row[] }) {
  const formatted = data.map((r) => ({
    ...r,
    day: new Date(r.day).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
  }));
  return (
    <div className="rounded-2xl shadow-sm border p-4 bg-white h-80">
      <div className="text-sm text-gray-500 mb-2">30 days activity</div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey="generate" stackId="1" />
          <Area type="monotone" dataKey="publish" stackId="1" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
