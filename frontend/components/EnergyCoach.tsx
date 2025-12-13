import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { chatWithEnergyCoach } from '../services/geminiService';
import { ChatMessage } from '../types';

export const EnergyCoach: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: '¡Hola! Soy tu Energy Coach. Pregúntame sobre kWh, paneles solares o eficiencia energética en Cartagena.',
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare history for Gemini
    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithEnergyCoach(history, userMsg.text);
    
    setMessages(prev => [...prev, {
      role: 'model',
      text: responseText,
      timestamp: new Date()
    }]);
    setLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-web3-card border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900 to-web3-card p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-neon-cyan" />
              <h3 className="font-bold text-white">Energy Coach</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-web3-dark/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-neon-blue/20 text-white border border-neon-blue/30 rounded-br-none' 
                    : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-2xl rounded-bl-none">
                  <Loader2 className="w-4 h-4 animate-spin text-neon-cyan" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-web3-card border-t border-white/10 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu duda..."
              className="flex-1 bg-web3-dark border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-cyan transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="bg-neon-cyan text-web3-dark p-2 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-to-r from-neon-cyan to-neon-blue hover:scale-105'
        }`}
      >
        {isOpen ? <X className="w-6 h-6 text-web3-dark" /> : <MessageCircle className="w-6 h-6 text-web3-dark" />}
      </button>
    </div>
  );
};