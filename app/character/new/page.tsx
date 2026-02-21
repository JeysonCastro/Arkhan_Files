"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { supabase } from "@/lib/supabase";
import { CharacterWizard } from "@/components/features/character-creator/character-wizard";

export default function NewCharacterPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    const handleComplete = async (characterData: any) => {
        if (!user) {
            alert("Erro: Sessão de usuário não encontrada. Por favor, faça login novamente.");
            return;
        }
        setIsSaving(true);

        try {
            // Insere o personagem base no banco de dados (o schema atual)
            // Lembre que atualmente a tabela investigators pede name e occupation e player_id
            const { data, error } = await supabase
                .from('investigators')
                .insert([{
                    name: characterData.name,
                    occupation: characterData.occupation,
                    user_id: user.id, // Correct column is user_id
                    data: { // Correct column for JSON is data
                        age: characterData.age,
                        gender: characterData.gender,
                        attributes: characterData.attributes,
                        avatar: characterData.avatar,
                        // Adaptação para a estrutura de sanidade antiga do projeto (se existir)
                        derivedStats: {
                            sanity: { current: characterData.attributes.SANITY, max: characterData.attributes.MAX_SANITY },
                            hp: { current: characterData.attributes.HP, max: characterData.attributes.MAX_HP },
                            mp: { current: characterData.attributes.MP, max: characterData.attributes.MAX_MP }
                        }
                    }
                }])
                .select();

            if (error) {
                console.error("Supabase Error:", error);
                alert("Erro ao salvar personagem");
                setIsSaving(false);
                return;
            }

            // Redireciona para o painel
            router.push('/dashboard');
        } catch (err) {
            console.error("Error creating character:", err);
            alert("Erro Inesperado");
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.push('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#050a05] text-[var(--color-mythos-parchment)] p-4 sm:p-8 flex flex-col items-center justify-center">
            <CharacterWizard onComplete={handleComplete} onCancel={handleCancel} isSaving={isSaving} />
        </div>
    );
}
