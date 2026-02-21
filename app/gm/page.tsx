"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_INVESTIGATORS } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Eye, Heart, Brain, Zap, X, Monitor, RefreshCw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Investigator } from "@/lib/types";
import CharacterSheetDisplay from "@/components/features/character-sheet/character-sheet-display";
import { useInvestigator } from "@/hooks/use-investigator";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


export default function GMPage() {
    const [investigators, setInvestigators] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Session Management
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string>('ALL');
    const [isCreatingSession, setIsCreatingSession] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // Roll Requests
    const [activeRolls, setActiveRolls] = useState<any[]>([]);
    const [showRollModal, setShowRollModal] = useState(false);
    const [rollSkillName, setRollSkillName] = useState("");
    const [rollTargetValue, setRollTargetValue] = useState("");

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
                        occupation: payload.new.occupation
                    };

                    setInvestigators(prev => {
                        const idx = prev.findIndex(c => c.id === payload.new.id);
                        if (idx !== -1) {
                            const newList = [...prev];
                            newList[idx] = newData;
                            return newList;
                        }
                        return prev;
                    });

                    // Se o GM estiver focado nesse investigador, atualize a ficha do hook local:
                    setInvestigator(prevInv => {
                        if (prevInv && prevInv.id === payload.new.id) {
                            return newData;
                        }
                        return prevInv;
                    });
                }
            )
            .subscribe((status) => {
                console.log("Supabase GM Investigator Realtime Status:", status);
            });

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [user, selectedSessionId, isLoadingData]);

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
                occupation: row.occupation
            }));

            setInvestigators(mapped);
        } catch (err: any) {
            console.error(err);
            setFetchError(err.message || 'Erro ao carregar investigadores da sessão.');
        } finally {
            setIsLoadingData(false);
        }
    };

    if (isLoading || !user || user.role !== 'KEEPER') return <div className="p-8 text-[var(--color-mythos-parchment)] animate-pulse">Acessando Arquivos Confidenciais...</div>;

    const handleSelectInvestigator = (inv: Investigator) => {
        setInvestigator(inv); // Initialize the hook with the selected data
        setSelectedId(inv.id);
    };

    const handleClose = () => {
        setSelectedId(null);
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
                target_value: parseInt(rollTargetValue),
                status: 'PENDING'
            }]);

            if (error) throw error;

            setShowRollModal(false);
            setRollSkillName("");
            setRollTargetValue("");
        } catch (err) {
            console.error("Error creating roll request:", err);
            alert("Erro ao solicitar rolagem.");
        }
    };

    const getSuccessColor = (type: string) => {
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

                    <Button
                        onClick={handleCreateSession}
                        disabled={isCreatingSession}
                        className="bg-black/40 border border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-gold)]/10 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Sessão {isCreatingSession && '...'}
                    </Button>
                </div>

                <div className="text-right hidden sm:block">
                    <p className="text-2xl font-bold text-[var(--color-mythos-gold)]">{investigators.length}</p>
                    <p className="text-xs uppercase tracking-widest text-[var(--color-mythos-gold-dim)]">Almas Ativas</p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
                {/* Full Width Grid Container */}
                <div className="col-span-12 overflow-y-auto pr-2 pb-8">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            {investigators.map((inv) => (
                                <Card
                                    key={inv.id}
                                    onClick={() => handleSelectInvestigator(inv)}
                                    className={`cursor-pointer border-[var(--color-mythos-gold-dim)]/40 p-4 relative overflow-hidden group transition-all duration-300
                                    ${selectedId === inv.id
                                            ? 'bg-[var(--color-mythos-green)]/30 border-[var(--color-mythos-gold)] ring-1 ring-[var(--color-mythos-gold)]'
                                            : 'bg-[#120a0a] hover:border-[var(--color-mythos-blood)]/50 hover:bg-[var(--color-mythos-green)]/10'
                                        }
                            `}
                                >
                                    {/* Status Stripe */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${inv.derivedStats.hp.current < 5 ? 'bg-[var(--color-mythos-blood)] animate-pulse' :
                                        inv.derivedStats.sanity.current < 30 ? 'bg-orange-600' : 'bg-[var(--color-mythos-gold-dim)]'
                                        }`} />

                                    <div className="pl-4 flex flex-col gap-4">
                                        {/* Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-xl font-bold text-[var(--color-mythos-parchment)] font-heading">{inv.name}</h3>
                                                <p className="text-xs text-[var(--color-mythos-gold-dim)] uppercase tracking-wider">{inv.occupation}</p>
                                            </div>
                                            {selectedId === inv.id && <Eye className="w-4 h-4 text-[var(--color-mythos-gold)]" />}
                                        </div>

                                        {/* Vitals Grid - Compact for list view */}
                                        <div className="grid grid-cols-3 gap-2">
                                            {/* HP */}
                                            <div className="bg-black/40 p-1 rounded border border-[var(--color-mythos-gold-dim)]/20 flex flex-col items-center">
                                                <div className="flex items-center gap-1 text-[var(--color-mythos-blood)] mb-1">
                                                    <Heart className="w-3 h-3 fill-current" />
                                                    <span className="text-[0.6rem] font-bold uppercase">HP</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--color-mythos-parchment)]">
                                                    {inv.derivedStats.hp.current} <span className="text-[var(--color-mythos-gold-dim)] text-[0.6rem]">/ {inv.derivedStats.hp.max}</span>
                                                </span>
                                            </div>

                                            {/* Sanity */}
                                            <div className="bg-black/40 p-1 rounded border border-[var(--color-mythos-gold-dim)]/20 flex flex-col items-center">
                                                <div className="flex items-center gap-1 text-blue-400 mb-1">
                                                    <Brain className="w-3 h-3" />
                                                    <span className="text-[0.6rem] font-bold uppercase">SAN</span>
                                                </div>
                                                <span className={`text-sm font-bold ${inv.derivedStats.sanity.current < 30 ? 'text-orange-500' : 'text-[var(--color-mythos-parchment)]'}`}>
                                                    {inv.derivedStats.sanity.current}
                                                </span>
                                            </div>

                                            {/* Magic Points */}
                                            <div className="bg-black/40 p-1 rounded border border-[var(--color-mythos-gold-dim)]/20 flex flex-col items-center">
                                                <div className="flex items-center gap-1 text-purple-400 mb-1">
                                                    <Zap className="w-3 h-3 fill-current" />
                                                    <span className="text-[0.6rem] font-bold uppercase">MP</span>
                                                </div>
                                                <span className="text-sm font-bold text-[var(--color-mythos-parchment)]">
                                                    {inv.derivedStats.magicPoints.current}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal: Sheet Display */}
                {selectedId && investigator && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-300">
                        <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden border border-[var(--color-mythos-gold-dim)]/50 rounded-lg bg-[#0a0707] relative flex flex-col shadow-[0_0_50px_rgba(184,134,11,0.15)] animate-in zoom-in-95 duration-300">
                            {/* Top bar for GM actions on this investigator */}
                            <div className="absolute top-2 right-4 z-[60] flex items-center gap-2 bg-black/50 p-1 rounded-md backdrop-blur-md">
                                {selectedSessionId !== 'ALL' && (
                                    <Button
                                        size="sm"
                                        variant="mythos"
                                        onClick={() => setShowRollModal(true)}
                                        className="h-8 shadow-[0_0_10px_rgba(184,134,11,0.2)]"
                                    >
                                        Solicitar Teste
                                    </Button>
                                )}
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-900/20 bg-black/50" onClick={handleClose}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Roll Request Quick Modal overlay */}
                            {showRollModal && (
                                <div className="absolute inset-0 z-[70] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
                                    <div className="bg-[#120a0a] border-2 border-[var(--color-mythos-gold)] p-6 rounded max-w-sm w-full space-y-4">
                                        <h3 className="text-xl font-heading text-[var(--color-mythos-blood)] uppercase tracking-widest border-b border-[var(--color-mythos-gold-dim)]/30 pb-2">Exigir Rolagem</h3>
                                        <p className="text-sm text-[var(--color-mythos-parchment)]/70 italic mb-4">
                                            Força o jogador <strong>{investigator.name}</strong> a fazer um teste na tela dele.
                                        </p>

                                        <div className="space-y-4 font-serif">
                                            <div>
                                                <label className="text-xs font-bold text-[var(--color-mythos-gold)] uppercase block mb-1">Nome do Teste (Ex: Encontrar)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-black/50 border border-[var(--color-mythos-gold-dim)]/50 p-2 text-[var(--color-mythos-parchment)] rounded"
                                                    value={rollSkillName}
                                                    onChange={e => setRollSkillName(e.target.value)}
                                                    placeholder="Sanidade, Força, Escutar..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-[var(--color-mythos-gold)] uppercase block mb-1">Valor Alvo (O valor na ficha)</label>
                                                <input
                                                    type="number"
                                                    className="w-full bg-black/50 border border-[var(--color-mythos-gold-dim)]/50 p-2 text-[var(--color-mythos-parchment)] rounded"
                                                    value={rollTargetValue}
                                                    onChange={e => setRollTargetValue(e.target.value)}
                                                    placeholder="Ex: 50"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="ghost" onClick={() => setShowRollModal(false)} className="text-gray-400">Cancelar</Button>
                                            <Button variant="mythos" onClick={handleSendRollRequest}>Enviar Exigência</Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold)] scrollbar-track-black/20">
                                <CharacterSheetDisplay
                                    investigator={investigator}
                                    onAttributeChange={handleAttributeChange}
                                    onInfoChange={handleInfoChange}
                                    onSkillChange={handleSkillChange}
                                    onClose={handleClose}
                                    isDialog={true}
                                    isReadOnly={true}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Live Rolls Log (Bottom Bar) */}
            {selectedSessionId !== 'ALL' && activeRolls.length > 0 && (
                <div className="mt-4 border-t border-[var(--color-mythos-gold-dim)]/30 pt-4 shrink-0">
                    <h3 className="text-[var(--color-mythos-gold)] font-bold text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Monitor className="w-4 h-4" /> Registro de Testes da Sessão
                    </h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[var(--color-mythos-gold-dim)]">
                        {activeRolls.map(roll => {
                            const inv = investigators.find(i => i.id === roll.investigator_id);
                            return (
                                <div key={roll.id} className="min-w-[200px] bg-black/40 border border-[var(--color-mythos-gold-dim)]/30 p-2 rounded flex flex-col justify-between shrink-0">
                                    <div className="flex justify-between items-start">
                                        <span className="text-xs font-bold text-[var(--color-mythos-parchment)] truncate max-w-[120px]">{inv?.name || 'Desconhecido'}</span>
                                        <span className={`text-[10px] uppercase font-bold px-1 rounded ${roll.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-500' : 'bg-green-900/50 text-green-400'}`}>
                                            {roll.status === 'PENDING' ? 'Rolando...' : 'Feito'}
                                        </span>
                                    </div>
                                    <div className="mt-1 flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-[var(--color-mythos-gold-dim)]">{roll.skill_name} <span className="opacity-50">(Alvo: {roll.target_value})</span></span>
                                        </div>
                                        {roll.status === 'ROLLED' && (
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-bold text-[var(--color-mythos-parchment)] leading-none">{roll.result_roll}</span>
                                                <span className={`text-[10px] font-bold ${getSuccessColor(roll.result_type)}`}>{roll.result_type}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
