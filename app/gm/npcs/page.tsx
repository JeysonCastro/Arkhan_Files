"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, UserPlus, Skull, ShieldAlert, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const MOCK_NPCS = [
    {
        id: "npc1",
        name: "Reverendo Michael Hurst",
        type: "Humano",
        alignment: "Hostil",
        description: "Um homem magro de olhar febril que prega sobre o fim dos tempos nas esquinas de Arkham.",
        stats: "HP: 10 | Sanidade: 20 | Poder: 65",
        portrait: "/assets/npcs/reverend.png"
    },
    {
        id: "npc2",
        name: "Silas 'Dente de Velha'",
        type: "Híbrido",
        alignment: "Neutro",
        description: "Um pescador local com pele excessivamente pálida e escamosa. Fala pouco, mas sabe muito sobre o porto.",
        stats: "HP: 14 | Sanidade: 15 | Poder: 40",
        portrait: "/assets/npcs/fisherman.png"
    },
    {
        id: "npc3",
        name: "O Andarilho do Sótão",
        type: "Monstro",
        alignment: "Agressivo",
        description: "Uma criatura pálida e alongada que se move pelas vigas de madeira com uma agilidade sobrenatural.",
        stats: "HP: 22 | Armadura: 2 (Pele Corácea) | Dano: 1d8+1d4",
        portrait: "/assets/npcs/shambler.png"
    }
];

