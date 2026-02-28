"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Plus, Play, Database, FileText, Settings, Users, Ghost } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function GMDashboard() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [isCreatingSession, setIsCreatingSession] = useState(false);

    // Auth Protection
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'KEEPER') {
                router.push('/dashboard'); // Kick players back to their dashboard
            } else {
                fetchSessions();
            }
        }
    }, [user, isLoading, router]);

    const fetchSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('keeper_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);
        } catch (err) {
            console.error("Error fetching sessions:", err);
        }
    };

    const handleCreateSession = async () => {
        if (!user) return;
        setIsCreatingSession(true);
        // Generate a 6-character alphanumeric code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        const sessionName = `Sessão ${new Date().toLocaleDateString()}`;

        try {
            const { data, error } = await supabase
                .from('sessions')
                .insert([{
                    keeper_id: user.id,
                    name: sessionName,
                    invite_code: code
                }])
                .select()
                .single();

            if (error) throw error;

            setSessions([data, ...sessions]);
            // Automatically enter the new session
            router.push(`/gm/session/${data.id}`);
        } catch (err) {
            console.error("Error creating session:", err);
            alert("Erro ao criar sessão. Tente novamente.");
        } finally {
            setIsCreatingSession(false);
        }
    };

    if (isLoading || !user || user.role !== 'KEEPER') return <LoadingScreen message="Acessando o Cofre do Guardião..." />;

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-[var(--color-mythos-gold-dim)]/30 pb-6 mb-8 shrink-0 gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-[var(--color-mythos-blood)] tracking-wider font-heading mb-2">Santuário do Guardião</h1>
                    <p className="text-[var(--color-mythos-gold-dim)] italic font-serif text-lg">Suas campanhas, artefatos e horrores em um só lugar.</p>
                </div>
                <Button
                    onClick={handleCreateSession}
                    disabled={isCreatingSession}
                    className="bg-[var(--color-mythos-blood)] hover:bg-red-900 border border-red-950 text-white transition-all whitespace-nowrap h-12 px-6 shadow-[0_0_20px_rgba(150,0,0,0.3)] hover:shadow-[0_0_30px_rgba(200,0,0,0.5)] font-serif tracking-widest uppercase text-sm"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    {isCreatingSession ? "Convocando..." : "Nova Sessão"}
                </Button>
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
                            <Ghost className="w-16 h-16 mx-auto text-[var(--color-mythos-gold-dim)]/30 mb-4" />
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
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Ghost className="w-24 h-24 text-[var(--color-mythos-gold)]" />
                                    </div>
                                    <div className="relative z-10 flex-1">
                                        <h3 className="text-xl font-bold font-heading tracking-wider text-[var(--color-mythos-parchment)] mb-1">{session.name}</h3>
                                        <p className="text-[var(--color-mythos-gold-dim)] font-mono text-xs bg-black/50 inline-block px-2 py-1 rounded border border-[var(--color-mythos-gold-dim)]/20 mt-2">
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
                </div>

                {/* Right Column: Pre-Session Tools (Placeholders for Future) */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Settings className="text-[var(--color-mythos-gold-dim)] w-5 h-5" />
                        <h2 className="text-xl font-heading tracking-widest text-[var(--color-mythos-gold-dim)] uppercase">Arquivos (Em Breve)</h2>
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
