import Link from "next/link";
import { BookOpen } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--background)]">
            <header className="border-b border-[var(--color-mythos-gold-dim)]/50 bg-[var(--color-mythos-dark-green)]/95 sticky top-0 z-50 backdrop-blur-sm shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-[var(--color-mythos-gold)] hover:text-[var(--color-mythos-parchment)] transition-colors group">
                        <BookOpen className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        <span className="font-bold text-xl font-[family-name:var(--font-heading)] uppercase tracking-widest text-shadow-sm">Arkham Archives</span>
                    </Link>

                    <div className="text-sm text-[var(--color-mythos-gold-dim)] font-serif italic tracking-wide">
                        Investigator Mode
                    </div>
                </div>
            </header>
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
