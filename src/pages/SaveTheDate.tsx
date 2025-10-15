import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Heart, Download, ArrowLeft, Sparkles } from 'lucide-react';

export function SaveTheDatePage() {
  const { guestId } = useParams();
  const navigate = useNavigate();

  console.log('SaveTheDatePage renderizando, guestId:', guestId);

  // Informações do casamento
  const weddingInfo = {
    title: "Casamento de Fabíola & Juninho",
    date: "2026-04-25",
    time: "16:30",
    location: "Espaço Cascata",
    address: "Suspense faz parte!",
    city: "Em breve...",
    description: "Queridos amigos e familiares, é oficial: vamos dizer 'sim!' Reserve esta data especial: 25 de abril de 2026. Sim, ainda falta um tempinho... mas já estamos tão animados que não conseguimos guardar segredo! Prepare o look, a dança, o coração e, é claro, o estômago — porque vai ter amor, festa e muita comida boa!",
    coupleNames: "Fabíola & Juninho"
  };

  const generateCalendarEvent = (calendarType: 'google' | 'outlook' | 'ics') => {
    const eventDate = new Date(weddingInfo.date + 'T' + weddingInfo.time);
    const endDate = new Date(eventDate.getTime() + (6 * 60 * 60 * 1000)); // 6 horas de duração
    
    const eventData = {
      title: weddingInfo.title,
      description: weddingInfo.description,
      location: `${weddingInfo.location}, ${weddingInfo.address}, ${weddingInfo.city}`,
      startDate: eventDate.toISOString(),
      endDate: endDate.toISOString()
    };

    let url = '';

    switch (calendarType) {
      case 'google':
        url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventData.title)}&dates=${eventData.startDate.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${eventData.endDate.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(eventData.description)}&location=${encodeURIComponent(eventData.location)}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(eventData.title)}&startdt=${eventData.startDate}&enddt=${eventData.endDate}&body=${encodeURIComponent(eventData.description + '\n\nLocal: ' + eventData.location)}&location=${encodeURIComponent(eventData.location)}`;
        break;
      case 'ics':
        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//SimAceito//Casamento//PT',
          'BEGIN:VEVENT',
          `DTSTART:${eventData.startDate.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
          `DTEND:${eventData.endDate.replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
          `SUMMARY:${eventData.title}`,
          `DESCRIPTION:${eventData.description}`,
          `LOCATION:${eventData.location}`,
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar' });
        const url_ics = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url_ics;
        link.download = 'casamento.ics';
        link.click();
        URL.revokeObjectURL(url_ics);
        return;
    }

    window.open(url, '_blank');
  };

  const eventDate = new Date(weddingInfo.date + 'T' + weddingInfo.time);
  const formattedDate = eventDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Em produção (ex.: GitHub Pages) o app pode estar em um subcaminho; use a BASE_URL e evite cache
  const baseUrlForAssets = (import.meta as any)?.env?.BASE_URL || '/';
  const saveTheDatePhotoUrl = `${baseUrlForAssets}SaveTheDate.jpg?v=1`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-wedding-primary via-wedding-darkMarsala to-wedding-primary">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-4 h-4 bg-wedding-gold/20 rounded-full animate-sparkle" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-32 right-16 w-3 h-3 bg-wedding-palha/30 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-5 h-5 bg-wedding-gold/15 rounded-full animate-sparkle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-60 right-8 w-2 h-2 bg-wedding-palha/25 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-6 h-6 bg-wedding-gold/10 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <Button
            variant="ghost"
            className="mb-6 text-wedding-palha hover:text-wedding-gold hover:bg-wedding-palha/10 border border-wedding-palha/20"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center justify-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-wedding-gold animate-pulse" />
            <h1 className="text-4xl font-elegant font-bold text-wedding-palha">Save the Date</h1>
            <Heart className="w-8 h-8 text-wedding-gold animate-pulse" />
          </div>
          
          <div className="bg-wedding-secondary/10 backdrop-blur-sm rounded-lg p-4 border border-wedding-palha/20">
            <p className="text-wedding-palha text-xl font-medium mb-2">
              Olá! 💕
            </p>
            <p className="text-wedding-palha/90">
              Salve a data do nosso casamento em seu calendário
            </p>
          </div>
        </div>

        {/* Event Card */}
        <Card className="bg-wedding-secondary/95 backdrop-blur-sm border-wedding-gold/30 mb-6 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-wedding-gold" />
              <CardTitle className="text-3xl font-elegant text-wedding-primary mb-2">
                {weddingInfo.coupleNames}
              </CardTitle>
              <Sparkles className="w-5 h-5 text-wedding-gold" />
            </div>
            <Badge className="w-fit mx-auto bg-wedding-primary text-wedding-palha border-wedding-gold/30 px-4 py-1">
              Casamento
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-6 px-6 pb-6">
            {/* Photo */}
            <div className="w-full">
              <div className="relative w-full overflow-hidden rounded-lg border border-wedding-gold/20 shadow-md bg-wedding-palha/5 flex items-center justify-center">
                <img
                  src={saveTheDatePhotoUrl}
                  alt="Foto do casal - Save the Date"
                  className="w-full h-auto max-h-96 md:max-h-[32rem] object-contain"
                />
              </div>
            </div>
            {/* Date & Time */}
            <div className="flex items-center gap-4 text-wedding-primary bg-wedding-primary/5 p-4 rounded-lg border border-wedding-primary/10">
              <div className="flex-shrink-0">
                <Calendar className="w-7 h-7 text-wedding-gold" />
              </div>
              <div>
                <p className="font-elegant font-semibold text-xl text-wedding-primary">{formattedDate}</p>
                <p className="text-wedding-primary/80 font-medium">às {weddingInfo.time}</p>
              </div>
            </div>

            {/* Description */}
            <div className="text-center text-wedding-primary bg-gradient-to-r from-wedding-primary/10 to-wedding-gold/10 p-6 rounded-lg border border-wedding-gold/20">
              <p className="leading-relaxed font-medium">{weddingInfo.description}</p>
            </div>

            
          </CardContent>
        </Card>

        {/* Calendar Options */}
        <Card className="bg-wedding-secondary/95 backdrop-blur-sm border-wedding-gold/30 mb-6 shadow-2xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardHeader className="pb-4">
            <CardTitle className="text-wedding-primary text-center text-2xl font-elegant">
              Adicionar ao Calendário
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4 px-6 pb-6">
            <Button
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => generateCalendarEvent('google')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Google Calendar
            </Button>
            
            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => generateCalendarEvent('outlook')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              Outlook Calendar
            </Button>
            
            <Button
              className="w-full bg-gradient-to-r from-wedding-primary to-wedding-darkMarsala hover:from-wedding-darkMarsala hover:to-wedding-primary text-wedding-palha font-medium py-4 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => generateCalendarEvent('ics')}
            >
              <Download className="w-5 h-5 mr-3" />
              Baixar Arquivo (.ics)
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <div className="bg-wedding-secondary/10 backdrop-blur-sm rounded-lg p-4 border border-wedding-palha/20">
            <p className="text-wedding-palha/90 text-sm">
              Com carinho, <span className="text-wedding-gold font-semibold">Fabíola e Juninho</span> 💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 