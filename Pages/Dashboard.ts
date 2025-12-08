import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import DashboardStats from "@/components/dashboard/DashboardStats";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Activity, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => base44.entities.Material.list(),
    initialData: [],
  });

  const { data: flats } = useQuery({
    queryKey: ['flats'],
    queryFn: () => base44.entities.Flat.list(),
    initialData: [],
  });

  const { data: recentNotes } = useQuery({
    queryKey: ['recent_notes'],
    queryFn: () => base44.entities.WorkNote.list('-created_date', 5),
    initialData: [],
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Project Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening on site today.</p>
      </div>

      <DashboardStats materials={materials} flats={flats} notes={recentNotes} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity / Notes */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-600" />
              Recent Updates
            </CardTitle>
            <Link to={createPageUrl('Flats')}>
              <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNotes.map(note => (
                <div key={note.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className={`mt-1 min-w-2 w-2 h-2 rounded-full ${
                    note.priority === 'Critical' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <h4 className="font-medium text-slate-900">{note.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-1">{note.description}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {note.category}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(note.created_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {recentNotes.length === 0 && (
                <div className="text-center text-slate-400 py-4">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Low Stock */}
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
            <Link to={createPageUrl('Materials')}>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Manage Inventory <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {materials
                .filter(m => m.quantity <= (m.min_stock_level || 0))
                .slice(0, 5)
                .map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="font-medium text-red-900">{item.name}</div>
                    <div className="text-red-700 font-bold">
                      {item.quantity} <span className="text-xs font-normal opacity-70">{item.unit}</span>
                    </div>
                  </div>
                ))}
               {materials.filter(m => m.quantity <= (m.min_stock_level || 0)).length === 0 && (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                     <TrendingUp className="w-6 h-6 text-green-600" />
                   </div>
                   <p className="text-slate-600 font-medium">All stock levels good</p>
                   <p className="text-sm text-slate-400">No materials are running low.</p>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}