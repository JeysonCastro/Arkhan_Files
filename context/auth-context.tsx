"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/lib/auth-types'; // Removed StoredUser since Supabase handles passwords
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean, error?: string }>;
    register: (username: string, password: string, role: Role) => Promise<{ success: boolean, error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch initial session and profile
        const initializeAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                await fetchProfile(session.user.id);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setIsLoading(false);
            } else if (session?.user && !user) {
                // Only fetch profile if we don't have it yet to prevent loops
                await fetchProfile(session.user.id);
            } else if (event === 'INITIAL_SESSION' && !session) {
                setIsLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data && !error) {
                setUser({
                    id: data.id,
                    username: data.username,
                    role: data.role as Role
                });
            } else {
                console.error("Error fetching profile:", error);
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (username: string, password: string): Promise<{ success: boolean, error?: string }> => {
        setIsLoading(true);
        try {
            const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const email = `${safeUsername}@arkham-archives.com`;

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error || !data.user) {
                console.error("Login failed:", error);
                setIsLoading(false);
                return { success: false, error: error?.message || "Erro desconhecido ao entrar." };
            }

            await fetchProfile(data.user.id);
            return { success: true };
        } catch (error: any) {
            setIsLoading(false);
            return { success: false, error: error.message };
        }
    };

    const register = async (username: string, password: string, role: Role): Promise<{ success: boolean, error?: string }> => {
        setIsLoading(true);
        try {
            const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '');
            const email = `${safeUsername}@arkham-archives.com`;

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        role
                    }
                }
            });

            if (error || !data.user) {
                console.error("Register failed:", error);
                setIsLoading(false);
                return { success: false, error: error?.message || "Erro desconhecido ao registrar." };
            }

            // Wait a tiny bit for the automated trigger to run in Supabase
            await new Promise(r => setTimeout(r, 800));
            await fetchProfile(data.user.id);
            return { success: true };
        } catch (error: any) {
            setIsLoading(false);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
