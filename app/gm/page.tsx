"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_INVESTIGATORS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Eye, Heart, Brain, Zap, X, Monitor, RefreshCw, Plus, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Investigator } from "@/lib/types";
import CharacterSheetDisplay from "@/components/features/character-sheet/character-sheet-display";
import { CompanionCard } from "@/components/features/session/companion-card";
import { Pinboard } from "@/components/features/session/pinboard";
import { InitiativeTracker } from "@/components/features/combat/initiative-tracker";
import { useInvestigator } from "@/hooks/use-investigator";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { MASTER_ITEMS_DB } from "@/lib/items-db";
import { EquipmentItem } from "@/lib/types";

export default function GMPage() {
    const [investigators, setInvestigators] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Session Management
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Global Environment State (Lights Out)
    const [isLightsOut, setIsLightsOut] = useState(false);

    // Roll Requests
    const [activeRolls, setActiveRolls] = useState<any[]>([]);
    const [showRollModal, setShowRollModal] = useState(false);
    const [rollSkillName, setRollSkillName] = useState("");
    const [rollTargetValue, setRollTargetValue] = useState("");
    const [rollDiceCount, setRollDiceCount] = useState("1");
    const [rollDiceType, setRollDiceType] = useState("d100");
    const [rollIsBlind, setRollIsBlind] = useState(false);

    // Item Distribution
    const [showItemModal, setShowItemModal] = useState(false);
    const [showSheetModal, setShowSheetModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showPinboard, setShowPinboard] = useState(false);
    const [showSoundModal, setShowSoundModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // State for the selected investigator (modal)
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // We can use the hook to manage the state of the *currently viewed* investigator
    // ensuring edits (if any) are tracked locally while open
    const {
        investigator,
        setInvestigator,
        handleAttributeChange,
        handleInfoChange,
        handleSkillChange
    } = useInvestigator(null);

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
                fetchInvestigators('ALL');
            }
        }
    }, [user, isLoading, router]);

    // Subscribe to Roll Requests
    useEffect(() => {
        if (!user || user.role !== 'KEEPER' || !selectedSessionId || selectedSessionId === 'ALL') return;

        console.log("Setting up REALTIME listener for session:", selectedSessionId);

        const fetchActiveRolls = async () => {
            const { data } = await supabase
                .from('roll_requests')
                .select('*')
                .eq('session_id', selectedSessionId)
                .order('created_at', { ascending: false })
                .limit(10);
            if (data) setActiveRolls(data);
        };

        fetchActiveRolls();

        const subscription = supabase
            .channel(`gm_roles_channel_${selectedSessionId}`) // Unique channel per session
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'roll_requests',
                    filter: `session_id=eq.${selectedSessionId}`
                },
                (payload) => {
                    console.log("Realtime GM Payload Received:", payload);
                    // Refresh the active rolls on any change
                    fetchActiveRolls();

                    // If it's an update to ROLLED, maybe show a toast/alert
                    if (payload.eventType === 'UPDATE' && payload.new.status === 'ROLLED') {
                        // Optional: could play a sound or use a toast library here
                        console.log("Player Rolled:", payload.new);
                    }
                }
            )
            .subscribe((status) => {
                console.log("Supabase GM Realtime Status:", status);
            });

        return () => {
            console.log("Cleaning up REALTIME listener");
            supabase.removeChannel(subscription);
        };
    }, [user, selectedSessionId]);

    // Realtime Listener for Investigator updates (HP, MP, Sanity on GM screen)
    useEffect(() => {
        if (!user || user.role !== 'KEEPER' || isLoadingData) return;

        const subscription = supabase
            .channel(`gm_investigators_updates_${selectedSessionId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'investigators'
                },
                (payload) => {
                    const newData = {
                        ...payload.new.data,
                        id: payload.new.id,
                        name: payload.new.name,
                        occupation: payload.new.occupation,
                        isFirearmReady: payload.new.is_firearm_ready || false
                    };

                    setInvestigators(prev => prev.map(inv => inv.id === newData.id ? newData : inv));

                    // If viewing this investigator currently, update local state
                    if (investigator && investigator.id === newData.id) {
                        setInvestigator(newData);
                    }
                }
            )
            .subscribe((status) => {
                console.log("Supabase Investigators Realtime Status (GM):", status);
            });

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user, isLoadingData, selectedSessionId, investigator]);

    // Cleanup stale rolls (2 minutes = 120000ms)
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveRolls(prev => {
                const now = Date.now();
                return prev.filter(roll => {
                    const rollTime = new Date(roll.created_at).getTime();
                    return (now - rollTime) < 120000;
                });
            });
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchSessions = async () => {
        try {
            const { data, error } = await supabase
                .from('sessions')
                .select('*')
                .eq('keeper_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSessions(data || []);

            // Set initial lights out state if a session is selected
            if (selectedSessionId && selectedSessionId !== 'ALL') {
                const currentSession = data?.find(s => s.id === selectedSessionId);
                if (currentSession) {
                    setIsLightsOut(currentSession.is_lights_out || false);
                }
            }
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
            setSelectedSessionId(data.id);
            fetchInvestigators(data.id);
        } catch (err) {
            console.error("Error creating session:", err);
            alert("Erro ao criar sessão. Tente novamente.");
        } finally {
            setIsCreatingSession(false);
        }
    };

    const handleSessionChange = (sessionId: string) => {
        setSelectedSessionId(sessionId);
        fetchInvestigators(sessionId);
        setSelectedId(null); // Clear selected investigator when changing session

        const session = sessions.find(s => s.id === sessionId);
        if (session) {
            setIsLightsOut(session.is_lights_out || false);
        } else {
            setIsLightsOut(false);
        }
    };

    const fetchInvestigators = async (sessionId: string) => {
        setIsLoadingData(true);
        setFetchError(null);
        try {
            let query = supabase.from('investigators').select('*').order('created_at', { ascending: false });

            if (sessionId !== 'ALL') {
                // Fetch investigator IDs linked to this session
                const { data: sessionLinks, error: linkError } = await supabase
                    .from('session_characters')
                    .select('investigator_id')
                    .eq('session_id', sessionId);

                if (linkError) throw linkError;

                const investigatorIds = sessionLinks.map(link => link.investigator_id);

                if (investigatorIds.length > 0) {
                    query = query.in('id', investigatorIds);
                } else {
                    // No characters in this session yet
                    setInvestigators([]);
                    setIsLoadingData(false);
                    return;
                }
            }

            const { data, error } = await query;
            if (error) throw error;

            const mapped = data.map(row => ({
                ...row.data,
                id: row.id,
                name: row.name,
                occupation: row.occupation,
                isFirearmReady: row.is_firearm_ready || false
            }));

            setInvestigators(mapped);
        } catch (err: any) {
            console.error(err);
            setFetchError(err.message || 'Erro ao carregar investigadores da sessão.');
        } finally {
            setIsLoadingData(false);
        }
    };

    if (isLoading || !user || user.role !== 'KEEPER') return <LoadingScreen message="Acessando Arquivos Confidenciais..." />;

    const handleSelectInvestigator = (inv: Investigator) => {
        setInvestigator(inv); // Initialize the hook with the selected data
        setSelectedId(inv.id);
    };

    const toggleLightsOut = async () => {
        if (!selectedSessionId || selectedSessionId === 'ALL') return;
        try {
            const newState = !isLightsOut;
            const { error } = await supabase
                .from('sessions')
                .update({ is_lights_out: newState })
                .eq('id', selectedSessionId);

            if (error) throw error;
            setIsLightsOut(newState);

            // Alerta local pro GM
            if (newState) {
                console.log("As luzes se apagaram na sessão.");
            } else {
                console.log("As luzes se acenderam na sessão.");
            }
        } catch (err) {
            console.error("Erro ao alterar iluminação:", err);
            alert("Erro ao alterar a iluminação global da sessão.");
        }
    };

    const handlePlaySound = async (url: string) => {
        if (!selectedSessionId || selectedSessionId === 'ALL') return;
        const channel = supabase.channel(`session_global_${selectedSessionId}`);
        channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'play_sound',
                    payload: { soundUrl: url }
                });
                console.log("Som disparado:", url);
                supabase.removeChannel(channel);
            }
        });
    };

    const handleClose = () => {
        setSelectedId(null);
    };

    const handleSendItemToPlayer = async (item: EquipmentItem) => {
        if (!investigator) return;
        try {
            const itemInstance: EquipmentItem = {
                ...item,
                id: `${item.id}_${Date.now()}`
            };

            const currentInventory = investigator.inventory || [];
            const newInventory = [...currentInventory, itemInstance];

            handleInfoChange('inventory', newInventory);

            const { data: dbInv } = await supabase
                .from('investigators')
                .select('data')
                .eq('id', investigator.id)
                .single();

            if (dbInv) {
                const newData = { ...dbInv.data, inventory: newInventory };
                await supabase
                    .from('investigators')
                    .update({ data: newData })
                    .eq('id', investigator.id);

                alert(`Item "${item.name}" enviado para ${investigator.name}!`);
                setShowItemModal(false);
            }
        } catch (error) {
            console.error("Erro ao enviar item:", error);
            alert("Erro ao enviar o item.");
        }
    };

    const handleToggleStatus = async (field: 'isMajorWound' | 'madnessState', value: any) => {
        if (!investigator) return;
        try {
            const { data: dbInv } = await supabase
                .from('investigators')
                .select('data')
                .eq('id', investigator.id)
                .single();

            if (dbInv) {
                const newData = { ...dbInv.data };
                newData[field] = value;

                await supabase
                    .from('investigators')
                    .update({ data: newData })
                    .eq('id', investigator.id);

            }
        } catch (error) {
            console.error("Erro ao alterar status:", error);
            alert("Erro ao alterar o status do investigador.");
        }
    };

    const handleSendRollRequest = async () => {
        if (!selectedId || !selectedSessionId || selectedSessionId === 'ALL' || !rollSkillName || !rollTargetValue) {
            alert("Preencha a perícia e o valor alvo. Selecione uma sessão específica primeiro.");
            return;
        }

        try {
            const { error } = await supabase.from('roll_requests').insert([{
                session_id: selectedSessionId,
                keeper_id: user?.id,
                investigator_id: selectedId,
                skill_name: rollSkillName,
                target_value: rollTargetValue ? parseInt(rollTargetValue) : null,
                dice_count: parseInt(rollDiceCount),
                dice_type: rollDiceType,
                is_blind: rollIsBlind,
                status: 'PENDING'
            }]);

            if (error) throw error;

            setShowRollModal(false);
            setRollSkillName("");
            setRollTargetValue("");
            setRollDiceCount("1");
            setRollDiceType("d100");
            setRollIsBlind(false);
        } catch (err) {
            console.error("Error creating roll request:", err);
            alert("Erro ao solicitar rolagem.");
        }
    };

    const getSuccessColor = (type: string | null) => {
        if (!type) return 'text-[var(--color-mythos-gold-dim)]';
        switch (type) {
            case 'CRITICAL': return 'text-blue-400';
            case 'EXTREME': return 'text-[var(--color-mythos-gold)]';
            case 'HARD': return 'text-green-400';
            case 'SUCCESS': return 'text-green-600';
            case 'FAILURE': return 'text-red-400';
            case 'FUMBLE': return 'text-red-600 font-bold';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-[var(--color-mythos-gold-dim)]/30 pb-4 mb-6 shrink-0 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[var(--color-mythos-blood)] tracking-wider font-heading">Visão do Guardião</h1>
                    <p className="text-[var(--color-mythos-gold-dim)] italic">Monitore a degradação física e mental dos seus jogadores.</p>
                </div>

                {/* Session Controls */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-black/40 p-3 rounded-md border border-[var(--color-mythos-gold-dim)]/20 shadow-md">
                    <div className="flex flex-col">
                        <span className="text-xs text-[var(--color-mythos-gold-dim)] uppercase tracking-widest mb-1">Cód. Convite</span>
                        <div className="flex items-center gap-2">
                            <Select value={selectedSessionId} onValueChange={handleSessionChange}>
                                <SelectTrigger className="w-[180px] bg-[#120a0a] border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)]">
                                    <SelectValue placeholder="Selecione a Sessão" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1010] border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)]">
                                    <SelectItem value="ALL">Todas as Fichas (Global)</SelectItem>
                                    {sessions.map(s => (
                                        <SelectItem key={s.id} value={s.id}>
                                            {s.name} ({s.invite_code})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => fetchInvestigators(selectedSessionId)}
                                className="border-[var(--color-mythos-gold-dim)]/30 bg-[#120a0a] hover:bg-black/50 text-[var(--color-mythos-gold)]"
                                title="Atualizar dados"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoadingData ? 'animate-spin' : ''}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <Button
                            onClick={handleCreateSession}
                            disabled={isCreatingSession}
                            className="bg-black/40 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-gold)]/10 transition-colors whitespace-nowrap flex-1 lg:flex-none justify-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Nova Sessão
                        </Button>
                        <Button
                            onClick={() => setShowSoundModal(true)}
                            disabled={selectedSessionId === 'ALL'}
                            className="bg-black/40 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-gold)]/10 transition-colors whitespace-nowrap hidden sm:flex"
                            title="Soundpad"
                        >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Sons
                        </Button>
                        <Button
                            onClick={toggleLightsOut}
                            disabled={selectedSessionId === 'ALL'}
                            className={`border transition-colors whitespace-nowrap flex-1 lg:flex-none justify-center font-serif tracking-widest ${isLightsOut ? 'bg-[var(--color-mythos-blood)] border-red-500 hover:bg-red-800 text-white shadow-[0_0_15px_rgba(200,0,0,0.5)]' : 'bg-black/40 border-[var(--color-mythos-gold-dim)]/50 text-stone-400 hover:text-stone-300'}`}
                            title={isLightsOut ? "Acender Luzes" : "Apagar Luzes (Pitch Black)"}
                        >
                            {isLightsOut ? "LUZ!" : "Apagar Luzes"}
                        </Button>
                        <Button
                            onClick={() => setShowPinboard(true)}
                            disabled={selectedSessionId === 'ALL'}
                            className="bg-stone-900 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] hover:bg-stone-800 transition-colors whitespace-nowrap hidden sm:flex"
                        >
                            Quadro
                        </Button>
                    </div>
                </div>

                <div className="text-right flex items-center gap-4 hidden sm:flex">
                    <Button
                        onClick={() => setShowPinboard(true)}
                        disabled={selectedSessionId === 'ALL'}
                        className="bg-stone-900 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] hover:bg-stone-800 transition-colors whitespace-nowrap sm:hidden lg:flex"
                    >
                        Quadro de Evidências
                    </Button>
                    <div>
                        <p className="text-2xl font-bold text-[var(--color-mythos-gold)]">{investigators.length}</p>
                        <p className="text-xs uppercase tracking-widest text-[var(--color-mythos-gold-dim)]">Almas Ativas</p>
                    </div>
                </div>
            </div>

            <div
                className="flex-1 overflow-hidden relative rounded-xl border border-[var(--color-mythos-wood)]/30 backdrop-blur-sm shadow-[inset_0_0_100px_rgba(0,0,0,0.9)]"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at center, rgba(30, 80, 50, 0.4) 0%, rgba(10, 20, 10, 0.95) 100%),
                        var(--texture-noise)
                    `,
                    backgroundColor: '#111a11',
                    backgroundBlendMode: 'normal, multiply'
                }}
            >
                <div className="absolute inset-0 overflow-y-auto px-4 py-8 md:px-12 relative z-10 flex flex-col min-h-full">

                    {/* Initiative Tracker Sidebar */}
                    {investigators.length > 0 && selectedSessionId !== 'ALL' && (
                        <div className="hidden xl:block absolute left-4 top-24 z-40">
                            <InitiativeTracker investigators={investigators} />
                        </div>
                    )}

                    {/* GM Area (Head of Table Top) */}
                    <div className="flex justify-center mb-16 pointer-events-none">
                        <div className="bg-gradient-to-b from-black/80 to-transparent border-t-4 border-[var(--color-mythos-blood)] p-6 rounded-b-3xl flex flex-col items-center shadow-2xl relative">
                            {/* Subtle spotlight for GM */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[var(--color-mythos-blood)]/5 rounded-full blur-[80px] mix-blend-screen" />
                            <Monitor className="w-10 h-10 text-[var(--color-mythos-gold-dim)] mb-2" />
                            <p className="font-heading uppercase tracking-widest text-[var(--color-mythos-gold-dim)] text-xs">Visão do Guardião</p>
                            <p className="font-serif italic text-gray-500 text-[10px] mt-1">Conduza os infelizes à sua perdição.</p>
                        </div>
                    </div>
                    {isLoadingData ? (
                        <div className="text-center p-8 text-[var(--color-mythos-gold-dim)] animate-pulse">
                            Consultando Arquivos da Sessão...
                        </div>
                    ) : fetchError ? (
                        <div className="text-center p-8 bg-red-900/20 border border-red-500/50 rounded text-red-400">
                            Aviso: {fetchError}
                        </div>
                    ) : investigators.length === 0 ? (
                        <div className="text-center p-8 text-[var(--color-mythos-gold-dim)]">
                            <p>Nenhum investigador encontrado nesta sessão.</p>
                            {selectedSessionId !== 'ALL' && (
                                <p className="text-xs mt-2">Peça aos jogadores para usarem o código de convite no painel deles.</p>
                            )}
                        </div>
                    ) : (
                        <div className="flex w-full justify-between items-start pb-32">
                            {/* Left Flank */}
                            <div className="flex flex-col gap-16 pointer-events-auto pl-2 md:pl-12">
                                {investigators.filter((_, i) => i % 2 === 0).map(inv => {
                                    const companionObj = {
                                        id: inv.id,
                                        characterName: inv.name || 'Desconhecido',
                                        occupation: inv.occupation || 'Sem Ocupação',
                                        playerName: 'Jogador', // Em uma implementação futura, dar fetch do profiles.username
                                        isCurrentUser: false,
                                        avatar: inv.avatar || null,
                                        portrait: inv.portrait || inv.personalData?.portrait || null,
                                        hp: inv.derivedStats?.hp || { current: 0, max: 0 },
                                        sanity: inv.derivedStats?.sanity || { current: 0, max: 0 },
                                        mp: inv.derivedStats?.magicPoints || { current: 0, max: 0 },
                                        isMajorWound: inv.isMajorWound || false,
                                        madnessState: inv.madnessState || 'normal',
                                        inventory: inv.inventory || []
                                    };

                                    return (
                                        <div key={inv.id} className="relative group perspective-1000 rotate-[4deg] hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 origin-left shadow-2xl">
                                            {/* Ferramentas do Guardião Hover */}
                                            <div className="absolute -top-12 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); setInvestigator(inv); setSelectedId(inv.id); setShowItemModal(true); }}
                                                    className="h-8 bg-green-900 hover:bg-green-800 text-green-100 border border-green-700 font-serif text-xs shadow-lg"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Dar Item
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); setInvestigator(inv); setSelectedId(inv.id); setShowRollModal(true); }}
                                                    className="h-8 bg-[#2a1a10] hover:bg-black/80 text-[var(--color-mythos-gold)] border border-[var(--color-mythos-gold-dim)] font-serif text-xs shadow-lg"
                                                >
                                                    Pedir Teste
                                                </Button>
                                            </div>
                                            <CompanionCard companion={companionObj} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Center Table Atmosphere */}
                            <div className="hidden lg:flex flex-col items-center justify-center pointer-events-none relative w-full px-8">
                                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--color-mythos-gold)]/10 rounded-full blur-[100px] mix-blend-screen" />
                            </div>

                            {/* Right Flank */}
                            <div className="flex flex-col gap-16 pointer-events-auto items-end pr-2 md:pr-12">
                                {investigators.filter((_, i) => i % 2 !== 0).map(inv => {
                                    const companionObj = {
                                        id: inv.id,
                                        characterName: inv.name || 'Desconhecido',
                                        occupation: inv.occupation || 'Sem Ocupação',
                                        playerName: 'Jogador',
                                        isCurrentUser: false,
                                        avatar: inv.avatar || null,
                                        portrait: inv.portrait || inv.personalData?.portrait || null,
                                        hp: inv.derivedStats?.hp || { current: 0, max: 0 },
                                        sanity: inv.derivedStats?.sanity || { current: 0, max: 0 },
                                        mp: inv.derivedStats?.magicPoints || { current: 0, max: 0 },
                                        isMajorWound: inv.isMajorWound || false,
                                        madnessState: inv.madnessState || 'normal',
                                        inventory: inv.inventory || []
                                    };

                                    return (
                                        <div key={inv.id} className="relative group perspective-1000 -rotate-[4deg] hover:rotate-0 hover:scale-105 hover:z-50 transition-all duration-500 origin-right shadow-2xl">
                                            {/* Ferramentas do Guardião Hover */}
                                            <div className="absolute -top-12 left-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); setInvestigator(inv); setSelectedId(inv.id); setShowItemModal(true); }}
                                                    className="h-8 bg-green-900 hover:bg-green-800 text-green-100 border border-green-700 font-serif text-xs shadow-lg"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" /> Dar Item
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={(e) => { e.stopPropagation(); setInvestigator(inv); setSelectedId(inv.id); setShowRollModal(true); }}
                                                    className="h-8 bg-[#2a1a10] hover:bg-black/80 text-[var(--color-mythos-gold)] border border-[var(--color-mythos-gold-dim)] font-serif text-xs shadow-lg"
                                                >
                                                    Pedir Teste
                                                </Button>
                                            </div>
                                            <CompanionCard companion={companionObj} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals for Roll Request and Character Sheet overlaying everything */}
            {selectedId && investigator && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 sm:p-6 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-7xl max-h-[95vh] flex flex-col xl:flex-row gap-6">

                        {showRollModal ? (
                            <div className="bg-[#120a0a] border border-[var(--color-mythos-gold-dim)] rounded w-full xl:w-[400px] shrink-0 p-6 flex flex-col shadow-2xl overflow-y-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-sm font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest">Solicitar Teste</h3>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">Alvo: {investigator.name}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-10 h-10" onClick={() => setShowRollModal(false)}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs text-[var(--color-mythos-gold-dim)] uppercase tracking-wider font-bold">Tipo de Teste (Ex: Sanidade, Lutar)</label>
                                        <input
                                            type="text"
                                            value={rollSkillName}
                                            onChange={e => setRollSkillName(e.target.value)}
                                            className="w-full bg-black border-2 border-[var(--color-mythos-gold-dim)]/50 p-3 text-[var(--color-mythos-gold)] font-[family-name:--font-typewriter] text-lg focus:outline-none focus:border-[var(--color-mythos-gold)]"
                                            placeholder="Digite aqui..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <p className="text-xs text-[var(--color-mythos-gold-dim)] mb-1">Valor Alvo (Abaixo de)</p>
                                            <input
                                                type="number"
                                                value={rollTargetValue}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRollTargetValue(e.target.value)}
                                                placeholder="Ex: 50"
                                                className="w-full bg-black/50 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] p-2 rounded focus:outline-none focus:border-[var(--color-mythos-gold)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mt-4 bg-[#1a0f0a] border border-[var(--color-mythos-blood)]/40 p-3 rounded shadow-inner">
                                        <input
                                            type="checkbox"
                                            id="blindRoll"
                                            className="accent-[var(--color-mythos-blood)] w-4 h-4 cursor-pointer"
                                            checked={rollIsBlind}
                                            onChange={(e) => setRollIsBlind(e.target.checked)}
                                        />
                                        <label htmlFor="blindRoll" className="text-sm font-serif text-[var(--color-mythos-gold-dim)] cursor-pointer flex-1">
                                            <strong className="text-[var(--color-mythos-blood)] tracking-wider">Rolagem Oculta (Blind Roll)</strong>
                                            <span className="block text-[10px] text-stone-500">O jogador não o resultado real do dado. Apenas você verá o que aconteceu.</span>
                                        </label>
                                    </div>

                                    <div className="flex justify-end gap-2 mt-6">
                                        <div className="space-y-2">
                                            <label className="text-xs text-[var(--color-mythos-gold-dim)] uppercase tracking-wider font-bold">Qtd. Dados</label>
                                            <input
                                                type="number"
                                                value={rollDiceCount}
                                                onChange={e => setRollDiceCount(e.target.value)}
                                                className="w-full bg-black border-2 border-[var(--color-mythos-gold-dim)]/50 p-2 text-center text-[var(--color-mythos-gold)] font-mono"
                                                min="1"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-[var(--color-mythos-gold-dim)] uppercase tracking-wider font-bold">Tipo (Faces)</label>
                                            <Select value={rollDiceType} onValueChange={setRollDiceType}>
                                                <SelectTrigger className="w-full bg-black border-2 border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] font-mono h-[42px]">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#120a0a] border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-gold)] font-mono">
                                                    <SelectItem value="d100">d100</SelectItem>
                                                    <SelectItem value="d20">d20</SelectItem>
                                                    <SelectItem value="d10">d10</SelectItem>
                                                    <SelectItem value="d8">d8</SelectItem>
                                                    <SelectItem value="d6">d6</SelectItem>
                                                    <SelectItem value="d4">d4</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSendRollRequest}
                                        className="w-full py-6 mt-4 bg-[#2a1a10] hover:bg-[var(--color-mythos-gold)] hover:text-black border border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] font-serif uppercase tracking-widest text-lg transition-colors group"
                                    >
                                        <Zap className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                                        FORÇAR TESTE
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#120a0a] border border-[var(--color-mythos-gold-dim)] rounded w-full max-w-[400px] shrink-0 p-6 flex flex-col shadow-2xl relative">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="text-sm font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest">Ações do Guardião</h3>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">Alvo: {investigator.name}</p>
                                    </div>
                                    <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-10 h-10" onClick={handleClose}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-4 flex-1">
                                    <Button
                                        onClick={() => setShowRollModal(true)}
                                        className="w-full py-4 bg-black hover:bg-[#2a1a10] border border-[var(--color-mythos-gold-dim)]/30 hover:border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold-dim)] hover:text-[var(--color-mythos-gold)] font-serif uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Painel de Testes Rápidos
                                    </Button>
                                    <Button
                                        onClick={() => setShowItemModal(true)}
                                        className="w-full py-4 bg-green-950/20 hover:bg-green-900 border border-green-900/30 hover:border-green-700 text-green-600 hover:text-green-300 font-serif uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Enviar Carta Físico / Item
                                    </Button>
                                    <Button
                                        onClick={() => setShowStatusModal(true)}
                                        className="w-full py-4 bg-purple-950/20 hover:bg-purple-900 border border-purple-900/30 hover:border-purple-700 text-purple-600 hover:text-purple-300 font-serif uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Surtos & Agonias (Status)
                                    </Button>
                                    <Button
                                        onClick={() => setShowSheetModal(true)}
                                        className="w-full py-4 bg-blue-950/20 hover:bg-blue-900 border border-blue-900/30 hover:border-blue-700 text-blue-600 hover:text-blue-300 font-serif uppercase tracking-widest text-xs transition-colors"
                                    >
                                        Ver Ficha Completa
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Character Sheet Modal Overlaying everything in this modal context */}
            {showSheetModal && (
                <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col p-4 sm:p-8 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-7xl mx-auto flex flex-col h-full bg-[#120a0a] border border-[var(--color-mythos-gold-dim)] rounded-md shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--color-mythos-gold-dim)]/30 bg-black/50 shrink-0">
                            <div>
                                <h3 className="text-2xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest drop-shadow-md">Ficha do Investigador</h3>
                                <p className="text-sm text-[var(--color-mythos-gold-dim)] font-serif mt-1">Acessando {investigator.name}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-10 h-10" onClick={() => setShowSheetModal(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold)] scrollbar-track-black/20 p-6 bg-[#0a0808]">
                            <CharacterSheetDisplay
                                investigator={investigator}
                                onAttributeChange={handleAttributeChange}
                                onInfoChange={handleInfoChange}
                                onSkillChange={handleSkillChange}
                                onClose={() => setShowSheetModal(false)}
                                isDialog={true}
                                isReadOnly={true}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Item Distribution Modal Overlaying everything in this modal context */}
            {showItemModal && (
                <div className="absolute inset-0 z-[60] bg-black/95 flex flex-col p-4 sm:p-8 backdrop-blur-md animate-in fade-in">
                    <div className="w-full max-w-7xl mx-auto flex flex-col h-full bg-[#120a0a] border border-[var(--color-mythos-gold-dim)] rounded-md shadow-2xl relative overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-[var(--color-mythos-gold-dim)]/30 bg-black/50 shrink-0">
                            <div>
                                <h3 className="text-2xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest drop-shadow-md">Catálogo de Itens</h3>
                                <p className="text-sm text-[var(--color-mythos-gold-dim)] font-serif mt-1">Enviar para {investigator.name}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-red-900/30 w-10 h-10" onClick={() => setShowItemModal(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Search Bar */}
                        <div className="p-4 bg-black/80 border-b border-[var(--color-mythos-gold-dim)]/30 shrink-0">
                            <input
                                type="text"
                                placeholder="Buscar item por nome ou tipo..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#1a1815] border border-[var(--color-mythos-gold-dim)]/50 p-3 text-[var(--color-mythos-gold)] font-serif focus:outline-none focus:border-[var(--color-mythos-gold)] placeholder:text-[var(--color-mythos-gold-dim)]/50"
                            />
                        </div>

                        {/* Catalog Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[url('/paper-texture.png')] bg-cover" style={{ backgroundBlendMode: 'multiply', backgroundColor: 'rgba(20, 20, 20, 0.95)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {MASTER_ITEMS_DB.filter(item =>
                                    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    item.description.toLowerCase().includes(searchQuery.toLowerCase())
                                ).map(item => (
                                    <div
                                        key={item.id}
                                        className="bg-[#1a1815] text-[var(--color-mythos-parchment)] border border-[var(--color-mythos-gold-dim)]/30 rounded-md p-4 shadow-xl relative cursor-pointer hover:border-[var(--color-mythos-gold)] hover:-translate-y-1 transition-all flex flex-col gap-4 group"
                                        onClick={() => handleSendItemToPlayer(item)}
                                    >
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

                                        {/* Enviar hover overlay */}
                                        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[var(--color-mythos-gold)] z-20 rounded-md backdrop-blur-sm">
                                            <Heart className="w-10 h-10 mb-3 animate-pulse text-[var(--color-mythos-blood)] drop-shadow-[0_0_15px_rgba(150,0,0,0.8)]" />
                                            <span className="font-bold font-serif uppercase tracking-widest text-base drop-shadow-md">Entregar Item</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showStatusModal && (
                <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-[#120a0a] border-2 border-[var(--color-mythos-blood)] rounded-md shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6 border-b border-[var(--color-mythos-blood)]/30 pb-4">
                            <div>
                                <h3 className="text-xl font-heading text-[var(--color-mythos-blood)] uppercase tracking-widest">Surtos & Agonias</h3>
                                <p className="text-[10px] text-gray-500 font-mono mt-1">Alvo: {investigator?.name}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-[var(--color-mythos-blood)] hover:text-red-400" onClick={() => setShowStatusModal(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        <div className="space-y-6 flex flex-col">
                            <Button
                                onClick={() => handleToggleStatus('isMajorWound', !investigator?.isMajorWound)}
                                className={`w-full py-6 font-serif uppercase tracking-widest border border-red-900 ${investigator?.isMajorWound ? 'bg-[var(--color-mythos-blood)] text-white font-bold' : 'bg-black text-[var(--color-mythos-blood)] hover:bg-red-950/30'}`}
                            >
                                <Heart className="w-5 h-5 mr-2" />
                                {investigator?.isMajorWound ? 'Curar Ferimento Maior' : 'Causar Ferimento Maior'}
                            </Button>

                            <hr className="border-[var(--color-mythos-gold-dim)]/20" />

                            <Button
                                onClick={() => handleToggleStatus('madnessState', 'normal')}
                                className={`w-full py-3 font-serif uppercase border border-gray-700 ${!investigator?.madnessState || investigator.madnessState === 'normal' ? 'bg-gray-800 text-white' : 'bg-black text-gray-400 hover:bg-gray-900'}`}
                            >
                                Mente Sã (Normal)
                            </Button>

                            <Button
                                onClick={() => handleToggleStatus('madnessState', 'bout_of_madness')}
                                className={`w-full py-4 font-serif uppercase tracking-widest border border-purple-900 ${investigator?.madnessState === 'bout_of_madness' ? 'bg-[#8822aa] text-white font-bold animate-pulse' : 'bg-black text-[#eeaaff] hover:bg-purple-950/30'}`}
                            >
                                <Brain className="w-5 h-5 mr-2" />
                                Surto de Loucura
                            </Button>

                            <Button
                                onClick={() => handleToggleStatus('madnessState', 'underlying_insanity')}
                                className={`w-full py-4 font-serif uppercase tracking-widest border border-blue-900 ${investigator?.madnessState === 'underlying_insanity' ? 'bg-[#1144bb] text-white font-bold' : 'bg-black text-[#aaaaff] hover:bg-blue-950/30'}`}
                            >
                                <Brain className="w-5 h-5 mr-2" />
                                Loucura Inerente
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* Live Rolls Sidebar Log (Right Panel) */}
            {selectedSessionId !== 'ALL' && activeRolls.length > 0 && (
                <div className="fixed top-24 right-4 bottom-4 w-72 pointer-events-none z-[60] flex flex-col justify-end pb-8">
                    <div className="pointer-events-auto flex flex-col gap-3">
                        {activeRolls.map((roll, index) => {
                            const inv = investigators.find(i => i.id === roll.investigator_id);
                            const rollTime = new Date(roll.created_at).getTime();
                            const ageInSeconds = Math.floor((Date.now() - rollTime) / 1000);
                            const ageWarning = ageInSeconds > 90 ? 'opacity-50 blur-[1px] hover:blur-none hover:opacity-100 transition-all' : '';

                            return (
                                <div key={roll.id} className={`bg-[#e8e6df] text-black border border-gray-400 p-3 rounded-sm shadow-xl relative animate-in slide-in-from-right duration-300 ${ageWarning} bg-[url('/paper-texture.png')] bg-cover`} style={{ backgroundBlendMode: 'multiply' }}>
                                    {/* Retrato miniatura estilo clip */}
                                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full border border-black overflow-hidden bg-black shadow-md z-10">
                                        {inv?.portrait || inv?.personalData?.portrait ? (
                                            <img src={inv.portrait || inv.personalData?.portrait} className="w-full h-full object-cover sepia-[0.3]" alt={inv?.name} />
                                        ) : (
                                            <div className="w-full h-full bg-gray-500 flex justify-center items-center text-white text-[8px] font-bold font-serif overflow-hidden leading-tight">Mug</div>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-start ml-5 mb-2">
                                        <span className="text-xs font-[family-name:--font-typewriter] font-bold truncate max-w-[120px] uppercase text-black">{inv?.name || 'Desconhecido'}</span>
                                        <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 border shadow-sm ${roll.status === 'PENDING' ? 'bg-yellow-200 text-black border-yellow-400' : 'bg-gray-800 text-white border-black'} ${roll.is_blind ? 'ring-2 ring-[var(--color-mythos-blood)] ring-offset-1 ring-offset-[#f4e4bc]' : ''}`}>
                                            {roll.status === 'PENDING' ? 'Em Andamento' : 'Realizado'} {roll.is_blind && '(Oculto)'}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex justify-between items-end border-t border-black/20 pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-serif font-bold text-black uppercase leading-tight">{roll.skill_name}</span>
                                            <span className="opacity-70 font-mono text-[10px]">({roll.dice_count || 1}{roll.dice_type || 'd100'}) {roll.target_value != null && <span>Alvo: {roll.target_value}</span>}</span>
                                        </div>
                                        {roll.status === 'ROLLED' ? (
                                            <div className="flex flex-col items-end pl-2">
                                                <span className={`text-2xl font-bold font-[family-name:--font-typewriter] leading-none ${roll.result_type?.includes('FAIL') ? 'text-red-800' : 'text-green-800'}`}>{roll.result_roll}</span>
                                                {roll.result_type && (
                                                    <span className={`text-[8px] tracking-widest uppercase font-bold ${roll.result_type?.includes('FAIL') ? 'text-red-700' : 'text-green-700'}`}>{roll.result_type}</span>
                                                )}
                                            </div>
                                        ) : (
                                            <Zap className="w-5 h-5 text-yellow-600 animate-pulse ml-2" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showPinboard && typeof window !== 'undefined' && require('react-dom').createPortal(
                <Pinboard
                    sessionId={selectedSessionId}
                    onClose={() => setShowPinboard(false)}
                    isGM={true}
                />,
                document.body
            )}

            {/* Soundpad Modal */}
            {showSoundModal && (
                <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-[#120a0a] border border-[var(--color-mythos-gold-dim)] rounded w-full max-w-lg p-6 shadow-2xl relative">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-heading text-[var(--color-mythos-gold)] tracking-widest uppercase">Mesa de Som (Soundpad)</h3>
                                <p className="text-xs text-stone-500 font-serif mt-1">Dispare efeitos sonoros diretamente nos navegadores dos jogadores.</p>
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-400 hover:bg-black/20" onClick={() => setShowSoundModal(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-64 overflow-y-auto pr-2">
                            {[
                                { name: "Batida na Porta", url: "https://www.soundjay.com/door/sounds/door-knock-1.mp3" },
                                { name: "Passos Lentos", url: "https://www.soundjay.com/human/sounds/footsteps-4.mp3" },
                                { name: "Passos Correndo", url: "https://www.soundjay.com/human/sounds/running-1.mp3" },
                                { name: "Sussurros Incompreensíveis", url: "https://pixabay.com/audio/download/whispering-8106.mp3" },
                                { name: "Grito Homem Longe", url: "https://pixabay.com/audio/download/man-scream-121085.mp3" },
                                { name: "Grito Mulher Terror", url: "https://pixabay.com/audio/download/female-scream-117355.mp3" },
                                { name: "Respiração Ofegante", url: "https://www.soundjay.com/human/sounds/breath-01.mp3" },
                                { name: "Coração Acelerado", url: "https://www.soundjay.com/human/sounds/heartbeat-01a.mp3" },
                                { name: "Vidro Quebrando", url: "https://www.soundjay.com/misc/sounds/glass-breaking-1.mp3" },
                                { name: "Cão Uivando", url: "https://www.soundjay.com/nature/sounds/dog-howling-1.mp3" },
                                { name: "Corvos (Agouro)", url: "https://www.soundjay.com/nature/sounds/crows-1.mp3" },
                                { name: "Madness Drone", url: "https://pixabay.com/audio/download/dark-ambient-drone-117240.mp3" }
                            ].map((snd, idx) => (
                                <Button
                                    key={idx}
                                    onClick={() => handlePlaySound(snd.url)}
                                    className="h-16 flex flex-col items-center justify-center bg-black hover:bg-[#2a1a10] border border-[var(--color-mythos-gold-dim)]/30 hover:border-[var(--color-mythos-gold)] transition-colors group"
                                >
                                    <Volume2 className="w-4 h-4 text-[var(--color-mythos-gold-dim)] group-hover:text-[var(--color-mythos-gold)] mb-1 shrink-0" />
                                    <span className="text-xs font-serif uppercase tracking-widest text-stone-300 group-hover:text-[var(--color-mythos-gold)] truncate w-full text-center px-2">{snd.name}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
