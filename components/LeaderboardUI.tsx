import React, { useEffect, useState } from 'react';
import { LeaderboardService, LeaderboardEntry } from '../services/LeaderboardService';

interface LeaderboardUIProps {
    levelId: number;
    onClose: () => void;
}

export const LeaderboardUI: React.FC<LeaderboardUIProps> = ({ levelId, onClose }) => {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        LeaderboardService.getLeaderboard(levelId).then(data => {
            setEntries(data);
            setLoading(false);
        });
    }, [levelId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-xl w-[500px] shadow-2xl relative max-h-[80vh] flex flex-col">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>

                <h2 className="text-2xl font-bold text-cyan-500 mb-2 text-center">LEADERBOARD</h2>
                <p className="text-slate-400 text-xs text-center mb-6 uppercase tracking-widest">Level {levelId} - Top Commanders</p>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 pr-2">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 uppercase font-mono text-xs sticky top-0 bg-slate-900 z-10">
                                <tr>
                                    <th className="py-2">Rank</th>
                                    <th className="py-2">Commander</th>
                                    <th className="py-2 text-right">Wave</th>
                                    <th className="py-2 text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {entries.map((entry, index) => (
                                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="py-3 font-mono text-slate-500">#{index + 1}</td>
                                        <td className="py-3 font-bold text-white">{entry.username}</td>
                                        <td className="py-3 text-right text-cyan-400">{entry.waves_survived}</td>
                                        <td className="py-3 text-right text-amber-400 font-mono">{entry.score.toLocaleString()}</td>
                                    </tr>
                                ))}
                                {entries.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-slate-600 italic">No records yet. Be the first!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
