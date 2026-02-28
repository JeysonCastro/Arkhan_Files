"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Skull, Link as LinkIcon, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { InvestigatorBadge } from "@/components/ui/investigator-badge";
import { LoadingScreen } from "@/components/ui/loading-screen";

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
                setIsLoadingData(false);
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

            const mapped = data.map(row => ({
                ...row.data,
                id: row.id,
                name: row.name,
                occupation: row.occupation,
                sessions: row.session_characters
            }));

            setInvestigators(mapped);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleDeleteCharacter = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja recussitar os mortos e extinguir permanentemente este investigador? Isso não pode ser desfeito!")) return;

        try {
            const { error } = await supabase
                .from('investigators')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setInvestigators(prev => prev.filter(inv => inv.id !== id));
        } catch (err: any) {
            console.error(err);
            alert("Erro ao excluir investigar: " + err.message);
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
            const executeWithTimeout = <T,>(promise: Promise<T>, ms: number = 5000): Promise<T> => {
                let timeoutId: NodeJS.Timeout;
                const timeoutPromise = new Promise<never>((_, reject) => {
                    timeoutId = setTimeout(() => {
                        reject(new Error("A requisição demorou demais. Tente novamente."));
                    }, ms);
                });
                return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
            };

            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const { data: { session } } = await supabase.auth.getSession();
            const accessToken = session?.access_token || anonKey;

            const sessionRes = await executeWithTimeout(
                fetch(`${supabaseUrl}/rest/v1/sessions?invite_code=eq.${inviteCode.toUpperCase()}&is_active=eq.true&select=id,name`, {
                    headers: {
                        'apikey': anonKey!,
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                })
            );

            if (!sessionRes.ok) throw new Error("Erro de comunicação com o servidor.");

            const sessionsData = await sessionRes.json();
            if (!sessionsData || sessionsData.length === 0) throw new Error("Código inválido ou sessão inativa.");

            const sessionData = sessionsData[0];
            setJoinMessage({ text: "Sessão encontrada. Vinculando...", type: "info" });

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

            if (!linkRes.ok) {
                const linkErrorData = await linkRes.json().catch(() => ({}));
                if (linkRes.status === 409 || linkErrorData.code === '23505') {
                    setJoinMessage({ text: "Já vinculado. Redirecionando...", type: "success" });
                    setTimeout(() => router.push(`/session/${sessionData.id}`), 500);
                    return;
                }
                throw new Error(linkErrorData.message || "Não foi possível vincular.");
            }

            setJoinMessage({ text: `Entrando em: ${sessionData.name}...`, type: "success" });
            setTimeout(() => router.push(`/session/${sessionData.id}`), 1000);

        } catch (err: any) {
            setJoinMessage({ text: err.message || "Erro ao entrar na sessão.", type: "error" });
        } finally {
            setIsJoining(false);
        }
    };

    if (isLoading || !user || isLoadingData) return <LoadingScreen message="Consultando os Arquivos..." />;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-[var(--color-mythos-parchment)] selection:bg-[var(--color-mythos-gold)] selection:text-black">
            {/* Ambient Background Layer */}
            <div className="fixed inset-0 pointer-events-none opacity-40 mix-blend-soft-light" style={{
                backgroundImage: 'url("/paper-texture.png"), var(--texture-noise)',
                backgroundBlendMode: 'multiply'
            }} />

            <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-12 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-[var(--color-mythos-gold-dim)]/20 pb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-[var(--color-mythos-gold)] tracking-widest uppercase drop-shadow-lg">
                            Meus Investigadores
                        </h1>
                        <p className="text-[var(--color-mythos-parchment)]/60 font-serif italic mt-2">
                            "Onde os registros da sanidade são mantidos sob chave e cadeado."
                        </p>
                    </div>
                    <Link href="/character/new">
                        <Button variant="mythos" size="lg" className="gap-3 shadow-[0_0_20px_rgba(184,134,11,0.2)] hover:shadow-[0_0_30px_rgba(184,134,11,0.4)] transition-all px-8 py-6 text-lg tracking-widest">
                            <Plus className="w-5 h-5" />
                            NOVA FICHA
                        </Button>
                    </Link>
                </div>

                {/* Join Session Section */}
                {investigators.length > 0 && (
                    <div className="relative group overflow-hidden bg-black/40 border border-[var(--color-mythos-gold-dim)]/30 rounded-lg p-6 backdrop-blur-md shadow-2xl">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--color-mythos-gold)] to-transparent opacity-50" />

                        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
                            <div className="flex-1 text-center lg:text-left">
                                <h3 className="text-[var(--color-mythos-gold)] font-bold text-xl flex items-center justify-center lg:justify-start gap-3 tracking-widest uppercase">
                                    <LinkIcon className="w-5 h-5 text-[var(--color-mythos-gold-dim)]" />
                                    Adentrar a Mesa
                                </h3>
                                <p className="text-sm text-[var(--color-mythos-parchment)]/50 font-serif mt-1 italic">
                                    Insira o código de 6 dígitos fornecido pelo Guardião para iniciar a sessão.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row w-full lg:w-auto items-stretch sm:items-center gap-4">
                                <div className="relative flex-1 sm:flex-none">
                                    <Input
                                        placeholder="XYZ123"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        maxLength={6}
                                        className="bg-black/60 border-[var(--color-mythos-gold-dim)]/40 text-[var(--color-mythos-parchment)] w-full sm:w-40 h-12 text-center font-bold tracking-[0.3em] uppercase text-xl focus:border-[var(--color-mythos-gold)] transition-colors shadow-inner"
                                    />
                                </div>

                                <Select value={selectedInvestigatorId} onValueChange={setSelectedInvestigatorId}>
                                    <SelectTrigger className="w-full sm:w-[240px] h-12 bg-black/60 border-[var(--color-mythos-gold-dim)]/40 text-[var(--color-mythos-parchment)] font-serif tracking-wide focus:border-[var(--color-mythos-gold)] transition-colors">
                                        <SelectValue placeholder="Escolher Ficha" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#120a0a] border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)]">
                                        {investigators.map(inv => (
                                            <SelectItem key={inv.id} value={inv.id} className="focus:bg-[var(--color-mythos-gold)] focus:text-black transition-colors font-serif">
                                                {inv.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Button
                                    onClick={handleJoinSession}
                                    disabled={isJoining || !inviteCode || !selectedInvestigatorId}
                                    className="h-12 px-10 bg-[var(--color-mythos-gold)]/10 hover:bg-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] hover:text-black border border-[var(--color-mythos-gold)]/50 hover:border-[var(--color-mythos-gold)] transition-all font-bold tracking-widest uppercase shadow-xl disabled:opacity-30"
                                >
                                    {isJoining ? "..." : "CONECTAR"}
                                </Button>
                            </div>
                        </div>

                        {joinMessage.text && (
                            <div className={`mt-4 text-xs text-center p-3 rounded-md border animate-in slide-in-from-top-2 duration-300 font-serif tracking-widest uppercase
                            ${joinMessage.type === 'error' ? 'text-red-400 bg-red-950/40 border-red-900/50' : 'text-green-400 bg-green-950/40 border-green-900/50'}`}>
                                {joinMessage.text}
                            </div>
                        )}
                    </div>
                )}

                {/* Investigators Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-4">
                    {investigators.map((inv) => (
                        <div key={inv.id} className="group flex flex-col items-center">
                            {/* Polaroid Card */}
                            <div className="relative bg-[#e8e6df] p-4 pb-12 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-[#c4c1b5] transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.7)] group-hover:z-10">
                                {/* Tape Deco */}
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8 bg-[#dcd9cd]/80 opacity-90 rotate-[5deg] shadow-sm z-20 border-t border-b border-black/5" style={{ clipPath: 'polygon(5% 0%, 95% 5%, 100% 95%, 0% 100%)' }}></div>

                                {/* Photo Container */}
                                <div className="relative aspect-square w-full min-w-[200px] bg-stone-900 overflow-hidden border-2 border-black/10 shadow-inner">
                                    {inv.avatar ? (
                                        <div className="w-full h-full scale-125 translate-y-2 grayscale-[0.3] sepia-[0.2]">
                                            <Skull className="absolute inset-0 m-auto w-16 h-16 text-[var(--color-mythos-gold-dim)]/20" />
                                        </div>
                                    ) : inv.portrait ? (
                                        <img
                                            src={inv.portrait}
                                            alt={inv.name}
                                            className="w-full h-full object-cover grayscale-[0.5] sepia-[0.3] contrast-125 group-hover:grayscale-0 group-hover:sepia-0 group-hover:contrast-100 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-stone-700 bg-[url('/paper-texture.png')] bg-cover opacity-60">
                                            <Skull className="w-20 h-20 mb-2 opacity-20" />
                                            <span className="text-[10px] font-serif uppercase tracking-widest font-black">Identidade Desconhecida</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] pointer-events-none" />
                                    <div className="absolute inset-0 bg-[#8c734b] mix-blend-color opacity-20 pointer-events-none" />
                                </div>

                                {/* Name & Occupation Label */}
                                <div className="mt-8 text-center px-2">
                                    <h4 className="text-black font-[family-name:--font-typewriter] font-bold text-2xl uppercase tracking-tighter leading-tight truncate">
                                        {inv.name}
                                    </h4>
                                    <p className="text-black/60 font-serif italic text-sm mt-1 border-t border-black/5 pt-2 truncate uppercase tracking-widest font-bold">
                                        {inv.occupation}
                                    </p>
                                </div>

                                {/* Delete Button (Trash) - Hidden by default */}
                                <button
                                    onClick={(e) => { e.preventDefault(); handleDeleteCharacter(inv.id); }}
                                    className="absolute bottom-2 right-2 p-2 text-red-900/20 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 duration-300"
                                    title="Extinguir"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Action Buttons Shadowed beneath */}
                            <div className="flex gap-4 w-full max-w-[280px] -mt-4 z-20 px-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                <Link href={`/character/${inv.id}`} className="flex-1">
                                    <Button className="w-full bg-black text-[var(--color-mythos-gold)] border border-[var(--color-mythos-gold-dim)]/50 hover:bg-[var(--color-mythos-gold)] hover:text-black transition-all font-serif uppercase tracking-widest text-xs h-10 shadow-2xl">
                                        Arquivos
                                    </Button>
                                </Link>
                                {inv.sessions && inv.sessions.length > 0 && (
                                    <Link href={`/session/${inv.sessions[0].session_id}`} className="flex-1">
                                        <Button className="w-full bg-[var(--color-mythos-blood)]/80 hover:bg-[var(--color-mythos-blood)] text-white border border-red-900 transition-all font-serif uppercase tracking-widest text-xs h-10 shadow-2xl">
                                            Entrar
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Empty State Card */}
                    {investigators.length === 0 && (
                        <div className="col-span-full py-24 border-2 border-dashed border-[var(--color-mythos-gold-dim)]/20 rounded-xl bg-black/20 flex flex-col items-center justify-center text-center px-6">
                            <Skull className="w-16 h-16 text-[var(--color-mythos-gold-dim)]/20 mb-6" />
                            <p className="text-[var(--color-mythos-gold)] text-xl font-heading mb-3 tracking-widest">Nenhum investigado encontrado.</p>
                            <p className="text-[var(--color-mythos-parchment)]/40 font-serif italic max-w-md mb-8">
                                "Os arquivos estão vazios. Nenhuma alma se atreveu a documentar sua descida à loucura... ainda."
                            </p>
                            <Link href="/character/new">
                                <Button variant="outline" className="border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)] px-10 hover:bg-[var(--color-mythos-gold)] hover:text-black h-12 tracking-[0.2em]">
                                    CRIAR PRIMEIRA FICHA
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
