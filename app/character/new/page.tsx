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
            // Lembre que atualmente a tabela investigators pede name, occupation e user_id
            const { data, error } = await supabase
                .from('investigators')
                .insert([{
                    name: characterData.name,
                    occupation: characterData.occupation,
                    user_id: user.id, // Reverted: using user_id to match Supabase schema defined in supabase_schema.sql
                    data: characterData
                }])
                .select();

            if (error) {
                console.error("Supabase Error stringified:", JSON.stringify(error, null, 2));
                console.error("Supabase Error raw:", error);
                alert(`Erro ao salvar personagem: ${error?.message || JSON.stringify(error)}`);
                setIsSaving(false);
                return;
            }

            console.log("[NewCharacter] Personagem salvo com sucesso:", data);

            // Redireciona para o painel
            router.push('/dashboard');
        } catch (err) {
            console.error("[NewCharacter] Erro Inesperado:", err);
            alert("Erro Inesperado ao salvar");
        } finally {
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
