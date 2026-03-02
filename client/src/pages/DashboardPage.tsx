import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, User, Loader2, Archive, ChevronRight } from 'lucide-react';

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
    const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());

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
            <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                    <p className="text-muted-foreground">Caricamento...</p>
                </div>
            </div>
        );
    }

    // Ordina per data decrescente
    const sortedPolls = [...polls].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Separa i sondaggi attivi (primi 2 non chiusi) dal resto
    const activePolls = sortedPolls.filter(p => !p.closedAt).slice(0, 2);
    const archivedPolls = sortedPolls.filter(p => 
        !activePolls.some(active => active.id === p.id)
    );

    // Raggruppa i sondaggi archiviati per mese
    const groupedByMonth = archivedPolls.reduce((acc, poll) => {
        const date = new Date(poll.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleDateString('it-IT', { 
            year: 'numeric', 
            month: 'long',
            timeZone: 'Europe/Rome'
        });
        
        if (!acc[monthKey]) {
            acc[monthKey] = { label: monthLabel, polls: [] };
        }
        acc[monthKey].polls.push(poll);
        return acc;
    }, {} as Record<string, { label: string; polls: Poll[] }>);

    const toggleMonth = (monthKey: string) => {
        setExpandedMonths(prev => {
            const newSet = new Set(prev);
            if (newSet.has(monthKey)) {
                newSet.delete(monthKey);
            } else {
                newSet.add(monthKey);
            }
            return newSet;
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
            {user?.role === 'ADMIN' && (
                <div className="flex justify-center sm:justify-end mb-8">
                    <Button 
                        onClick={() => navigate('/admin/create-poll')}
                        className="w-full sm:w-auto h-10 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        <span className="text-sm">Crea Nuovo Sondaggio</span>
                    </Button>
                </div>
            )}

            {polls.length === 0 ? (
                <Card className="glass-effect shadow-xl border-border/50 animate-scale-in">
                    <CardContent className="flex flex-col items-center justify-center py-20">
                        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center mb-5 shadow-lg">
                            <Calendar className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Nessun sondaggio disponibile</h3>
                        <p className="text-muted-foreground text-center max-w-md text-base">
                            Al momento non ci sono sondaggi attivi. Torna più tardi!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-12">
                    {/* Sondaggi Attivi */}
                    {activePolls.length > 0 && (
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-bold text-foreground">Sondaggi Attivi</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-3" />
                            </div>
                            <div className="grid gap-6 md:grid-cols-2">
                                {activePolls.map((poll, index) => (
                                    <Link
                                        key={poll.id}
                                        to={`/polls/${poll.id}`}
                                        className="block group animate-fade-in"
                                        style={{ animationDelay: `${index * 75}ms` }}
                                    >
                                        <Card className="h-full glass-effect border-2 border-primary/30 hover:border-primary hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
                                            <CardHeader className="pb-3 sm:pb-4">
                                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                                    <CardTitle className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                        {poll.title}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {index === 0 && (
                                                        <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 text-xs font-medium px-2 sm:px-3 py-1">
                                                            <span className="hidden sm:inline">Prossima Settimana</span>
                                                            <span className="sm:hidden">Prossima</span>
                                                        </Badge>
                                                    )}
                                                    {index === 1 && (
                                                        <Badge className="bg-primary/15 text-primary hover:bg-primary/25 text-xs font-medium px-2 sm:px-3 py-1">
                                                            <span className="hidden sm:inline">Settimana Corrente</span>
                                                            <span className="sm:hidden">Corrente</span>
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-3 sm:space-y-4">
                                                {poll.description && (
                                                    <CardDescription className="line-clamp-2 text-sm sm:text-base">
                                                        {poll.description}
                                                    </CardDescription>
                                                )}
                                                <div className="pt-2 sm:pt-3 border-t space-y-1.5 sm:space-y-2">
                                                    <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground">
                                                        <User className="w-4 h-4" />
                                                        <span>{poll.firstName} {poll.lastName}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                        <span>{new Date(poll.createdAt).toLocaleDateString('it-IT', { 
                                                            day: 'numeric', 
                                                            month: 'long',
                                                            timeZone: 'Europe/Rome'
                                                        })}</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Archivio Sondaggi */}
                    {archivedPolls.length > 0 && (
                        <section className="space-y-5">
                            <div className="flex items-center gap-3">
                                <Archive className="w-5 h-5 text-muted-foreground" />
                                <h3 className="text-xl font-semibold text-muted-foreground">Archivio</h3>
                                <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent ml-3" />
                                <span className="text-sm text-muted-foreground font-medium">{archivedPolls.length}</span>
                            </div>
                            <div className="space-y-4">
                                {Object.entries(groupedByMonth).map(([monthKey, { label, polls }]) => {
                                    const isExpanded = expandedMonths.has(monthKey);
                                    return (
                                        <div key={monthKey} className="bg-card/30 backdrop-blur-sm rounded-xl border border-border/50 overflow-hidden animate-fade-in">
                                            <button
                                                onClick={() => toggleMonth(monthKey)}
                                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-accent/30 transition-all duration-300 group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${
                                                        isExpanded ? 'rotate-90' : ''
                                                    }`} />
                                                    <h4 className="text-lg font-semibold capitalize group-hover:text-primary transition-colors">
                                                        {label}
                                                    </h4>
                                                </div>
                                                <Badge variant="secondary" className="text-xs">
                                                    {polls.length}
                                                </Badge>
                                            </button>
                                            <div className={`overflow-hidden transition-all duration-300 ${
                                                isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                                            }`}>
                                                <div className="px-5 pb-5 pt-2">
                                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                                        {polls.map((poll, index) => (
                                                            <Link
                                                                key={poll.id}
                                                                to={`/polls/${poll.id}`}
                                                                className="block group animate-fade-in"
                                                                style={{ animationDelay: `${index * 50}ms` }}
                                                            >
                                                                <Card className="h-full bg-card/60 backdrop-blur-sm hover:bg-card hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300">
                                                                    <CardHeader className="pb-3">
                                                                        <div className="flex justify-between items-start mb-2">
                                                                            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors line-clamp-2">
                                                                                {poll.title}
                                                                            </CardTitle>
                                                                        </div>
                                                                        {poll.closedAt ? (
                                                                            <Badge variant="destructive" className="w-fit text-xs px-2.5 py-0.5 font-medium">
                                                                                Chiuso
                                                                            </Badge>
                                                                        ) : (
                                                                            <Badge variant="success" className="w-fit text-xs px-2.5 py-0.5 font-medium">
                                                                                Aperto
                                                                            </Badge>
                                                                        )}
                                                                    </CardHeader>
                                                                    <CardContent className="space-y-3">
                                                                        {poll.description && (
                                                                            <CardDescription className="line-clamp-2 text-sm">
                                                                                {poll.description}
                                                                            </CardDescription>
                                                                        )}
                                                                        <div className="pt-2 border-t space-y-1.5">
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <User className="w-3.5 h-3.5" />
                                                                                <span>{poll.firstName} {poll.lastName}</span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                <Calendar className="w-3.5 h-3.5" />
                                                                                <span>{new Date(poll.createdAt).toLocaleDateString('it-IT', { 
                                                                                    day: 'numeric', 
                                                                                    month: 'long',
                                                                                    timeZone: 'Europe/Rome'
                                                                                })}</span>
                                                                            </div>
                                                                        </div>
                                                                    </CardContent>
                                                                </Card>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
