import React from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";

const CATEGORIES = ["Plumbing", "Flooring", "Electrical", "Painting", "Carpentry", "Civil", "Finishing", "Snag List", "Other"];
const STATUSES = ["Pending", "In Progress", "Resolved", "Verified"];
const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export default function NoteForm({ onSubmit, initialData, onCancel, flatId }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: initialData || {
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

  const onFormSubmit = (data) => {
    onSubmit({
      ...data,
      flat_id: initialData?.flat_id || flatId
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register("title", { required: true })} placeholder="Brief summary of the issue/work" />
        {errors.title && <span className="text-xs text-red-500">Title is required</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Select value={priority} onValueChange={(val) => setValue("priority", val)}>
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
        <Select value={status} onValueChange={(val) => setValue("status", val)}>
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