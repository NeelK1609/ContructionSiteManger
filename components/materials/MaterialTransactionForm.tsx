import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { Flat, Material, MaterialTransaction, NewRecord } from "@/api/base44Client";

interface TransactionFormValues {
  quantity: string;
  flat_id: string;
  notes: string;
  date: string;
}

interface MaterialTransactionFormProps {
  material: Material;
  flats?: Flat[];
  onSubmit: (data: NewRecord<MaterialTransaction>) => void;
  onCancel: () => void;
}

// Local YYYY-MM-DD (toISOString would give the UTC date, which can be off by one)
const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export default function MaterialTransactionForm({ material, flats = [], onSubmit, onCancel }: MaterialTransactionFormProps) {
  const [activeTab, setActiveTab] = React.useState<"Usage" | "Restock">("Usage");
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    defaultValues: {
      quantity: "",
      flat_id: "none",
      notes: "",
      date: today()
    }
  });

  const flatId = watch("flat_id");

  const onFormSubmit = (data: TransactionFormValues) => {
    onSubmit({
      date: data.date,
      notes: data.notes,
      type: activeTab,
      material_id: material.id,
      quantity: Number(data.quantity),
      flat_id: activeTab === "Usage" && data.flat_id !== "none" ? data.flat_id : null
    });
  };

  const quantity = Number(watch("quantity")) || 0;
  const exceedsStock = activeTab === "Usage" && quantity > material.quantity;

  return (
    <div className="py-2">
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500">Current Stock</p>
          <p className="text-xl font-bold text-slate-900">{material.quantity} <span className="text-sm font-normal text-slate-500">{material.unit}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Item</p>
          <p className="font-medium">{material.name}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "Usage" | "Restock")} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="Usage" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-600">
            <ArrowDownCircle className="w-4 h-4 mr-2" /> Log Usage
          </TabsTrigger>
          <TabsTrigger value="Restock" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-600">
            <ArrowUpCircle className="w-4 h-4 mr-2" /> Restock
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity ({material.unit})</Label>
            <Input 
              id="quantity" 
              type="number" 
              step="0.01" 
              placeholder="0.00"
              {...register("quantity", { required: true, min: 0.01 })} 
            />
            {errors.quantity && <span className="text-xs text-red-500">Enter a quantity greater than 0</span>}
            {!errors.quantity && exceedsStock && (
              <span className="text-xs text-amber-600">More than current stock; stock will go negative</span>
            )}
          </div>
        </div>

        {activeTab === "Usage" && (
          <div className="space-y-2">
            <Label htmlFor="flat">Used In (Optional)</Label>
            <Select value={flatId} onValueChange={(val) => setValue("flat_id", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Flat (Optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- General Site Usage --</SelectItem>
                {flats.map(f => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.flat_number}{f.block ? ` (Block ${f.block})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">Link this material usage to a specific flat for cost tracking.</p>
          </div>
        )}

        {activeTab === "Restock" && (
           <div className="space-y-2">
             <Label htmlFor="vendor">Vendor / Source (Optional)</Label>
             <Input id="vendor" {...register("notes")} placeholder="e.g. ABC Suppliers" />
           </div>
        )}

        {activeTab === "Usage" && (
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              {...register("notes")} 
              placeholder="Description of usage..." 
            />
          </div>
        )}

        <DialogFooter className="mt-6">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button 
            type="submit" 
            className={activeTab === "Usage" ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
          >
            {activeTab === "Usage" ? "Confirm Usage" : "Confirm Restock"}
          </Button>
        </DialogFooter>
      </form>
    </div>
  );
}