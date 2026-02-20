"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Brain, Heart, Zap, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { DiceRoller } from "@/components/features/dice/dice-roller";
import { PlayerRollListener } from "@/components/features/dice/player-roll-listener";

export default function PlayerSessionView() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [sessionData, setSessionData] = useState<any>(null);
    const [companions, setCompanions] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

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
                        portrait: investigatorData?.personalData?.portrait || null,
                        hp: investigatorData?.derivedStats?.hp || { current: 0, max: 0 },
                        sanity: investigatorData?.derivedStats?.sanity || { current: 0, max: 0 },
                        mp: investigatorData?.derivedStats?.magicPoints || { current: 0, max: 0 }
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

    if (isLoading || isLoadingData) return <div className="p-8 text-[var(--color-mythos-parchment)] animate-pulse">Estabelecendo conexão mística...</div>;

    const currentUserInvestigator = companions.find(c => c.isCurrentUser);

    return (
        <div className="min-h-screen bg-[var(--color-mythos-black)] p-4 md:p-8 relative">

            {/* Real-time Dice Systems */}
            <DiceRoller />
            {currentUserInvestigator && (
                <PlayerRollListener
                    sessionId={params.id as string}
                    investigatorId={currentUserInvestigator.id}
                />
            )}

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-mythos-gold-dim)]/30 pb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)] hover:bg-black/40">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-mythos-blood)] font-heading tracking-widest uppercase">
                                {sessionData?.name}
                            </h1>
                            <p className="text-[var(--color-mythos-gold-dim)] italic font-serif flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                {companions.length} Investigadores nesta sessão
                            </p>
                        </div>
                    </div>

                    <Button variant="outline" onClick={fetchSessionData} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] bg-black/40 hover:bg-black hover:text-[var(--color-mythos-parchment)]">
                        Atualizar Status
                    </Button>
                </div>

                {/* Companions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {companions.map(companion => (
                        <div
                            key={companion.id}
                            className={`relative border rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${companion.isCurrentUser
                                ? 'border-[var(--color-mythos-gold)] bg-[var(--color-mythos-green)]/10 shadow-[0_0_15px_rgba(255,215,0,0.1)]'
                                : 'border-[var(--color-mythos-gold-dim)]/40 bg-[#120a0a]'
                                }`}
                        >
                            {/* Portrait / Header */}
                            <div className="h-40 bg-black/60 relative border-b border-[var(--color-mythos-gold-dim)]/30 flex items-center justify-center overflow-hidden">
                                {companion.portrait ? (
                                    <img
                                        src={companion.portrait}
                                        alt={companion.characterName}
                                        className="object-cover w-full h-full opacity-80"
                                        onError={(e) => {
                                            // Fallback to the icon if the image fails to load
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}

                                <User className={`w-16 h-16 text-[var(--color-mythos-gold-dim)]/20 fallback-icon ${companion.portrait ? 'hidden absolute' : ''}`} />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                                {/* Names */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 backdrop-blur-sm border-t border-[var(--color-mythos-gold-dim)]/20">
                                    <h2 className="text-lg font-bold text-[var(--color-mythos-parchment)] font-heading truncate">
                                        {companion.characterName}
                                    </h2>
                                    <p className="text-xs text-[var(--color-mythos-gold-dim)] truncate uppercase tracking-widest flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        Jogado por: {companion.playerName} {companion.isCurrentUser && '(Você)'}
                                    </p>
                                </div>
                            </div>

                            {/* Vitals Body */}
                            <div className="p-4 grid grid-cols-3 gap-2 flex-grow">
                                {/* HP */}
                                <div className="bg-black/40 rounded border border-[var(--color-mythos-blood)]/20 p-2 flex flex-col items-center justify-center relative overflow-hidden group">
                                    <div className={`absolute bottom-0 left-0 right-0 bg-[var(--color-mythos-blood)]/10 z-0 transition-all ${companion.hp.current < 5 ? 'h-full animate-pulse bg-[var(--color-mythos-blood)]/30' : 'h-1/3'}`} />
                                    <Heart className="w-4 h-4 text-[var(--color-mythos-blood)] mb-1 z-10" />
                                    <span className="text-sm font-bold text-[var(--color-mythos-parchment)] z-10">
                                        {companion.hp.current} <span className="text-[10px] text-[var(--color-mythos-gold-dim)]">/ {companion.hp.max}</span>
                                    </span>
                                </div>

                                {/* Sanity */}
                                <div className="bg-black/40 rounded border border-blue-900/30 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className={`absolute bottom-0 left-0 right-0 bg-blue-900/10 z-0 transition-all ${companion.sanity.current < 30 ? 'h-full animate-pulse bg-orange-900/40 border-orange-500' : 'h-1/3'}`} />
                                    <Brain className={`w-4 h-4 mb-1 z-10 ${companion.sanity.current < 30 ? 'text-orange-500' : 'text-blue-400'}`} />
                                    <span className={`text-sm font-bold z-10 ${companion.sanity.current < 30 ? 'text-orange-400' : 'text-[var(--color-mythos-parchment)]'}`}>
                                        {companion.sanity.current}
                                    </span>
                                </div>

                                {/* MP */}
                                <div className="bg-black/40 rounded border border-purple-900/30 p-2 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute bottom-0 left-0 right-0 bg-purple-900/10 h-1/3 z-0" />
                                    <Zap className="w-4 h-4 text-purple-400 mb-1 z-10" />
                                    <span className="text-sm font-bold text-[var(--color-mythos-parchment)] z-10">
                                        {companion.mp.current}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {companions.length === 0 && (
                        <div className="col-span-full py-12 text-center text-[var(--color-mythos-gold-dim)]">
                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="font-serif italic">A sessão está vazia e silenciosa...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
