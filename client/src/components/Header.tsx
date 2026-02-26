import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setMobileMenuOpen(false);
    };

    return (
        <>
            <header className="border-b border-border bg-card sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-xl md:text-2xl font-bold text-foreground hover:text-primary transition-colors">
                                Sprint N250 Booking
                            </Link>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
                            aria-label="Menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setMobileMenuOpen(false)}
            >
                <div
                    className={`fixed right-0 top-0 bottom-0 w-72 bg-card shadow-xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex justify-end items-center p-4 border-b border-border">
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-foreground hover:bg-accent rounded-md transition-colors"
                            aria-label="Chiudi"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        <div className="pb-4 border-b border-border">
                            <p className="text-sm font-medium text-foreground">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {user?.email}
                            </p>
                            {user?.role === 'ADMIN' && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                                    Amministratore
                                </span>
                            )}
                        </div>

                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full justify-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
