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
import { CompanionCard } from "@/components/features/session/companion-card";

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
                        avatar: investigatorData?.avatar || null,
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
                            portrait: invData?.personalData?.portrait || newCompanions[idx].portrait
                        };
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
                        <CompanionCard key={companion.id} companion={companion} />
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
