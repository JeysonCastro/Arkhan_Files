"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PinboardItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Plus, Image as ImageIcon, FileText, Trash2, GripHorizontal } from "lucide-react";
import { MASTER_ITEMS_DB } from "@/lib/items-db";

interface PinboardProps {
    sessionId: string;
    onClose: () => void;
    isGM?: boolean; // Controls who can add/delete base items, but we'll let anyone drag for now
}

export function Pinboard({ sessionId, onClose, isGM = false }: PinboardProps) {
    const [items, setItems] = useState<PinboardItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageSearch, setImageSearch] = useState("");
    const boardRef = useRef<HTMLDivElement>(null);

    // Fetch initial items
    useEffect(() => {
        const fetchItems = async () => {
            const { data, error } = await supabase
                .from('pinboard_items')
                .select('*')
                .eq('session_id', sessionId);

            if (!error && data) {
                setItems(data as PinboardItem[]);
            }
            setLoading(false);
        };
        fetchItems();

        // Realtime Subscription
        const channel = supabase.channel(`pinboard_${sessionId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'pinboard_items',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setItems(prev => [...prev.filter(i => i.id !== payload.new.id), payload.new as PinboardItem]);
                } else if (payload.eventType === 'UPDATE') {
                    setItems(prev => prev.map(item => item.id === payload.new.id ? payload.new as PinboardItem : item));
                } else if (payload.eventType === 'DELETE') {
                    setItems(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const handleDragEnd = async (id: string, info: any) => {
        // Find the item to get its current visual position offset
        const item = items.find(i => i.id === id);
        if (!item) return;

        // info.offset is how much it moved in this drag
        const newX = Math.round(item.position_x + info.offset.x);
        const newY = Math.round(item.position_y + info.offset.y);

        // Optimistic local update
        setItems(prev => prev.map(i => i.id === id ? { ...i, position_x: newX, position_y: newY } : i));

        // Let's bring it to the front by updating z-index relative to others
        const maxZ = Math.max(...items.map(i => i.z_index || 1), 0);

        // Update DB (debounced/background)
        await supabase
            .from('pinboard_items')
            .update({ position_x: newX, position_y: newY, z_index: maxZ + 1 })
            .eq('id', id);
    };

    const handleAddItem = async (type: 'NOTE' | 'IMAGE', url?: string, title?: string) => {
        const newItem = {
            session_id: sessionId,
            title: title || (type === 'NOTE' ? 'Nova Nota' : 'Nova Imagem'),
            content: type === 'NOTE' ? 'Escreva aqui...' : null,
            type: type,
            image_url: type === 'IMAGE' ? (url || '/placeholder.jpg') : null,
            position_x: Math.round(window.innerWidth / 2 - 100 + (Math.random() * 50)),
            position_y: Math.round(window.innerHeight / 2 - 100 + (Math.random() * 50)),
            z_index: 10,
            rotation: Math.floor(Math.random() * 10) - 5,
            color: 'bg-yellow-100',
        };

        const { data, error } = await supabase.from('pinboard_items').insert(newItem).select();
        if (error) {
            console.error("Full Error creating item:", JSON.stringify(error, null, 2));
            console.error("Attempted payload:", JSON.stringify(newItem, null, 2));
            alert(`Erro ao criar item: ${error.message}`);
        } else if (data) {
            // Let the realtime subscription handle adding it to the UI, 
            // but we successfully inserted it.
            console.log("Successfully created item:", data);
        }
    };

    const handleDelete = async (id: string) => {
        // Optimistic delete
        setItems(prev => prev.filter(i => i.id !== id));
        await supabase.from('pinboard_items').delete().eq('id', id);
    };

    const updateContent = async (id: string, field: 'title' | 'content', value: string) => {
        setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));

        // Wait to save to avoid spamming the DB while typing
        // A simple timeout or blur event is preferred. Doing blur for simplicity later.
    };

    const saveContent = async (id: string, field: 'title' | 'content', value: string) => {
        await supabase.from('pinboard_items').update({ [field]: value }).eq('id', id);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[url('/board-texture.jpg')] bg-stone-800 flex flex-col">
            {/* Toolbar */}
            <div className="bg-black/80 text-white p-4 flex justify-between items-center z-50 shadow-lg border-b border-stone-600">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold font-serif tracking-widest text-[#d8c29d]">Quadro de Evidências</h2>
                    <Button onClick={() => handleAddItem('NOTE')} variant="outline" size="sm" className="bg-stone-800 hover:bg-stone-700 border-stone-600">
                        <FileText className="w-4 h-4 mr-2" />
                        Nova Nota
                    </Button>
                    {isGM && (
                        <Button onClick={() => setShowImageModal(true)} variant="outline" size="sm" className="bg-stone-800 hover:bg-stone-700 border-stone-600">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Adicionar Imagem
                        </Button>
                    )}
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-900/50 hover:text-red-400">
                    <X className="w-6 h-6" />
                </Button>
            </div>

            {/* Board Area */}
            <div ref={boardRef} className="flex-1 relative overflow-hidden bg-stone-900/50 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)] touch-none">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center text-stone-500 font-serif text-xl animate-pulse">
                        Reunindo os recortes...
                    </div>
                ) : (
                    items.map((item) => (
                        <motion.div
                            key={item.id}
                            drag
                            dragMomentum={false}
                            onDragEnd={(_, info) => handleDragEnd(item.id, info)}
                            initial={{ x: item.position_x, y: item.position_y, rotate: item.rotation }}
                            // Animate strictly doesn't take x and y as strictly animated values if dragging, 
                            // but framer handles external updates if they don't break the drag gesture
                            animate={{ x: item.position_x, y: item.position_y, rotate: item.rotation }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            style={{ zIndex: item.z_index }}
                            className={`absolute shadow-xl flex flex-col ring-1 ring-black/20 hover:ring-white/50 group
                                ${item.type === 'NOTE' ? 'w-48 min-h-48 p-4 ' + (item.color || 'bg-[#fff9d6]') : 'w-64 bg-white p-2'}
                            `}
                        >
                            {/* Drag Handle & Delete */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-black/5 rounded">
                                <GripHorizontal className="w-4 h-4 text-black/40 cursor-grab active:cursor-grabbing mx-1" />
                                <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-red-500/20 rounded text-red-900/40 hover:text-red-700 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Pin visual */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-800 shadow-[0_2px_5px_rgba(0,0,0,0.5)] border-2 border-red-900 z-10">
                                <div className="absolute inset-1 rounded-full bg-white/30" />
                            </div>

                            {item.type === 'NOTE' && (
                                <div className="mt-2 h-full flex flex-col">
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateContent(item.id, 'title', e.target.value)}
                                        onBlur={(e) => saveContent(item.id, 'title', e.target.value)}
                                        className="font-bold text-black bg-transparent border-none outline-none mb-2 placeholder-black/30 font-serif"
                                        placeholder="Título"
                                    />
                                    <textarea
                                        value={item.content || ''}
                                        onChange={(e) => updateContent(item.id, 'content', e.target.value)}
                                        onBlur={(e) => saveContent(item.id, 'content', e.target.value)}
                                        className="w-full flex-1 resize-none bg-transparent border-none outline-none text-black/80 font-serif text-sm leading-relaxed"
                                        placeholder="Sua anotação aqui..."
                                    />
                                </div>
                            )}

                            {item.type === 'IMAGE' && (
                                <div className="mt-2 flex flex-col items-center">
                                    {/* Using a standard img for now since we don't know hosts for next/image */}
                                    {item.image_url && <img src={item.image_url} alt={item.title} className="w-full object-contain mb-2 border border-stone-200" draggable={false} />}
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateContent(item.id, 'title', e.target.value)}
                                        onBlur={(e) => saveContent(item.id, 'title', e.target.value)}
                                        className="font-medium text-black bg-transparent border-none outline-none text-center text-sm font-serif w-full"
                                        placeholder="Legenda"
                                    />
                                </div>
                            )}

                        </motion.div>
                    ))
                )}
            </div>

            {/* Image Selection Modal */}
            {showImageModal && (
                <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1a1815] border-2 border-[#d8c29d]/50 rounded-lg shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-[#d8c29d]/20 bg-black/40">
                            <h3 className="text-xl font-heading text-[#d8c29d] tracking-widest uppercase flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" /> Arquivos Físicos e Evidências
                            </h3>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-900/40" onClick={() => setShowImageModal(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="p-4 border-b border-[#d8c29d]/20 bg-black/60">
                            <input
                                type="text"
                                placeholder="Procurar item..."
                                value={imageSearch}
                                onChange={(e) => setImageSearch(e.target.value)}
                                className="w-full bg-[#111] border border-[#d8c29d]/30 text-[#d8c29d] p-2 font-serif placeholder:text-[#d8c29d]/40 focus:outline-none focus:border-[#d8c29d]"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {MASTER_ITEMS_DB.filter(item =>
                                item.imageUrl &&
                                (item.name.toLowerCase().includes(imageSearch.toLowerCase()) ||
                                    item.type.toLowerCase().includes(imageSearch.toLowerCase()))
                            ).map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        handleAddItem('IMAGE', item.imageUrl!, item.name);
                                        setShowImageModal(false);
                                    }}
                                    className="bg-black/50 border border-[#d8c29d]/30 rounded cursor-pointer hover:border-[#d8c29d] hover:scale-105 transition-all flex flex-col items-center p-2 group"
                                >
                                    <div className="w-full aspect-square bg-black mb-2 rounded overflow-hidden">
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover sepia-[0.3] group-hover:sepia-0 transition-all" />
                                    </div>
                                    <span className="text-xs font-serif text-center text-[#d8c29d] line-clamp-2">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
