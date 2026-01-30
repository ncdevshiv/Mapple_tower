import React, { useState, useEffect } from 'react';
import { AuthModal } from './AuthModal';
import { AuthService } from '../services/AuthService';

interface MainMenuProps {
    onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
    const [showAuth, setShowAuth] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Check local token validity (simplified)
        const token = AuthService.getToken();
        if (token) {
            // Ideally we'd validte with backend, but for now assume logged in
            // Apps usually fetch /me here
            setUser({ username: 'Commander' }); // Placeholder until we fetch real user
        }
    }, []);

    const handleAuthSuccess = (u: any) => {
        setUser(u);
        setShowAuth(false);
    };

    const handleLogout = () => {
        AuthService.logout();
        setUser(null);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-50 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#1e293b_0%,#020617_100%)]"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

            {/* Animated Grid Floor */}
            <div className="absolute inset-0 perspective-1000 overflow-hidden pointer-events-none opacity-30">
                <div className="absolute bottom-0 w-[200%] h-[50%] -left-[50%] bg-[linear-gradient(transparent_0%,rgba(34,211,238,0.1)_1px,transparent_1px),linear-gradient(90deg,transparent_0%,rgba(34,211,238,0.1)_1px,transparent_1px)] bg-[length:40px_40px] rotate-x-60 animate-grid-flow transform-3d"></div>
            </div>

            {/* Auth Button (Top Right) */}
            <div className="absolute top-4 right-4 z-50">
                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-cyan-400 font-mono text-sm">CMD: {user.username}</span>
                        <button onClick={handleLogout} className="px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded text-xs tracking-widest uppercase">
                            Logout
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setShowAuth(true)} className="px-6 py-2 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 rounded text-xs tracking-widest uppercase shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                        Login / Register
                    </button>
                )}
            </div>

            <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
                {/* Logo / Title */}
                <div className="mb-12 text-center relative">
                    <div className="absolute -inset-10 bg-cyan-500/20 blur-[100px] rounded-full pointer-events-none"></div>
                    <h1 className="title-font text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] tracking-tighter">
                        CLASH
                    </h1>
                    <h2 className="title-font text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-purple-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] tracking-[0.2em] -mt-2 md:-mt-4">
                        DEFENSE
                    </h2>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <button
                        onClick={onStart}
                        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none border border-cyan-500/50 transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]"
                    >
                        <div className="absolute inset-0 bg-cyan-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <div className="relative flex items-center justify-center gap-3">
                            <span className="text-cyan-400 group-hover:text-white transition-colors font-bold text-xl uppercase tracking-widest title-font">Initialize</span>
                            <span className="text-cyan-400 group-hover:text-white transition-colors text-xl">▶</span>
                        </div>
                    </button>

                    <div className="text-center mt-8 text-slate-500 text-xs font-mono uppercase tracking-widest">
                        v1.0.0 // System Ready
                    </div>
                </div>
            </div>

            {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />}
        </div>
    );
};

export default MainMenu;
