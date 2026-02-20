"use client";

import { useState } from "react";
import { Plus, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WEAPONS_PTBR, WeaponData } from "@/lib/data-ptbr";

interface Props {
    onSelect: (weapon: WeaponData) => void;
}

export default function WeaponSelector({ onSelect }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredWeapons = WEAPONS_PTBR.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.skill.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (weapon: WeaponData) => {
        onSelect(weapon);
        setIsOpen(false);
        setSearchTerm("");
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="mythos" size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Adicionar Arma
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#fdfbf7] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border-2 border-black relative rounded-sm">

                        {/* Header */}
                        <div className="p-4 border-b-2 border-black flex justify-between items-center bg-gray-100">
                            <h3 className="text-xl font-heading uppercase tracking-widest">Arsenal</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-black/20 bg-white">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    className="pl-9 bg-transparent border-black"
                                    placeholder="Buscar arma..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {filteredWeapons.map((weapon) => (
                                <div
                                    key={weapon.name}
                                    className="flex items-center justify-between p-3 hover:bg-black/5 cursor-pointer border border-transparent hover:border-black/20 transition-colors group"
                                    onClick={() => handleSelect(weapon)}
                                >
                                    <div>
                                        <div className="font-bold text-lg">{weapon.name}</div>
                                        <div className="text-xs text-gray-600 flex gap-2">
                                            <span>{weapon.skill}</span>
                                            <span>•</span>
                                            <span>{weapon.damage}</span>
                                            <span>•</span>
                                            <span>Alcance: {weapon.range}</span>
                                        </div>
                                        {weapon.description && (
                                            <div className="text-xs text-gray-500 italic mt-1">{weapon.description}</div>
                                        )}
                                    </div>
                                    <Button size="sm" variant="secondary" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        Escolher
                                    </Button>
                                </div>
                            ))}

                            {filteredWeapons.length === 0 && (
                                <div className="p-8 text-center text-gray-500 italic">
                                    Nenhuma arma encontrada nos registros.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
