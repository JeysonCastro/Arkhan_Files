"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MASTER_ITEMS_DB } from "@/lib/items-db";
import { ArrowLeft, Search, PackageOpen, Plus, Trash2, Edit2, X, Save, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ItemLibraryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [customItems, setCustomItems] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [newItem, setNewItem] = useState({
        name: "",
        type: "Equipamento",
        description: "",
        stats: "",
        image_url: ""
    });

    useEffect(() => {
        if (user) {
            fetchCustomItems();
        }
    }, [user]);

    const fetchCustomItems = async () => {
        const { data, error } = await supabase
            .from('custom_items')
            .select('*')
            .eq('keeper_id', user?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setCustomItems(data);
        }
    };

    const handleSaveItem = async () => {
        if (!user || !newItem.name) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('custom_items')
                .insert([{
                    keeper_id: user.id,
                    ...newItem
                }]);

            if (error) throw error;

            setIsModalOpen(false);
            setNewItem({ name: "", type: "Equipamento", description: "", stats: "", image_url: "" });
            fetchCustomItems();
        } catch (err) {
            console.error("Error saving item:", err);
            alert("Erro ao salvar item.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm("Deseja destruir este artefato permanentemente?")) return;
        const { error } = await supabase
            .from('custom_items')
            .delete()
            .eq('id', id);

        if (!error) {
            fetchCustomItems();
        }
    };

    const allItems = [...MASTER_ITEMS_DB, ...customItems];

    const filteredItems = allItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[var(--color-mythos-gold-dim)]/30 pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/gm')}
                        className="text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)] border border-transparent hover:border-[var(--color-mythos-gold-dim)]/50 bg-[#120a0a]"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--color-mythos-parchment)] tracking-wider font-heading">Biblioteca de Itens</h1>
                        <p className="text-[var(--color-mythos-gold-dim)] italic font-serif">Catálogo de artefatos, armas e relíquias do Guardião.</p>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-mythos-gold-dim)]" />
                        <Input
                            placeholder="Pesquisar artefato..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-[#120a0a] border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-gold)] focus:border-[var(--color-mythos-gold)]"
                        />
                    </div>

                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[var(--color-mythos-blood)] hover:bg-red-900 border border-red-950 text-white h-10 px-6 font-serif uppercase tracking-widest text-xs">
                                <Plus className="w-4 h-4 mr-2" /> Novo Item
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0a0a0a] border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-heading tracking-widest text-[var(--color-mythos-gold)] uppercase">Criar Novo Artefato</DialogTitle>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                {/* Form */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Nome do Item</label>
                                        <Input
                                            value={newItem.name}
                                            onChange={(e: any) => setNewItem({ ...newItem, name: e.target.value })}
                                            placeholder="Ex: Cálice de Sangue"
                                            className="bg-black/40 border-[var(--color-mythos-gold-dim)]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Tipo</label>
                                        <select
                                            value={newItem.type}
                                            onChange={(e: any) => setNewItem({ ...newItem, type: e.target.value })}
                                            className="w-full bg-black/40 border border-[var(--color-mythos-gold-dim)]/20 rounded-md p-2 text-sm text-[var(--color-mythos-gold)]"
                                        >
                                            <option>Equipamento</option>
                                            <option>Arma de Fogo</option>
                                            <option>Arma Branca</option>
                                            <option>Tomo do Mito</option>
                                            <option>Artefato</option>
                                            <option>Evidência</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Atributos / Stats</label>
                                        <Input
                                            value={newItem.stats}
                                            onChange={(e: any) => setNewItem({ ...newItem, stats: e.target.value })}
                                            placeholder="Ex: Dano: 1d8 | Cargas: 3"
                                            className="bg-black/40 border-[var(--color-mythos-gold-dim)]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Imagem (URL)</label>
                                        <Input
                                            value={newItem.image_url}
                                            onChange={(e: any) => setNewItem({ ...newItem, image_url: e.target.value })}
                                            placeholder="https://exemplo.com/imagem.png"
                                            className="bg-black/40 border-[var(--color-mythos-gold-dim)]/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Descrição Narrativa</label>
                                        <Textarea
                                            value={newItem.description}
                                            onChange={(e: any) => setNewItem({ ...newItem, description: e.target.value })}
                                            placeholder="Descreve o horror ou a utilidade deste objeto..."
                                            className="bg-black/40 border-[var(--color-mythos-gold-dim)]/20 min-h-[100px] font-serif italic"
                                        />
                                    </div>

                                    <Button
                                        onClick={handleSaveItem}
                                        disabled={isSaving || !newItem.name}
                                        className="w-full bg-[var(--color-mythos-gold)] hover:bg-[#d4af37] text-black font-bold uppercase tracking-widest mt-4"
                                    >
                                        {isSaving ? "Consagrando..." : "Guardar no Cofre"}
                                    </Button>
                                </div>

                                {/* Preview */}
                                <div className="hidden md:block">
                                    <p className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)] mb-4 text-center">Visualização do Card</p>
                                    <div className="bg-black/80 border border-[var(--color-mythos-gold)]/40 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(200,150,50,0.1)] flex flex-col h-full max-w-[300px] mx-auto scale-90">
                                        <div className="h-48 bg-[#120a0a] flex items-center justify-center border-b border-[var(--color-mythos-gold-dim)]/20 relative">
                                            {newItem.image_url ? (
                                                <img src={newItem.image_url} className="max-h-full object-contain p-4" alt="Preview" />
                                            ) : (
                                                <ImageIcon className="w-16 h-16 text-[var(--color-mythos-gold-dim)]/20" />
                                            )}
                                        </div>
                                        <div className="p-4 flex-1">
                                            <h3 className="text-lg font-bold font-heading text-[var(--color-mythos-gold)] mb-1 uppercase tracking-tight">{newItem.name || "Novo Artefato"}</h3>
                                            <span className="text-[10px] font-mono text-[var(--color-mythos-blood)] border border-[var(--color-mythos-blood)]/30 px-2 py-0.5 inline-block mb-3 rounded-sm">{newItem.type}</span>
                                            <p className="text-sm text-stone-400 font-serif italic line-clamp-4">"{newItem.description || "Nenhuma descrição ainda..."}"</p>
                                            {newItem.stats && (
                                                <div className="mt-4 pt-3 border-t border-[var(--color-mythos-gold-dim)]/20">
                                                    <p className="text-xs text-[var(--color-mythos-gold-dim)] font-mono">{newItem.stats}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => {
                    const isCustom = 'keeper_id' in item;
                    return (
                        <div key={item.id} className={`bg-black/80 border ${isCustom ? 'border-[var(--color-mythos-gold)]/40 shadow-[0_0_15px_rgba(200,150,50,0.05)]' : 'border-[var(--color-mythos-gold-dim)]/30'} rounded-xl overflow-hidden hover:border-[var(--color-mythos-gold)]/60 transition-all flex flex-col group relative`}>
                            {isCustom && (
                                <div className="absolute top-2 right-2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="h-8 w-8 bg-red-950/80 hover:bg-red-900 border border-red-900/50 text-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {(item.imageUrl || item.image_url) ? (
                                <div className="h-48 overflow-hidden bg-[#120a0a] flex items-center justify-center p-4 border-b border-[var(--color-mythos-gold-dim)]/20 relative">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10 opacity-60"></div>
                                    <img src={item.imageUrl || item.image_url} alt={item.name} className="max-h-full object-contain filter drop-shadow-[0_0_10px_rgba(200,150,50,0.2)] group-hover:scale-110 transition-transform duration-500 relative z-0" />
                                </div>
                            ) : (
                                <div className="h-48 bg-[#120a0a] flex items-center justify-center border-b border-[var(--color-mythos-gold-dim)]/20">
                                    <PackageOpen className="w-16 h-16 text-[var(--color-mythos-gold-dim)]/20" />
                                </div>
                            )}
                            <div className="p-4 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold font-heading text-[var(--color-mythos-gold)] mb-1 leading-tight">{item.name}</h3>
                                <div className="flex gap-2 items-center mb-3">
                                    <span className="text-[10px] font-mono tracking-widest uppercase text-[var(--color-mythos-blood)] border border-[var(--color-mythos-blood)]/30 px-2 py-0.5 rounded-sm bg-red-950/20">{item.type}</span>
                                    {isCustom && (
                                        <span className="text-[10px] font-mono tracking-widest uppercase text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-sm bg-blue-950/20">Personalizado</span>
                                    )}
                                </div>

                                <p className="text-sm text-stone-400 font-serif leading-relaxed flex-1 italic line-clamp-3">
                                    "{item.description}"
                                </p>

                                {item.stats && (
                                    <div className="mt-4 pt-3 border-t border-[var(--color-mythos-gold-dim)]/20">
                                        <p className="text-xs text-[var(--color-mythos-gold-dim)] font-mono">{item.stats}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredItems.length === 0 && (
                <div className="text-center py-20 text-[var(--color-mythos-gold-dim)]/50">
                    <p className="font-serif italic text-lg mb-2">As estantes estão vazias.</p>
                    <p className="text-sm">Nenhum artefato corresponde à sua busca.</p>
                </div>
            )}
        </div>
    );
}
