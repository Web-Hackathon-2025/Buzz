import { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Calendar, Star, User, 
  LogOut, Menu, X, Home
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('auth_token');

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navLinks = [
    { path: '/search', label: 'Search', icon: Search },
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    { path: '/reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md z-50 border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-700 to-orange-700 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">K</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent">
                Karigar
              </span>
            </Link>

            {isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-6">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                          isActive
                            ? 'bg-amber-100 text-amber-800'
                            : 'text-stone-700 hover:text-amber-700 hover:bg-stone-50'
                        }`}
                      >
                        <Icon size={18} />
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="flex items-center gap-4 pl-4 border-l border-stone-200">
                    <div className="flex items-center gap-2 text-stone-700">
                      <User size={18} />
                      <span className="text-sm font-medium">Customer</span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-stone-700 hover:text-amber-700 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="hidden lg:inline">Logout</span>
                    </button>
                  </div>
                </div>

                <button
                  className="md:hidden text-stone-700"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="px-6 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-amber-700 to-orange-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden bg-white border-t border-amber-100">
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-amber-100 text-amber-800'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <Icon size={20} />
                    {link.label}
                  </Link>
                );
              })}
              <div className="pt-4 border-t border-stone-200">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-stone-700 hover:bg-stone-50 rounded-lg w-full"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default Layout;

