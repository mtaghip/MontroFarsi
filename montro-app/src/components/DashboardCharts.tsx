"use client";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const GOLD = "#b8962e";
const NAVY = "#1f2a44";
const PALETTE = ["#1f2a44", "#b8962e", "#2e7d4f", "#8a6d3b", "#5b7fb0", "#a4231c", "#6b6b6b", "#c9a227", "#3f5a8a", "#9c7c2e"];

export function MonthlyChart({ data }: { data: { month: string; sales: number; profit: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="month" fontSize={11} />
        <YAxis fontSize={11} width={48} />
        <Tooltip formatter={(v: number) => "£" + v.toLocaleString("en-GB")} />
        <Line type="monotone" dataKey="sales" name="Sales" stroke={NAVY} strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="profit" name="Gross profit" stroke={GOLD} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CategoryBar({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
        <XAxis dataKey="name" fontSize={10} interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis fontSize={11} width={48} />
        <Tooltip formatter={(v: number) => "£" + v.toLocaleString("en-GB")} />
        <Bar dataKey="value" name="Value" fill={NAVY} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SharePie({ data }: { data: { name: string; value: number }[] }) {
  const filtered = data.filter((d) => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={filtered} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label={(e) => e.name}>
          {filtered.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => "£" + v.toLocaleString("en-GB")} />
      </PieChart>
    </ResponsiveContainer>
  );
}
