import React, { useState, useEffect } from 'react';
import WeddingHeader from '@/components/WeddingHeader';
import MusicPlayer from '@/components/MusicPlayer';
import CountdownTimer from '@/components/CountdownTimer';
import NavigationMenu from '@/components/NavigationMenu';
import GiftList from '@/components/GiftList';
import EventLocation from '@/components/EventLocation';
import PhotoGallery from '@/components/PhotoGallery';
import PartyGallery from '@/components/PartyGallery';
import MessageBoard from '@/components/MessageBoard';
import Raffle from '@/components/Raffle';
import GuestManual from '@/components/GuestManual';
import { Toaster } from 'sonner';
import { useAuth } from '@/lib/auth';
import { useSearchParams } from 'react-router-dom';
import { RAFFLE_ENABLED } from '@/lib/features';

const Index = () => {
  const [searchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(
    RAFFLE_ENABLED && sectionFromUrl === 'raffle' ? 'raffle' : 'countdown'
  );
  const { user, isAdmin } = useAuth();
  
  // Data do casamento - ajuste conforme necessário
  const weddingDate = new Date('2026-08-22T18:30:00');

  useEffect(() => {
    if (RAFFLE_ENABLED && sectionFromUrl === 'raffle') {
      setActiveSection('raffle');
    }
  }, [sectionFromUrl]);

  // Efeito para verificar autenticação ao montar o componente
  useEffect(() => {
    console.log('Estado de autenticação:', { user, isAdmin });
  }, [user, isAdmin]);

  const renderSection = () => {
    switch (activeSection) {
      case 'countdown':
        return (
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-elegant font-semibold mb-4 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.55)] md:text-foreground md:drop-shadow-none">
              Faltam apenas...
            </h2>
            <CountdownTimer targetDate={weddingDate} />
          </div>
        );
      case 'gifts':
        return <GiftList />;
      case 'location':
        return <EventLocation />;
      case 'gallery':
        return <PhotoGallery />;
      case 'party':
        return <PartyGallery />;
      case 'messages':
        return <MessageBoard />;
      case 'raffle':
        return <Raffle />;
      case 'manual':
        return <GuestManual onSectionChange={setActiveSection} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div
        className={`pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat md:hidden ${
          activeSection === 'countdown' ? '' : 'hidden'
        }`}
        style={{ backgroundImage: "url('/FotoFundo.jpeg')" }}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-black/35 md:hidden ${
          activeSection === 'countdown' ? '' : 'hidden'
        }`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b from-wedding-primary via-wedding-darkMarsala to-wedding-secondary ${
          activeSection === 'countdown' ? 'hidden md:block' : 'block'
        }`}
        aria-hidden
      />

      <div className="relative z-10">
      <MusicPlayer />
      <Toaster position="top-center" richColors />
      <div className="container mx-auto pt-14 sm:pt-6 pb-16 max-w-full">
        <WeddingHeader />
        <NavigationMenu
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          heroMode={activeSection === 'countdown'}
        />
        <main className="mt-0 pb-6 min-w-0">
          {renderSection()}
        </main>
      </div>
      </div>
      
      {/* Floating decorative elements */}
      <div className="hidden sm:block fixed top-20 left-10 w-4 h-4 bg-wedding-gold/40 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="hidden sm:block fixed top-32 right-16 w-3 h-3 bg-wedding-palha/40 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="hidden sm:block fixed bottom-40 left-20 w-5 h-5 bg-wedding-accent/40 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="hidden sm:block fixed bottom-60 right-8 w-2 h-2 bg-wedding-marsala/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
};

export default Index;
