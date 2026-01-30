import React, { useState } from 'react';
import { AuthService } from '../services/AuthService';

interface AuthModalProps {
    onClose: () => void;
    onSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            let data;
            if (isRegister) {
                data = await AuthService.register(username, email, password);
            } else {
                data = await AuthService.login(email, password);
            }
            onSuccess(data.user);
            onClose();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 p-8 rounded-xl w-96 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>

                <h2 className="text-2xl font-bold text-cyan-500 mb-6 text-center">
                    {isRegister ? 'JOIN THE DEFENSE' : 'COMMANDER LOGIN'}
                </h2>

                {error && <div className="bg-red-500/20 text-red-500 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {isRegister && (
                        <input
                            type="text"
                            placeholder="Username"
                            className="bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="bg-slate-800 border border-slate-600 rounded p-3 text-white focus:border-cyan-500 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        className="mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded shadow-lg transition-transform active:scale-95"
                    >
                        {isRegister ? 'REGISTER' : 'LOGIN'}
                    </button>
                </form>

                <p className="mt-6 text-center text-slate-400 text-sm">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-cyan-400 hover:text-cyan-300 underline"
                    >
                        {isRegister ? 'Login' : 'Register'}
                    </button>
                </p>
            </div>
        </div>
    );
};
