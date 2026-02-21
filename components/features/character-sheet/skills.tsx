import { Skill } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { BASE_SKILLS_PTBR } from "@/lib/data-ptbr"; // Import PT-BR data
import { InfoPopover } from "@/components/ui/info-popover"; // Import InfoPopover

interface Props {
    skills: Skill[];
    onChange: (index: number, field: keyof Skill, value: number | boolean | string) => void;
    isReadOnly?: boolean;
}

export default function CharacterSheetSkills({ skills, onChange, isReadOnly }: Props) {
    // Split skills into 3 columns
    const itemsPerCol = Math.ceil(skills.length / 3);
    const col1 = skills.slice(0, itemsPerCol);
    const col2 = skills.slice(itemsPerCol, itemsPerCol * 2);
    const col3 = skills.slice(itemsPerCol * 2);

    const renderSkillCol = (colSkills: typeof skills, startIndex: number) => (
        <div className="space-y-1">
            {colSkills.map((skill, localIndex) => {
                const globalIndex = startIndex + localIndex;
                const total = (skill.baseChance || 0) + (skill.pointsAdded || 0);
                const baseSkill = BASE_SKILLS_PTBR.find(s => s.name === skill.name);
                const description = baseSkill?.description || "";

                return (
                    <div key={skill.name} className="flex items-center gap-1 text-sm border-b border-[var(--color-mythos-gold-dim)]/30 pb-1 hover:bg-[var(--color-mythos-green)]/30 transition-colors">
                        {/* Checkbox de evolução */}
                        <div className={`relative flex items-center justify-center w-4 h-4 border border-[var(--color-mythos-gold-dim)] bg-[var(--color-mythos-black)]/50 shrink-0 ${!isReadOnly ? 'cursor-pointer hover:border-[var(--color-mythos-gold)]' : ''}`}
                            onClick={() => !isReadOnly && onChange(globalIndex, "checked", !skill.checked)}>
                            {skill.checked && <div className="w-2 h-2 bg-[var(--color-mythos-gold)]" />}
                        </div>

                        {/* Nome da Perícia e Base */}
                        <div className="flex-1 flex items-center gap-1 min-w-0">
                            <div className="flex items-center gap-1 overflow-hidden">
                                <span className="font-bold whitespace-nowrap overflow-hidden text-ellipsis text-xs md:text-sm text-[var(--color-mythos-parchment)]">{skill.name}</span>
                            </div>
                            <span className="text-[0.6rem] text-[var(--color-mythos-gold-dim)] shrink-0">({skill.baseChance}%)</span>
                            {description && <div className="shrink-0"><InfoPopover title={skill.name} description={description} /></div>}
                        </div>

                        {/* Valor Atual (Input Discreto) */}
                        <Input
                            type="number"
                            value={total}
                            readOnly={isReadOnly}
                            onChange={(e) => {
                                const newVal = parseInt(e.target.value) || 0;
                                const added = newVal - (skill.baseChance || 0);
                                onChange(globalIndex, "pointsAdded", added);
                            }}
                            className="vintage-input w-10 text-center font-bold h-6 p-0 text-sm text-[var(--color-mythos-gold)] border-b border-[var(--color-mythos-gold-dim)] focus:border-[var(--color-mythos-gold)] bg-transparent disabled:opacity-70"
                        />

                        {/* Half / Fifth (Small) */}
                        <div className="flex flex-col text-[0.5rem] leading-none w-4 text-center text-[var(--color-mythos-gold-dim)]/70 shrink-0">
                            <div title="Metade">{Math.floor(total / 2)}</div>
                            <div title="Quinto">{Math.floor(total / 5)}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2 bg-[var(--color-mythos-green)] p-1 border-t border-b border-[var(--color-mythos-gold-dim)]">
                <h3 className="text-xl font-heading text-[var(--color-mythos-gold)] uppercase tracking-widest flex-1 text-center">Perícias do Investigador</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4">
                {renderSkillCol(col1, 0)}
                {renderSkillCol(col2, itemsPerCol)}
                {renderSkillCol(col3, itemsPerCol + col2.length)}
            </div>
        </div>
    );
}
