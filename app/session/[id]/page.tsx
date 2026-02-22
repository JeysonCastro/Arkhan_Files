"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createPortal } from "react-dom";
import { ArrowLeft, Users, Brain, Heart, Zap, User, Skull, Briefcase, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { DiceRoller } from "@/components/features/dice/dice-roller";
import { PlayerRollListener } from "@/components/features/dice/player-roll-listener";
import { CompanionCard } from "@/components/features/session/companion-card";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function PlayerSessionView() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [sessionData, setSessionData] = useState<any>(null);
    const [companions, setCompanions] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Backpack State
    const [showInventory, setShowInventory] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else {
                fetchSessionData();
            }
        }
    }, [user, isLoading, params.id]);

    const fetchSessionData = async () => {
        const sessionId = params.id as string;
        try {
            // 1. Fetch Session Info
            const { data: sessionInfo, error: sessionError } = await supabase
                .from('sessions')
                .select('name, is_active')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;
            setSessionData(sessionInfo);

            // 2. Fetch all characters in this session via junction table
            // We join with investigators, and then join profiles on investigators.user_id to get player name
            const { data: charsData, error: charsError } = await supabase
                .from('session_characters')
                .select(`
                    investigator_id,
                    investigators (
                        id,
                        name,
                        occupation,
                        data,
                        user_id,
                        profiles ( username )
                    )
                `)
                .eq('session_id', sessionId);

            if (charsError) throw charsError;

            // Map the nested data to a flat structure for easy rendering
            const mappedCompanions = charsData
                .map((row: any) => {
                    const inv = row.investigators;
                    if (!inv) return null; // Safe fallback if RLS or deletion happens

                    const investigatorData = inv.data;
                    const profile = inv.profiles;

                    return {
                        id: inv.id,
                        characterName: inv.name,
                        occupation: inv.occupation,
                        playerName: profile ? profile.username : 'Desconhecido',
                        isCurrentUser: inv.user_id === user?.id,
                        avatar: investigatorData?.avatar || null,
                        portrait: investigatorData?.portrait || investigatorData?.personalData?.portrait || null,
                        hp: investigatorData?.derivedStats?.hp || { current: 0, max: 0 },
                        sanity: investigatorData?.derivedStats?.sanity || { current: 0, max: 0 },
                        mp: investigatorData?.derivedStats?.magicPoints || { current: 0, max: 0 },
                        inventory: investigatorData?.inventory || []
                    };
                })
                .filter((c: unknown) => c !== null) as any[]; // Remove any null elements and cast

            // Put current user's character first (optional UX enhancement)
            mappedCompanions.sort((a, b) => (a.isCurrentUser === b.isCurrentUser) ? 0 : a.isCurrentUser ? -1 : 1);

            setCompanions(mappedCompanions);
        } catch (err) {
            console.error("Error fetching session:", err);
            // Maybe redirect if session not found
            router.push('/dashboard');
        } finally {
            setIsLoadingData(false);
        }
    };

    // Realtime Listener for Investigator updates (HP, MP, Sanity, etc.)
    useEffect(() => {
        if (!params.id || isLoadingData) return;

        const subscription = supabase
            .channel(`session_updates_${params.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'investigators'
            }, (payload) => {
                setCompanions(prev => {
                    const idx = prev.findIndex(c => c.id === payload.new.id);
                    if (idx !== -1) {
                        const newCompanions = [...prev];
                        const invData = payload.new.data;

                        newCompanions[idx] = {
                            ...newCompanions[idx],
                            hp: invData?.derivedStats?.hp || { current: 0, max: 0 },
                            sanity: invData?.derivedStats?.sanity || { current: 0, max: 0 },
                            mp: invData?.derivedStats?.magicPoints || { current: 0, max: 0 },
                            avatar: invData?.avatar || newCompanions[idx].avatar,
                            portrait: invData?.portrait || invData?.personalData?.portrait || newCompanions[idx].portrait,
                            inventory: invData?.inventory || []
                        };

                        // Realtime Item Notification if current user's inventory grew
                        if (newCompanions[idx].isCurrentUser) {
                            const oldInvLength = prev[idx].inventory?.length || 0;
                            const newInvLength = invData?.inventory?.length || 0;

                            if (newInvLength > oldInvLength) {
                                // Simple toast or native alert for now
                                alert("O Guardião colocou um item na sua mochila!");
                            }
                        }

                        return newCompanions;
                    }
                    return prev;
                });
            })
            .subscribe((status) => {
                console.log("Supabase Player Realtime Status:", status);
            });

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [params.id, isLoadingData]);

    if (isLoading || isLoadingData) return <LoadingScreen message="Entrando na Mesa..." />;

    const currentUserInvestigator = companions.find(c => c.isCurrentUser);
    const otherCompanions = companions.filter(c => !c.isCurrentUser);

    return (
        <div
            className="min-h-screen relative overflow-hidden"
            style={{
                backgroundImage: `
                    radial-gradient(circle at center, rgba(30, 80, 50, 0.4) 0%, rgba(10, 20, 10, 0.95) 100%),
                    var(--texture-noise)
                `,
                backgroundColor: '#111a11',
                backgroundBlendMode: 'normal, multiply'
            }}
        >
            {/* Table Edge Lighting / Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-0" />

            {/* Real-time Dice Systems */}
            <DiceRoller />
            {currentUserInvestigator && (
                <PlayerRollListener
                    sessionId={params.id as string}
                    investigatorId={currentUserInvestigator.id}
                />
            )}

            <div className="max-w-7xl mx-auto space-y-4 relative z-10 flex flex-col min-h-[85vh]">
                {/* Header (Top Left/Right HUD) */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-mythos-gold-dim)]/10 pb-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)] hover:bg-black/40">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-[var(--color-mythos-gold)] font-heading tracking-widest uppercase drop-shadow-md">
                                {sessionData?.name}
                            </h1>
                            <p className="text-[var(--color-mythos-gold-dim)]/70 text-xs md:text-sm font-serif flex items-center gap-2">
                                <Users className="w-3 h-3" />
                                {companions.length} Vidas em jogo
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" onClick={fetchSessionData} size="sm" className="border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-gold-dim)] bg-black/20 hover:bg-black/80 hover:text-[var(--color-mythos-gold)]">
                        Atualizar Status
                    </Button>
                </div>

                {/* The "Table" Area */}
                <div className="flex-1 flex flex-col justify-between py-8">

                    {/* Head of the Table: Game Master */}
                    <div className="flex justify-center mb-12">
                        <div className="bg-gradient-to-b from-black/80 to-transparent border-t-4 border-[var(--color-mythos-blood)] p-6 rounded-b-3xl flex flex-col items-center">
                            <Skull className="w-10 h-10 text-[var(--color-mythos-blood)] mb-2 drop-shadow-[0_0_15px_rgba(124,22,22,0.8)]" />
                            <p className="font-heading uppercase tracking-widest text-[var(--color-mythos-blood)]/80 text-xs">O Guardião</p>
                        </div>
                    </div>

                    {/* Middle of the Table: Other Players (Flanks) */}
                    <div className="flex-1 flex justify-between items-center px-2 md:px-12 pointer-events-none">

                        {/* Left Flank */}
                        <div className="flex flex-col gap-16 pointer-events-auto">
                            {otherCompanions.filter((_, i) => i % 2 === 0).map(companion => (
                                <div key={companion.id} className="rotate-[4deg] hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 origin-left shadow-2xl">
                                    <CompanionCard companion={companion} />
                                </div>
                            ))}
                        </div>

                        {/* Center Table Atmosphere (Lamp light / Table Props) */}
                        <div className="hidden lg:flex flex-col items-center justify-center pointer-events-none relative w-full max-w-sm">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--color-mythos-gold)]/5 rounded-full blur-[100px] mix-blend-screen" />
                        </div>

                        {/* Right Flank */}
                        <div className="flex flex-col gap-16 pointer-events-auto items-end">
                            {otherCompanions.filter((_, i) => i % 2 !== 0).map(companion => (
                                <div key={companion.id} className="-rotate-[4deg] hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 origin-right shadow-2xl">
                                    <CompanionCard companion={companion} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Foot of the Table: Current User (Bottom Center) */}
                    <div className="flex flex-col items-center justify-center mt-12 group perspective-1000">
                        {currentUserInvestigator ? (
                            <>
                                {/* Floating Mochila Button */}
                                <Button
                                    variant="mythos"
                                    onClick={() => setShowInventory(true)}
                                    className="mb-8 z-50 bg-[#2a1a10] border border-[var(--color-mythos-gold-dim)] shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-serif uppercase tracking-widest gap-2 hover:bg-[#3a2517] hover:scale-105 transition-all w-48 mx-auto"
                                >
                                    <Briefcase className="w-5 h-5 text-[var(--color-mythos-gold)]" />
                                    Abrir Mochila
                                    {currentUserInvestigator.inventory?.length > 0 && (
                                        <span className="bg-[var(--color-mythos-blood)] text-white text-xs px-2 py-0.5 rounded-full ml-1 font-sans font-bold">
                                            {currentUserInvestigator.inventory.length}
                                        </span>
                                    )}
                                </Button>

                                <div className="transform translate-y-4 hover:-translate-y-2 hover:scale-110 transition-all duration-500 z-50">
                                    {/* Subtle spotlight on the user */}
                                    <div className="absolute -inset-10 bg-[var(--color-mythos-gold)]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                                    <CompanionCard companion={currentUserInvestigator} />
                                </div>
                            </>
                        ) : (
                            <div className="text-[var(--color-mythos-gold-dim)] italic border border-dashed border-[var(--color-mythos-gold-dim)]/30 rounded p-8">
                                Você não possui investigador nesta mesa.
                            </div>
                        )}
                    </div>

                </div>
            </div>
            {/* Player Backpack Modal (Rendered outside table layout to prevent scaling/transform bugs) */}
            {mounted && showInventory && currentUserInvestigator && createPortal(
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
                    <div className="w-full max-w-4xl max-h-[85vh] overflow-hidden border-2 border-[var(--color-mythos-gold-dim)] bg-[url('/paper-texture.png')] bg-cover relative flex flex-col shadow-2xl rounded" style={{ backgroundBlendMode: 'multiply', backgroundColor: '#1a1815' }}>

                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-black/30 bg-black/20 backdrop-blur-sm">
                            <h2 className="text-2xl font-heading text-[var(--color-mythos-gold)] tracking-widest uppercase flex items-center gap-3">
                                <Briefcase className="w-6 h-6" /> Pertences Pessoais
                            </h2>
                            <Button size="icon" variant="ghost" className="text-[var(--color-mythos-blood)] hover:text-red-500 hover:bg-black/20" onClick={() => setShowInventory(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Inventory Grid */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold-dim)]">
                            {(!currentUserInvestigator.inventory || currentUserInvestigator.inventory.length === 0) ? (
                                <div className="text-center text-[var(--color-mythos-gold-dim)]/50 font-serif italic py-12 text-lg">
                                    Sua mochila está vazia. O Guardião ainda não lhe entregou nenhum item.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {currentUserInvestigator.inventory.map((item: any, idx: number) => (
                                        <div key={item.id || idx} className="bg-[#1a1815] text-[var(--color-mythos-parchment)] border border-[var(--color-mythos-gold-dim)]/30 rounded-md p-4 shadow-xl relative hover:border-[var(--color-mythos-gold)] hover:-translate-y-1 transition-all flex flex-col gap-4 group">
                                            {/* Head: Title & Thumbnail */}
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 shrink-0 bg-black/60 border border-[var(--color-mythos-gold)]/20 rounded-md overflow-hidden relative shadow-inner">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover sepia-[0.3]" />
                                                    ) : (
                                                        <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-mythos-gold-dim)]/50">
                                                            <span className="text-[10px] uppercase font-serif">Sem Foto</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col justify-start">
                                                    <h4 className="font-heading font-medium uppercase text-base leading-tight text-[var(--color-mythos-gold)]">{item.name}</h4>
                                                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-mythos-gold-dim)]/70">{item.type}</span>
                                                    {item.stats && (
                                                        <div className="mt-2 self-start bg-red-900/30 px-2 py-1 border-l-2 border-[var(--color-mythos-blood)] font-mono text-[10px] font-bold text-[var(--color-mythos-gold)] uppercase tracking-wide">
                                                            {item.stats}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body: Description */}
                                            <div className="pt-3 border-t border-[var(--color-mythos-gold-dim)]/10 flex-1 flex flex-col justify-between">
                                                <p className="font-serif text-xs leading-relaxed text-[var(--color-mythos-parchment)]/80">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
