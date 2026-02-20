"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Skull, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [investigators, setInvestigators] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Join Session State
    const [inviteCode, setInviteCode] = useState("");
    const [selectedInvestigatorId, setSelectedInvestigatorId] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    const [joinMessage, setJoinMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
                setIsLoadingData(false); // Make sure to stop loading indicator even if redirecting
            } else {
                fetchInvestigators();
            }
        }
    }, [user, isLoading, router]);

    const fetchInvestigators = async () => {
        try {
            const { data, error } = await supabase
                .from('investigators')
                .select(`
                    *,
                    session_characters (
                        session_id,
                        sessions ( name )
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Map the JSONB data to our Investigator type
            const mapped = data.map(row => ({
                ...row.data,
                id: row.id, // Ensure we use the DB ID
                name: row.name,
                occupation: row.occupation,
                sessions: row.session_characters // Attach session links
            }));

            setInvestigators(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleJoinSession = async () => {
        if (!inviteCode || !selectedInvestigatorId) {
            setJoinMessage({ text: "Preencha o código e escolha a ficha.", type: "error" });
            return;
        }

        setIsJoining(true);
        setJoinMessage({ text: "Iniciando conexão...", type: "info" });

        try {
            // Helper to timeout fetch requests just in case of deadlocks
            const withTimeout = (promise: Promise<any>, ms = 8000) => {
                return Promise.race([
                    promise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase call timed out")), ms))
                ]);
            };

            setJoinMessage({ text: "Consultando código da sessão...", type: "info" });

            // 1. Find the session by invite code
            const { data: sessionData, error: sessionError } = await withTimeout((async () => await supabase
                .from('sessions')
                .select('id, name')
                .eq('invite_code', inviteCode.toUpperCase())
                .eq('is_active', true)
                .single()
            )());

            if (sessionError) {
                if (sessionError.code === 'PGRST116') throw new Error("Código inválido ou sessão inativa.");
                throw sessionError;
            }
            if (!sessionData) {
                throw new Error("Sessão não encontrada ou vazia.");
            }

            setJoinMessage({ text: "Sessão encontrada. Vinculando personagem...", type: "info" });

            // 2. Link investigator to session
            const { error: linkError } = await withTimeout((async () => await supabase
                .from('session_characters')
                .insert([{
                    session_id: sessionData.id,
                    investigator_id: selectedInvestigatorId
                }])
            )());

            // Specifically handle unique constraint violation (already joined)
            if (linkError) {
                if (linkError.code === '23505') {
                    // It's technically a success if they are already in
                    setJoinMessage({ text: "Personagem já vinculado. Redirecionando...", type: "success" });
                    setTimeout(() => router.push(`/session/${sessionData.id}`), 500);
                    return;
                }
                throw new Error(linkError.message || JSON.stringify(linkError));
            }

            setJoinMessage({ text: `Entrando na sessão: ${sessionData.name}...`, type: "success" });
            setInviteCode(""); // Clear code

            // Redirect to the session table
            setTimeout(() => {
                router.push(`/session/${sessionData.id}`);
            }, 1000);

        } catch (err: any) {
            console.error("Join session error:", err);
            setJoinMessage({ text: err.message || "Erro ao entrar na sessão.", type: "error" });
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading || !user || isLoadingData) return <div className="p-8 text-[var(--color-mythos-parchment)] animate-pulse">Consultando Arquivos...</div>;

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-mythos-gold)] tracking-wider">Meus Investigadores</h1>
                    <p className="text-[var(--color-mythos-parchment)]/70">Gerencie seus personagens e a sanidade deles.</p>
                </div>
                <Link href="/character/new">
                    <Button variant="mythos" size="md" className="gap-2 shadow-lg hover:shadow-[var(--color-mythos-gold)]/20 whitespace-nowrap">
                        <Plus className="w-4 h-4" />
                        Nova Ficha
                    </Button>
                </Link>
            </div>

            {/* Join Session Banner */}
            {investigators.length > 0 && (
                <div className="bg-[#120a0a] border border-[var(--color-mythos-gold-dim)]/40 p-4 rounded-md shadow-md flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                        <h3 className="text-[var(--color-mythos-parchment)] font-bold flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-[var(--color-mythos-gold-dim)]" />
                            Entrar em uma Sessão
                        </h3>
                        <p className="text-xs text-[var(--color-mythos-gold-dim)]">O Guardião pode te fornecer um Código de Convite de 6 dígitos.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row w-full md:w-auto items-center gap-2">
                        <Input
                            placeholder="Ex: XYZ123"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="bg-black/40 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] w-full sm:w-32 uppercase text-center font-bold tracking-widest"
                        />
                        <Select value={selectedInvestigatorId} onValueChange={setSelectedInvestigatorId}>
                            <SelectTrigger className="w-full sm:w-[180px] bg-black/40 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)]">
                                <SelectValue placeholder="Escolher Ficha" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a1010] border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)]">
                                {investigators.map(inv => (
                                    <SelectItem key={inv.id} value={inv.id}>{inv.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleJoinSession}
                            disabled={isJoining || !inviteCode || !selectedInvestigatorId}
                            className="w-full sm:w-auto bg-[var(--color-mythos-green)]/20 hover:bg-[var(--color-mythos-green)] text-[var(--color-mythos-parchment)] border border-[var(--color-mythos-green)]"
                        >
                            {isJoining ? "..." : "Entrar"}
                        </Button>
                    </div>

                    {joinMessage.text && (
                        <div className={`w-full md:w-auto text-xs text-center p-2 rounded ${joinMessage.type === 'error' ? 'text-red-400 bg-red-950/30' : 'text-green-400 bg-green-950/30'}`}>
                            {joinMessage.text}
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {investigators.map((inv) => (
                    <div key={inv.id} className="group relative bg-[var(--color-mythos-green)]/40 border border-[var(--color-mythos-gold-dim)] rounded-sm p-6 hover:bg-[var(--color-mythos-green)]/60 hover:border-[var(--color-mythos-gold)] transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity text-[var(--color-mythos-gold)]">
                            <Skull className="w-12 h-12" />
                        </div>

                        <h2 className="text-xl font-bold text-[var(--color-mythos-parchment)] mb-1 font-heading tracking-wide">{inv.name}</h2>
                        <p className="text-sm text-[var(--color-mythos-gold)] mb-4 uppercase tracking-widest text-xs">{inv.occupation}</p>

                        <div className="flex flex-col gap-2 mt-4 mt-auto">
                            <span className={`self-start text-xs px-2 py-1 rounded border-2 font-bold uppercase tracking-wider ${inv.derivedStats.sanity.current < 30
                                ? 'border-[var(--color-mythos-blood)] text-[var(--color-mythos-blood)] bg-black/30'
                                : 'border-[var(--color-mythos-accent)] text-[var(--color-mythos-parchment)] bg-[var(--color-mythos-green)]'
                                }`}>
                                {inv.derivedStats.sanity.current < 30 ? 'Insane' : 'Alive'}
                            </span>

                            <div className="flex items-center justify-between gap-2 mt-2">
                                <Link href={`/character/${inv.id}`} className="flex-1">
                                    <Button variant="outline" size="sm" className="w-full border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-gold)] hover:text-black">
                                        Ficha
                                    </Button>
                                </Link>

                                {inv.sessions && inv.sessions.length > 0 && (
                                    <Link href={`/session/${inv.sessions[0].session_id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full bg-[var(--color-mythos-green)]/20 hover:bg-[var(--color-mythos-green)] text-[var(--color-mythos-parchment)] border border-[var(--color-mythos-green)]">
                                            Mesa
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Empty State Card */}
                {investigators.length === 0 && (
                    <div className="col-span-full text-center py-12 border-2 border-dashed border-[var(--color-mythos-gold-dim)]/30 rounded-lg bg-[var(--color-mythos-black)]/20">
                        <p className="text-[var(--color-mythos-gold-dim)] mb-4 italic">No investigators found in the archives.</p>
                        <Link href="/character/new">
                            <Button variant="ghost">Create your first character</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
