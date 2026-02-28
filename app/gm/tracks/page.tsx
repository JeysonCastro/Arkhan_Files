"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Map, BookOpen, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const MOCK_TRACKS = [
    {
        id: "tr1",
        title: "O Chamado da Floresta Sussurrante",
        type: "Exploração",
        duration: "3-4 sessões",
        difficulty: "Moderada",
        description: "Os investigadores devem entrar na floresta ao norte de Arkham para localizar um grupo de estudantes desaparecidos. Há relatos de luzes estranhas entre as árvores.",
        scenes: ["A chegada na borda", "O acampamento abandonado", "O Círculo de Pedras", "A cabana do eremita"]
    },
    {
        id: "tr2",
        title: "Ritual na Mansão Blackwood",
        type: "Clímax",
        duration: "1-2 sessões",
        difficulty: "Alta",
        description: "Uma corrida contra o relógio para impedir que o herdeiro dos Blackwood complete a invocação durante o eclipse total.",
        scenes: ["Infiltração na mansão", "O porão inundado", "O Salão dos Espelhos", "O confronto ritual"]
    },
    {
        id: "tr3",
        title: "Chegada em Innsmouth",
        type: "Introdução",
        duration: "1 sessão",
        difficulty: "Baixa",
        description: "A chegada tensa na cidade portuária em declínio. Os investigadores devem encontrar abrigo e evitar olhares curiosos enquanto buscam por pistas de um agente desaparecido.",
        scenes: ["O ônibus de Joe Sargent", "Hotel Gilman", "A mercearia de First National", "O porto sob a névoa"]
    }
];

export default function TracksPage() {
    const router = useRouter();

    return (
        <div className="min-h-[calc(100vh-8rem)] flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-blue-900/30 pb-6 mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/gm')}
                        className="text-stone-400 hover:text-blue-400 border border-transparent hover:border-blue-900/50 bg-black/40 h-10 px-4"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-blue-500 tracking-wider font-heading">Trilhas Narrativas</h1>
                        <p className="text-stone-500 italic font-serif">Prepare ganchos, blocos de cena e a estrutura da sua campanha.</p>
                    </div>
                </div>

                <Button className="bg-blue-900/40 border border-blue-600/50 text-blue-400 hover:bg-blue-600 hover:text-white h-10 px-6 font-serif uppercase tracking-widest text-xs">
                    Criar Nova Trilha
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {MOCK_TRACKS.map(track => (
                    <Card key={track.id} className="bg-[#050510] border border-blue-900/20 rounded-xl overflow-hidden hover:border-blue-500/30 transition-all flex flex-col group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold font-heading text-stone-200 group-hover:text-blue-400 transition-colors uppercase tracking-wide">{track.title}</h3>
                                    <div className="flex gap-4 mt-2">
                                        <div className="flex items-center text-xs text-stone-500">
                                            <BookOpen className="w-4 h-4 mr-1 text-blue-900" /> {track.type}
                                        </div>
                                        <div className="flex items-center text-xs text-stone-500">
                                            <Clock className="w-4 h-4 mr-1 text-blue-900" /> {track.duration}
                                        </div>
                                        <div className="flex items-center text-xs text-stone-500">
                                            <AlertTriangle className="w-4 h-4 mr-1 text-blue-900" /> {track.difficulty}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="text-stone-400 font-serif leading-relaxed italic mb-6">
                                "{track.description}"
                            </p>

                            <div className="space-y-3">
                                <h4 className="text-xs font-heading tracking-widest text-blue-900 uppercase">Blocos de Cena</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {track.scenes.map((scene, idx) => (
                                        <div key={idx} className="bg-black/40 border border-blue-900/10 p-3 rounded flex items-center gap-3 group/scene hover:border-blue-900/40 transition-colors">
                                            <span className="text-[10px] font-mono text-blue-900/60">{idx + 1}</span>
                                            <span className="text-xs text-stone-300 group-hover/scene:text-blue-300 transition-colors">{scene}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto p-4 bg-[#0a0a1a] border-t border-blue-900/10 flex justify-end">
                            <Button variant="ghost" className="text-xs text-blue-900 hover:text-blue-400 hover:bg-blue-900/10">Editar Planejamento</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {MOCK_TRACKS.length === 0 && (
                <div className="text-center py-20">
                    <Map className="w-16 h-16 mx-auto text-blue-900/20 mb-4" />
                    <p className="text-stone-500 font-serif italic text-lg">Nenhum rastro foi encontrado nas trilhas.</p>
                </div>
            )}
        </div>
    );
}
