import React from 'react';
import { Sun, Wind, BarChart3, Users, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentStep, setCurrentStep, onLogout }) => {
  const navItems = [
    { id: 1, label: 'Perfil', icon: Users },
    { id: 2, label: 'Análisis', icon: Sun },
    { id: 3, label: 'Resultados', icon: BarChart3 },
    { id: 4, label: 'Mercado', icon: Users }, 
  ];

  return (
    <div className="min-h-screen bg-web3-dark font-sans selection:bg-neon-cyan/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-40 bg-web3-dark/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <img 
                src="https://raw.githubusercontent.com/jedalosa/energymatch/main/frontend/components/logo.png" 
                alt="EnergyMatch Logo" 
                className="h-14 w-auto object-contain" 
              />
            </div>
            
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentStep(item.id)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      currentStep === item.id 
                        ? 'text-neon-cyan border-b-2 border-neon-cyan py-5' 
                        : 'text-gray-400 hover:text-white py-5 border-b-2 border-transparent'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>

              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                  title="Salir"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile progress bar */}
      <div className="md:hidden fixed top-16 w-full h-1 bg-web3-card z-40">
        <div 
          className="h-full bg-neon-cyan transition-all duration-500" 
          style={{ width: `${(currentStep / 4) * 100}%` }}
        />
      </div>

      <main className="pt-20 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-auto bg-web3-dark py-8 text-center text-sm text-gray-500">
        <p>© 2024 EnergyMatch. Powered by Gemini & Google Cloud.</p>
        <div className="flex justify-center gap-4 mt-2">
           <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-white/5 border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div> Web3 Ready
           </span>
        </div>
      </footer>
    </div>
  );
};
