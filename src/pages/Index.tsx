
import React, { useState } from 'react';
import WeddingHeader from '@/components/WeddingHeader';
import CountdownTimer from '@/components/CountdownTimer';
import NavigationMenu from '@/components/NavigationMenu';
import GuestManager from '@/components/GuestManager';
import GiftList from '@/components/GiftList';
import EventLocation from '@/components/EventLocation';
import PhotoGallery from '@/components/PhotoGallery';
import MessageBoard from '@/components/MessageBoard';

const Index = () => {
  const [activeSection, setActiveSection] = useState('countdown');
  
  // Data do casamento - ajuste conforme necessário
  const weddingDate = new Date('2024-06-15T16:00:00');

  const renderSection = () => {
    switch (activeSection) {
      case 'countdown':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-elegant font-semibold mb-8 text-foreground">
              Faltam apenas...
            </h2>
            <CountdownTimer targetDate={weddingDate} />
          </div>
        );
      case 'guests':
        return <GuestManager />;
      case 'gifts':
        return <GiftList />;
      case 'location':
        return <EventLocation />;
      case 'gallery':
        return <PhotoGallery />;
      case 'messages':
        return <MessageBoard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen wedding-gradient">
      <div className="container mx-auto px-4 py-8">
        <WeddingHeader />
        
        <NavigationMenu 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="animate-fade-in">
          {renderSection()}
        </div>
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
