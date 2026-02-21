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
import { InvestigatorBadge } from "@/components/ui/investigator-badge";

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
            console.log("[JOIN_SESSION] Iniciando...", { inviteCode, selectedInvestigatorId });
            setJoinMessage({ text: "Consultando código da sessão...", type: "info" });

            // Helper for forced timeout just to guarantee UI feedback if it hangs
            const executeWithTimeout = <T,>(promise: Promise<T>, ms: number = 5000): Promise<T> => {
                let timeoutId: NodeJS.Timeout;
                const timeoutPromise = new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => {
                        console.error(`[JOIN_SESSION] Timeout após ${ms}ms`);
                        reject(new Error("A requisição demorou demais para responder. Tente novamente."));
                    }, ms);
                });
                return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
            };

            console.log("[JOIN_SESSION] Disparando REST Fetch Vanilla...");

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

            // Extract the active user token to bypass RLS restrictions on raw fetches
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token || anonKey;

            // 1. Find the session via raw fetch to avoid SDK hanging
            const sessionRes = await executeWithTimeout(
                fetch(`${supabaseUrl}/rest/v1/sessions?invite_code=eq.${inviteCode.toUpperCase()}&is_active=eq.true&select=id,name`, {
                    headers: {
                        'apikey': anonKey!,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            );

            if (!sessionRes.ok) {
                console.error("[JOIN_SESSION] Sessão Fetch Error HTTP", sessionRes.status);
                throw new Error("Erro de comunicação com o servidor de dados.");
            }

            const sessionsData = await sessionRes.json();
            console.log("[JOIN_SESSION] Query sessions recebida", sessionsData);

            if (!sessionsData || sessionsData.length === 0) {
                throw new Error("Sessão não encontrada, inativa ou código inválido.");
            }

            const sessionData = sessionsData[0]; // .single() equivalent

            setJoinMessage({ text: "Sessão encontrada. Vinculando personagem...", type: "info" });
            console.log("[JOIN_SESSION] Disparando query no banco (session_characters) por POST (REST)...");

            // 2. Link investigator to session via raw fetch
            const linkRes = await executeWithTimeout(
                fetch(`${supabaseUrl}/rest/v1/session_characters`, {
                    method: 'POST',
                    headers: {
                        'apikey': anonKey!,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        session_id: sessionData.id,
                        investigator_id: selectedInvestigatorId
                    })
                })
            );

            console.log("[JOIN_SESSION] Query session_characters recebida. Status:", linkRes.status);

            if (!linkRes.ok) {
                const linkErrorData = await linkRes.json().catch(() => ({}));
                console.log("[JOIN_SESSION] RAW Link Error Data", linkErrorData);

                // 409 Conflict = Unique violation in PostgREST
                if (linkRes.status === 409 || linkErrorData.code === '23505') {
                    console.log("[JOIN_SESSION] Personagem já vinculado, redirecionando.");
                    setJoinMessage({ text: "Personagem já vinculado. Redirecionando...", type: "success" });
                    setTimeout(() => router.push(`/session/${sessionData.id}`), 500);
                    return;
                }
                throw new Error(linkErrorData.message || "Não foi possível vincular o personagem à mesa.");
            }

            console.log("[JOIN_SESSION] Sucesso. Redirecionando.");
            setJoinMessage({ text: `Entrando na sessão: ${sessionData.name}...`, type: "success" });
            setInviteCode(""); // Clear code

            // Redirect to the session table
            setTimeout(() => {
                router.push(`/session/${sessionData.id}`);
            }, 1000);

        } catch (err: any) {
            console.error("[JOIN_SESSION] Catch Block:", err);
            setJoinMessage({ text: err.message || "Erro ao entrar na sessão.", type: "error" });
        } finally {
            setIsJoining(false);
            console.log("[JOIN_SESSION] Fim.");
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {investigators.map((inv) => (
                    <div key={inv.id} className="group relative bg-[#0a0f0a] border-2 border-[#1c2e1c] rounded p-6 hover:border-[#3d6e3d] transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center">

                        {/* Investigator Badge as Header */}
                        <div className="w-full mb-4 flex justify-center mt-[-30px]">
                            <InvestigatorBadge investigator={inv} size="sm" />
                        </div>

                        {/* Occupation */}
                        <p className="text-xs text-[#8f968f] mb-4 uppercase tracking-widest bg-[#152015] px-2 py-1 rounded">{inv.occupation}</p>

                        <div className="flex flex-col gap-3 w-full mt-auto">

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
