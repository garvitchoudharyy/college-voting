"use client";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Row } from "@/lib/election";
export default function ResultCharts({ rows }: { rows: Row[] }) {
  const data = rows.map((r) => ({ name: r.candidate.name, votes: r.count, color: r.candidate.color }));
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="card h-80" aria-label="Bar chart of votes">
        <ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="votes" radius={[8, 8, 0, 0]}>{data.map((d) => <Cell key={d.name} fill={d.color} />)}</Bar></BarChart></ResponsiveContainer>
      </div>
      <div className="card h-80" aria-label="Donut chart of vote share">
        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="votes" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>{data.map((d) => <Cell key={d.name} fill={d.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
      </div>
    </div>
  );
}
