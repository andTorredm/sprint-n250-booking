import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function CreatePollPage() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (user?.role !== 'ADMIN') {
        navigate('/');
        return null;
    }

    const addOption = () => {
        setOptions([...options, '']);
    };

    const removeOption = (index: number) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validOptions = options.filter((opt) => opt.trim() !== '');
        if (validOptions.length < 2) {
            setError('Inserisci almeno 2 opzioni');
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
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link to="/" className="inline-block mb-4 text-primary hover:underline">
                ← Torna ai sondaggi
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-8">Crea Nuovo Sondaggio</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Titolo *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground"
                        required
                        placeholder="es. Prenotazioni Ufficio - Settimana 10-14 Marzo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Descrizione
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-input rounded-md text-foreground"
                        rows={3}
                        placeholder="Informazioni aggiuntive (opzionale)"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                        Opzioni *
                    </label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    className="flex-1 px-4 py-2 bg-background border border-input rounded-md text-foreground"
                                    placeholder={`Opzione ${index + 1}`}
                                />
                                {options.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => removeOption(index)}
                                    >
                                        Rimuovi
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={addOption}
                        className="mt-3"
                    >
                        + Aggiungi Opzione
                    </Button>
                </div>

                {error && (
                    <div className="text-destructive text-sm bg-destructive/10 border border-destructive px-4 py-2 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex gap-4">
                    <Button type="submit" disabled={submitting} className="flex-1">
                        {submitting ? 'Creazione...' : 'Crea Sondaggio'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/')}
                    >
                        Annulla
                    </Button>
                </div>
            </form>

        </div>
    );
}
