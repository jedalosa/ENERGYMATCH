import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { EnergyCoach } from './components/EnergyCoach';
import { UserProfile, Recommendation, PropertyType, UserRole, ClientType, Provider } from './types';
import { MapPin, ArrowRight, Zap, DollarSign, Home, CheckCircle, AlertCircle, Search, ShieldCheck, Briefcase, User, Settings, Lock, Activity, FileText, Upload, Sun, Wind, Cloud, Droplets, ArrowLeft, LogOut, Clock, Calendar, Mail, Save, Globe, Phone, Award, Map as MapIcon, X } from 'lucide-react';
import { generateRecommendations, analyzeEnergyBill, sendToN8N } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Landing Page Component ---

const LandingPage: React.FC<{ onSelectRole: (role: UserRole) => void }> = ({ onSelectRole }) => {
  const [showRoles, setShowRoles] = useState(false);

  return (
    <div className="min-h-screen bg-web3-dark flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[128px]"></div>
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img 
            src="https://raw.githubusercontent.com/jedalosa/energymatch/main/frontend/components/logo.png" 
            alt="EnergyMatch Logo" 
            className="h-12 w-auto object-contain" 
        />
      </div>

      <div className="relative z-10 text-center max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-700 p-6 flex flex-col items-center">
        
        {/* Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1] mt-8">
          Energy<span className="text-neon-cyan">Match</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mt-4 mb-8">
          Descubre la solución energética ideal. Analizamos tu consumo con IA y te conectamos con proveedores verificados en Colombia.
        </p>

        {/* CTA Buttons - Role Selection */}
        {!showRoles ? (
          <button 
            onClick={() => setShowRoles(true)}
            className="group relative inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full text-lg font-bold hover:bg-neon-cyan hover:text-black hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] z-20 cursor-pointer"
          >
            Iniciar Plataforma
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => onSelectRole('client')}
              className="bg-web3-card hover:bg-web3-card/80 border border-white/10 hover:border-neon-cyan p-6 rounded-2xl text-left transition-all group"
            >
              <div className="bg-neon-cyan/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6 text-neon-cyan" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Hogar o Empresa</h3>
              <p className="text-sm text-gray-400">Busco instalar paneles solares y ahorrar energía.</p>
            </button>

            <button 
              onClick={() => onSelectRole('provider')}
              className="bg-web3-card hover:bg-web3-card/80 border border-white/10 hover:border-green-400 p-6 rounded-2xl text-left transition-all group"
            >
              <div className="bg-green-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Proveedor</h3>
              <p className="text-sm text-gray-400">Ofrezco instalación, mantenimiento o consultoría.</p>
            </button>

             <button 
              onClick={() => onSelectRole('admin')}
              className="bg-web3-card hover:bg-web3-card/80 border border-white/10 hover:border-purple-400 p-6 rounded-2xl text-left transition-all group"
            >
              <div className="bg-purple-500/10 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Administrador</h3>
              <p className="text-sm text-gray-400">Gestión de la plataforma y verificación.</p>
            </button>
          </div>
        )}

      </div>
      
      <div className="absolute bottom-8 text-center text-gray-600 text-xs w-full">
         <button onClick={() => setShowRoles(false)} className={showRoles ? "text-gray-400 underline mb-2" : "hidden"}>Volver</button>
         <div>© 2024 EnergyMatch. Powered by Gemini.</div>
      </div>
    </div>
  );
};

// --- CLIENT (USER) FLOW COMPONENTS ---

