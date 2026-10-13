import React from "react";
import { base44, type Material, type MaterialTransaction, type NewRecord } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import MaterialList from "@/components/materials/MaterialList";
import MaterialForm from "@/components/materials/MaterialForm";
import MaterialHistory from "@/components/materials/MaterialHistory";

export default function MaterialsPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [historyMaterial, setHistoryMaterial] = React.useState<Material | null>(null);
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => base44.entities.Material.list('name'),
  });

  const { data: flats = [] } = useQuery({
    queryKey: ['flats'],
    queryFn: () => base44.entities.Flat.list('flat_number'),
  });

  const { data: historyTransactions = [], isLoading: historyLoading } = useQuery({
    queryKey: ['material_history', historyMaterial?.id],
    queryFn: () => base44.entities.MaterialTransaction.filter({ material_id: historyMaterial!.id }, '-date'),
    enabled: !!historyMaterial,
  });

  const invalidateMaterials = () => queryClient.invalidateQueries({ queryKey: ['materials'] });

  const createMutation = useMutation({
    mutationFn: (data: NewRecord<Material>) => base44.entities.Material.create(data),
    onSuccess: () => {
      invalidateMaterials();
      setIsCreateOpen(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewRecord<Material>> }) => base44.entities.Material.update(id, data),
    onSuccess: invalidateMaterials
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => base44.entities.Material.delete(id),
    onSuccess: invalidateMaterials
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: NewRecord<MaterialTransaction>) => {
      // Read the latest stock rather than the cached list so quantities never drift
      const material = await base44.entities.Material.get(data.material_id);
      if (!material) throw new Error('Material not found');

      // 1. Create the transaction record
      await base44.entities.MaterialTransaction.create(data);

      // 2. Update the parent material quantity
      const delta = ['Usage', 'Wastage'].includes(data.type) ? -data.quantity : data.quantity;
      await base44.entities.Material.update(material.id, { quantity: material.quantity + delta });
    },
    onSuccess: (_, variables) => {
      invalidateMaterials();
      queryClient.invalidateQueries({ queryKey: ['material_history', variables.material_id] });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Materials Inventory</h1>
          <p className="text-slate-500 mt-1">Track stock levels and location of construction materials.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20">
              <Plus className="w-5 h-5 mr-2" /> Add Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Material</DialogTitle>
            </DialogHeader>
            <MaterialForm 
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400">Loading materials...</div>
      ) : (
      <MaterialList
        materials={materials}
        flats={flats}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
        onDelete={(id) => {
          if (confirm('Are you sure you want to delete this material?')) {
            deleteMutation.mutate(id);
          }
        }}
        onTransaction={(data) => transactionMutation.mutate(data)}
        onViewHistory={setHistoryMaterial}
      />
      )}

      <Dialog open={!!historyMaterial} onOpenChange={(open) => !open && setHistoryMaterial(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transaction History: {historyMaterial?.name}</DialogTitle>
          </DialogHeader>
          {historyLoading ? (
             <div className="py-8 text-center text-slate-500">Loading history...</div>
          ) : (
            <MaterialHistory transactions={historyTransactions} flats={flats} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}