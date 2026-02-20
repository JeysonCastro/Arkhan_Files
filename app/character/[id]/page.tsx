"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Investigator } from "@/lib/types";
import { BASE_SKILLS_PTBR } from "@/lib/data-ptbr";
import CharacterSheetDisplay from "@/components/features/character-sheet/character-sheet-display";
import { useInvestigator } from "@/hooks/use-investigator";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";

// Actually, I realized I didn't export INITIAL_INVESTIGATOR from hook. 
// I should probably define it locally or export it.
// Let's modify the hook file first to export it, or define it here.
// For now, I'll define a local one to be safe if I can't modify the hook immediately in parallel.
// Wait, I can modify the hook in previous step? No, I already wrote it.
// I will check the hook content in next step or assume I need to export it.
// I'll add the export to the hook in a separate step or just redefine it here for robustness if I can't multitask.
// I'll redefine it here to be safe and avoid "Element not exported" error.

const INITIAL_INVESTIGATOR: Investigator = {
    id: "",
    name: "",
    occupation: "",
    age: 25,
    sex: "",
    residence: "",
    birthplace: "",
    attributes: {
        STR: { base: 50, current: 50 },
        CON: { base: 50, current: 50 },
        SIZ: { base: 50, current: 50 },
        DEX: { base: 50, current: 50 },
        APP: { base: 50, current: 50 },
        INT: { base: 50, current: 50 },
        POW: { base: 50, current: 50 },
        EDU: { base: 50, current: 50 },
        LUCK: { base: 50, current: 50 },
    },
    derivedStats: {
        hp: { max: 10, current: 10 },
        sanity: { max: 99, current: 50, start: 50 },
        magicPoints: { max: 10, current: 10 },
        moveRate: 8,
        build: 0,
        damageBonus: "0"
    },
    skills: [],
    personalDescription: "",
    traits: "",
    ideology: "",
    injuries: "",
    significantPeople: "",
    phobias: "",
    meaningfulLocations: "",
    arcaneTomes: "",
    treasuredPossessions: "",
    encounters: "",
    gear: [],
    spendingLevel: 0,
    cash: 0,
    assets: "",
    weapons: []
};

export default function CharacterSheetPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    // Check auth
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // We pass null properly to the hook, it handles default initialization
    const {
        investigator,
        setInvestigator,
        handleAttributeChange,
        handleInfoChange,
        handleSkillChange
    } = useInvestigator(null);

    const [isNew, setIsNew] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadCharacter = async () => {
            if (params.id === 'new') {
                setIsNew(true);
                setInvestigator({
                    ...INITIAL_INVESTIGATOR,
                    id: crypto.randomUUID(),
                    skills: BASE_SKILLS_PTBR.map(s => ({
                        name: s.name,
                        baseChance: s.baseChance,
                        pointsAdded: 0,
                        checked: false
                    }))
                });
                setIsLoading(false);
            } else {
                // Load from Supabase
                try {
                    const { data, error } = await supabase
                        .from('investigators')
                        .select('*')
                        .eq('id', params.id)
                        .single();

                    if (data && !error) {
                        setInvestigator({
                            ...INITIAL_INVESTIGATOR,
                            ...data.data,
                            id: data.id // Ensure ID matches DB
                        });
                    } else {
                        throw error || new Error("Not found");
                    }
                } catch (err) {
                    console.error("Error loading character", err);
                    // Initialize blank or show error - for now, safe default
                    setInvestigator({
                        ...INITIAL_INVESTIGATOR,
                        id: params.id as string,
                        skills: BASE_SKILLS_PTBR.map(s => ({
                            name: s.name,
                            baseChance: s.baseChance,
                            pointsAdded: 0,
                            checked: false
                        }))
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadCharacter();
    }, [params.id]);

    const saveCharacter = async () => {
        if (!user) {
            alert("Você precisa estar logado para salvar.");
            return;
        }

        try {
            const { error } = await supabase
                .from('investigators')
                .upsert({
                    id: investigator.id,
                    user_id: user.id,
                    name: investigator.name || 'Desconhecido',
                    occupation: investigator.occupation || 'Nenhum',
                    data: investigator // The whole object as JSONB
                });

            if (error) throw error;

            alert("Investigador salvo nos Arquivos de Arkham!");
            if (isNew) {
                router.push(`/character/${investigator.id}`);
                setIsNew(false);
            }
        } catch (err: any) {
            console.error("Save error:", err);
            alert("Erro ao salvar: " + err.message);
        }
    };

    if (isLoading || !investigator.id) return <div className="p-8 text-[var(--color-mythos-parchment)] animate-pulse">Carregando Arquivos...</div>;

    return (
        <CharacterSheetDisplay
            investigator={investigator}
            onAttributeChange={handleAttributeChange}
            onInfoChange={handleInfoChange}
            onSkillChange={handleSkillChange}
            onSave={saveCharacter}
            onClose={() => router.push('/dashboard')}
        />
    );
}
