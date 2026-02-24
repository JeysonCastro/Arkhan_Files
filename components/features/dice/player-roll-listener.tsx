"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skull, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedDice, DiceType } from "@/components/features/dice/animated-dice";

interface PlayerRollListenerProps {
    sessionId: string;
    investigatorId: string;
    currentLuck: number; // Added to know how much luck the player has
    onSpendLuck?: (amount: number) => void;
}

export function PlayerRollListener({ sessionId, investigatorId, currentLuck = 0, onSpendLuck }: PlayerRollListenerProps) {
    const [activeRequest, setActiveRequest] = useState<any>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [isPushing, setIsPushing] = useState(false);
    const [rollResult, setRollResult] = useState<{ number: number, type: string | null } | null>(null);
    const [visualDiceResult, setVisualDiceResult] = useState<number | null>(null);
    const [spendingLuck, setSpendingLuck] = useState(false);

    useEffect(() => {
        if (!sessionId || !investigatorId) return;

        // Fetch any existing pending request first
        const fetchPending = async () => {
            const { data } = await supabase
                .from('roll_requests')
                .select('*')
                .eq('session_id', sessionId)
                .eq('investigator_id', investigatorId)
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) setActiveRequest(data);
        };

        fetchPending();

        // Subscribe to real-time incoming requests
        const subscription = supabase
            .channel(`player_rolls_${investigatorId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'roll_requests',
                filter: `investigator_id=eq.${investigatorId}`
            }, (payload) => {
                if (payload.new.status === 'PENDING' && payload.new.session_id === sessionId) {
                    setActiveRequest(payload.new);
                    setRollResult(null); // Reset prev state
                    setVisualDiceResult(null);
                    setSpendingLuck(false);
                    setIsPushing(false);
                }
            })
            // Listen to updates in case the GM cancels it or something (optional)
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, [sessionId, investigatorId]);

    const calculateDegreeOfSuccess = (roll: number, target: number) => {
        if (roll === 1) return "CRITICAL";
        if (roll >= 96 && target < 50) return "FUMBLE";
        if (roll === 100) return "FUMBLE";
        if (roll <= Math.floor(target / 5)) return "EXTREME";
        if (roll <= Math.floor(target / 2)) return "HARD";
        if (roll <= target) return "SUCCESS";
        return "FAILURE";
    };

    const dismissRoll = () => {
        setActiveRequest(null);
        setRollResult(null);
        setVisualDiceResult(null);
        setSpendingLuck(false);
        setIsPushing(false);
    };

    const handleRoll = async () => {
        if (!activeRequest || isRolling) return;
        setIsRolling(true);

        // Fake suspense timeout
        setTimeout(async () => {
            const diceTypeStr = activeRequest.dice_type || 'd100';
            const sides = parseInt(diceTypeStr.replace('d', '')) || 100;
            const count = activeRequest.dice_count || 1;

            let total = 0;
            for (let i = 0; i < count; i++) {
                total += Math.floor(Math.random() * sides) + 1;
            }

            let successType: string | null = null;
            if (diceTypeStr === 'd100' && activeRequest.target_value != null) {
                successType = calculateDegreeOfSuccess(total, activeRequest.target_value);
            }

            setVisualDiceResult(total);

            // Wait 1.5s after the "roll" finishes before showing the final result card
            setTimeout(() => {
                setRollResult({ number: total, type: successType });

                // If it's a failure (but not a fumble usually, check rules) 
                // and they have enough luck, give them a chance to spend it before auto-dismissing.
                const isFumble = successType === 'FUMBLE';
                const isFailure = successType === 'FAILURE';
                const needsLuck = isFailure && activeRequest.target_value != null;
                const luckNeeded = total - activeRequest.target_value;
                const canAffordLuck = currentLuck >= luckNeeded && luckNeeded > 0;

                // Allow push roll ONLY on regular failure (not fumble) and if we aren't already pushing it
                const canPushRoll = isFailure && !isPushing;

                if ((needsLuck && canAffordLuck) || canPushRoll) {
                    // Do not auto-dismiss or patch immediately, wait for user input
                    setIsRolling(false);
                    return;
                }

                // If logic doesn't allow saving it, proceed normally
                submitFinalRoll(total, successType);
            }, 1000); // the suspense wait time

        }, 1000); // the rolling animation time
    };

    const submitFinalRoll = (total: number, successType: string | null) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
            const accessToken = session?.access_token || anonKey;

            fetch(`${supabaseUrl}/rest/v1/roll_requests?id=eq.${activeRequest.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': anonKey!,
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    status: 'ROLLED',
                    result_roll: total,
                    result_type: successType
                })
            })
                .then(res => {
                    if (!res.ok) console.error("Falha ao registrar rolagem. Status HTTP:", res.status);
                    else console.log("Rolagem atualizada com sucesso no banco de dados.");
                })
                .catch(err => console.error("Erro na comunicação fetch:", err));
        });

        setIsRolling(false);
        setSpendingLuck(false);

        // Auto-dismiss after 4 seconds
        setTimeout(dismissRoll, 4000);
    };

    const handleSpendLuck = () => {
        if (!rollResult || !activeRequest || activeRequest.target_value == null) return;

        const luckNeeded = rollResult.number - activeRequest.target_value;
        if (currentLuck >= luckNeeded && luckNeeded > 0) {
            setSpendingLuck(true);

            // Assuming the parent component passes a handler to actually deduct the luck locally/remotely
            if (onSpendLuck) {
                onSpendLuck(luckNeeded);
            }

            // Update local state to show success
            const newTotal = rollResult.number; // Keep the original dice number visually? In CoC 7e, you just "buy" the success.
            setRollResult({ number: newTotal, type: "SUCCESS_WITH_LUCK" });

            // Submit the adjusted roll
            submitFinalRoll(newTotal, "SUCCESS_WITH_LUCK");
        }
    };

    const handlePushRoll = () => {
        setIsPushing(true);
        setRollResult(null); // Reset the result view
        handleRoll(); // Roll again, but now under 'isPushing' tension
    };

    const handleAcceptFailure = () => {
        if (!rollResult) return;
        submitFinalRoll(rollResult.number, rollResult.type);
    };

    if (!activeRequest) return null;

    const getSuccessColor = (type: string | null) => {
        if (!type) return 'text-white';
        switch (type) {
            case 'CRITICAL': return 'text-blue-400';
            case 'EXTREME': return 'text-[var(--color-mythos-gold)]';
            case 'HARD': return 'text-green-400';
            case 'SUCCESS': return 'text-green-600';
            case 'FAILURE': return 'text-red-400';
            case 'FUMBLE': return 'text-red-600 font-bold';
            default: return 'text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`bg-[#120a0a] border-2 w-full max-w-md p-8 rounded-lg shadow-2xl relative overflow-hidden transition-colors duration-500
                ${rollResult?.type === 'FUMBLE' ? 'border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)]' :
                    rollResult?.type === 'CRITICAL' ? 'border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)]' :
                        rollResult ? 'border-[var(--color-mythos-gold)] shadow-[0_0_50px_rgba(184,134,11,0.2)]' :
                            'border-[var(--color-mythos-blood)] animate-pulse shadow-[0_0_30px_rgba(139,0,0,0.4)]'
                }`}
            >
                {/* Background Texture/Icon */}
                <Skull className={`absolute -right-10 -bottom-10 w-64 h-64 text-black/40 rotate-12 z-0 ${isPushing ? 'animate-pulse text-red-900/30' : ''}`} />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div>
                        <h2 className="text-2xl font-black font-heading tracking-widest uppercase text-[var(--color-mythos-blood)] mb-2">
                            {isPushing ? "Forçando a Sorte..." : "O Guardião Exige um Teste!"}
                        </h2>
                        <p className="text-[var(--color-mythos-gold-dim)] italic text-lg font-serif">
                            Role <strong className="text-[var(--color-mythos-gold)] uppercase ml-1">{activeRequest.dice_count || 1}{activeRequest.dice_type || 'd100'}</strong> para <strong className="text-[var(--color-mythos-gold)] uppercase ml-1">{activeRequest.skill_name}</strong>
                        </p>
                        {activeRequest.target_value != null && (
                            <p className="text-sm mt-1 text-gray-500">Valor Alvo: {activeRequest.target_value}</p>
                        )}
                    </div>

                    {!rollResult ? (
                        <Button
                            onClick={handleRoll}
                            disabled={isRolling}
                            size="lg"
                            className="bg-[var(--color-mythos-blood)] hover:bg-red-800 text-white font-bold text-xl uppercase tracking-wider py-8 px-12 rounded shadow-[0_0_20px_rgba(139,0,0,0.5)] transition-transform hover:scale-105"
                        >
                            Rolar {activeRequest.dice_count || 1}{activeRequest.dice_type || 'd100'}
                        </Button>
                    ) : isRolling ? (
                        <div className="flex flex-col items-center justify-center p-8">
                            <AnimatedDice
                                type={(activeRequest.dice_type as DiceType) || 'd100'}
                                isRolling={true}
                                value={null}
                                size="lg"
                                color="text-[var(--color-mythos-gold)]"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-2 animate-in zoom-in-50 duration-500">
                            {activeRequest.is_blind ? (
                                <>
                                    <span className="text-7xl font-black text-[var(--color-mythos-blood)] shadow-black drop-shadow-lg animate-pulse" style={{ textShadow: '0 0 20px rgba(220,20,20,0.8)' }}>
                                        ???
                                    </span>
                                    <span className="text-xl font-bold uppercase tracking-widest text-[var(--color-mythos-gold-dim)] shadow-black drop-shadow-md text-center max-w-xs mt-4">
                                        Os dados foram lançados nas sombras. Apenas o Guardião sabe o que se aproxima...
                                    </span>
                                    {/* Botão de Fechar Direto para Blind Rolls */}
                                    <div className="mt-8">
                                        <Button onClick={handleAcceptFailure} variant="ghost" className="text-gray-400 hover:text-white border border-gray-800 rounded px-8">
                                            Aguardar o Destino
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="text-7xl font-black text-[var(--color-mythos-parchment)] shadow-black drop-shadow-lg">
                                        {rollResult.number}
                                    </span>
                                    {rollResult.type && (
                                        <span className={`text-2xl font-bold uppercase tracking-widest ${getSuccessColor(rollResult.type)} shadow-black drop-shadow-md`}>
                                            {rollResult.type === "SUCCESS_WITH_LUCK" ? "SUCESSO (SORTE)" : rollResult.type}
                                        </span>
                                    )}
                                </>
                            )}

                            {!activeRequest.is_blind && rollResult.type === 'FAILURE' && activeRequest.target_value != null && (
                                <div className="mt-6 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 pt-4 border-t border-[var(--color-mythos-gold-dim)]/30 w-full">
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        {/* Gastar Sorte option */}
                                        {(rollResult.number - activeRequest.target_value) <= currentLuck && (rollResult.number - activeRequest.target_value) > 0 ? (
                                            <div className="w-full flex items-center justify-between border border-[var(--color-mythos-gold-dim)]/30 p-2 rounded bg-black/40">
                                                <div className="text-left">
                                                    <p className="text-xs text-[var(--color-mythos-gold-dim)]">Gastar Sorte (Faltam {rollResult.number - activeRequest.target_value})</p>
                                                    <p className="text-[10px] text-gray-500">Sorte Atual: {currentLuck}</p>
                                                </div>
                                                <Button onClick={handleSpendLuck} disabled={spendingLuck} size="sm" className="bg-[var(--color-mythos-gold)] hover:bg-[var(--color-mythos-gold-dim)] text-black font-bold h-8">
                                                    Aceitar Preço
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-[var(--color-mythos-gold-dim)]/50 text-xs italic w-full text-center">Sem Sorte o suficiente para comprar o sucesso.</p>
                                        )}

                                        {/* Push Roll option */}
                                        {!isPushing && (
                                            <div className="w-full flex items-center justify-between border border-red-900/50 p-2 rounded bg-red-950/20">
                                                <div className="text-left">
                                                    <p className="text-xs text-red-500 font-bold">Forçar Rolagem</p>
                                                    <p className="text-[10px] text-red-400">Rolar novamente. Uma falha trará desastre.</p>
                                                </div>
                                                <Button onClick={handlePushRoll} className="bg-red-900 hover:bg-red-800 text-white font-bold h-8 border border-red-600 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                                                    Tentar a Sorte
                                                </Button>
                                            </div>
                                        )}

                                        <Button onClick={handleAcceptFailure} variant="ghost" className="text-gray-400 hover:text-white mt-2 w-full border-t border-gray-800 rounded-none">
                                            Aceitar Falha
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Disable auto text for blind rolls cause we added a button */}
                            {!activeRequest.is_blind && rollResult.type !== 'FAILURE' && !spendingLuck && (
                                <p className="text-[var(--color-mythos-gold-dim)]/50 text-xs mt-4 italic">Notificando o Guardião...</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
