import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface AdminRouteProps {
    children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                setIsAuthorized(false);
                setIsLoading(false);
                return;
            }

            try {
                // Force token refresh to ensure custom claims are up-to-date
                const idTokenResult = await user.getIdTokenResult(true);
                if (idTokenResult.claims.admin === true) {
                    setIsAuthorized(true);
                } else {
                    console.warn('Unauthorized admin access attempt by:', user.email);
                    // Sign out unauthorized user attempting to access admin dashboard
                    await auth.signOut();
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('Failed to verify admin claims:', error);
                setIsAuthorized(false);
            } finally {
                setIsLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
                <div className="relative flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <ShieldCheck className="w-5 h-5 text-primary absolute" />
                </div>
                <p className="text-gray-500 font-medium text-sm">Verifying administrator authorization...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
}
