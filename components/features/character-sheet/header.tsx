import { Investigator } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OCCUPATIONS_PTBR } from "@/lib/data-ptbr"; // Use PT-BR data
import { InfoPopover } from "@/components/ui/info-popover"; // Import InfoPopover
import { useRef } from "react";
import { Upload, Camera } from "lucide-react";

interface Props {
    investigator: Investigator;
    onChange: (field: keyof Investigator, value: string | number) => void;
}

export default function CharacterSheetHeader({ investigator, onChange }: Props) {
    // Find current occupation description
    const currentOccupation = OCCUPATIONS_PTBR.find(o => o.name === investigator.occupation);

    // Create rich-text description for the Popover
    const occupationDescriptionNode = currentOccupation ? (
        <div className="space-y-3">
            <p className="border-b border-gray-200 pb-2">{currentOccupation.description}</p>
            <div>
                <strong className="text-gray-900 block pb-1">Pontos de Perícia da Ocupação:</strong>
                <span className="bg-gray-100 px-1 py-0.5 rounded border border-gray-200">{currentOccupation.skillPointsDescription}</span>
            </div>
            <div>
                <strong className="text-gray-900 block pb-1">Nível de Crédito Inicial:</strong>
                <span>{currentOccupation.creditRating.min} a {currentOccupation.creditRating.max}</span>
            </div>
            <div>
                <strong className="text-gray-900 block pb-1">Perícias Recomendadas:</strong>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                    {currentOccupation.skills.map(skill => (
                        <li key={skill}>{skill}</li>
                    ))}
                </ul>
            </div>
        </div>
    ) : null;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange("portrait", reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex border-b-2 border-[var(--color-mythos-gold)] pb-2 mb-4">
                <h1 className="text-3xl font-black uppercase tracking-widest w-full text-center text-[var(--color-mythos-gold)]">Investigador dos Anos 1920</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Personal Data Column - Classic Style */}
                <div className="md:col-span-9 grid grid-cols-2 gap-x-8 gap-y-2 text-sm font-serif">

                    <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Nome</Label>
                        <Input
                            value={investigator.name}
                            onChange={(e) => onChange("name", e.target.value)}
                            className="vintage-input w-full text-lg font-bold text-[var(--color-mythos-parchment)]"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Jogador</Label>
                        <Input
                            value={"Eu"}
                            readOnly
                            className="vintage-input w-full opacity-70 text-[var(--color-mythos-parchment)]"
                        />
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                        <div className="flex items-center gap-1">
                            <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Ocupação</Label>
                            {occupationDescriptionNode && <InfoPopover title={investigator.occupation} description={occupationDescriptionNode} />}
                        </div>
                        <select
                            className="vintage-input w-full bg-[var(--color-mythos-black)]/50 text-[var(--color-mythos-parchment)] border-b border-[var(--color-mythos-gold-dim)] focus:outline-none focus:border-[var(--color-mythos-gold)]"
                            value={investigator.occupation}
                            onChange={(e) => onChange("occupation", e.target.value)}
                        >
                            <option value="" className="bg-[var(--color-mythos-black)]">Selecione...</option>
                            {OCCUPATIONS_PTBR.map(occ => (
                                <option key={occ.name} value={occ.name} className="bg-[var(--color-mythos-black)] text-[var(--color-mythos-parchment)]">{occ.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-2 md:col-span-1 flex items-end gap-4">
                        <div className="flex items-end gap-2 flex-1">
                            <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Idade</Label>
                            <Input
                                type="number"
                                value={investigator.age}
                                onChange={(e) => onChange("age", parseInt(e.target.value))}
                                className="vintage-input w-full text-center text-[var(--color-mythos-parchment)]"
                            />
                        </div>
                        <div className="flex items-end gap-2 flex-1">
                            <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Sexo</Label>
                            <Input
                                value={investigator.sex}
                                onChange={(e) => onChange("sex", e.target.value)}
                                className="vintage-input w-full text-center text-[var(--color-mythos-parchment)]"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Residência</Label>
                        <Input
                            value={investigator.residence}
                            onChange={(e) => onChange("residence", e.target.value)}
                            className="vintage-input w-full text-[var(--color-mythos-parchment)]"
                        />
                    </div>

                    <div className="col-span-2 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Local Nasc.</Label>
                        <Input
                            value={investigator.birthplace}
                            onChange={(e) => onChange("birthplace", e.target.value)}
                            className="vintage-input w-full text-[var(--color-mythos-parchment)]"
                        />
                    </div>
                </div>

                {/* Portrait / Logo Area */}
                <div
                    className="md:col-span-3 flex flex-col items-center justify-center border-2 border-[var(--color-mythos-gold)] p-2 bg-[var(--color-mythos-black)]/30 relative group cursor-pointer overflow-hidden aspect-[3/4] shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
                    onClick={() => fileInputRef.current?.click()}
                    title="Clique para adicionar uma foto"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    {investigator.portrait ? (
                        <>
                            <img
                                src={investigator.portrait}
                                alt="Retrato do Investigador"
                                className="w-full h-full object-cover grayscale sepia-[.3] contrast-125 hover:grayscale-0 hover:sepia-0 transition-all duration-500"
                            />
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[var(--color-mythos-gold)] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                    <Camera className="w-4 h-4" /> Alterar
                                </span>
                            </div>
                        </>
                    ) : (
                        <div className="w-full h-full border border-[var(--color-mythos-gold-dim)]/20 flex flex-col items-center justify-center text-center text-[var(--color-mythos-gold-dim)] italic p-4 hover:bg-[var(--color-mythos-green)]/10 transition-colors">
                            <Upload className="w-8 h-8 mb-2 opacity-50" />
                            <span className="text-xs">Clique para adicionar foto</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
