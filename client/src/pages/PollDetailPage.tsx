import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface PollOption {
    id: number;
    optionText: string;
}

interface Vote {
    id: number;
    userId: number;
    optionId: number;
    firstName: string;
    lastName: string;
    email: string;
    optionText: string;
    timestamp: string;
}

interface PollDetail {
    id: number;
    title: string;
    description: string;
    closedAt: string | null;
    options: PollOption[];
    votes: Vote[];
}

export default function PollDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [poll, setPoll] = useState<PollDetail | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedOptionForModal, setSelectedOptionForModal] = useState<number | null>(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchPoll();
        fetchMyVotes();
    }, [id, token, navigate]);

    const fetchPoll = async () => {
        try {
            const response = await fetch(`/api/polls/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch poll');

            const data = await response.json();
            setPoll(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchMyVotes = async () => {
        try {
            const response = await fetch(`/api/votes/${id}/my-votes`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) return;

            const data = await response.json();
            setSelectedOptions(data);
        } catch (error) {
        }
    };

    const handleVote = async () => {
        setSubmitting(true);
        try {
            const response = await fetch('/api/votes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    pollId: Number(id),
                    optionIds: selectedOptions,
                }),
            });

            if (!response.ok) throw new Error('Failed to submit vote');

            // Refresh poll data
            await fetchPoll();
        } catch (error) {
            alert('Errore durante il salvataggio del voto');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClosePoll = async () => {
        if (!confirm('Sei sicuro di voler chiudere questo sondaggio?')) return;

        try {
            const response = await fetch(`/api/polls/${id}/close`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to close poll');

            fetchPoll();
        } catch (error) {
            alert('Errore durante la chiusura del sondaggio');
        }
    };

    const toggleOption = (optionId: number) => {
        if (poll?.closedAt) return;

        setSelectedOptions((prev) =>
            prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId]
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-foreground">Caricamento...</p>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-foreground">Sondaggio non trovato</p>
            </div>
        );
    }

    // Group votes by option
    const votesByOption = poll.votes.reduce((acc, vote) => {
        if (!acc[vote.optionId]) {
            acc[vote.optionId] = [];
        }
        acc[vote.optionId].push(vote);
        return acc;
    }, {} as Record<number, Vote[]>);

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/" className="inline-block mb-4 text-primary hover:underline">
                ← Torna ai sondaggi
            </Link>
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <h1 className="text-3xl font-bold text-foreground">{poll.title}</h1>
                    {user?.role === 'ADMIN' && !poll.closedAt && (
                        <Button variant="destructive" onClick={handleClosePoll}>
                            Chiudi Sondaggio
                        </Button>
                    )}
                </div>
                {poll.description && (
                    <p className="text-muted-foreground mb-4">{poll.description}</p>
                )}
                {poll.closedAt && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-md mb-4">
                        Sondaggio chiuso il {new Date(poll.closedAt).toLocaleString('it-IT')}
                    </div>
                )}
            </div>

            <div className="space-y-12">
                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">
                        {poll.closedAt ? 'Opzioni' : 'Seleziona le tue opzioni'}
                    </h2>
                    <div className="space-y-3">
                        {poll.options.map((option) => (
                            <label
                                key={option.id}
                                className={`flex items-center space-x-3 p-4 bg-card border border-border rounded-lg ${poll.closedAt ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-accent'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedOptions.includes(option.id)}
                                    onChange={() => toggleOption(option.id)}
                                    disabled={!!poll.closedAt}
                                    className="w-5 h-5 rounded border-input"
                                />
                                <span className="text-foreground">{option.optionText}</span>
                                <span className="ml-auto text-sm text-muted-foreground">
                                    {votesByOption[option.id]?.length || 0} voti
                                </span>
                            </label>
                        ))}
                    </div>
                    {!poll.closedAt && (
                        <Button
                            onClick={handleVote}
                            className="w-full mt-4"
                            disabled={submitting || selectedOptions.length === 0}
                        >
                            {submitting ? 'Salvataggio...' : 'Salva Voto'}
                        </Button>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-foreground mb-4">Riepilogo Voti</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {poll.options.map((option) => {
                            const optionVotes = votesByOption[option.id] || [];

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => setSelectedOptionForModal(option.id)}
                                    className="bg-card border border-border rounded-lg p-4 hover:bg-accent transition-colors text-left cursor-pointer"
                                >
                                    <p className="font-medium text-foreground text-sm mb-2 line-clamp-2">
                                        {option.optionText}
                                    </p>
                                    <p className="text-2xl font-bold text-primary">
                                        {optionVotes.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {optionVotes.length === 1 ? 'voto' : 'voti'}
                                    </p>
                                </button>
                            );
                        })}
                        {poll.options.length === 0 && (
                            <p className="text-muted-foreground text-center py-8 col-span-full">
                                Nessuna opzione disponibile
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {selectedOptionForModal !== null && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedOptionForModal(null)}
                >
                    <div
                        className="bg-card border border-border rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const option = poll.options.find((o) => o.id === selectedOptionForModal);
                            const optionVotes = votesByOption[selectedOptionForModal] || [];
                            const totalVotes = poll.votes.length;
                            const percentage = totalVotes > 0 ? (optionVotes.length / totalVotes) * 100 : 0;

                            if (!option) return null;

                            return (
                                <>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-semibold text-foreground text-xl pr-4">
                                            {option.optionText}
                                        </h3>
                                        <button
                                            onClick={() => setSelectedOptionForModal(null)}
                                            className="text-muted-foreground hover:text-foreground text-2xl leading-none"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-3xl font-bold text-primary mb-2">
                                            {optionVotes.length} {optionVotes.length === 1 ? 'voto' : 'voti'}
                                        </p>
                                        {totalVotes > 0 && (
                                            <>
                                                <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {percentage.toFixed(0)}% del totale
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {optionVotes.length > 0 ? (
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                                                Chi ha votato (in ordine di prenotazione):
                                            </p>
                                            {optionVotes
                                                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                .map((vote, index) => (
                                                    <div
                                                        key={vote.id}
                                                        className="flex justify-between items-center text-sm bg-background rounded px-3 py-2"
                                                    >
                                                        <span className="text-foreground flex items-center gap-2">
                                                            <span className="font-semibold text-primary">#{index + 1}</span>
                                                            <span>{vote.firstName} {vote.lastName}</span>
                                                        </span>
                                                        <span className="text-muted-foreground text-xs">
                                                            {new Date(vote.timestamp).toLocaleString('it-IT', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">
                                            Nessun voto per questa opzione
                                        </p>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
}
