import React, { useState, useEffect } from 'react';
import WeddingHeader from '@/components/WeddingHeader';
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

const Index = () => {
  const [searchParams] = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const [activeSection, setActiveSection] = useState(
    sectionFromUrl === 'raffle' ? 'raffle' : 'countdown'
  );
  const { user, isAdmin } = useAuth();
  
  // Data do casamento - ajuste conforme necessário
  const weddingDate = new Date('2026-04-25T16:30:00');

  // Abrir seção da rifa quando a URL tiver ?section=raffle
  useEffect(() => {
    if (sectionFromUrl === 'raffle') {
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
            <h2 className="text-3xl font-elegant font-semibold mb-4 text-foreground">
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
    <div className="min-h-screen bg-gradient-to-b from-wedding-primary to-wedding-secondary">
      <Toaster position="top-center" richColors />
      <div className="container mx-auto px-4 pt-4 pb-16">
        <WeddingHeader />
        <NavigationMenu activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className="mt-0 pb-6">
          {renderSection()}
        </main>
      </div>
      
      {/* Floating decorative elements */}
      <div className="fixed top-20 left-10 w-4 h-4 bg-wedding-marsala/30 rounded-full animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="fixed top-32 right-16 w-3 h-3 bg-wedding-palha/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="fixed bottom-40 left-20 w-5 h-5 bg-wedding-accent/30 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="fixed bottom-60 right-8 w-2 h-2 bg-wedding-marsala/20 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
    </div>
  );
};

export default Index;
