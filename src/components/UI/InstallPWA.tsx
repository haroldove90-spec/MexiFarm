import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setShowPopup(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    // If it's iOS and not already in standalone mode, show the prompt after a delay
    if (isIOSDevice && !(window.navigator as any).standalone) {
      const timer = setTimeout(() => setShowPopup(true), 3000);
      return () => clearTimeout(timer);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowPopup(false);
  };

  if (!showPopup) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 left-6 md:left-auto md:w-[400px] z-[100]"
      >
        <div className="glass border border-white/40 shadow-2xl rounded-[32px] p-6 backdrop-blur-xl overflow-hidden relative">
          {/* Decorative background elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#023E8A]/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#0077B6]/10 rounded-full blur-2xl" />

          <div className="relative flex items-start gap-5">
            <div className="shrink-0 w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center p-2 border border-slate-100">
              <img 
                src="https://appdesignproyectos.com/mexifarm.jpg" 
                alt="Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Instalar MexiFarm</h3>
                <button 
                  onClick={() => setShowPopup(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-5">
                Accede más rápido y disfruta de una experiencia nativa instalando la app en tu dispositivo.
              </p>

              {isIOS ? (
                <div className="bg-[#023E8A]/5 rounded-2xl p-4 border border-[#023E8A]/10">
                  <p className="text-xs font-bold text-[#023E8A] flex items-center gap-2 mb-2">
                    <Smartphone size={14} /> Instrucciones para iOS:
                  </p>
                  <ol className="text-[11px] text-slate-600 space-y-1.5 list-decimal list-inside font-medium">
                    <li>Toca el botón <span className="font-black">Compartir</span> en la barra inferior.</li>
                    <li>Desliza hacia abajo y selecciona <span className="font-black">"Añadir a pantalla de inicio"</span>.</li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#023E8A] to-[#0077B6] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#023E8A]/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Download size={18} />
                  Instalar ahora
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPWA;
