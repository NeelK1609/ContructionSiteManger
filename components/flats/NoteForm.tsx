import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import type { NewRecord, WorkNote } from "@/api/base44Client";

export const CATEGORIES = ["Plumbing", "Flooring", "Electrical", "Painting", "Carpentry", "Civil", "Finishing", "Snag List", "Other"];
const STATUSES: WorkNote['status'][] = ["Pending", "In Progress", "Resolved", "Verified"];
const PRIORITIES: WorkNote['priority'][] = ["Low", "Medium", "High", "Critical"];

type NoteFormValues = NewRecord<WorkNote>;

interface NoteFormProps {
  onSubmit: (data: NoteFormValues) => void;
  initialData?: WorkNote;
  onCancel: () => void;
  flatId: string;
}

export default function NoteForm({ onSubmit, initialData, onCancel, flatId }: NoteFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<NoteFormValues>({
    defaultValues: initialData ? {
      title: initialData.title,
      category: initialData.category,
      description: initialData.description ?? "",
      status: initialData.status,
      priority: initialData.priority,
      flat_id: initialData.flat_id
    } : {
      title: "",
      category: "Other",
      description: "",
      status: "Pending",
      priority: "Medium",
      flat_id: flatId
    }
  });

  const category = watch("category");
  const status = watch("status");
  const priority = watch("priority");

  const onFormSubmit = (data: NoteFormValues) => {
    onSubmit({
      ...data,
      flat_id: initialData?.flat_id || flatId
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: true, validate: v => v.trim() !== "" })} placeholder="Brief summary of the issue/work" />
        {errors.title && <span className="text-xs text-red-500">Title is required</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Work Type</Label>
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
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(val) => setValue("priority", val as WorkNote['priority'])}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={(val) => setValue("status", val as WorkNote['status'])}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Details</Label>
        <Textarea 
          id="description" 
          {...register("description")} 
          placeholder="Detailed description of the work needed..." 
          className="h-24"
        />
      </div>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
          {initialData ? 'Update Note' : 'Add Note'}
        </Button>
      </DialogFooter>
    </form>
  );
}