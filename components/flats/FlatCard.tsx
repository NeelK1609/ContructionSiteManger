import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from "lucide-react";
import type { Flat, FlatStatus } from "@/api/base44Client";

const statusColors: Record<FlatStatus, string> = {
  "Not Started": "bg-slate-100 text-slate-600",
  "In Progress": "bg-blue-100 text-blue-700",
  "Near Completion": "bg-yellow-100 text-yellow-700",
  "Completed": "bg-green-100 text-green-700",
  "Handed Over": "bg-purple-100 text-purple-700"
};

export default function FlatCard({ flat, issueCount }: { flat: Flat; issueCount: number }) {

  return (
    <Link to={createPageUrl(`FlatDetails?id=${flat.id}`)} className="block">
      <Card className="hover:shadow-lg transition-all duration-300 hover:border-orange-200 cursor-pointer overflow-hidden group">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                {[flat.block && `Block ${flat.block}`, flat.floor != null && `Floor ${flat.floor}`].filter(Boolean).join(' • ')}
              </p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{flat.flat_number}</h3>
            </div>
            <div className={`p-2 rounded-full bg-slate-50 group-hover:bg-orange-50 transition-colors`}>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500" />
            </div>
          </div>
          
          <div className="flex justify-between items-end">
            <Badge className={`${statusColors[flat.status]} border-none hover:bg-opacity-80`}>
              {flat.status}
            </Badge>
            {issueCount > 0 && (
              <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                {issueCount} active {issueCount === 1 ? 'issue' : 'issues'}
              </span>
            )}
          </div>
        </div>
        {flat.owner_name && (
          <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 truncate">
            Owner: {flat.owner_name}
          </div>
        )}
      </Card>
    </Link>
  );
}