export default function NPCPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [isOldModalOpen, setIsOldModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // For now we will just use the mock data plus any local state variations
    // since there's no supabase table for NPCs clearly delineated yet, or if there is, it's not hooked up.
    // The requirement is just to add the creation menus.
    const [localNPCs, setLocalNPCs] = useState<any[]>(MOCK_NPCS);

    const [newNpc, setNewNpc] = useState({
        name: "",
        type: "Humano",
        alignment: "Neutro",
        description: "",
        stats: "",
        portrait: ""
    });

    const handleCreateNpc = () => {
        if (!newNpc.name) return;

        const freshNpc = {
            id: `npc_${Date.now()}`,
            ...newNpc
        };

        setLocalNPCs([freshNpc, ...localNPCs]);
        setIsModalOpen(false);
        setNewNpc({
            name: "",
            type: "Humano",
            alignment: "Neutro",
            description: "",
            stats: "",
            portrait: ""
        });
    };

    const filteredNPCs = localNPCs.filter(npc =>
        npc.name.toLowerCase().includes(search.toLowerCase()) ||
        npc.type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-red-900/30 pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/gm')}
                        className="text-stone-400 hover:text-red-400 border border-transparent hover:border-red-900/50 bg-black/40 h-10 px-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-red-600 tracking-wider font-heading">Compêndio de NPCs</h1>
                        <p className="text-stone-500 italic font-serif">Gerencie aliados, monstros e horrores da sua campanha.</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-600" />
                        <Input
                            placeholder="Buscar NPC..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-black/60 border-red-900/30 text-stone-200 focus:border-red-600 h-10"
                        />
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-red-900/40 border border-red-600/50 text-red-400 hover:bg-red-600 hover:text-white h-10 px-6 font-serif uppercase tracking-widest text-xs">
                                <UserPlus className="w-4 h-4 mr-2" /> Novo NPC
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#0a0505] border-red-900/30 text-stone-200 max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold font-heading text-red-600 tracking-wider">Criar Novo NPC</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-red-900/80">Nome do Personagem</label>
                                        <Input
                                            value={newNpc.name}
                                            onChange={(e) => setNewNpc({ ...newNpc, name: e.target.value })}
                                            placeholder="Ex: Silas, O Pescador"
                                            className="bg-black/40 border-red-900/20 text-stone-200"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-red-900/80">Tipo</label>
                                        <select
                                            value={newNpc.type}
                                            onChange={(e) => setNewNpc({ ...newNpc, type: e.target.value })}
                                            className="w-full h-10 bg-black/40 border border-red-900/20 text-stone-200 rounded-md px-3 text-sm focus:border-red-600 outline-none"
                                        >
                                            <option value="Humano">Humano</option>
                                            <option value="Monstro">Monstro</option>
                                            <option value="Híbrido">Híbrido</option>
                                            <option value="Cultista">Cultista</option>
                                            <option value="Deus/Avatar">Avatar/Grande Antigo</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-red-900/80">Alinhamento</label>
                                        <select
                                            value={newNpc.alignment}
                                            onChange={(e) => setNewNpc({ ...newNpc, alignment: e.target.value })}
                                            className="w-full h-10 bg-black/40 border border-red-900/20 text-stone-200 rounded-md px-3 text-sm focus:border-red-600 outline-none"
                                        >
                                            <option value="Aliado">Aliado</option>
                                            <option value="Neutro">Neutro</option>
                                            <option value="Hostil">Hostil</option>
                                            <option value="Agressivo">Agressivo/Frenético</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-mono uppercase text-red-900/80">Atributos (Resumo)</label>
                                        <Input
                                            value={newNpc.stats}
                                            onChange={(e) => setNewNpc({ ...newNpc, stats: e.target.value })}
                                            placeholder="Ex: HP: 12 | San: 30"
                                            className="bg-black/40 border-red-900/20 text-stone-200"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-red-900/80">Foto de Referência (URL/Upload)</label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newNpc.portrait}
                                            onChange={(e) => setNewNpc({ ...newNpc, portrait: e.target.value })}
                                            placeholder="Cole um link ou faça upload ->"
                                            className="bg-black/40 border-red-900/20 flex-1 text-stone-200"
                                        />
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e: any) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => {
                                                        setNewNpc({ ...newNpc, portrait: reader.result as string });
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="bg-black/40 border-red-900/20 w-32 cursor-pointer text-xs p-1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-red-900/80">Descrição / Comportamento</label>
                                    <Textarea
                                        value={newNpc.description}
                                        onChange={(e) => setNewNpc({ ...newNpc, description: e.target.value })}
                                        placeholder="Como este ser age? O que ele quer? Aparência física..."
                                        className="bg-black/40 border-red-900/20 min-h-[100px] font-serif italic text-stone-300"
                                    />
                                </div>

                                <Button
                                    onClick={handleCreateNpc}
                                    disabled={!newNpc.name}
                                    className="w-full bg-red-900 hover:bg-red-800 text-white font-bold uppercase tracking-widest mt-4"
                                >
                                    Invocar Entidade
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNPCs.map(npc => (
                    <Card key={npc.id} className="bg-[#0a0505] border border-red-900/20 overflow-hidden hover:border-red-600/40 transition-all group flex flex-col">
                        <div className="h-40 bg-[#120505] relative overflow-hidden flex items-center justify-center border-b border-red-900/10">
                            {npc.type === 'Monstro' ? (
                                <Skull className="w-20 h-20 text-red-900/20 absolute z-0" />
                            ) : (
                                <Heart className="w-20 h-20 text-stone-900/20 absolute z-0" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0505] to-transparent z-10"></div>
                            {npc.portrait ? (
                                <img src={npc.portrait} alt={npc.name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-500 z-10" />
                            ) : (
                                <div className="w-24 h-24 rounded-full border-2 border-red-900/30 bg-black relative z-20 overflow-hidden flex items-center justify-center">
                                    <span className="text-red-900/40 font-heading text-2xl">{npc.name.charAt(0)}</span>
                                </div>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col pt-2">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold font-heading text-stone-200 tracking-wide">{npc.name}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-widest font-bold ${npc.alignment === 'Hostil' ? 'border-red-600 text-red-500 bg-red-950/20' :
                                    npc.alignment === 'Agressivo' ? 'border-orange-600 text-orange-500 bg-orange-950/20' :
                                        'border-stone-600 text-stone-500 bg-stone-900'
                                    }`}>
                                    {npc.alignment}
                                </span>
                            </div>
                            <span className="text-[10px] text-stone-600 uppercase tracking-widest font-mono mb-3 block">{npc.type}</span>
                            <p className="text-sm text-stone-400 font-serif leading-relaxed italic mb-4">
                                "{npc.description}"
                            </p>
                            <div className="mt-auto pt-4 border-t border-red-900/10 flex justify-between items-center">
                                <span className="text-xs font-mono text-red-900/80">{npc.stats}</span>
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-stone-500 hover:text-red-400">Ver Ficha</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredNPCs.length === 0 && (
                <div className="text-center py-20">
                    <ShieldAlert className="w-16 h-16 mx-auto text-red-900/20 mb-4" />
                    <p className="text-stone-500 font-serif italic text-lg">As sombras estão quietas... Por enquanto.</p>
                </div>
            )}
        </div>
    );
}