// This step now acts as a Wizard for the Profile Setup
const OnboardingStep: React.FC<{ 
  profile: UserProfile; 
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
}> = ({ profile, setProfile, onNext }) => {
  const [internalStep, setInternalStep] = useState(1);
  const [hasBill, setHasBill] = useState<boolean | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geo Location Logic
  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setProfile(prev => ({
          ...prev,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: "Detectado por GPS"
          }
        }));
      }, (err) => alert("Error obteniendo ubicación."));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAnalyzing(true);
      const file = e.target.files[0];
      const data = await analyzeEnergyBill(file);
      
      setProfile(prev => ({
        ...prev,
        monthlyConsumptionKWh: data.consumption,
        monthlyCostCOP: data.cost,
        energyRate: data.rate,
        hasPeakConsumption: data.hasPeaks
      }));
      setAnalyzing(false);
    }
  };

  const handleSaveProfile = () => {
    // Simple LocalStorage simulation
    localStorage.setItem('energyMatch_userProfile', JSON.stringify(profile));
    alert("¡Perfil guardado exitosamente! Podrás consultarlo nuevamente.");
  };

  // Internal Wizard Steps
  const renderStep1_Consumption = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-neon-cyan mb-1">Análisis de Consumo</h2>
        <p className="text-gray-400 text-sm">Entendamos tu perfil energético actual.</p>
      </div>
      
      {/* Name Input Added Here */}
      <div>
         <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><User className="w-3 h-3"/> Nombre (Empresa / Hogar)</label>
         <input 
           type="text" 
           className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan outline-none"
           placeholder="Ej: Familia Pérez o Industrias SAS"
           value={profile.name || ''}
           onChange={e => setProfile({...profile, name: e.target.value})}
         />
      </div>

      {/* Bill Question */}
      <div className="bg-web3-dark p-4 rounded-xl border border-white/10">
        <p className="text-white text-sm mb-3">¿Tiene facturas de energía que desee cargar?</p>
        <div className="flex gap-2">
           <button 
             onClick={() => setHasBill(true)}
             className={`flex-1 py-2 px-4 rounded-lg text-sm border transition-all ${hasBill === true ? 'bg-neon-cyan text-web3-dark border-neon-cyan font-bold' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
           >
             Sí, cargar PDF/Foto
           </button>
           <button 
             onClick={() => setHasBill(false)}
             className={`flex-1 py-2 px-4 rounded-lg text-sm border transition-all ${hasBill === false ? 'bg-white text-web3-dark border-white font-bold' : 'border-white/20 text-gray-400 hover:border-white/50'}`}
           >
             No, ingresar manual
           </button>
        </div>
      </div>

      {/* Logic Branch: Upload or Manual */}
      {hasBill === true && (
        <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 text-center hover:border-neon-cyan/50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
          />
          {analyzing ? (
            <div className="flex flex-col items-center gap-2">
               <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
               <span className="text-neon-cyan text-sm">Analizando factura con Gemini AI...</span>
            </div>
          ) : (
             <>
               <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
               <p className="text-sm text-gray-300">Haz clic para subir o arrastra tu factura aquí</p>
               <p className="text-xs text-gray-500 mt-1">Soporta Imágenes y PDF</p>
             </>
          )}
        </div>
      )}

      {/* Fields (Show if Manual OR if Bill Analysis finished to allow editing) */}
      {(hasBill === false || (hasBill === true && !analyzing)) && (
        <>
          <div className="space-y-4">
             {/* Added Email Field */}
             <div>
                <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Mail className="w-3 h-3"/> Correo Electrónico (para resultados)</label>
                <input 
                  type="email" 
                  className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan outline-none"
                  placeholder="empresa@ejemplo.com"
                  value={profile.email || ''}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                />
             </div>
             <div>
                <label className="text-xs text-gray-400 mb-1 block">Costo Mensual Promedio (COP)</label>
                <input 
                  type="number" 
                  className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan outline-none"
                  placeholder="Ej: 2000000"
                  value={profile.monthlyCostCOP || ''}
                  onChange={e => setProfile({...profile, monthlyCostCOP: Number(e.target.value)})}
                />
             </div>
             <div>
                <label className="text-xs text-gray-400 mb-1 block">Consumo Mensual (kWh)</label>
                <input 
                  type="number" 
                  className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-neon-cyan outline-none"
                  placeholder="Ej: 3500"
                  value={profile.monthlyConsumptionKWh || ''}
                  onChange={e => setProfile({...profile, monthlyConsumptionKWh: Number(e.target.value)})}
                />
             </div>
          </div>
        </>
      )}
      
      {/* Operational Questions (Always Show) */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
         <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Clock className="w-3 h-3"/> Horas Operación/Día</label>
            <input 
              type="number"
              max="24"
              className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan"
              value={profile.operatingHours || ''}
              onChange={e => setProfile({...profile, operatingHours: Number(e.target.value)})}
            />
         </div>
         <div>
            <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3"/> Días Operación/Semana</label>
            <input 
              type="number"
              max="7"
              className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan"
              value={profile.operatingDays || ''}
              onChange={e => setProfile({...profile, operatingDays: Number(e.target.value)})}
            />
         </div>
      </div>

      <div className="pt-4">
        <button onClick={() => setInternalStep(2)} className="w-full bg-neon-cyan text-web3-dark font-bold py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center gap-2">
           Siguiente <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  const renderStep2_Property = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-neon-cyan mb-1">Características de Propiedad</h2>
        <p className="text-gray-400 text-sm">¿Cuál es la ubicación de tu propiedad?</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
         <div className="col-span-1">
            <label className="text-xs text-gray-400 mb-1 block">Tipo</label>
            <select 
              className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-3 text-white outline-none focus:border-neon-cyan"
              value={profile.propertyType}
              onChange={e => setProfile({...profile, propertyType: e.target.value as PropertyType})}
            >
              <option value={PropertyType.COMMERCIAL}>Comercial</option>
              <option value={PropertyType.INDUSTRIAL}>Industrial</option>
              <option value={PropertyType.RESIDENTIAL_OFFICE}>Oficina</option>
              <option value={PropertyType.RESIDENTIAL_HOME}>Casa</option>
            </select>
         </div>
         <div className="col-span-1">
            <label className="text-xs text-gray-400 mb-1 block">Ubicación (Barrio)</label>
            <input 
              type="text" 
              className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-3 text-white outline-none focus:border-neon-cyan"
              placeholder="Ej: Bocagrande"
              value={profile.neighborhood || ''}
              onChange={e => setProfile({...profile, neighborhood: e.target.value})}
            />
         </div>
      </div>
      
      <div>
         <button 
           onClick={handleGeoLocation}
           className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-3 rounded-lg text-neon-cyan transition-colors"
         >
           <MapPin className="w-4 h-4" />
           {profile.location ? "Ubicación Detectada" : "Detectar Ubicación GPS"}
         </button>
      </div>

      <div className="pt-4 flex gap-3">
        <button onClick={() => setInternalStep(1)} className="flex-1 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors">
           Atrás
        </button>
        <button onClick={() => setInternalStep(3)} className="flex-1 bg-neon-cyan text-web3-dark font-bold py-3 rounded-lg hover:bg-white transition-colors flex justify-center items-center gap-2">
           Siguiente <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  const renderStep3_Resources = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-neon-cyan mb-1">Recursos y Objetivos</h2>
        <p className="text-gray-400 text-sm">Personaliza la recomendación según tu entorno.</p>
      </div>

      {/* Visual Cards for Climate (Static indicators) */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-web3-dark border border-white/10 p-4 rounded-xl flex items-center gap-3">
            <Sun className="w-8 h-8 text-yellow-400" />
            <div>
               <div className="text-white font-bold text-sm">Alta Radiación</div>
               <div className="text-[10px] text-gray-500">Cartagena Avg</div>
            </div>
         </div>
         <div className="bg-web3-dark border border-white/10 p-4 rounded-xl flex items-center gap-3">
            <Wind className="w-8 h-8 text-gray-400" />
            <div>
               <div className="text-white font-bold text-sm">Viento Costero</div>
               <div className="text-[10px] text-gray-500">6.2 m/s</div>
            </div>
         </div>
      </div>

      <div>
         <label className="text-xs text-gray-400 mb-1 block">Presupuesto Inicial Estimado</label>
         <select 
            className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-neon-cyan"
            value={profile.budgetCOP || ''}
            onChange={e => setProfile({...profile, budgetCOP: e.target.value})}
         >
            <option value="">Seleccionar rango</option>
            <option value="low">Bajo (5M - 15M COP)</option>
            <option value="medium">Medio (15M - 50M COP)</option>
            <option value="high">Alto (50M+ COP)</option>
         </select>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        <div className="flex gap-3">
            <button onClick={() => setInternalStep(2)} className="flex-1 border border-white/20 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors flex justify-center items-center gap-2">
            <ArrowLeft className="w-4 h-4"/> Atrás
            </button>
            <button onClick={onNext} className="flex-1 bg-gradient-to-r from-neon-blue to-neon-cyan text-web3-dark font-bold py-3 rounded-lg hover:shadow-[0_0_20px_rgba(102,252,241,0.3)] transition-all flex justify-center items-center gap-2">
            Generar Análisis <ArrowRight className="w-4 h-4"/>
            </button>
        </div>
        {/* Save Profile Button */}
        <button onClick={handleSaveProfile} className="w-full text-xs text-gray-400 hover:text-neon-cyan flex items-center justify-center gap-2 py-2 border border-dashed border-white/10 rounded-lg hover:border-neon-cyan/50 transition-colors">
            <Save className="w-3 h-3"/> Guardar mi perfil para después
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
       <div className="bg-web3-card border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mb-6">
             {[1,2,3].map(step => (
                <div key={step} className={`w-2 h-2 rounded-full transition-colors ${internalStep === step ? 'bg-neon-cyan' : 'bg-white/10'}`}></div>
             ))}
          </div>

          {internalStep === 1 && renderStep1_Consumption()}
          {internalStep === 2 && renderStep2_Property()}
          {internalStep === 3 && renderStep3_Resources()}
       </div>
    </div>
  );
};

const AnalysisStep: React.FC<{
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onAnalyze: () => void;
  isLoading: boolean;
}> = ({ profile, setProfile, onAnalyze, isLoading }) => {
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-140px)]">
      {/* Map Section */}
      <div className="lg:col-span-2 bg-web3-card rounded-2xl border border-white/5 overflow-hidden relative group">
        <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
            {/* Placeholder for Google Map - No overlay */}
            <div 
              className="w-full h-full bg-[url('https://picsum.photos/1200/800?grayscale')] bg-cover bg-center opacity-60 transition-opacity"
            ></div>
            
            {/* Clean Location Info */}
            <div className="absolute top-4 left-4 bg-web3-dark/90 backdrop-blur border border-white/10 p-4 rounded-xl max-w-xs shadow-xl">
                <h3 className="font-bold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-neon-cyan"/> {profile.neighborhood || "Cartagena"}, Bolivar</h3>
                <p className="text-xs text-gray-400 mt-1">
                   {profile.location ? `GPS: ${profile.location.lat.toFixed(4)}, ${profile.location.lng.toFixed(4)}` : "Ubicación aproximada"}
                </p>
            </div>
        </div>
      </div>

      {/* Side Panel */}
      <div className="bg-web3-card border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
         <div>
            <h3 className="text-xl font-bold text-white mb-6">Variables del Sitio</h3>
            
            <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-sm text-gray-400">Radiación Solar Promedio</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                        5.5 <span className="text-sm text-yellow-500 font-normal">kWh/m²/día</span>
                    </div>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-sm text-gray-400">Velocidad del Viento</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                        6.2 <span className="text-sm text-blue-400 font-normal">m/s</span>
                    </div>
                </div>
            </div>
         </div>

         <div className="mt-8">
             <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl mb-4">
                 <p className="text-sm text-blue-200 flex gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>
                    Gemini buscará proveedores con tarifas competitivas en tu zona.
                 </p>
             </div>

             <button 
                onClick={onAnalyze}
                disabled={isLoading}
                className="w-full bg-neon-cyan text-web3-dark font-bold py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white transition-colors flex justify-center items-center gap-2"
            >
                {isLoading ? (
                    <>
                       <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                       Ranking Proveedores...
                    </>
                ) : (
                    <>Calcular Ranking <Zap className="w-5 h-5"/></>
                )}
            </button>
         </div>
      </div>
    </div>
  );
};

const ResultsStep: React.FC<{ recommendations: Recommendation[], onNext: () => void }> = ({ recommendations, onNext }) => {
    // Transform data for chart
    const data = recommendations.map(rec => ({
        name: rec.providerName.split(" ")[0], // Short name
        Inversión: rec.upfrontCost / 1000000, // Millions
        Ahorro: (rec.savingsMonthly * 12 * 5) / 1000000, // 5 Year savings in Millions
    }));

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-white">Ranking de Proveedores</h2>
                    <p className="text-gray-400">Mejores ofertas detectadas por kWh instalado.</p>
                </div>
                <div className="text-sm text-neon-cyan flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Enviado a tu correo
                </div>
            </div>

            {/* Recommendations Grid - Ranking Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map((rec, idx) => (
                    <div key={rec.id} className={`bg-web3-card border rounded-2xl p-6 transition-all group relative overflow-hidden ${idx === 0 ? 'border-neon-cyan shadow-[0_0_15px_rgba(102,252,241,0.15)]' : 'border-white/10 hover:border-white/30'}`}>
                        {idx === 0 && (
                            <div className="absolute top-0 right-0 bg-neon-cyan text-web3-dark text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
                                #1 MEJOR OPCIÓN
                            </div>
                        )}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-neon-cyan/10 transition-colors"></div>
                        
                        <div className="mb-4 relative">
                            <h3 className="text-xl font-bold text-white">{rec.providerName}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                                <Briefcase className="w-4 h-4"/> {rec.technology}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 relative">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-gray-300">Precio / kWp</span>
                                <span className="text-neon-cyan font-bold font-mono">${(rec.pricePerKW / 1000000).toFixed(2)}M</span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Potencia Sistema</span>
                                    <span className="text-white font-bold">{rec.capacityKW} kWp</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Inversión Total</span>
                                    <span className="text-white font-mono">${(rec.upfrontCost / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">ROI Estimado</span>
                                    <span className="text-green-400 font-bold">{rec.roiYears} años</span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-4 relative">
                             <div className="mb-4 text-[10px] text-center text-gray-500">
                                *Precio sujeto a visita técnica
                             </div>
                            <button onClick={onNext} className={`w-full font-bold py-3 rounded-xl transition-all ${idx === 0 ? 'bg-neon-cyan text-web3-dark hover:bg-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                                Cotizar con {rec.providerName.split(" ")[0]}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Financial Analysis Chart */}
            <div className="bg-web3-card border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-6">Comparativa de Rentabilidad</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#1F2833', borderColor: '#333', color: '#fff'}}
                                itemStyle={{color: '#fff'}}
                            />
                            <Legend />
                            <Bar dataKey="Inversión" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Ahorro" fill="#45A29E" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

const MarketplaceStep: React.FC = () => {
    const providers = [
        { id: '1', name: "SolarCaribe Pro", rating: 4.8, verified: true, tags: ["Residencial", "PyME", "Certificado RETIE"] },
        { id: '2', name: "EcoEnergy Cartagena", rating: 4.5, verified: true, tags: ["Industrial", "Eólica", "Mantenimiento"] },
        { id: '3', name: "Ingeniería Sostenible", rating: 4.2, verified: false, tags: ["Consultoría", "Diseño"] }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Directorio Completo</h2>
                <div className="flex gap-2">
                    <input type="text" placeholder="Filtrar por servicio..." className="bg-web3-card border border-white/10 rounded-lg px-4 py-2 text-sm text-white"/>
                    <button className="bg-neon-cyan/10 text-neon-cyan p-2 rounded-lg border border-neon-cyan/20"><Search className="w-5 h-5"/></button>
                </div>
             </div>

             {providers.map(provider => (
                 <div key={provider.id} className="bg-web3-card border border-white/5 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-neon-cyan/30 transition-all">
                     <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-lg">
                             {provider.name.substring(0,2)}
                         </div>
                         <div>
                             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                 {provider.name} 
                                 {provider.verified && <ShieldCheck className="w-4 h-4 text-neon-cyan" />}
                             </h3>
                             <div className="flex items-center gap-1 text-yellow-400 text-sm mb-1">
                                 {"★".repeat(Math.floor(provider.rating))}
                                 <span className="text-gray-500 ml-1">({provider.rating})</span>
                             </div>
                             <div className="flex gap-2 mt-2">
                                 {provider.tags.map(tag => (
                                     <span key={tag} className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded border border-white/5">{tag}</span>
                                 ))}
                             </div>
                         </div>
                     </div>
                     <div className="flex gap-3 w-full sm:w-auto">
                         <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors">
                             Ver Perfil
                         </button>
                         <button className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-neon-cyan text-web3-dark font-bold hover:bg-white transition-colors">
                             Solicitar Cotización
                         </button>
                     </div>
                 </div>
             ))}
        </div>
    );
};

// --- NEW DASHBOARDS ---

const ProviderDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'profile'>('dashboard');
    const [providerProfile, setProviderProfile] = useState<Provider>({
        id: '1',
        name: "SolarCaribe Pro",
        rating: 4.8,
        verified: true,
        specialties: ["Residencial", "Comercial"],
        certifications: ["RETIE", "ISO 9001", "Bureau Veritas"],
        zone: "Costa Caribe",
        energyTypes: ["Solar Fotovoltaica", "Eólica"],
        adminPhone: "+57 300 123 4567",
        adminEmail: "gerencia@solarcaribe.com",
        contactPhone: "+57 301 987 6543",
        contactEmail: "ventas@solarcaribe.com",
        website: "https://solarcaribe.pro",
        pricePerKW: 4200000,
        yearsExperience: 8,
        serviceLocations: ["Cartagena", "Barranquilla", "Santa Marta"]
    });

    const handleSaveProfile = () => {
        alert("Perfil actualizado correctamente (Simulación de Guardado)");
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <img 
                      src="https://raw.githubusercontent.com/jedalosa/energymatch/main/frontend/components/logo.png" 
                      alt="EnergyMatch Logo" 
                      className="h-12 w-auto object-contain" 
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Portal de Proveedores</h1>
                        <p className="text-gray-400">Bienvenido, {providerProfile.name}</p>
                    </div>
                </div>
                
                <div className="flex bg-web3-card p-1 rounded-lg border border-white/10">
                    <button 
                        onClick={() => setActiveTab('dashboard')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-neon-cyan text-web3-dark' : 'text-gray-400 hover:text-white'}`}
                    >
                        Dashboard
                    </button>
                    <button 
                         onClick={() => setActiveTab('profile')}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-neon-cyan text-web3-dark' : 'text-gray-400 hover:text-white'}`}
                    >
                        Mi Perfil
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-white">Verificado RETIE</span>
                    </div>
                    <button 
                      onClick={onLogout}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {activeTab === 'dashboard' ? (
                 <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="bg-web3-card p-6 rounded-2xl border border-white/5">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl"><Activity className="w-6 h-6 text-blue-400"/></div>
                                <span className="text-green-400 text-sm font-bold">+12%</span>
                             </div>
                             <div className="text-3xl font-bold text-white">24</div>
                             <div className="text-gray-400 text-sm">Solicitudes de Cotización (Leads)</div>
                         </div>
                         <div className="bg-web3-card p-6 rounded-2xl border border-white/5">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-500/10 rounded-xl"><Settings className="w-6 h-6 text-yellow-400"/></div>
                             </div>
                             <div className="text-3xl font-bold text-white">{providerProfile.rating}</div>
                             <div className="text-gray-400 text-sm">Calificación Promedio</div>
                         </div>
                         <div className="bg-web3-card p-6 rounded-2xl border border-white/5">
                             <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-neon-cyan/10 rounded-xl"><DollarSign className="w-6 h-6 text-neon-cyan"/></div>
                             </div>
                             <div className="text-3xl font-bold text-white">8</div>
                             <div className="text-gray-400 text-sm">Proyectos en Ejecución</div>
                         </div>
                    </div>

                    {/* Leads Table */}
                    <div className="bg-web3-card border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="font-bold text-white">Solicitudes Recientes</h3>
                            <button className="text-sm text-neon-cyan hover:underline">Ver todas</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-400">
                                <thead className="bg-white/5 text-gray-200 uppercase">
                                    <tr>
                                        <th className="px-6 py-4">Cliente</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Consumo</th>
                                        <th className="px-6 py-4">Estado</th>
                                        <th className="px-6 py-4">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">Hotel Las Américas</td>
                                        <td className="px-6 py-4">Comercial</td>
                                        <td className="px-6 py-4">4,500 kWh</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Nuevo</span></td>
                                        <td className="px-6 py-4"><button className="text-neon-cyan hover:text-white">Contactar</button></td>
                                    </tr>
                                     <tr className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">Familia Rodríguez</td>
                                        <td className="px-6 py-4">Hogar</td>
                                        <td className="px-6 py-4">450 kWh</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">Pendiente</span></td>
                                        <td className="px-6 py-4"><button className="text-neon-cyan hover:text-white">Contactar</button></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                 </>
            ) : (
                <div className="bg-web3-card border border-white/5 rounded-2xl p-6 md:p-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-right-4">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-neon-cyan"/> Editar Perfil de Proveedor
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Company Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex gap-2"><Briefcase className="w-4 h-4"/> Datos Comerciales</h3>
                            
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Nombre de la Empresa</label>
                                <input 
                                  className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan"
                                  value={providerProfile.name}
                                  onChange={e => setProviderProfile({...providerProfile, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Años Experiencia</label>
                                    <input 
                                      type="number"
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan"
                                      value={providerProfile.yearsExperience}
                                      onChange={e => setProviderProfile({...providerProfile, yearsExperience: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Precio Promedio / kWp (COP)</label>
                                    <input 
                                      type="number"
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan"
                                      value={providerProfile.pricePerKW}
                                      onChange={e => setProviderProfile({...providerProfile, pricePerKW: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                             <div>
                                <label className="text-xs text-gray-400 mb-1 block flex items-center gap-1"><Globe className="w-3 h-3"/> Página Web</label>
                                <input 
                                  className="w-full bg-web3-dark border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-neon-cyan"
                                  value={providerProfile.website}
                                  onChange={e => setProviderProfile({...providerProfile, website: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                             <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex gap-2"><Phone className="w-4 h-4"/> Contacto</h3>
                             
                             <div className="bg-white/5 p-4 rounded-lg space-y-3">
                                <span className="text-xs text-neon-cyan font-bold uppercase">Administración</span>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Celular Admin</label>
                                    <input 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm"
                                      value={providerProfile.adminPhone}
                                      onChange={e => setProviderProfile({...providerProfile, adminPhone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Email Admin</label>
                                    <input 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm"
                                      value={providerProfile.adminEmail}
                                      onChange={e => setProviderProfile({...providerProfile, adminEmail: e.target.value})}
                                    />
                                </div>
                             </div>

                             <div className="bg-white/5 p-4 rounded-lg space-y-3">
                                <span className="text-xs text-green-400 font-bold uppercase">Atención al Cliente (Leads)</span>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Celular Ventas</label>
                                    <input 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm"
                                      value={providerProfile.contactPhone}
                                      onChange={e => setProviderProfile({...providerProfile, contactPhone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block">Email Ventas</label>
                                    <input 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm"
                                      value={providerProfile.contactEmail}
                                      onChange={e => setProviderProfile({...providerProfile, contactEmail: e.target.value})}
                                    />
                                </div>
                             </div>
                        </div>
                        
                        {/* Scope */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                             <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2 flex gap-2"><Award className="w-4 h-4"/> Alcance y Certificaciones</h3>
                             
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block flex gap-1 items-center"><Zap className="w-3 h-3"/> Tipos de Energía</label>
                                    <textarea 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm h-24"
                                      placeholder="Ej: Solar FV, Eólica, Térmica..."
                                      value={providerProfile.energyTypes.join(", ")}
                                      onChange={e => setProviderProfile({...providerProfile, energyTypes: e.target.value.split(",")})}
                                    />
                                    <span className="text-[10px] text-gray-500">Separar por comas</span>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 mb-1 block flex gap-1 items-center"><Award className="w-3 h-3"/> Certificaciones</label>
                                    <textarea 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm h-24"
                                      placeholder="Ej: RETIE, ISO 9001..."
                                      value={providerProfile.certifications.join(", ")}
                                      onChange={e => setProviderProfile({...providerProfile, certifications: e.target.value.split(",")})}
                                    />
                                    <span className="text-[10px] text-gray-500">Separar por comas</span>
                                </div>
                                 <div>
                                    <label className="text-xs text-gray-400 mb-1 block flex gap-1 items-center"><MapIcon className="w-3 h-3"/> Cobertura (Lugares)</label>
                                    <textarea 
                                      className="w-full bg-web3-dark border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-neon-cyan text-sm h-24"
                                      placeholder="Ej: Cartagena, Toda Colombia..."
                                      value={providerProfile.serviceLocations.join(", ")}
                                      onChange={e => setProviderProfile({...providerProfile, serviceLocations: e.target.value.split(",")})}
                                    />
                                    <span className="text-[10px] text-gray-500">Separar por comas</span>
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 flex justify-end">
                        <button onClick={handleSaveProfile} className="bg-neon-cyan text-web3-dark font-bold px-8 py-3 rounded-xl hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-neon-cyan/20">
                            <Save className="w-5 h-5"/> Guardar Cambios
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const AdminDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img 
                      src="https://raw.githubusercontent.com/jedalosa/energymatch/main/frontend/components/logo.png" 
                      alt="EnergyMatch Logo" 
                      className="h-12 w-auto object-contain" 
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
                        <p className="text-gray-400">Vista general de la plataforma</p>
                    </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-full transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-web3-card p-4 rounded-xl border border-white/5">
                     <div className="text-xs text-gray-400 mb-1">Usuarios Totales</div>
                     <div className="text-2xl font-bold text-white">1,240</div>
                 </div>
                 <div className="bg-web3-card p-4 rounded-xl border border-white/5">
                     <div className="text-xs text-gray-400 mb-1">Proveedores</div>
                     <div className="text-2xl font-bold text-white">45</div>
                 </div>
                 <div className="bg-web3-card p-4 rounded-xl border border-white/5">
                     <div className="text-xs text-gray-400 mb-1">CO2 Ahorrado (Ton)</div>
                     <div className="text-2xl font-bold text-neon-cyan">850.5</div>
                 </div>
                 <div className="bg-web3-card p-4 rounded-xl border border-white/5">
                     <div className="text-xs text-gray-400 mb-1">Volumen Transado</div>
                     <div className="text-2xl font-bold text-green-400">$2.5B</div>
                 </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Verification Queue */}
                <div className="bg-web3-card border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-yellow-400"/> Verificaciones Pendientes
                    </h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">PV</div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Energía Solar del Norte SAS</div>
                                        <div className="text-xs text-gray-400">NIT: 900.123.456</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-green-500/20 text-green-400 rounded"><CheckCircle className="w-4 h-4"/></button>
                                    <button className="p-2 hover:bg-red-500/20 text-red-400 rounded"><X className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* System Logs */}
                <div className="bg-web3-card border border-white/5 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400"/> Logs del Sistema
                    </h3>
                    <div className="space-y-2 text-xs font-mono text-gray-400">
                        <div className="flex gap-2"><span className="text-green-400">[10:42 AM]</span> New user registration: ID #8492</div>
                        <div className="flex gap-2"><span className="text-blue-400">[10:40 AM]</span> Gemini API Request: Token usage 450</div>
                        <div className="flex gap-2"><span className="text-yellow-400">[10:35 AM]</span> Warning: High latency in region us-central1</div>
                        <div className="flex gap-2"><span className="text-green-400">[10:30 AM]</span> Smart Contract interaction verified: 0x7f...90</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Main App Component ---

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  
  // App Logic State
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    clientType: 'company',
    name: '',
    email: '',
    monthlyConsumptionKWh: 0,
    monthlyCostCOP: 0,
    propertyType: PropertyType.COMMERCIAL,
    location: null,
    roofAreaM2: 0,
    neighborhood: '',
    budgetCOP: '',
    operatingHours: 8,
    operatingDays: 6
  });

  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const runAnalysis = async () => {
    setLoading(true);
    const results = await generateRecommendations(profile);
    setRecommendations(results);
    setLoading(false);
    setCurrentStep(3);
    
    // Trigger N8N after generation
    if(profile.email) {
        sendToN8N(profile, results);
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    setCurrentView('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentView('landing');
    setUserRole(null);
    setCurrentStep(1);
  };

  if (currentView === 'landing') {
    return <LandingPage onSelectRole={handleRoleSelection} />;
  }

  // --- ROUTING BASED ON ROLE ---

  if (userRole === 'provider') {
      return (
          <div className="min-h-screen bg-web3-dark font-sans p-4 md:p-8">
              <ProviderDashboard onLogout={handleLogout} />
          </div>
      );
  }

  if (userRole === 'admin') {
      return (
           <div className="min-h-screen bg-web3-dark font-sans p-4 md:p-8">
              <AdminDashboard onLogout={handleLogout} />
          </div>
      );
  }

  // Default User (Client) Flow
  return (
    <Layout currentStep={currentStep} setCurrentStep={setCurrentStep} onLogout={handleLogout}>
      {currentStep === 1 && (
        <OnboardingStep 
            profile={profile} 
            setProfile={setProfile} 
            onNext={() => {
                // If user is done with wizard (internal logic in OnboardingStep handles steps 1-3)
                // We actually want to move to the 'Analysis' View (which is Step 2 in main nav)
                // But OnboardingStep contains the data gathering. 
                // Let's assume OnboardingStep calls onNext when all 3 internal steps are done.
                setCurrentStep(2);
            }} 
        />
      )}
      
      {currentStep === 2 && (
        <AnalysisStep 
            profile={profile} 
            setProfile={setProfile}
            onAnalyze={runAnalysis}
            isLoading={loading}
        />
      )}

      {currentStep === 3 && (
        <ResultsStep 
            recommendations={recommendations}
            onNext={() => setCurrentStep(4)}
        />
      )}

      {currentStep === 4 && (
        <MarketplaceStep />
      )}

      <EnergyCoach />
    </Layout>
  );
};

export default App;
