import Link from "next/link";
import { Eye, Scroll } from "lucide-react";

export default function GMLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--color-mythos-black)] text-[var(--color-mythos-parchment)] font-serif selection:bg-[var(--color-mythos-gold)] selection:text-black">
            {/* Keeper's Header */}
            <header className="border-b border-[var(--color-mythos-gold-dim)]/50 bg-[#0a0505] sticky top-0 z-50 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[var(--color-mythos-blood)] hover:text-red-400 transition-colors group">
                        <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-xl font-[family-name:var(--font-heading)] uppercase tracking-widest text-shadow-sm">Keeper's Lodge</span>
                    </Link>

                    {/* Navigation removed as Keepers only use the GM Dashboard */}
                </div>
            </header>

            <main className="container mx-auto py-8 px-4">
                {children}
            </main>
        </div>
    );
}
