import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { Material, NewRecord } from "@/api/base44Client";

const CATEGORIES = ["Cement", "Sand", "Bricks", "Steel", "Tiles", "Paint", "Hardware", "Plumbing", "Electrical", "Wood", "Other"];
const UNITS = ["Bags", "Kg", "Ton", "Sq.ft", "Pieces", "Liters", "Meters", "Boxes"];

type MaterialFormValues = NewRecord<Material>;

interface MaterialFormProps {
  onSubmit: (data: MaterialFormValues) => void;
  initialData?: Material;
  onCancel: () => void;
}

export default function MaterialForm({ onSubmit, initialData, onCancel }: MaterialFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MaterialFormValues>({
    defaultValues: initialData ? {
      name: initialData.name,
      category: initialData.category,
      quantity: initialData.quantity,
      unit: initialData.unit,
      min_stock_level: initialData.min_stock_level ?? 0,
      location: initialData.location ?? ""
    } : {
      name: "",
      category: "Other",
      quantity: 0,
      unit: "Pieces",
      min_stock_level: 0,
      location: ""
    }
  });

  const category = watch("category");
  const unit = watch("unit");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2">
          <Label htmlFor="name">Material Name</Label>
          <Input id="name" {...register("name", { required: true, validate: v => v.trim() !== "" })} placeholder="e.g. UltraTech Cement" />
          {errors.name && <span className="text-xs text-red-500">Name is required</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(val) => setValue("category", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register("location")} placeholder="e.g. Shed 1" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input id="quantity" type="number" step="0.01" {...register("quantity", { required: true, min: 0, valueAsNumber: true })} />
          {errors.quantity && <span className="text-xs text-red-500">Enter a quantity of 0 or more</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Select value={unit} onValueChange={(val) => setValue("unit", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Unit" />
            </SelectTrigger>
            <SelectContent>
              {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_stock_level">Min Stock Alert</Label>
          <Input id="min_stock_level" type="number" step="0.01" {...register("min_stock_level", { min: 0, setValueAs: v => (v === "" ? 0 : Number(v)) })} />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
          {initialData ? 'Update Material' : 'Add Material'}
        </Button>
      </DialogFooter>
    </form>
  );
}