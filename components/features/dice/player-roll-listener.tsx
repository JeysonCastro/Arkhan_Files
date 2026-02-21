"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Skull, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayerRollListenerProps {
    sessionId: string;
    investigatorId: string;
}

export function PlayerRollListener({ sessionId, investigatorId }: PlayerRollListenerProps) {
    const [activeRequest, setActiveRequest] = useState<any>(null);
    const [isRolling, setIsRolling] = useState(false);
    const [rollResult, setRollResult] = useState<{ number: number, type: string | null } | null>(null);

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

            setRollResult({ number: total, type: successType });

            // Extrair o token atual para enviar no POST puro contornando falhas no Supabase Client
            supabase.auth.getSession().then(({ data: { session } }) => {
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                const accessToken = session?.access_token || anonKey;

                // Fire-and-forget RAW PATCH request
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

            // Auto-dismiss after 3 seconds
            setTimeout(() => {
                setActiveRequest(null);
                setRollResult(null);
            }, 4000);

        }, 1000);
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
                <Skull className="absolute -right-10 -bottom-10 w-64 h-64 text-black/40 rotate-12 z-0" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div>
                        <h2 className="text-2xl font-black font-heading tracking-widest uppercase text-[var(--color-mythos-blood)] mb-2">O Guardião Exige um Teste!</h2>
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
                            {isRolling ? (
                                <span className="animate-pulse flex items-center gap-2"><Dices className="animate-spin" /> Rolando...</span>
                            ) : (
                                `Rolar ${activeRequest.dice_count || 1}${activeRequest.dice_type || 'd100'}`
                            )}
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center space-y-2 animate-in zoom-in-50 duration-500">
                            <span className="text-7xl font-black text-[var(--color-mythos-parchment)] shadow-black drop-shadow-lg">
                                {rollResult.number}
                            </span>
                            {rollResult.type && (
                                <span className={`text-2xl font-bold uppercase tracking-widest ${getSuccessColor(rollResult.type)} shadow-black drop-shadow-md`}>
                                    {rollResult.type}
                                </span>
                            )}
                            <p className="text-[var(--color-mythos-gold-dim)]/50 text-xs mt-4 italic">Notificando o Guardião...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
