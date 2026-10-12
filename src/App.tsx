/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ProcessSection } from './components/ProcessSection';
import { TeamSection } from './components/TeamSection';
import { LanguagesSection } from './components/LanguagesSection';
import { EthicsSection } from './components/EthicsSection';
import { OfficeSection } from './components/OfficeSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AdminAuthModal } from './components/AdminAuthModal';
import { Shield, LogOut } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('it');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [consultationService, setConsultationService] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Check admin state on load or query param ?admin=true
  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem('italia_immigrazione_admin') === 'true';
      const params = new URLSearchParams(window.location.search);
      if (params.get('admin') === 'true' || savedAdmin) {
        if (savedAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdminModalOpen(true);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Handle dynamic text direction (RTL for Arabic and Urdu)
  useEffect(() => {
    const isRtl = currentLang === 'ar' || currentLang === 'ur';
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  const handleOpenConsultation = (serviceName?: string) => {
    if (serviceName) {
      setConsultationService(serviceName);
    } else {
      setConsultationService('');
    }
    setIsConsultationOpen(true);
  };

  const handleLogoutAdmin = () => {
    try {
      localStorage.removeItem('italia_immigrazione_admin');
    } catch {
      // ignore
    }
    setIsAdmin(false);
  };

  return (
    <div className="min-h-screen bg-[#FCFAF6] text-[#10263D] flex flex-col selection:bg-[#B45F42]/20 selection:text-[#10263D]">
      {/* Top Banner ONLY visible when Owner is authenticated as Admin */}
      {isAdmin && (
        <div className="bg-[#B45F42] text-white py-2 px-4 text-xs flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>Modalità Amministratore attiva (I normali visitatori non vedono i pulsanti di modifica)</span>
            </span>
            <button
              type="button"
              onClick={handleLogoutAdmin}
              className="inline-flex items-center gap-1 bg-black/20 hover:bg-black/30 px-2.5 py-1 rounded-xs transition-colors"
            >
              <LogOut className="w-3 h-3" />
              <span>Esci da Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Fixed Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Cinematic Hero */}
        <Hero
          currentLang={currentLang}
          onOpenConsultation={() => handleOpenConsultation()}
        />

        {/* 2. Chi Siamo / Mission */}
        <AboutSection currentLang={currentLang} />

        {/* 3. Servizi (6 core areas with deep document checklist modal) */}
        <ServicesSection
          currentLang={currentLang}
          onOpenConsultationWithService={(serviceTitle) => handleOpenConsultation(serviceTitle)}
        />

        {/* 4. Come funziona (4-step workflow) */}
        <ProcessSection
          currentLang={currentLang}
          onOpenConsultation={() => handleOpenConsultation()}
        />

        {/* 5. Team di 5 persone (Public read-only by default, editable ONLY if isAdmin is true) */}
        <TeamSection
          currentLang={currentLang}
          isAdmin={isAdmin}
        />

        {/* 6. Lingue & Comunicazione */}
        <LanguagesSection
          currentLang={currentLang}
          onLanguageChange={setCurrentLang}
          onOpenConsultation={() => handleOpenConsultation()}
        />

        {/* 7. Esperienza e Collaborazione Legale */}
        <EthicsSection />

        {/* 8. Ufficio di Milano */}
        <OfficeSection currentLang={currentLang} />

        {/* 9. Contatti & Form di Richiesta */}
        <ContactSection
          currentLang={currentLang}
          initialService={consultationService}
        />
      </main>

      {/* Footer */}
      <Footer
        currentLang={currentLang}
        onOpenConsultation={() => handleOpenConsultation()}
        isAdmin={isAdmin}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Floating WhatsApp Quick Link */}
      <FloatingWhatsApp />

      {/* Fast Consultation Request Modal */}
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        defaultService={consultationService}
      />

      {/* Owner Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAuthenticated={() => setIsAdmin(true)}
      />
    </div>
  );
}
