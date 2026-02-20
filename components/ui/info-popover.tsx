"use client";

import { useState, useRef, useEffect } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InfoPopoverProps {
    title: string;
    description: React.ReactNode;
}

export function InfoPopover({ title, description }: InfoPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative inline-block ml-2" ref={popoverRef}>
            <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full p-0 text-gray-500 hover:text-black hover:bg-gray-200"
                onClick={() => setIsOpen(!isOpen)}
                title="Ver descrição"
            >
                <Info className="h-3 w-3" />
            </Button>

            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#fdfbf7] border-2 border-gray-800 p-3 shadow-xl z-50 text-left rounded-sm before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-b-gray-800">
                    <h4 className="font-bold text-sm mb-2 text-gray-900 border-b border-gray-300 pb-1">{title}</h4>
                    <div className="text-xs text-gray-700 leading-relaxed font-serif space-y-2">{description}</div>
                </div>
            )}
        </div>
    );
}
