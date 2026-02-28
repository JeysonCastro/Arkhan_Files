import React, { useState } from "react";
import { Investigator, AttributeName, Skill } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Save, ArrowLeft, X } from "lucide-react";
import CharacterSheetHeader from "@/components/features/character-sheet/header";
import CharacterSheetAttributes from "@/components/features/character-sheet/attributes";
import CharacterSheetSkills from "@/components/features/character-sheet/skills";
import CharacterSheetCombat from "@/components/features/character-sheet/combat";
import CharacterSheetBackstory from "@/components/features/character-sheet/backstory";

interface Props {
    investigator: Investigator;
    onAttributeChange: (attr: AttributeName, value: number) => void;
    onInfoChange: (field: keyof Investigator, value: any) => void;
    onSkillChange: (index: number, field: keyof Skill, value: number | boolean | string) => void;
    onSave?: () => void;
    onClose?: () => void; // Optional handler for close button
    isDialog?: boolean; // Changes header style if in dialog
    isReadOnly?: boolean; // Disables editing if true
}

const CharacterSheetDisplay = React.memo(function CharacterSheetDisplay({
    investigator,
    onAttributeChange,
    onInfoChange,
    onSkillChange,
    onSave,
    onClose,
    isDialog = false,
    isReadOnly = false // Extracting the prop here
}: Props) {
    const [activeTab, setActiveTab] = useState<'front' | 'back'>('front');

    return (
        <div className={`bg-[var(--color-mythos-paper)] text-[var(--color-mythos-black)] font-serif p-4 md:p-8 relative ${isDialog ? 'h-full overflow-y-auto' : 'min-h-screen'}`}>
            {/* Texture Overlay - reduced opacity for legibility */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('/paper-texture.png')] mix-blend-multiply z-0" />

            <div className="max-w-5xl mx-auto space-y-4 relative z-10">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-2 print:hidden sticky top-0 z-50 bg-[var(--color-mythos-paper)]/95 p-2 sm:px-4 border-b border-[var(--color-mythos-gold)]/30 backdrop-blur-sm gap-2">
                    <div className="flex items-center min-w-[40px]">
                        {onClose && (
                            <Button variant="ghost" className="gap-1 sm:gap-2 text-[var(--color-mythos-blood)] hover:text-red-500 hover:bg-transparent px-2" onClick={onClose}>
                                <ArrowLeft className="w-5 h-5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{isDialog ? 'Fechar' : 'Voltar ao Painel'}</span>
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-1 sm:gap-2 flex-1 justify-center">
                        <Button
                            variant={activeTab === 'front' ? "mythos" : "secondary"}
                            onClick={() => setActiveTab('front')}
                            className="w-20 sm:w-24 md:w-32 text-xs md:text-sm px-1 sm:px-4 shadow-sm"
                        >
                            Frente
                        </Button>
                        <Button
                            variant={activeTab === 'back' ? "mythos" : "secondary"}
                            onClick={() => setActiveTab('back')}
                            className="w-20 sm:w-24 md:w-32 text-xs md:text-sm px-1 sm:px-4 shadow-sm"
                        >
                            Verso
                        </Button>
                    </div>

                    <div className="flex items-center justify-end min-w-[40px]">
                        {onSave && (
                            <Button onClick={onSave} variant="mythos" className="gap-2 shadow-md px-2 sm:px-4">
                                <Save className="w-4 h-4" /> <span className="hidden md:inline">Salvar</span>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Sheet Content Card */}
                <div className="bg-[var(--color-mythos-parchment)]/95 p-6 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_0_80px_rgba(40,20,10,0.1)] ring-1 ring-black/20 rounded-sm min-h-[800px] vintage-border backdrop-blur-md relative overflow-hidden">
                    {/* Inner texture mapping slightly scaled up */}
                    <div className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20 bg-[url('/paper-texture.png')] bg-cover bg-center" />

                    <div className="relative z-10">
                        {activeTab === 'front' ? (
                            <>
                                <CharacterSheetHeader investigator={investigator} onChange={onInfoChange} isReadOnly={isReadOnly} />

                                <hr className="my-6 border-t-2 border-[var(--color-mythos-gold-dim)]/50" />

                                <CharacterSheetAttributes
                                    attributes={investigator.attributes}
                                    derived={investigator.derivedStats}
                                    onChange={onAttributeChange}
                                    isReadOnly={isReadOnly}
                                    isMajorWound={investigator.isMajorWound}
                                    madnessState={investigator.madnessState}
                                />

                                <hr className="my-6 border-t-2 border-[var(--color-mythos-gold-dim)]/50" />

                                {/* Render Skills only if initialized */}
                                {(investigator.skills || []).length > 0 && (
                                    <div className="space-y-6">
                                        <CharacterSheetSkills skills={investigator.skills} onChange={onSkillChange} isReadOnly={isReadOnly} />

                                        <hr className="my-6 border-t-2 border-[var(--color-mythos-gold-dim)]/50" />

                                        <CharacterSheetCombat investigator={investigator} onChange={onInfoChange} isReadOnly={isReadOnly} />
                                    </div>
                                )}
                            </>
                        ) : (
                            <CharacterSheetBackstory investigator={investigator} onChange={onInfoChange} isReadOnly={isReadOnly} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CharacterSheetDisplay;
