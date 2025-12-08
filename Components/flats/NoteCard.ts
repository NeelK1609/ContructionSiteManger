import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle2, Clock } from "lucide-react";
import { format } from 'date-fns';

const PRIORITY_COLORS = {
  Low: "bg-blue-100 text-blue-700",
  Medium: "bg-yellow-100 text-yellow-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700"
};

const STATUS_ICONS = {
  Pending: <Clock className="w-3 h-3" />,
  "In Progress": <Clock className="w-3 h-3 text-blue-500" />,
  Resolved: <CheckCircle2 className="w-3 h-3 text-green-500" />,
  Verified: <CheckCircle2 className="w-3 h-3 text-green-700" />
};

export default function NoteCard({ note, onEdit, onDelete }) {
  return (
    <Card className="hover:shadow-md transition-shadow group relative">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <Badge variant="outline" className={`${PRIORITY_COLORS[note.priority]} border-none font-medium`}>
            {note.priority}
          </Badge>
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
            {note.category}
          </Badge>
        </div>
        <CardTitle className="text-lg font-semibold mt-2 leading-tight">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 min-h-[80px]">
        <p className="text-sm text-slate-600 line-clamp-3 whitespace-pre-line">
          {note.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-slate-400 border-t border-slate-50 mt-2 pt-3">
        <div className="flex items-center gap-1.5">
          {STATUS_ICONS[note.status]}
          <span>{note.status}</span>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 bottom-4 bg-white pl-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(note)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => onDelete(note.id)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}