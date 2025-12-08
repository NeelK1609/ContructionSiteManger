import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

export default function MaterialHistory({ transactions = [], flats = [] }) {
  const getFlatNumber = (id) => {
    const flat = flats.find(f => f.id === id);
    return flat ? `${flat.flat_number} (${flat.block})` : '-';
  };

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Location / Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="text-xs text-slate-500">
                {format(new Date(tx.date), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    ['Usage', 'Wastage'].includes(tx.type) 
                      ? "bg-red-50 text-red-600 border-red-100" 
                      : "bg-green-50 text-green-600 border-green-100"
                  }
                >
                  {['Usage', 'Wastage'].includes(tx.type) ? <ArrowDownCircle className="w-3 h-3 mr-1" /> : <ArrowUpCircle className="w-3 h-3 mr-1" />}
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">
                {tx.quantity}
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {tx.flat_id ? (
                  <span className="font-medium text-slate-900">Flat {getFlatNumber(tx.flat_id)}</span>
                ) : (
                  <span>{tx.notes || '-'}</span>
                )}
                {tx.flat_id && tx.notes && (
                  <div className="text-xs text-slate-400 mt-1">{tx.notes}</div>
                )}
              </TableCell>
            </TableRow>
          ))}
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                No history available for this material.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}