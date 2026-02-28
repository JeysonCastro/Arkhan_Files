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
import { Pinboard } from "@/components/features/session/pinboard";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Crosshair } from "lucide-react";
import { SessionAudioPlayer } from "@/components/features/session/audio-player";
import { CinematicOverlay } from "@/components/features/session/cinematic-overlay";
import { SanityEffectProvider } from "@/components/features/session/sanity-effect-provider";

export default function PlayerSessionView() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const [sessionData, setSessionData] = useState<any>(null);
    const [companions, setCompanions] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Backpack State
    const [showInventory, setShowInventory] = useState(false);

    // Pinboard State
    const [showPinboard, setShowPinboard] = useState(false);

    // Handout / Secret Delivery Modal State
    const [receivedItem, setReceivedItem] = useState<any | null>(null);

    // Fog of War / Flashlight state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isFlashlightOn, setIsFlashlightOn] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
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
                .select('name, is_active, is_lights_out, ambient_audio, scene_mode')
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
                        luck: investigatorData?.attributes?.LUCK?.current || 0,
                        isMajorWound: investigatorData?.isMajorWound || false,
                        madnessState: investigatorData?.madnessState || 'normal',
                        isFirearmReady: inv.is_firearm_ready || false,
                        inventory: investigatorData?.inventory || [],
                        rawInvestigatorData: investigatorData // Keep a reference for easy updates
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
                            luck: invData?.attributes?.LUCK?.current || 0,
                            isMajorWound: invData?.isMajorWound || false,
                            madnessState: invData?.madnessState || 'normal',
                            isFirearmReady: payload.new.is_firearm_ready || false,
                            avatar: invData?.avatar || newCompanions[idx].avatar,
                            portrait: invData?.portrait || invData?.personalData?.portrait || newCompanions[idx].portrait,
                            inventory: invData?.inventory || [],
                            rawInvestigatorData: invData
                        };

                        // Realtime Item Notification if current user's inventory grew
                        if (newCompanions[idx].isCurrentUser) {
                            const oldInvLength = prev[idx].inventory?.length || 0;
                            const newInvLength = invData?.inventory?.length || 0;

                            if (newInvLength > oldInvLength && invData.inventory) {
                                const newlyAddedItem = invData.inventory[invData.inventory.length - 1];
                                setReceivedItem(newlyAddedItem);
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

        // Listen for Global Session Changes (Lights Out)
        const sessionSub = supabase
            .channel(`session_global_${params.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'sessions',
                filter: `id=eq.${params.id}`
            }, (payload) => {
                setSessionData((prev: any) => prev ? {
                    ...prev,
                    is_lights_out: payload.new.is_lights_out,
                    ambient_audio: payload.new.ambient_audio,
                    scene_mode: payload.new.scene_mode
                } : prev);
            })
            .on('broadcast', { event: 'play_sound' }, (payload) => {
                const url = payload.payload?.soundUrl;
                const targetId = payload.payload?.targetId;

                setCompanions(prev => {
                    const currentInvestigator = prev.find(c => c.isCurrentUser);
                    if (!currentInvestigator) return prev; // Not fully loaded yet

                    // Se enviou url E (o alvo for ALL ou for exatamente este jogador), toca!
                    if (url && (!targetId || targetId === 'ALL' || targetId === currentInvestigator.id)) {
                        console.log(`SFX Recebido: ${url} (Alvo: ${targetId || 'ALL'})`);
                        const audio = new Audio(url);
                        audio.volume = 0.5;
                        audio.play().catch(e => console.error("Audio playback blocked:", e));
                    }
                    return prev;
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
            supabase.removeChannel(sessionSub);
        };
    }, [params.id, isLoadingData]);

    const isLightsOut = sessionData?.is_lights_out;

    useEffect(() => {
        if (!isLightsOut || !isFlashlightOn) return;
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [isLightsOut, isFlashlightOn]);

    if (isLoading || isLoadingData) return <LoadingScreen message="Entrando na Mesa..." />;

    const currentUserInvestigator = companions.find(c => c.isCurrentUser);
    const otherCompanions = companions.filter(c => !c.isCurrentUser);

    const handleSpendLuck = async (amount: number) => {
        if (!currentUserInvestigator) return;

        try {
            const currentData = currentUserInvestigator.rawInvestigatorData;
            if (!currentData || !currentData.attributes || !currentData.attributes.LUCK) return;

            const newLuck = Math.max(0, currentData.attributes.LUCK.current - amount);

            // Create a deep copy of the attributes to update LUCK
            const updatedAttributes = {
                ...currentData.attributes,
                LUCK: {
                    ...currentData.attributes.LUCK,
                    current: newLuck
                }
            };

            const { error } = await supabase
                .from('investigators')
                .update({
                    data: {
                        ...currentData,
                        attributes: updatedAttributes
                    }
                })
                .eq('id', currentUserInvestigator.id);

            if (error) {
                console.error("Failed to update luck:", error);
                alert("Erro ao debitar Sorte no banco de dados.");
            }
        } catch (e) {
            console.error("Error handling luck spend:", e);
        }
    };

    const handleToggleFirearm = async () => {
        if (!currentUserInvestigator) return;
        try {
            const newState = !currentUserInvestigator.isFirearmReady;
            // Optimistic update technically handled by realtime, but we fire the DB call
            const { error } = await supabase
                .from('investigators')
                .update({ is_firearm_ready: newState })
                .eq('id', currentUserInvestigator.id);

            if (error) throw error;
        } catch (err) {
            console.error("Error toggling firearm:", err);
            alert("Erro ao empunhar arma.");
        }
    };

    const hasLightSource = currentUserInvestigator?.inventory?.some(
        (i: any) => i.id === 'utl_lanterna' || i.id === 'utl_lampiao'
    );

    return (
        <div
            className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${isLightsOut ? 'bg-[#050505]' : ''}`}
            style={isLightsOut ? undefined : {
                backgroundImage: `
                    radial-gradient(circle at center, rgba(30, 80, 50, 0.4) 0%, rgba(10, 20, 10, 0.95) 100%),
                    var(--texture-noise)
                `,
                backgroundColor: '#111a11',
                backgroundBlendMode: 'normal, multiply'
            }}
        >
            {/* Global Lights Out Overlay Effect (Fog of War) */}
            <div className={`fixed inset-0 z-[150] pointer-events-none transition-opacity duration-1000 ${isLightsOut ? 'opacity-100' : 'opacity-0'}`}>
                {isLightsOut && (
                    <div
                        className="absolute inset-0 transition-all duration-300 pointer-events-none"
                        style={{
                            background: isFlashlightOn
                                ? `radial-gradient(circle 350px at ${mousePos.x}px ${mousePos.y}px, transparent 10%, rgba(5,5,5,0.85) 50%, rgba(2,2,2,0.98) 100%)`
                                : 'rgba(5, 5, 5, 0.95)'
                        }}
                    >
                        {/* Ambient subtle pulse if flashlight is off */}
                        {!isFlashlightOn && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-mythos-gold)]/5 rounded-full blur-[100px] mix-blend-screen opacity-30 animate-pulse" style={{ animationDuration: '4s' }} />
                        )}
                    </div>
                )}
            </div>

            {/* Table Edge Lighting / Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] pointer-events-none z-0" />

            {/* Immersive Audio & Video */}
            <SessionAudioPlayer trackKey={sessionData?.ambient_audio || 'none'} />
            <CinematicOverlay isActive={sessionData?.scene_mode === 'CINEMATIC'} />

            {/* Real-time Dice Systems */}
            <DiceRoller />
            {currentUserInvestigator && (
                <PlayerRollListener
                    sessionId={params.id as string}
                    investigatorId={currentUserInvestigator.id}
                    currentLuck={currentUserInvestigator.luck}
                    onSpendLuck={handleSpendLuck}
                />
            )}

            <div className={`max-w-7xl mx-auto space-y-4 relative z-10 flex flex-col min-h-[85vh] transition-opacity duration-1000 ${sessionData?.scene_mode === 'CINEMATIC' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
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

                    <div className="flex items-center gap-2">
                        <Button
                            variant="mythos"
                            onClick={() => setShowPinboard(true)}
                            size="sm"
                            className="bg-stone-900 border-[var(--color-mythos-gold-dim)]/30 hover:bg-stone-800"
                        >
                            Quadro de Evidências
                        </Button>
                        <Button variant="outline" onClick={fetchSessionData} size="sm" className="border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-gold-dim)] bg-black/20 hover:bg-black/80 hover:text-[var(--color-mythos-gold)]">
                            Atualizar Status
                        </Button>
                    </div>
                </div>

                {/* Sanity Effect Wrapper para o restante da UI */}
                <SanityEffectProvider
                    currentSanity={currentUserInvestigator?.sanity?.current || 50}
                    startSanity={currentUserInvestigator?.sanity?.start || currentUserInvestigator?.sanity?.max || 50}
                >
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

                                    {/* Botões de Ação Rápida (Combate e Exploração) */}
                                    <div className="flex gap-2 mb-8 z-50 -mt-6">
                                        <Button
                                            variant="outline"
                                            onClick={handleToggleFirearm}
                                            className={`border shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-sans uppercase tracking-widest gap-2 hover:scale-105 transition-all text-xs w-48
                                            ${currentUserInvestigator.isFirearmReady
                                                    ? 'bg-blue-900 border-blue-500 text-blue-100 font-bold shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                                                    : 'bg-black/60 border-[var(--color-mythos-gold-dim)]/50 text-stone-400 hover:text-stone-300'}`}
                                        >
                                            <Crosshair className="w-4 h-4" />
                                            {currentUserInvestigator.isFirearmReady ? 'Arma em Punho!' : 'Empunhar Arma'}
                                        </Button>

                                        {/* Lanterna Fog of War Toggle */}
                                        {hasLightSource && (
                                            <Button
                                                variant="outline"
                                                onClick={() => setIsFlashlightOn(!isFlashlightOn)}
                                                className={`border shadow-[0_5px_15px_rgba(0,0,0,0.8)] font-sans uppercase tracking-widest gap-2 hover:scale-105 transition-all text-xs w-48
                                                ${isFlashlightOn
                                                        ? 'bg-[var(--color-mythos-gold)]/20 border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] font-bold shadow-[0_0_15px_rgba(200,160,80,0.4)]'
                                                        : 'bg-black/60 border-[var(--color-mythos-gold-dim)]/50 text-stone-400 hover:text-stone-300'}`}
                                            >
                                                <Zap className="w-4 h-4" />
                                                {isFlashlightOn ? 'Apagar Luz' : 'Acender Lanterna'}
                                            </Button>
                                        )}
                                    </div>

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
                </SanityEffectProvider>
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

            {/* Fullscreen Pinboard Modal */}
            {mounted && showPinboard && createPortal(
                <SanityEffectProvider
                    currentSanity={currentUserInvestigator?.sanity?.current || 50}
                    startSanity={currentUserInvestigator?.sanity?.start || currentUserInvestigator?.sanity?.max || 50}
                >
                    <Pinboard
                        sessionId={params.id as string}
                        onClose={() => setShowPinboard(false)}
                        isGM={false}
                    />
                </SanityEffectProvider>,
                document.body
            )}

            {/* Secret Handout Modal */}
            {mounted && receivedItem && createPortal(
                <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="w-full max-w-md bg-[url('/paper-texture.png')] bg-cover relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)] rounded-sm border border-[var(--color-mythos-gold-dim)]/50 p-6 text-center" style={{ backgroundBlendMode: 'multiply', backgroundColor: '#2a221b' }}>

                        <div className="absolute top-2 right-2">
                            <Button size="icon" variant="ghost" className="text-stone-400 hover:text-white" onClick={() => setReceivedItem(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="mx-auto w-20 h-20 rounded-full bg-black/50 border-2 border-[var(--color-mythos-gold)] flex items-center justify-center mb-4 shadow-inner overflow-hidden">
                            {receivedItem.imageUrl ? (
                                <img src={receivedItem.imageUrl} alt={receivedItem.name} className="w-full h-full object-cover sepia-[0.3]" />
                            ) : (
                                <Briefcase className="w-10 h-10 text-[var(--color-mythos-gold-dim)]" />
                            )}
                        </div>

                        <h2 className="text-xl font-heading text-[var(--color-mythos-gold)] tracking-widest uppercase mb-1">Item Adquirido</h2>
                        <h3 className="text-2xl font-serif font-bold text-white mb-1 drop-shadow-md">{receivedItem.name}</h3>
                        <p className="text-[10px] uppercase tracking-widest text-[var(--color-mythos-gold-dim)]/70 mb-4">{receivedItem.type}</p>

                        <div className="bg-black/40 border-y border-[var(--color-mythos-gold-dim)]/20 py-4 mb-6 px-4 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]">
                            <p className="text-sm font-serif text-[var(--color-mythos-parchment)]/90 italic leading-relaxed text-center">
                                "{receivedItem.description}"
                            </p>
                            {receivedItem.stats && (
                                <div className="mt-4 flex justify-center">
                                    <p className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest bg-red-950/40 border border-red-900/50 inline-block px-3 py-1">
                                        {receivedItem.stats}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            variant="mythos"
                            onClick={() => setReceivedItem(null)}
                            className="w-full bg-stone-900 hover:bg-stone-800 text-lg py-6 shadow-xl"
                        >
                            Guardar na Mochila
                        </Button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
