import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, XCircle, Clock, User, Loader2, AlertTriangle } from 'lucide-react';

interface PollOption {
    id: number;
    optionText: string;
    capacity: number;
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
    const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

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

            await fetchPoll();
        } catch (error) {
            alert('Errore durante il salvataggio del voto');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClosePoll = async () => {
        setShowCloseConfirmation(false);

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Caricamento...</p>
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="shadow-md max-w-md">
                    <CardContent className="pt-6 text-center">
                        <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                        <h2 className="text-lg font-semibold mb-1.5">Sondaggio non trovato</h2>
                        <p className="text-sm text-muted-foreground mb-4">Il sondaggio non esiste o non è più disponibile</p>
                        <Button onClick={() => navigate('/')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Torna alla dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const votesByOption = poll.votes.reduce((acc, vote) => {
        if (!acc[vote.optionId]) {
            acc[vote.optionId] = [];
        }
        acc[vote.optionId].push(vote);
        return acc;
    }, {} as Record<number, Vote[]>);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
            <Link 
                to="/" 
                className="inline-flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-semibold">Torna ai sondaggi</span>
            </Link>

            <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 w-full">
                        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">{poll.title}</h1>
                        {poll.description && (
                            <p className="text-lg text-muted-foreground">{poll.description}</p>
                        )}
                    </div>
                    {user?.role === 'ADMIN' && !poll.closedAt && (
                        <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                            <Button 
                                variant="destructive" 
                                onClick={() => setShowCloseConfirmation(true)}
                                className="w-full sm:w-auto h-10 px-4 shadow-lg text-sm"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                <span>Chiudi Sondaggio</span>
                            </Button>
                        </div>
                    )}
                </div>
                {poll.closedAt ? (
                    <Badge variant="destructive" className="text-sm px-3 py-1 font-medium">
                        Chiuso il {new Date(poll.closedAt).toLocaleString('it-IT', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZone: 'Europe/Rome'
                        })}
                    </Badge>
                ) : (
                    <Badge variant="success" className="text-sm px-3 py-1 font-medium">
                        Aperto
                    </Badge>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Voting Section */}
                <Card className="glass-effect shadow-xl border-border/30 h-fit">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold">
                            {poll.closedAt ? 'Opzioni' : 'Le tue Scelte'}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {poll.closedAt ? 'Opzioni disponibili' : 'Seleziona una o più opzioni'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {poll.options.map((option, index) => {
                            const isSelected = selectedOptions.includes(option.id);
                            const voteCount = votesByOption[option.id]?.length || 0;
                            const isFull = voteCount >= option.capacity;
                            
                            return (
                                <label
                                    key={option.id}
                                    className={`
                                        flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-300
                                        ${poll.closedAt 
                                            ? 'cursor-not-allowed opacity-70 bg-muted/30' 
                                            : isFull && !isSelected
                                                ? 'cursor-not-allowed opacity-50 bg-muted/30'
                                                : 'cursor-pointer hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5'
                                        }
                                        ${isSelected 
                                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' 
                                            : isFull
                                                ? 'border-destructive/30 bg-destructive/5'
                                                : 'border-border bg-card'
                                        }
                                    `}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all
                                        ${isSelected 
                                            ? 'border-primary bg-primary' 
                                            : 'border-input bg-background'
                                        }
                                    `}>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleOption(option.id)}
                                        disabled={!!poll.closedAt || (isFull && !isSelected)}
                                        className="sr-only"
                                    />
                                    <span className="flex-1 font-semibold text-sm sm:text-base text-foreground">{option.optionText}</span>
                                    <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                                        <Badge variant={isFull ? "destructive" : "outline"} className="font-semibold text-xs">
                                            {voteCount}/{option.capacity}
                                        </Badge>
                                        {isFull && !isSelected && (
                                            <span className="hidden sm:inline text-xs text-destructive font-semibold">Completo</span>
                                        )}
                                    </div>
                                </label>
                            );
                        })}
                        {!poll.closedAt && (
                            <Button
                                onClick={handleVote}
                                className="w-full mt-4 h-10 text-sm font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                                disabled={submitting || selectedOptions.length === 0}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        <span className="hidden sm:inline">Salvataggio...</span>
                                        <span className="sm:hidden">Salva...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 sm:mr-2" />
                                        <span className="hidden sm:inline ml-2">Salva Voto</span>
                                        <span className="sm:hidden ml-2">Salva</span>
                                    </>
                                )}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <Card className="glass-effect shadow-xl border-border/30">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-2xl font-bold">
                            Riepilogo Risultati
                        </CardTitle>
                        <CardDescription className="text-base">
                            Risultati in tempo reale
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {poll.options.map((option, index) => {
                                const optionVotes = votesByOption[option.id] || [];
                                const capacityPercentage = option.capacity > 0 ? (optionVotes.length / option.capacity) * 100 : 0;
                                const isFull = optionVotes.length >= option.capacity;

                                return (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelectedOptionForModal(option.id)}
                                        className={`group relative bg-gradient-to-br from-card to-card/50 border-2 rounded-xl p-3 sm:p-4 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-left overflow-hidden ${
                                            isFull ? 'border-destructive/50 hover:border-destructive' : 'border-border hover:border-primary/50'
                                        }`}
                                        style={{ animationDelay: `${index * 75}ms` }}
                                    >
                                        {/* Background progress bar */}
                                        <div 
                                            className={`absolute inset-0 transition-all duration-500 ${
                                                isFull ? 'bg-destructive/5' : 'bg-primary/5'
                                            }`}
                                            style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                                        />
                                        
                                        <div className="relative">
                                            <p className="font-semibold text-foreground text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
                                                {option.optionText}
                                            </p>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className={`text-2xl sm:text-3xl font-bold ${
                                                        isFull ? 'text-destructive' : 'text-primary'
                                                    }`}>
                                                        {optionVotes.length}/{option.capacity}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground font-medium mt-0.5 sm:mt-1">
                                                        <span className="hidden sm:inline">posti occupati</span>
                                                        <span className="sm:hidden">posti</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xl sm:text-2xl font-bold ${
                                                        isFull ? 'text-destructive' : 'text-primary'
                                                    }`}>
                                                        {capacityPercentage.toFixed(0)}%
                                                    </p>
                                                    <p className="hidden sm:block text-xs text-muted-foreground font-medium mt-1">
                                                        {isFull ? 'completo' : 'disponibile'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {poll.options.length === 0 && (
                            <p className="text-muted-foreground text-center py-10">
                                Nessuna opzione disponibile
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modal for detailed votes */}
            {selectedOptionForModal !== null && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
                    onClick={() => setSelectedOptionForModal(null)}
                >
                    <Card
                        className="shadow-lg max-w-[90vw] sm:max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {(() => {
                            const option = poll.options.find((o) => o.id === selectedOptionForModal);
                            const optionVotes = votesByOption[selectedOptionForModal] || [];
                            const capacityPercentage = option && option.capacity > 0 ? (optionVotes.length / option.capacity) * 100 : 0;
                            const isFull = option && optionVotes.length >= option.capacity;

                            if (!option) return null;

                            return (
                                <>
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <CardTitle className="text-xl mb-1.5">
                                                    {option.optionText}
                                                </CardTitle>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className={`text-2xl font-bold ${
                                                        isFull ? 'text-destructive' : 'text-primary'
                                                    }`}>
                                                        {optionVotes.length}/{option.capacity}
                                                    </span>
                                                    <span className="text-muted-foreground text-sm">
                                                        posti {isFull ? '(completo!)' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedOptionForModal(null)}
                                                className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted rounded-lg"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="mt-3">
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-300 ${
                                                        isFull ? 'bg-destructive' : 'bg-primary'
                                                    }`}
                                                    style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1.5">
                                                {capacityPercentage.toFixed(0)}% • {option.capacity - optionVotes.length} {option.capacity - optionVotes.length === 1 ? 'posto disponibile' : 'posti disponibili'}
                                            </p>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {optionVotes.length > 0 ? (
                                            <div className="space-y-1.5">
                                                <p className="text-xs font-medium text-muted-foreground mb-2">
                                                    Chi ha votato (ordine di prenotazione):
                                                </p>
                                                {optionVotes
                                                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                                                    .map((vote, index) => (
                                                        <div
                                                            key={vote.id}
                                                            className="flex justify-between items-center gap-3 bg-muted/30 rounded-lg px-3 py-2.5 border border-transparent hover:border-primary/30 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                                                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs flex-shrink-0">
                                                                    #{index + 1}
                                                                </div>
                                                                <span className="font-medium text-foreground truncate text-sm">
                                                                    {vote.firstName} {vote.lastName}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
                                                                <Clock className="w-3 h-3" />
                                                                <span className="hidden sm:inline">
                                                                    {new Date(vote.timestamp).toLocaleString('it-IT', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                        timeZone: 'Europe/Rome'
                                                                    })}
                                                                </span>
                                                                <span className="sm:hidden">
                                                                    {new Date(vote.timestamp).toLocaleDateString('it-IT', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        timeZone: 'Europe/Rome'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8">
                                                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                                    <User className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">
                                                    Nessun voto per questa opzione
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </>
                            );
                        })()}
                    </Card>
                </div>
            )}

            {/* Modale di Conferma Chiusura */}
            {showCloseConfirmation && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in"
                    onClick={() => setShowCloseConfirmation(false)}
                >
                    <Card
                        className="shadow-lg max-w-[90vw] sm:max-w-md w-full max-h-[80vh] overflow-y-auto animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                                        <AlertTriangle className="w-6 h-6 text-destructive" />
                                    </div>
                                    <CardTitle className="text-xl">Chiudi Sondaggio</CardTitle>
                                </div>
                                <button
                                    onClick={() => setShowCloseConfirmation(false)}
                                    className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-muted rounded-lg"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Sei sicuro di voler chiudere questo sondaggio? 
                                <br />
                                <strong className="text-foreground">Questa azione è definitiva</strong> e gli utenti non potranno più votare.
                            </p>
                            <div className="flex gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setShowCloseConfirmation(false)}
                                >
                                    Annulla
                                </Button>
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleClosePoll}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Chiudi
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
