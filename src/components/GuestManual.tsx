import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, MapPin, Clock, Gift, Camera, Heart, Sparkles } from 'lucide-react';

interface GuestManualProps {
  onSectionChange?: (section: string) => void;
}

const GuestManual: React.FC<GuestManualProps> = ({ onSectionChange }) => {
  const handleRSVP = () => {
    window.open('https://www.simacieto.com.br', '_blank');
  };

  const handleGiftList = () => {
    if (onSectionChange) {
      onSectionChange('gifts');
    }
  };

  const handlePartyGallery = () => {
    if (onSectionChange) {
      onSectionChange('party');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-br from-wedding-marsala/20 via-wedding-gold/15 to-wedding-palha/10 border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <CardHeader className="text-center relative z-10 py-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-wedding-marsala mb-4">
             Seja Bem-vindo(a)
          </CardTitle>
          <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Estamos imensamente felizes por dividir esse momento tão especial com você! 
            Preparamos tudo com muito carinho e queremos que você aproveite cada instante 
            dessa celebração inesquecível. Por isso, criamos esse pequeno guia com 
            informações importantes sobre o nosso grande dia.
          </p>
        </CardHeader>
      </Card>

      {/* Horário */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Horário
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala">
            <p className="text-2xl font-bold text-wedding-marsala mb-3">
              Cerimônia: 16h em ponto
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Pedimos que chegue com, pelo menos, 30 minutos de antecedência, para que 
              tudo ocorra com tranquilidade e você não perca nenhum detalhe especial do 
              início da cerimônia.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Local */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Local
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala">
            <p className="text-2xl font-bold text-wedding-marsala mb-3">
              Palácio dos Ypês – São Joaquim da Barra (SP)
            </p>
            <p className="text-lg text-gray-700 mb-3 leading-relaxed">
              Um lugar lindo, ao ar livre e com clima de conto de fadas.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Vista-se com elegância e conforto, pois celebraremos o amor cercados pela natureza.
            </p>
          </div>
        </CardContent>
      </Card>

            {/* Dress Code */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
              Dress Code
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala">
            <p className="text-2xl font-bold text-wedding-marsala mb-3">
              Traje: Esporte fino / Passeio completo
            </p>
            <p className="text-lg text-gray-700 mb-3 leading-relaxed">
              Se inspire em tons suaves e looks elegantes.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Evite roupas brancas ou off-white — essa cor é reservada para a noiva. 💍
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Presentes */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Gift className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Presentes
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala">
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              Nosso maior presente é ter você conosco neste dia.
            </p>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Mas, se quiser nos ajudar a montar o novo lar, criamos uma lista de presentes no site:
            </p>
            <Button 
              onClick={handleGiftList}
              className="bg-wedding-marsala hover:bg-wedding-marsala/90 text-white px-6 py-2 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Ver Lista de Presentes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Fotos */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Celulares & Fotos
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala space-y-4">
            <p className="text-lg text-gray-700 leading-relaxed">
              Durante a cerimônia, convidamos você a registrar o seu ponto de vista, 
              compartilhe conosco sua experiência, mas lembre-se, <strong className="text-wedding-marsala">não atrapalhe os profissionais</strong>.
            </p>
            <Button 
              onClick={handlePartyGallery}
              className="bg-wedding-marsala hover:bg-wedding-marsala/90 text-white px-6 py-2 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
            >
              <Camera className="w-4 h-4 mr-2" />
              Ver Galeria da Festa
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* RSVP */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Confirmação de Presença (RSVP)
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala space-y-4">
            <p className="text-lg font-bold text-wedding-marsala">
              Confirme sua presença até o dia 01 de setembro de 2025.
            </p>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-md">
              <p className="text-lg text-yellow-800 font-bold mb-3 flex items-center gap-2">
                ⚠️ Informação Importante:
              </p>
              <p className="text-base text-yellow-800 mb-3 leading-relaxed">
                Caso não seja realizada a confirmação até a data estipulada, assumiremos que 
                não poderá comparecer, sendo assim, seu nome não constará na lista de presença 
                da festa, o que ocasionará um desconforto, pois não terá autorização para entrar.
              </p>
              <p className="text-base text-yellow-800 leading-relaxed">
                Somente confirme sua presença se realmente tiver interesse em ir, e caso 
                ocorra algum imprevisto posteriormente à confirmação, que lhe impeça de 
                participar, por gentileza, nos informe.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dica Final */}
      <Card className="bg-gradient-to-br from-wedding-marsala/20 via-wedding-gold/15 to-wedding-palha/10 border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-wedding-marsala rounded-full shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold text-wedding-marsala">
               Dica Final
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 relative z-10">
          <div className="bg-gradient-to-br from-wedding-gold/20 to-wedding-marsala/10 p-6 rounded-xl border-l-4 border-wedding-marsala space-y-4">
            <p className="text-xl text-gray-700 leading-relaxed font-medium">
              Vá leve, vá feliz e vá de coração aberto!
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Queremos você dançando, brindando e celebrando conosco cada segundo.
            </p>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
              <p className="text-lg text-red-800 font-bold mb-3 flex items-center gap-2">
                🚫 Lembrete Importante:
              </p>
              <p className="text-base text-red-800 leading-relaxed">
                Convidado não convida, então, não leve acompanhantes que não foram convidados, 
                todos foram selecionados a dedo, então não queremos indisposição na hora da festa.
              </p>
            </div>
            <p className="text-xl text-gray-700 font-bold text-center">
              Esse dia é nosso, mas ele também é seu!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Assinatura */}
      <Card className="bg-gradient-to-br from-wedding-marsala/10 via-wedding-gold/5 to-wedding-palha/5 border-0 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <CardContent className="text-center py-12 relative z-10">
          <div className="mb-6">
            <div className="w-16 h-1 bg-wedding-marsala mx-auto mb-4 rounded-full"></div>
          </div>
          <p className="text-xl text-gray-700 mb-3 font-medium">Com amor,</p>
          <p className="text-2xl font-bold text-wedding-marsala font-serif italic tracking-wide">
            Fabíola & Juninho
          </p>
          <div className="mt-6">
            <div className="w-16 h-1 bg-wedding-marsala mx-auto rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestManual; 