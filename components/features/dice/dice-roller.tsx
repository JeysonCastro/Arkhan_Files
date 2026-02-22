"use client";

import { useState, useRef, useEffect } from "react";
import { Dices, X, History } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RollResult {
    id: string;
    notation: string;
    result: number;
    timestamp: Date;
    details?: string;
}

export function DiceRoller() {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState<RollResult[]>([]);
    const [isRolling, setIsRolling] = useState(false);
    const [diceCount, setDiceCount] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Auto-scroll history container
    const historyRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = historyRef.current.scrollHeight;
        }
    }, [history]);

    const playDiceSound = () => {
        // In a real app we'd load a small mp3. For now, pretend or use a base64 tiny blip if provided.
        // Try catching in case user hasn't interacted with document
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log('Audio play prevented by browser', e));
        }
    };

    const rollDice = (sides: number, count: number = 1) => {
        if (isRolling) return;
        setIsRolling(true);
        playDiceSound();

        // Simulate roll delay for suspense
        setTimeout(() => {
            let total = 0;
            const rolls = [];
            for (let i = 0; i < count; i++) {
                const r = Math.floor(Math.random() * sides) + 1;
                total += r;
                rolls.push(r);
            }

            const newRoll: RollResult = {
                id: Math.random().toString(36).substring(7),
                notation: `${count}d${sides}`,
                result: total,
                timestamp: new Date(),
                details: count > 1 ? `[${rolls.join(', ')}]` : undefined
            };

            setHistory(prev => [...prev, newRoll].slice(-15)); // Keep last 15 rolls
            setIsRolling(false);
        }, 600);
    };

    const calculateDegreeOfSuccess = (roll: number, target: number) => {
        if (roll === 1) return { text: "CRÍTICO", color: "text-blue-400 font-bold" };
        if (roll >= 96 && target < 50) return { text: "DESASTRE", color: "text-red-500 font-bold" };
        if (roll === 100) return { text: "DESASTRE", color: "text-red-500 font-bold" };
        if (roll <= Math.floor(target / 5)) return { text: "EXTREMO", color: "text-[var(--color-mythos-gold)] font-bold" };
        if (roll <= Math.floor(target / 2)) return { text: "ÁRDUO", color: "text-green-400 font-bold" };
        if (roll <= target) return { text: "SUCESSO", color: "text-green-600" };
        return { text: "FALHA", color: "text-red-400" };
    };

    return (
        <>
            {/* The Floating Toggle Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    variant="mythos"
                    size="icon"
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-[0_0_20px_rgba(184,134,11,0.3)] hover:shadow-[0_0_30px_rgba(184,134,11,0.6)] z-50 flex items-center justify-center transition-transform hover:scale-110"
                    title="Rolar Dados"
                >
                    <Dices className="h-6 w-6 text-black" />
                </Button>
            )}

            {/* The Roller Panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 w-80 bg-[#120a0a] border-2 border-[var(--color-mythos-gold-dim)] rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-black/60 p-3 flex justify-between items-center border-b border-[var(--color-mythos-gold-dim)]/30 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-[var(--color-mythos-gold)]">
                            <Dices className="h-5 w-5" />
                            <h3 className="font-heading tracking-widest uppercase font-bold text-sm">Dados do Destino</h3>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6 text-gray-400 hover:text-white">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Settings / Quantity */}
                    <div className="px-4 pt-3 flex items-center justify-between border-b border-[var(--color-mythos-gold-dim)]/20 pb-2">
                        <span className="text-xs font-bold text-[var(--color-mythos-gold-dim)] tracking-widest uppercase">Quantidade de Dados:</span>
                        <div className="flex items-center">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-r-none border-[var(--color-mythos-gold-dim)]/50 bg-black text-[var(--color-mythos-parchment)]"
                                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                            >
                                -
                            </Button>
                            <input
                                type="number"
                                min={1}
                                max={20}
                                value={diceCount}
                                onChange={(e) => setDiceCount(Math.max(1, parseInt(e.target.value) || 1))}
                                className="h-6 w-12 text-center text-xs font-bold bg-black text-[var(--color-mythos-parchment)] border-y border-[var(--color-mythos-gold-dim)]/50 focus:outline-none"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-6 w-6 rounded-l-none border-[var(--color-mythos-gold-dim)]/50 bg-black text-[var(--color-mythos-parchment)]"
                                onClick={() => setDiceCount(Math.min(20, diceCount + 1))}
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    {/* Quick Rolls */}
                    <div className="p-4 grid grid-cols-4 gap-2 bg-[var(--color-mythos-black)]">
                        <Button variant="outline" size="sm" onClick={() => rollDice(100, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d100` : 'd100'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(10, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d10` : 'd10'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(8, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d8` : 'd8'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(6, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d6` : 'd6'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(4, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d4` : 'd4'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(3, diceCount)} disabled={isRolling} className="border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d3` : 'd3'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => rollDice(20, diceCount)} disabled={isRolling} className="col-span-2 border-[var(--color-mythos-gold-dim)]/50 text-[var(--color-mythos-parchment)] hover:bg-[var(--color-mythos-gold)] hover:text-black font-bold">
                            {diceCount > 1 ? `${diceCount}d20` : 'd20'}
                        </Button>
                    </div>

                    {/* History Log */}
                    <div className="flex-1 min-h-[150px] max-h-[250px] overflow-y-auto bg-black p-3 space-y-2 font-mono text-xs" ref={historyRef}>
                        {history.length === 0 ? (
                            <div className="text-gray-600 text-center italic mt-10">O destino aguarda...</div>
                        ) : (
                            history.map((roll) => (
                                <div key={roll.id} className="flex justify-between items-center border-b border-gray-800 pb-1 animate-in slide-in-from-left-2 fade-in">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">{roll.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                        <span className="text-[var(--color-mythos-gold-dim)] font-bold">{roll.notation}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-bold text-[var(--color-mythos-parchment)]">{roll.result}</span>
                                        {roll.details && <span className="text-gray-500 text-[10px]">{roll.details}</span>}
                                    </div>
                                </div>
                            ))
                        )}
                        {isRolling && (
                            <div className="text-[var(--color-mythos-gold)] text-center animate-pulse py-2">Rolando os ossos...</div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
