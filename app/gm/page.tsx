"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Plus, Play, Database, FileText, Settings, Users, Ghost, Edit2, Trash2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function GMDashboard() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");

    // Rename state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<any>(null);
    const [editedSessionName, setEditedSessionName] = useState("");

    // Delete state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sessionToDelete, setSessionToDelete] = useState<any>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Auth Protection
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!isLoading) {
            if (!user) {
                router.replace('/login');
            } else if (user.role !== 'KEEPER') {
                router.replace('/dashboard'); // Kick players back to their dashboard
            } else {
                fetchSessions();
            }
        }
    }, [user, isLoading, isMounted, router]);

    const fetchSessions = async () => {
        console.log("[GM_Dashboard] Iniciando fetchSessions para keeper_id:", user?.id);
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('keeper_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("[GM_Dashboard] Erro no fetchSessions do Supabase:", error);
                throw error;
            }
            console.log(`[GM_Dashboard] Fetched ${data?.length || 0} sessões ativas.`);
            setSessions(data || []);
        } catch (err) {
            console.error("[GM_Dashboard] Exception caught no fetchSessions:", err);
        }
    };

    const handleCreateSession = async () => {
        if (!user || !newSessionName) return;
        setIsCreatingSession(true);
        console.log(`[GM_Dashboard] Criando nova sessão: "${newSessionName}" por keeper_id: ${user.id}`);
        // Generate a 6-character alphanumeric code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();

        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert([{
                    keeper_id: user.id,
                    name: newSessionName,
                    invite_code: code
                }])
                .select()
                .single();

            if (error) {
                console.error("[GM_Dashboard] Erro ao inserir nova sessão no Supabase:", error);
                throw error;
            }

            console.log("[GM_Dashboard] Sessão criada com sucesso. Redirecionando para ID:", data.id);
            setSessions([data, ...sessions]);
            setIsCreateModalOpen(false);
            setNewSessionName("");
            // Automatically enter the new session
            router.push(`/gm/session/${data.id}`);
        } catch (err) {
            console.error("[GM_Dashboard] Exception caught ao criar sessão:", err);
            alert("Erro ao criar sessão. Tente novamente.");
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleEditSession = async () => {
        if (!editingSession || !editedSessionName) return;

        try {
            const { error } = await supabase
                .from('sessions')
                .update({ name: editedSessionName })
                .eq('id', editingSession.id);

            if (error) throw error;

            setSessions(sessions.map(s =>
                s.id === editingSession.id ? { ...s, name: editedSessionName } : s
            ));
            setIsEditModalOpen(false);
            setEditingSession(null);
            setEditedSessionName("");
        } catch (err) {
            console.error("Error updating session:", err);
            alert("Erro ao renomear sessão.");
        }
    };

    const handleDeleteSession = async () => {
        if (!sessionToDelete) return;
        setIsDeleting(true);
        console.log(`[GM_Dashboard] Solicitando deleção da sessão ID: ${sessionToDelete.id}`);

        try {
            const { error } = await supabase
                .from('sessions')
                .delete()
                .eq('id', sessionToDelete.id);

            if (error) {
                console.error("[GM_Dashboard] Erro ao excluir sessão do Supabase:", error);
                throw error;
            }

            console.log("[GM_Dashboard] Sessão excluída com sucesso.");
            setSessions(sessions.filter(s => s.id !== sessionToDelete.id));
            setIsDeleteModalOpen(false);
            setSessionToDelete(null);
        } catch (err) {
            console.error("[GM_Dashboard] Exception caught ao deletar sessão:", err);
            alert("Erro ao excluir sessão.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isMounted || isLoading || !user || user.role !== 'KEEPER') return <LoadingScreen message="Acessando o Cofre do Guardião..." />;

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[var(--color-mythos-gold-dim)]/30 pb-6 mb-8 shrink-0 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-mythos-blood)] tracking-wider font-heading mb-2">Santuário do Guardião</h1>
                    <p className="text-[var(--color-mythos-gold-dim)] italic font-serif text-lg">Suas campanhas, artefatos e horrores em um só lugar.</p>
                </div>

                <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                    setIsCreateModalOpen(open);
                    if (open) setNewSessionName(`Sessão ${new Date().toLocaleDateString()}`);
                }}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-[var(--color-mythos-blood)] hover:bg-red-900 border border-red-950 text-white transition-all whitespace-nowrap h-12 px-6 shadow-[0_0_20px_rgba(150,0,0,0.3)] hover:shadow-[0_0_30px_rgba(200,0,0,0.5)] font-serif tracking-widest uppercase text-sm"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Nova Sessão
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0a0505] border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-heading text-[var(--color-mythos-gold)] tracking-wider">Criar Nova Sessão</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Nome da Sessão</label>
                                <Input
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder="Ex: O Horror nas Sombras"
                                    className="bg-black/60 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)] placeholder:text-stone-600"
                                />
                            </div>
                            <Button
                                onClick={handleCreateSession}
                                disabled={!newSessionName || isCreatingSession}
                                className="w-full bg-[var(--color-mythos-blood)] hover:bg-red-900 text-white font-bold uppercase tracking-widest mt-4 border border-red-950"
                            >
                                {isCreatingSession ? "Convocando..." : "Criar Sessão"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">

                {/* Left Column: Active Sessions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Database className="text-[var(--color-mythos-gold)] w-6 h-6" />
                        <h2 className="text-2xl font-heading tracking-widest text-[var(--color-mythos-gold)] uppercase">Sessões Ativas</h2>
                    </div>

                    {sessions.length === 0 ? (
                        <Card className="bg-black/40 border border-[var(--color-mythos-gold-dim)]/20 p-12 text-center rounded-xl backdrop-blur-sm">
                            <div className="relative w-16 h-16 mx-auto mb-4 opacity-80">
                                <Image src="/assets/session-bg.png" alt="Card Background" fill className="object-contain" />
                            </div>
                            <p className="text-[var(--color-mythos-gold-dim)] font-serif text-lg">Nenhum ritual em andamento.</p>
                            <p className="text-stone-500 text-sm mt-2">Crie uma nova sessão para convidar seus investigadores.</p>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {sessions.map((session) => (
                                <Card
                                    key={session.id}
                                    className="bg-black/60 border border-[var(--color-mythos-gold-dim)]/30 p-6 rounded-xl hover:border-[var(--color-mythos-gold)]/60 transition-all group relative overflow-hidden flex flex-col"
                                >
                                    {/* Image with mix-blend-screen to remove black bg and pointer-events-none to let clicks pass through */}
                                    <div className="absolute top-0 right-0 p-4 opacity-40 group-hover:opacity-100 transition-opacity w-32 h-32 pointer-events-none mix-blend-screen">
                                        <Image src="/assets/session-bg.png" alt="Card Background" fill className="object-contain" />
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <div className="flex justify-between items-start relative">
                                            <h3 className="text-xl font-bold font-heading tracking-wider text-[var(--color-mythos-parchment)] mb-1 pr-20">{session.name}</h3>

                                            {/* Action buttons properly separated and styled */}
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 z-20">
                                                <button
                                                    onClick={() => {
                                                        setEditingSession(session);
                                                        setEditedSessionName(session.name);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)] bg-black/80 hover:bg-black rounded border border-[var(--color-mythos-gold-dim)]/30 backdrop-blur-sm transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                                    title="Editar Sessão"
                                                >
                                                    <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSessionToDelete(session);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                    className="p-1.5 text-red-900/70 hover:text-red-500 bg-black/80 hover:bg-black rounded border border-red-900/30 hover:border-red-500/50 backdrop-blur-sm transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                                                    title="Excluir Sessão"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[var(--color-mythos-gold-dim)] font-mono text-xs bg-black/50 inline-block px-2 py-1 rounded border border-[var(--color-mythos-gold-dim)]/20 mt-2 relative z-10">
                                            Convite: <span className="text-[var(--color-mythos-gold)] font-bold">{session.invite_code}</span>
                                        </p>
                                    </div>
                                    <div className="relative z-10 mt-8">
                                        <Button
                                            variant="ghost"
                                            className="w-full bg-[#120a0a] hover:bg-black/80 border border-[var(--color-mythos-gold-dim)]/40 text-[var(--color-mythos-gold)] hover:text-white font-serif uppercase tracking-widest text-xs h-10 group-hover:border-[var(--color-mythos-gold)] group-hover:shadow-[0_0_15px_rgba(200,150,50,0.2)]"
                                            onClick={() => router.push(`/gm/session/${session.id}`)}
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Entrar na Mesa
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Edit Session Modal */}
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                        <DialogContent className="bg-[#0a0505] border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold font-heading text-[var(--color-mythos-gold)] tracking-wider">Renomear Sessão</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-[var(--color-mythos-gold-dim)]">Novo Nome</label>
                                    <Input
                                        value={editedSessionName}
                                        onChange={(e) => setEditedSessionName(e.target.value)}
                                        placeholder="Digite o novo nome da sessão"
                                        className="bg-black/60 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)]"
                                    />
                                </div>
                                <Button
                                    onClick={handleEditSession}
                                    disabled={!editedSessionName.trim()}
                                    className="w-full bg-[var(--color-mythos-blood)] hover:bg-red-900 text-white font-bold uppercase tracking-widest mt-4 border border-red-950"
                                >
                                    Salvar Alterações
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Session Modal */}
                    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                        <DialogContent className="bg-[#0a0505] border-red-900/30 text-[var(--color-mythos-parchment)] max-w-sm">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold font-heading text-red-500 tracking-wider flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" />
                                    Excluir Sessão
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <p className="text-stone-400 text-sm font-serif">
                                    Tem certeza que deseja excluir a sessão <span className="text-[var(--color-mythos-parchment)] font-bold">"{sessionToDelete?.name}"</span>?
                                </p>
                                <p className="text-red-900/80 text-xs font-mono">
                                    Esta ação não pode ser desfeita e todos os dados vinculados a esta sessão serão perdidos.
                                </p>
                                <div className="flex gap-4 mt-6">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setIsDeleteModalOpen(false);
                                            setSessionToDelete(null);
                                        }}
                                        className="flex-1 border border-stone-800 hover:bg-stone-900 text-stone-400 font-mono text-xs uppercase"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleDeleteSession}
                                        disabled={isDeleting}
                                        className="flex-1 bg-red-900 hover:bg-red-800 text-white font-bold uppercase tracking-widest border border-red-950 text-xs"
                                    >
                                        {isDeleting ? "Excluindo..." : "Excluir"}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Right Column: Pre-Session Tools (Placeholders for Future) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="text-[var(--color-mythos-gold-dim)] w-5 h-5" />
                        <h2 className="text-xl font-heading tracking-widest text-[var(--color-mythos-gold-dim)] uppercase">Arquivos</h2>
                    </div>

                    <Card
                        className="bg-[#120a0a]/80 border border-[var(--color-mythos-gold-dim)]/20 p-5 rounded-xl hover:bg-black/80 transition-all cursor-pointer hover:border-[var(--color-mythos-gold)]/50 group/item"
                        onClick={() => router.push('/gm/items')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#2a1a10] p-3 rounded-full border border-[var(--color-mythos-gold)]/20 group-hover/item:border-[var(--color-mythos-gold)]/50 transition-colors">
                                <FileText className="w-6 h-6 text-[var(--color-mythos-gold-dim)] group-hover/item:text-[var(--color-mythos-gold)]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--color-mythos-parchment)] tracking-wide group-hover/item:text-[var(--color-mythos-gold)]">Biblioteca de Itens</h3>
                                <p className="text-xs text-stone-500 font-serif">Gerencie artefatos, armas e relíquias.</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="bg-[#120a0a]/80 border border-[var(--color-mythos-gold-dim)]/20 p-5 rounded-xl hover:bg-black/80 transition-all cursor-pointer hover:border-red-500/50 group/npc"
                        onClick={() => router.push('/gm/npcs')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-red-950/30 p-3 rounded-full border border-red-900/30 group-hover/npc:border-red-500/50 transition-colors">
                                <Users className="w-6 h-6 text-red-700/50 group-hover/npc:text-red-500/80" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--color-mythos-parchment)] tracking-wide group-hover/npc:text-red-400">Compêndio de NPCs</h3>
                                <p className="text-xs text-stone-500 font-serif">Gerencie monstros, cultistas e aliados.</p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        className="bg-[#120a0a]/80 border border-[var(--color-mythos-gold-dim)]/20 p-5 rounded-xl hover:bg-black/80 transition-all cursor-pointer hover:border-blue-500/50 group/tracks"
                        onClick={() => router.push('/gm/tracks')}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1a1a2e] p-3 rounded-full border border-blue-900/30 group-hover/tracks:border-blue-500/50 transition-colors">
                                <Database className="w-6 h-6 text-blue-500/50 group-hover/tracks:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-[var(--color-mythos-parchment)] tracking-wide group-hover/tracks:text-blue-300">Trilhas Narrativas</h3>
                                <p className="text-xs text-stone-500 font-serif">Prepare ganchos e blocos de cena.</p>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
