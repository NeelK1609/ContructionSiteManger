import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, AlertTriangle, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MaterialForm from "./MaterialForm";
import MaterialTransactionForm from "./MaterialTransactionForm";
import { History } from "lucide-react";

export default function MaterialList({ materials, flats, onUpdate, onDelete, onTransaction, onViewHistory }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [transactingMaterial, setTransactingMaterial] = useState(null);

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <Input 
          placeholder="Search materials..." 
          className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-auto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.map((material) => {
              const isLowStock = material.quantity <= (material.min_stock_level || 0);
              return (
                <TableRow key={material.id} className="group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {material.name}
                      {isLowStock && (
                        <span title="Low Stock" className="flex items-center text-red-500 text-xs bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                          <AlertTriangle className="w-3 h-3 mr-1" /> Low
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-normal">
                      {material.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={isLowStock ? "text-red-600 font-semibold" : "font-semibold"}>
                      {material.quantity} {material.unit}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500">{material.location || '-'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-normal mr-2"
                        onClick={() => setTransactingMaterial(material)}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Stock
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onViewHistory(material)} title="View History">
                        <History className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setEditingMaterial(material)}>
                        <Pencil className="w-4 h-4 text-slate-500 hover:text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(material.id)}>
                        <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredMaterials.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  No materials found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editingMaterial} onOpenChange={(open) => !open && setEditingMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Material</DialogTitle>
          </DialogHeader>
          {editingMaterial && (
            <MaterialForm 
              initialData={editingMaterial} 
              onSubmit={(data) => {
                onUpdate(editingMaterial.id, data);
                setEditingMaterial(null);
              }}
              onCancel={() => setEditingMaterial(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!transactingMaterial} onOpenChange={(open) => !open && setTransactingMaterial(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
          </DialogHeader>
          {transactingMaterial && (
            <MaterialTransactionForm 
              material={transactingMaterial}
              flats={flats}
              onSubmit={(data) => {
                onTransaction(data);
                setTransactingMaterial(null);
              }}
              onCancel={() => setTransactingMaterial(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}