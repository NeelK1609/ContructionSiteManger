import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft, Filter, RefreshCw } from "lucide-react";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NoteCard from "@/components/flats/NoteCard";
import NoteForm from "@/components/flats/NoteForm";

export default function FlatDetailsPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const flatId = urlParams.get('id');
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const { data: flat, isLoading: flatLoading } = useQuery({
    queryKey: ['flat', flatId],
    queryFn: async () => {
      const res = await base44.entities.Flat.list({ id: flatId });
      return res[0];
    },
    enabled: !!flatId
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', flatId],
    queryFn: () => base44.entities.WorkNote.filter({ flat_id: flatId }),
    enabled: !!flatId,
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.WorkNote.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', flatId]);
      setIsCreateOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.WorkNote.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['notes', flatId]);
      setEditingNote(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.WorkNote.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['notes', flatId])
  });

  const updateFlatStatusMutation = useMutation({
    mutationFn: (status) => base44.entities.Flat.update(flatId, { status }),
    onSuccess: () => queryClient.invalidateQueries(['flat', flatId])
  });

  if (flatLoading) return <div className="p-8">Loading flat details...</div>;
  if (!flat) return <div className="p-8">Flat not found</div>;

  const categories = ["All", "Plumbing", "Flooring", "Electrical", "Painting", "Carpentry", "Other"];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link to={createPageUrl('Flats')} className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Flats
      </Link>

      <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-slate-900">{flat.flat_number}</h1>
            <Badge variant="outline" className="text-lg py-1 px-3 bg-slate-50">
              Block {flat.block}
            </Badge>
          </div>
          <p className="text-slate-500 mt-2">
            Status: <span className="font-medium text-slate-900">{flat.status}</span>
          </p>
        </div>
        
        <div className="flex gap-2">
          {flat.status !== 'Completed' && (
             <Button variant="outline" onClick={() => updateFlatStatusMutation.mutate('Completed')}>
               Mark as Completed
             </Button>
          )}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                <Plus className="w-5 h-5 mr-2" /> Add Work Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Note for {flat.flat_number}</DialogTitle>
              </DialogHeader>
              <NoteForm 
                flatId={flatId}
                onSubmit={(data) => createMutation.mutate(data)}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="All" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b h-auto p-0 rounded-none space-x-2">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="rounded-t-lg rounded-b-none border border-b-0 border-transparent data-[state=active]:bg-white data-[state=active]:border-slate-200 data-[state=active]:shadow-none px-4 py-2"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes
                .filter(n => cat === 'All' || n.category === cat)
                .map(note => (
                  <NoteCard 
                    key={note.id} 
                    note={note} 
                    onEdit={setEditingNote}
                    onDelete={(id) => {
                      if(confirm('Delete this note?')) deleteMutation.mutate(id);
                    }}
                  />
                ))}
              {notes.filter(n => cat === 'All' || n.category === cat).length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed rounded-xl">
                  No notes found in this category
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {editingNote && (
            <NoteForm 
              flatId={flatId}
              initialData={editingNote}
              onSubmit={(data) => updateMutation.mutate({ id: editingNote.id, data })}
              onCancel={() => setEditingNote(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}