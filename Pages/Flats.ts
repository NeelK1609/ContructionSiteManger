import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import FlatCard from "@/components/flats/FlatCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FlatsPage() {
  const [search, setSearch] = React.useState("");
  const [blockFilter, setBlockFilter] = React.useState("all");

  const { data: flats, isLoading: flatsLoading } = useQuery({
    queryKey: ['flats'],
    queryFn: () => base44.entities.Flat.list(),
    initialData: [],
  });

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => base44.entities.WorkNote.filter({ status: 'Pending' }), // Get pending notes to show counts
    initialData: [],
  });

  const getIssueCount = (flatId) => notes.filter(n => n.flat_id === flatId).length;

  const filteredFlats = flats.filter(flat => {
    const matchesSearch = flat.flat_number.toLowerCase().includes(search.toLowerCase());
    const matchesBlock = blockFilter === 'all' || flat.block === blockFilter;
    return matchesSearch && matchesBlock;
  });

  const uniqueBlocks = [...new Set(flats.map(f => f.block))].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Flats & Progress</h1>
          <p className="text-slate-500 mt-1">Manage construction status and work notes for each unit.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto bg-white p-1 rounded-lg border shadow-sm">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search flats..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 border-none focus-visible:ring-0"
            />
          </div>
          <div className="w-[1px] h-6 bg-slate-200 mx-1" />
          <Select value={blockFilter} onValueChange={setBlockFilter}>
            <SelectTrigger className="w-[120px] border-none focus:ring-0">
              <SelectValue placeholder="Block" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Blocks</SelectItem>
              {uniqueBlocks.map(b => (
                <SelectItem key={b} value={b}>Block {b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFlats.map(flat => (
          <FlatCard 
            key={flat.id} 
            flat={flat} 
            issueCount={getIssueCount(flat.id)} 
          />
        ))}
      </div>
    </div>
  );
}