import { Investigator } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OCCUPATIONS_PTBR } from "@/lib/data-ptbr"; // Use PT-BR data
import { InfoPopover } from "@/components/ui/info-popover"; // Import InfoPopover
import { useRef } from "react";
import { Upload, Camera } from "lucide-react";
import { InvestigatorBadge } from "@/components/ui/investigator-badge";

interface Props {
    investigator: Investigator;
    onChange: (field: keyof Investigator, value: string | number) => void;
    isReadOnly?: boolean;
}

export default function CharacterSheetHeader({ investigator, onChange, isReadOnly }: Props) {
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
        if (isReadOnly) return;
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

            <div className="flex flex-col-reverse md:flex-row gap-8 items-start">
                {/* Personal Data Column - Classic Style */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm font-serif w-full">

                    <div className="col-span-2 md:col-span-1 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Nome</Label>
                        <Input
                            value={investigator.name || ""}
                            onChange={(e) => onChange("name", e.target.value)}
                            readOnly={isReadOnly}
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
                            className="vintage-input w-full bg-[var(--color-mythos-black)]/50 text-[var(--color-mythos-parchment)] border-b border-[var(--color-mythos-gold-dim)] focus:outline-none focus:border-[var(--color-mythos-gold)] disabled:opacity-70"
                            value={investigator.occupation}
                            onChange={(e) => onChange("occupation", e.target.value)}
                            disabled={isReadOnly}
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
                                value={investigator.age || ""}
                                onChange={(e) => onChange("age", parseInt(e.target.value) || 0)}
                                readOnly={isReadOnly}
                                className="vintage-input w-full text-center text-[var(--color-mythos-parchment)]"
                            />
                        </div>
                        <div className="flex items-end gap-2 flex-1">
                            <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Sexo</Label>
                            <Input
                                value={investigator.sex || ""}
                                onChange={(e) => onChange("sex", e.target.value)}
                                readOnly={isReadOnly}
                                className="vintage-input w-full text-center text-[var(--color-mythos-parchment)]"
                            />
                        </div>
                    </div>

                    <div className="col-span-2 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Residência</Label>
                        <Input
                            value={investigator.residence || ""}
                            onChange={(e) => onChange("residence", e.target.value)}
                            readOnly={isReadOnly}
                            className="vintage-input w-full text-[var(--color-mythos-parchment)]"
                        />
                    </div>

                    <div className="col-span-2 flex items-end gap-2">
                        <Label className="whitespace-nowrap font-bold text-[var(--color-mythos-gold)] uppercase text-xs">Local Nasc.</Label>
                        <Input
                            value={investigator.birthplace || ""}
                            onChange={(e) => onChange("birthplace", e.target.value)}
                            readOnly={isReadOnly}
                            className="vintage-input w-full text-[var(--color-mythos-parchment)]"
                        />
                    </div>
                </div>

                {/* Portrait / Logo Area */}
                <div
                    className={`w-full md:w-[240px] flex flex-col items-center justify-center p-2 pt-6 relative group overflow-visible ${!isReadOnly ? 'cursor-pointer' : ''}`}
                    onClick={() => !isReadOnly && fileInputRef.current?.click()}
                    title={!isReadOnly ? "Clique na foto para alterar" : "Retrato do Investigador"}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />

                    <InvestigatorBadge investigator={investigator} size="lg" className="scale-90 md:scale-100" hideBars={true} />

                    {!isReadOnly && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30 w-32 h-32 md:w-40 md:h-40 rotate-[1deg] mt-1 pointer-events-none">
                            <span className="text-[var(--color-mythos-gold)] text-xs font-bold uppercase tracking-widest flex flex-col items-center gap-1 text-center font-[family-name:--font-typewriter]">
                                <Camera className="w-6 h-6" /> Alterar Foto
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
