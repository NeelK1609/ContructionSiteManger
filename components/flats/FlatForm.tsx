import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { Flat, FlatStatus, NewRecord } from "@/lib/types";
import { FLAT_STATUSES } from "@/lib/constants";

type FlatFormValues = NewRecord<Flat>;

interface FlatFormProps {
  onSubmit: (data: FlatFormValues) => void;
  initialData?: Flat;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function FlatForm({ onSubmit, initialData, onCancel, isSubmitting }: FlatFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FlatFormValues>({
    defaultValues: initialData ? {
      flat_number: initialData.flat_number,
      block: initialData.block ?? "",
      floor: initialData.floor,
      status: initialData.status,
      owner_name: initialData.owner_name ?? ""
    } : {
      flat_number: "",
      block: "",
      floor: undefined,
      status: "Not Started",
      owner_name: ""
    }
  });

  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="flat_number">Flat Number</Label>
          <Input id="flat_number" {...register("flat_number", { required: true, validate: v => v.trim() !== "" })} placeholder="e.g. A-101" />
          {errors.flat_number && <span className="text-xs text-red-500">Flat number is required</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="block">Block / Wing</Label>
          <Input id="block" {...register("block")} placeholder="e.g. A" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">Floor</Label>
          <Input
            id="floor"
            type="number"
            step="1"
            {...register("floor", { setValueAs: v => (v === "" || v == null ? null : Number(v)), validate: v => v == null || Number.isInteger(v) })}
            placeholder="e.g. 1"
          />
          {errors.floor && <span className="text-xs text-red-500">Floor must be a whole number</span>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={(val) => setValue("status", val as FlatStatus)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {FLAT_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="owner_name">Owner (optional)</Label>
          <Input id="owner_name" {...register("owner_name")} placeholder="e.g. R. Sharma" />
        </div>
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
          {initialData ? 'Update Flat' : 'Add Flat'}
        </Button>
      </DialogFooter>
    </form>
  );
}
