"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Role } from "@/lib/auth-types";

export default function LoginPage() {
    const router = useRouter();
    const { login, register } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState<Role>("INVESTIGATOR");

    // Error handling
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const result = await login(username, password);
        if (result.success) {
            router.push('/'); // Or dashboard based on role, handled by protected routes or here
        } else {
            setError(result.error || "Credenciais inválidas. Os Antigos não reconhecem você.");
        }
        setIsLoading(false);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        const result = await register(username, password, role);
        if (result.success) {
            // Register auto-logins
            // Redirection logic for fresh register
            if (role === 'KEEPER') router.push('/gm');
            else router.push('/dashboard');
        } else {
            // Translate common Supabase errors to Portuguese
            let ptError = result.error;
            if (ptError?.includes("Password should be at least 6 characters")) ptError = "A senha deve ter pelo menos 6 caracteres.";
            if (ptError?.includes("User already registered")) ptError = "Este nome já foi inscrito no Livro dos Condenados (Usuário já existe).";
            if (ptError?.includes("email rate limit exceeded")) ptError = "Muitas tentativas! Os Antigos exigem paciência (Desative a 'Confirmação de Email' no Supabase).";

            setError(ptError || "Erro ao criar conta.");
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-mythos-black)] p-4">
            {/* Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('/paper-texture.png')] mix-blend-overlay z-0" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading text-[var(--color-mythos-blood)] tracking-widest uppercase">
                        Arkham Archives
                    </h1>
                    <p className="text-[var(--color-mythos-gold-dim)] font-serif italic mt-2">
                        Entre por sua conta e risco.
                    </p>
                </div>

                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-black/40 border border-[var(--color-mythos-gold-dim)]/30">
                        <TabsTrigger value="login" className="data-[state=active]:bg-[var(--color-mythos-gold)] data-[state=active]:text-black font-heading tracking-wide">LOGIN</TabsTrigger>
                        <TabsTrigger value="register" className="data-[state=active]:bg-[var(--color-mythos-gold)] data-[state=active]:text-black font-heading tracking-wide">CRIAR CONTA</TabsTrigger>
                    </TabsList>

                    {/* LOGIN TAB */}
                    <TabsContent value="login">
                        <Card className="bg-[#120a0a] border-[var(--color-mythos-gold-dim)]/40 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-mythos-parchment)]">Acesse os Arquivos</CardTitle>
                                <CardDescription className="text-[var(--color-mythos-gold-dim)]">
                                    Identifique-se para acessar os registros proibidos.
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Nome de Usuário</Label>
                                        <Input
                                            id="username"
                                            placeholder="Ex: H.P. Lovecraft"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="bg-black/20 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Senha</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="******"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-black/20 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)]"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 text-xs italic">{error}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full hover-mythos" disabled={isLoading}>
                                        {isLoading ? "Consultando os astros..." : "Entrar"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>

                    {/* REGISTER TAB */}
                    <TabsContent value="register">
                        <Card className="bg-[#120a0a] border-[var(--color-mythos-gold-dim)]/40 shadow-2xl">
                            <CardHeader>
                                <CardTitle className="text-[var(--color-mythos-parchment)]">Novo Iniciado</CardTitle>
                                <CardDescription className="text-[var(--color-mythos-gold-dim)]">
                                    Inscreva seu nome no livro. Qual será seu destino?
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleRegister}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-username">Nome de Usuário</Label>
                                        <Input
                                            id="reg-username"
                                            placeholder="Seu nome"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="bg-black/20 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Senha</Label>
                                        <Input
                                            id="reg-password"
                                            type="password"
                                            placeholder="******"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="bg-black/20 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)] focus:border-[var(--color-mythos-gold)]"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Função</Label>
                                        <Select onValueChange={(val: Role) => setRole(val)} defaultValue="INVESTIGATOR">
                                            <SelectTrigger className="bg-black/20 border-[var(--color-mythos-gold-dim)]/30 text-[var(--color-mythos-parchment)]">
                                                <SelectValue placeholder="Selecione sua função" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1010] border-[var(--color-mythos-gold-dim)] text-[var(--color-mythos-parchment)]">
                                                <SelectItem value="INVESTIGATOR">Investigador (Player)</SelectItem>
                                                <SelectItem value="KEEPER">Guardião (Game Master)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-[0.7rem] text-[var(--color-mythos-gold-dim)] italic">
                                            * Guardiões têm acesso aos segredos proibidos e fichas de outros jogadores.
                                        </p>
                                    </div>
                                    {error && <p className="text-red-500 text-xs italic">{error}</p>}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" className="w-full hover-mythos" disabled={isLoading}>
                                        {isLoading ? "Inscrevendo..." : "Criar Conta"}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
