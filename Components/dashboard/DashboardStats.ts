import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function DashboardStats({ materials = [], flats = [], notes = [] }) {
  const lowStockCount = materials.filter(m => m.quantity <= (m.min_stock_level || 0)).length;
  const activeFlats = flats.filter(f => f.status === 'In Progress').length;
  const pendingNotes = notes.filter(n => n.status === 'Pending').length;

  const stats = [
    {
      title: "Total Materials",
      value: materials.length,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100"
    },
    {
      title: "Low Stock Alerts",
      value: lowStockCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100"
    },
    {
      title: "Active Flats",
      value: activeFlats,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      title: "Pending Issues",
      value: pendingNotes,
      icon: ClipboardList,
      color: "text-orange-600",
      bg: "bg-orange-100"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}