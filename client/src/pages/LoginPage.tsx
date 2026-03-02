import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password, firstName, lastName);
            }
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-primary/5 to-background">
            <div className="w-full max-w-md space-y-6 animate-fade-in">
                <div className="text-center space-y-3">
                    <h1 className="text-3xl font-bold tracking-tight">Sprint N250 Booking</h1>
                    <p className="text-sm text-muted-foreground">
                        {isLogin ? 'Accedi al tuo account' : 'Crea un nuovo account'}
                    </p>
                </div>

                <Card className="border-border/50 shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-semibold">
                            {isLogin ? 'Accedi' : 'Registrati'}
                        </CardTitle>
                        <CardDescription className="text-xs">
                            {isLogin ? 'Inserisci le tue credenziali' : 'Compila i campi per iniziare'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="grid grid-cols-2 gap-4 animate-slide-in">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName">Nome</Label>
                                        <Input
                                            id="firstName"
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Mario"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName">Cognome</Label>
                                        <Input
                                            id="lastName"
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Rossi"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nome@esempio.it"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="text-destructive text-sm bg-destructive/10 border border-destructive/30 px-4 py-3 rounded-lg animate-fade-in">
                                    {error}
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full h-11 font-medium" 
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Attendere...
                                    </>
                                ) : (
                                    <>
                                        {isLogin ? <LogIn className="w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                        {isLogin ? 'Accedi' : 'Registrati'}
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-5 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError('');
                                }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isLogin ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
