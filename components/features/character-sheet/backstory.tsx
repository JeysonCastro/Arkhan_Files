import { Investigator } from "@/lib/types";
import { Label } from "@/components/ui/label";

interface Props {
    investigator: Investigator;
    onChange: (field: keyof Investigator, value: string) => void;
    isReadOnly?: boolean;
}

export default function CharacterSheetBackstory({ investigator, onChange, isReadOnly }: Props) {
    const renderTextArea = (label: string, field: keyof Investigator, rows: number = 3) => (
        <div className="mb-4">
            <Label className="font-heading text-lg text-[var(--color-mythos-gold)] border-b border-[var(--color-mythos-gold-dim)] mb-1 w-full block">{label}</Label>
            <div className="relative">
                {/* Linhas de pauta visuais */}
                <div className="absolute inset-0 pointer-events-none flex flex-col pt-1">
                    {Array.from({ length: rows }).map((_, i) => (
                        <div key={i} className="border-b border-[var(--color-mythos-accent)] h-8 w-full mt-1.5" />
                    ))}
                </div>
                <textarea
                    value={String(investigator[field] || "")}
                    onChange={(e) => onChange(field, e.target.value)}
                    readOnly={isReadOnly}
                    className="w-full bg-transparent border-none resize-none font-handwriting text-lg leading-loose pl-1 relative z-10 focus:outline-none text-[var(--color-mythos-parchment)] disabled:opacity-70"
                    rows={rows}
                    style={{ lineHeight: '2.35rem' }} // Ajuste fino para alinhar com as linhas
                />
            </div>
        </div>
    );

    return (
        <div className="p-6 bg-[var(--color-mythos-black)]/40 ring-1 ring-[var(--color-mythos-gold-dim)] rounded-sm">
            <h2 className="text-3xl font-black uppercase tracking-widest text-center border-b-2 border-[var(--color-mythos-gold)] text-[var(--color-mythos-gold)] mb-8">Antecedentes do Investigador</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    {renderTextArea("Descrição Pessoal", "personalDescription", 4)}
                    {renderTextArea("Ideologia / Crenças", "ideology", 3)}
                    {renderTextArea("Pessoas Significativas", "significantPeople", 4)}
                    {renderTextArea("Locais Importantes", "meaningfulLocations", 3)}
                    {renderTextArea("Pertences Queridos", "treasuredPossessions", 3)}
                    {renderTextArea("Características", "traits", 3)}
                </div>
                <div>
                    {renderTextArea("Ferimentos & Cicatrizes", "injuries", 3)}
                    {renderTextArea("Fobias & Manias", "phobias", 3)}
                    {renderTextArea("Tomos Arcanos, Feitiços & Artefatos", "arcaneTomes", 4)}
                    {renderTextArea("Encontros com Entidades Estranhas", "encounters", 4)}

                    <div className="mt-8 border-2 border-[var(--color-mythos-gold-dim)] p-4 bg-[var(--color-mythos-black)]/30">
                        <Label className="font-heading text-lg text-[var(--color-mythos-gold)] uppercase block text-center mb-4 border-b border-[var(--color-mythos-gold-dim)]">Inventário & Equipamento</Label>
                        <textarea
                            value={(investigator.gear || []).join('\n')}
                            onChange={(e) => {
                                // Simple multiline to array conversion
                                onChange("gear" as any, e.target.value.split('\n') as any)
                            }}
                            readOnly={isReadOnly}
                            className="w-full h-40 bg-transparent resize-none border-none focus:outline-none font-serif text-[var(--color-mythos-parchment)] disabled:opacity-70"
                            placeholder="- Item 1&#10;- Item 2"
                        />
                    </div>

                    <div className="mt-4 border-2 border-[var(--color-mythos-gold-dim)] p-4 bg-[var(--color-mythos-black)]/30">
                        <Label className="font-heading text-lg text-[var(--color-mythos-gold)] uppercase block text-center mb-4 border-b border-[var(--color-mythos-gold-dim)]">Dinheiro & Recursos</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold uppercase block text-[var(--color-mythos-gold-dim)]">Nível de Gastos</Label>
                                <input
                                    type="number"
                                    value={investigator.spendingLevel || ""}
                                    onChange={(e) => onChange("spendingLevel" as any, e.target.value)}
                                    readOnly={isReadOnly}
                                    className="vintage-input w-full"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase block text-[var(--color-mythos-gold-dim)]">Dinheiro</Label>
                                <input
                                    type="number"
                                    value={investigator.cash || ""}
                                    onChange={(e) => onChange("cash" as any, e.target.value)}
                                    readOnly={isReadOnly}
                                    className="vintage-input w-full"
                                />
                            </div>
                            <div className="col-span-2">
                                <Label className="text-xs font-bold uppercase block text-[var(--color-mythos-gold-dim)]">Patrimônio</Label>
                                <input
                                    value={investigator.assets || ""}
                                    onChange={(e) => onChange("assets" as any, e.target.value)}
                                    readOnly={isReadOnly}
                                    className="vintage-input w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
