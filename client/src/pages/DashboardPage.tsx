import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Poll {
    id: number;
    title: string;
    description: string;
    createdAt: string;
    closedAt: string | null;
    firstName: string;
    lastName: string;
}

export default function DashboardPage() {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        fetchPolls();
    }, [token, navigate]);

    const fetchPolls = async () => {
        try {
            const response = await fetch('/api/polls', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) throw new Error('Failed to fetch polls');

            const data = await response.json();
            setPolls(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <p className="text-foreground">Caricamento...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-foreground">Sondaggi</h2>
                {user?.role === 'ADMIN' && (
                    <Button onClick={() => navigate('/admin/create-poll')}>
                        Crea Nuovo Sondaggio
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {polls.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                        Nessun sondaggio disponibile
                    </p>
                ) : (
                    polls.map((poll) => (
                        <Link
                            key={poll.id}
                            to={`/polls/${poll.id}`}
                            className="block bg-card border border-border rounded-lg p-6 hover:bg-accent transition-colors"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {poll.title}
                                    </h3>
                                    {poll.description && (
                                        <p className="text-muted-foreground mb-2">{poll.description}</p>
                                    )}
                                    <p className="text-sm text-muted-foreground">
                                        Creato da {poll.firstName} {poll.lastName} •{' '}
                                        {new Date(poll.createdAt).toLocaleDateString('it-IT')}
                                    </p>
                                </div>
                                {poll.closedAt ? (
                                    <span className="px-3 py-1 bg-destructive text-destructive-foreground text-sm rounded-full">
                                        Chiuso
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-primary text-primary-foreground text-sm rounded-full">
                                        Aperto
                                    </span>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
