"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skull } from "lucide-react";

export type DiceType = "d4" | "d6" | "d8" | "d10" | "d20" | "d100";

interface AnimatedDiceProps {
    type: DiceType;
    value: number | null; // null if rolling
    isRolling: boolean;
    size?: "sm" | "md" | "lg" | "xl";
    color?: string; // e.g. "text-[var(--color-mythos-blood)]"
}

export function AnimatedDice({ type, value, isRolling, size = "md", color = "text-[var(--color-mythos-parchment)]" }: AnimatedDiceProps) {
    const [displayValue, setDisplayValue] = useState<number | string>("?");

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-16 h-16 text-xl",
        lg: "w-24 h-24 text-3xl",
        xl: "w-40 h-40 text-5xl",
    };

    const maxValues = {
        d4: 4,
        d6: 6,
        d8: 8,
        d10: 9, // Often displayed as 0-9
        d20: 20,
        d100: 90, // Often displayed as 00-90
    };

    // Fast scrambling effect when rolling
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRolling) {
            interval = setInterval(() => {
                let r = Math.floor(Math.random() * maxValues[type]) + 1;

                // Formatting for d10 and d100
                if (type === 'd10') r = r % 10;
                if (type === 'd100') {
                    r = Math.floor(Math.random() * 10) * 10;
                    if (r === 0) r = 0; // Using 0 for double zero
                }

                setDisplayValue(type === 'd100' && r === 0 ? "00" : r);
            }, 50);
        } else {
            // Set actual value
            if (value !== null) {
                // If it's a d100 sequence, show the tens properly, or just the raw number
                if (type === 'd100') {
                    // Typical usage: pass the full 1-100 to d100 and it shows the tens digit?
                    // Usually we pass the exact face that showed up. 
                    // Let's assume 'value' is the exact face (0-90 for tens, or 1-100 total)
                    // If they just pass the total d100 roll, we format it:
                    if (value === 100) setDisplayValue("00");
                    else setDisplayValue(Math.floor(value / 10) * 10 || "00");
                } else if (type === 'd10') {
                    setDisplayValue(value % 10);
                } else {
                    setDisplayValue(value);
                }
            } else {
                setDisplayValue("?");
            }
        }
        return () => clearInterval(interval);
    }, [isRolling, type, value, maxValues]);

    // Shape vectors (simplified SVGs) for visual flavor
    const renderShape = () => {
        const svgSize = "100%";
        const strokeColor = "currentColor";
        const strokeWidth = "2";

        // Very basic wireframes that look cool while spinning
        switch (type) {
            case "d4":
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" className="absolute inset-0 opacity-20">
                        <polygon points="50,10 10,90 90,90" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <line x1="50" y1="10" x2="50" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <line x1="10" y1="90" x2="50" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <line x1="90" y1="90" x2="50" y2="70" stroke={strokeColor} strokeWidth={strokeWidth} />
                    </svg>
                );
            case "d6":
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" className="absolute inset-0 opacity-20">
                        <rect x="15" y="15" width="70" height="70" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                    </svg>
                );
            case "d8":
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" className="absolute inset-0 opacity-20">
                        <polygon points="50,10 10,50 50,90 90,50" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <line x1="10" y1="50" x2="90" y2="50" stroke={strokeColor} strokeWidth={strokeWidth} />
                    </svg>
                );
            case "d10":
            case "d100":
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" className="absolute inset-0 opacity-20">
                        <polygon points="50,10 90,40 50,90 10,40" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <polygon points="50,10 70,45 50,90 30,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <line x1="10" y1="40" x2="90" y2="40" stroke={strokeColor} strokeWidth={strokeWidth} />
                    </svg>
                );
            case "d20":
            default:
                return (
                    <svg width={svgSize} height={svgSize} viewBox="0 0 100 100" className="absolute inset-0 opacity-20">
                        <polygon points="50,10 90,35 75,85 25,85 10,35" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <polygon points="50,10 75,45 25,45" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                        <polygon points="25,45 75,45 50,85" fill="none" stroke={strokeColor} strokeWidth={strokeWidth} />
                    </svg>
                );
        }
    };

    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${color} font-heading font-bold select-none`}>
            {/* The rotating shape */}
            <motion.div
                animate={{
                    rotateZ: isRolling ? [0, 90, 180, 270, 360] : 0,
                    rotateY: isRolling ? [0, 180, 360] : 0,
                    rotateX: isRolling ? [0, -180, -360] : 0,
                    scale: isRolling ? [1, 1.2, 1] : 1
                }}
                transition={{
                    repeat: isRolling ? Infinity : 0,
                    duration: 0.6,
                    ease: "linear"
                }}
                className="absolute inset-0 flex items-center justify-center"
            >
                {renderShape()}

                {/* Glow during roll */}
                <AnimatePresence>
                    {isRolling && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[var(--color-mythos-gold)] blur-md rounded-full"
                        />
                    )}
                </AnimatePresence>
            </motion.div>

            {/* The Number Text */}
            <motion.div
                key={String(displayValue) + (isRolling ? "rolling" : "stopped")}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
            >
                {displayValue}
            </motion.div>

            {/* If critical failure (100) or success (1), add dramatic skull/star overlay 
                We can add this logic later if we pass a 'successType' prop 
            */}
        </div>
    );
}
