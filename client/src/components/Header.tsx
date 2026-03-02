import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, Menu, X, Calendar, User, Mail } from 'lucide-react';
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
            <header className="glass-effect border-b border-border sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex justify-between items-center">
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/25 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/35">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <span className="text-xl md:text-2xl font-bold gradient-text">
                                Sprint N250
                            </span>
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2.5 text-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all duration-200"
                            aria-label="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Overlay */}
            <div 
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
                    mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileMenuOpen(false)}
            >
                {/* Sidebar */}
                <div
                    className={`fixed right-0 top-0 bottom-0 w-80 glass-effect shadow-2xl transform transition-transform duration-300 ease-out ${
                        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-border/50">
                        <h3 className="text-lg font-bold">Menu</h3>
                        <button
                            onClick={() => setMobileMenuOpen(false)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200"
                            aria-label="Chiudi"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-6 space-y-4 border-b border-border/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/25">
                                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-semibold text-foreground truncate">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                {user?.role === 'ADMIN' && (
                                    <Badge variant="default" className="mt-1.5 text-xs px-2.5 py-0.5 font-medium">
                                        Admin
                                    </Badge>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full justify-center h-11 font-semibold border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-center border-t border-border/50">
                        <p className="text-xs text-muted-foreground font-medium">
                            Sprint N250 Booking © 2026
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
