import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Trash2, Loader2, Users, Minus, Calendar } from 'lucide-react';

interface PollOption {
    text: string;
    capacity: number;
}

export default function CreatePollPage() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState<PollOption[]>([
        { text: '', capacity: 6 },
        { text: '', capacity: 6 }
    ]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (user?.role !== 'ADMIN') {
        navigate('/');
        return null;
    }

    const addOption = () => {
        setOptions([...options, { text: '', capacity: 6 }]);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOptionText = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    const incrementCapacity = (index: number) => {
        const newOptions = [...options];
        newOptions[index].capacity = Math.min(newOptions[index].capacity + 1, 99);
        setOptions(newOptions);
    };

    const decrementCapacity = (index: number) => {
        const newOptions = [...options];
        newOptions[index].capacity = Math.max(newOptions[index].capacity - 1, 1);
        setOptions(newOptions);
    };

    const generateWeekDays = () => {
        const today = new Date();
        // Trova il lunedì della settimana corrente
        const currentMonday = new Date(today);
        currentMonday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        
        // Aggiungi 7 giorni per ottenere il lunedì della settimana successiva
        const nextMonday = new Date(currentMonday);
        nextMonday.setDate(currentMonday.getDate() + 7);
        
        const weekDays = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì'];
        const newOptions: PollOption[] = weekDays.map((day, index) => {
            const date = new Date(nextMonday);
            date.setDate(nextMonday.getDate() + index);
            const dayStr = date.getDate().toString().padStart(2, '0');
            const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
            const yearStr = date.getFullYear();
            return {
                text: `${day} ${dayStr}/${monthStr}/${yearStr}`,
                capacity: 6
            };
        });
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validOptions = options.filter((opt) => opt.text.trim() !== '' && opt.capacity > 0);
        if (validOptions.length < 2) {
            setError('Inserisci almeno 2 opzioni valide con capacità maggiore di 0');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch('/api/polls', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description,
                    options: validOptions,
                }),
            });

            if (!response.ok) throw new Error('Failed to create poll');

            const data = await response.json();
            navigate(`/polls/${data.id}`);
        } catch (error) {
            setError('Errore durante la creazione del sondaggio');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <Link 
                to="/" 
                className="inline-flex items-center gap-2 mb-8 text-primary hover:text-primary/80 transition-colors group"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-semibold">Torna ai sondaggi</span>
            </Link>

            <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold gradient-text mb-2 sm:mb-3">Crea Nuovo Sondaggio</h1>
                <p className="text-base sm:text-lg text-muted-foreground">Compila i campi per creare un nuovo sondaggio di prenotazione</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Info Base */}
                <div className="grid gap-4 sm:gap-5">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm sm:text-base font-semibold">Titolo del Sondaggio</Label>
                        <Input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="es. Prenotazioni Settimana 10-14 Marzo"
                            required
                            className="h-12 sm:h-12 text-base"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm sm:text-base font-semibold">Descrizione <span className="text-muted-foreground font-normal">(opzionale)</span></Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Aggiungi dettagli..."
                            rows={3}
                            className="resize-none text-base min-h-[100px]"
                        />
                    </div>
                </div>

                {/* Opzioni */}
                <Card className="glass-effect shadow-xl border-border/30">
                    <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl font-bold">
                                    Giorni e Posti Disponibili
                                </CardTitle>
                                <CardDescription className="text-base mt-1">
                                    Configura le opzioni con i posti disponibili per ciascuna
                                </CardDescription>
                            </div>
                            <Button
                                type="button"
                                onClick={generateWeekDays}
                                variant="outline"
                                size="default"
                                className="hidden sm:flex gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary transition-all"
                            >
                                <Calendar className="w-4 h-4" />
                                Genera Settimana
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 sm:p-6">
                        <div className="space-y-4">
                            {options.map((option, index) => (
                                <div 
                                    key={index} 
                                    className="group p-4 sm:p-5 rounded-xl border-2 border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:shadow-md"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {/* Numero */}
                                        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex items-center justify-center font-bold text-base shadow-md shadow-primary/20">
                                            {index + 1}
                                        </div>
                                        
                                        {/* Input Testo */}
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                type="text"
                                                value={option.text}
                                                onChange={(e) => updateOptionText(index, e.target.value)}
                                                placeholder={index === 0 ? "Lunedì 10/3" : index === 1 ? "Martedì 11/3" : `Giorno ${index + 1}`}
                                                className="h-11 sm:h-12 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-base font-medium"
                                            />
                                        </div>

                                        {/* Rimuovi (solo desktop) */}
                                        {options.length > 2 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                variant="ghost"
                                                size="icon"
                                                className="hidden sm:flex h-9 w-9 opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-destructive-foreground flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>

                                    {/* Capacità e Rimuovi Mobile */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 bg-muted/50 rounded-xl px-3 py-2.5 flex-1">
                                            <Button
                                                type="button"
                                                onClick={() => decrementCapacity(index)}
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg border-primary/20 hover:border-primary hover:bg-primary/10 flex-shrink-0"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <div className="flex items-center gap-2 justify-center flex-1">
                                                <Users className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                                                <span className="font-bold text-xl sm:text-lg tabular-nums text-primary">{option.capacity}</span>
                                                <span className="text-sm text-muted-foreground">posti</span>
                                            </div>
                                            <Button
                                                type="button"
                                                onClick={() => incrementCapacity(index)}
                                                variant="outline"
                                                size="icon"
                                                className="h-10 w-10 sm:h-9 sm:w-9 rounded-lg border-primary/20 hover:border-primary hover:bg-primary/10 flex-shrink-0"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        {/* Rimuovi (solo mobile) */}
                                        {options.length > 2 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeOption(index)}
                                                variant="outline"
                                                size="icon"
                                                className="sm:hidden h-10 w-10 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive flex-shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            onClick={addOption}
                            variant="outline"
                            className="w-full mt-4 h-12 sm:h-11 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all text-base"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Aggiungi Giorno
                        </Button>

                        <Button
                            type="button"
                            onClick={generateWeekDays}
                            variant="outline"
                            size="default"
                            className="w-full mt-2 sm:hidden gap-2 border-primary/30 hover:bg-primary/10"
                        >
                            <Calendar className="w-4 h-4" />
                            Genera Settimana Lavorativa
                        </Button>
                    </CardContent>
                </Card>

                {/* Anteprima */}
                {options.filter(opt => opt.text.trim() !== '').length > 0 && (
                    <Card className="glass-effect shadow-lg border-primary/20">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-muted-foreground">Anteprima Rapida</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                                {options
                                    .filter(opt => opt.text.trim() !== '')
                                    .map((opt, idx) => (
                                        <div 
                                            key={idx}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/10 text-primary text-sm font-semibold border border-primary/20"
                                        >
                                            <span>{opt.text}</span>
                                            <span className="text-xs opacity-75 font-medium">({opt.capacity} posti)</span>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {error && (
                    <div className="text-destructive text-sm bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-lg animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Azioni */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center sm:justify-end pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                        className="w-full sm:w-auto h-10 px-6 text-sm"
                    >
                        Annulla
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={submitting} 
                        className="w-full sm:w-auto h-10 px-6 text-sm shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creazione...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Crea Sondaggio
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
