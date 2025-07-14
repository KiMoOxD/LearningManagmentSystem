"use client"

import { useAuth } from "@/context/AuthContext"
import PremiumSidebar from "@/components/Sidebar"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function MainLayout({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <p className="text-foreground">Loading...</p>
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen bg-background">
            <PremiumSidebar />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
} 