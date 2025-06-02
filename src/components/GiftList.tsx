import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { QRCodeSVG } from 'qrcode.react';
import { Gift, CreditCard, QrCode } from 'lucide-react';

interface GiftItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  link: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
}

interface Experience {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  status: 'available' | 'reserved' | 'purchased';
  reservedBy?: string;
}

const GiftList: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [reservationName, setReservationName] = useState('');
  const [reservationEmail, setReservationEmail] = useState('');
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);

  const categories = [
    { id: 'all', name: 'Todos' },
    { id: 'casa', name: 'Casa' },
    { id: 'cozinha', name: 'Cozinha' },
    { id: 'decoracao', name: 'Decoração' },
    { id: 'experiencias', name: 'Experiências' },
  ];

  const gifts: GiftItem[] = [
    {
      id: '1',
      name: 'Jogo de Panelas Tramontina',
      category: 'cozinha',
      price: 427.41,
      image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-panelas-10-pecas-turim-antiaderente-tramontina/walaplace/tra20297064/1f539946889e61c6d643d9b494f2d692.jpeg',
      link: 'https://www.magazineluiza.com.br/jogo-de-panelas-10-pecas-turim-antiaderente-tramontina/p/gjehg54kh5/ud/cjpn/',
      status: 'available'
    },
    {
      id: '2',
      name: 'Liquidificador Oster',
      category: 'cozinha',
      price: 233.65,
      image: 'https://a-static.mlcdn.com.br/1500x1500/liquidificador-oster-1400-full-32l-preto/techshop/liqost00009/ed713034c6adfdcb230064ff2d9eadb7.jpeg',
      link: 'https://www.magazineluiza.com.br/liquidificador-oster-1400-full-32l-preto/p/dhk55j13j7/ep/liqu/',
      status: 'available'
    },
    {
      id: '3',
      name: 'Lava Louças 8 Serviços Preta Midea',
      category: 'cozinha',
      price:  1899.00,
      image: 'https://a-static.mlcdn.com.br/800x560/lava-loucas-8-servicos-preta-midea/mideacarrier/dwa08p1/9ca05f019e8890c9b8a0fc1dbbf7dcbf.jpeg',
      link: 'https://www.magazineluiza.com.br/lava-loucas-8-servicos-preta-midea/p/cc1a2h5d2k/ed/l08s/',
      status: 'available'
    },
    {
      id: '4',
      name: 'Cooktop 5 Bocas Mondial A Gas Glp Preto Ctg 02',
      category: 'cozinha',
      price: 483.55,
      image: 'https://a-static.mlcdn.com.br/800x560/cooktop-5-bocas-mondial-a-gas-glp-preto-ctg-02/magazineluiza/227131700/6e612e3fe78b04c7976fb45ab8b22184.jpg',
      link: 'https://www.magazineluiza.com.br/cooktop-5-bocas-mondial-a-gas-glp-preto-ctg-02/p/227131700/ed/ck5b/',
      status: 'available'
    },
    {
      id: '5',
      name: 'Forno Elétrico de Embutir Mueller Decorato',
      category: 'cozinha',
      price: 939.91,
      image: 'https://a-static.mlcdn.com.br/800x560/forno-eletrico-de-embutir-mueller-decorato-preto-44l/multiloja/12954/b46b99d54ca98e28e672557387cb62e9.jpeg',
      link: 'https://www.magazineluiza.com.br/forno-eletrico-de-embutir-mueller-decorato-preto-44l/p/kcgg1jge0e/ed/frne/',
      status: 'available'
    },
    {
      id: '6',
      name: 'Air Fryer Philips Walita Série 1000 XL NA130 Preta com Timer 6,2L',
      category: 'cozinha',
      price: 398.05,
      image: 'https://a-static.mlcdn.com.br/800x560/air-fryer-philips-walita-serie-1000-xl-na130-preta-com-timer-62l/magazineluiza/238674700/94ff2d09f2c72d63d220bb1c875a6ec0.jpg',
      link: 'https://www.magazineluiza.com.br/air-fryer-philips-walita-serie-1000-xl-na130-preta-com-timer-62l/p/238674700/ep/efso/',
      status: 'available'
    },
    {
      id: '7',
      name: 'Panela Elétrica de Arroz WAPWRC1000 5 Xícaras400W ',
      category: 'cozinha',
      price: 195.00,
      image: 'https://a-static.mlcdn.com.br/800x560/panela-eletrica-de-arroz-wapwrc1000-5-xicaras400w-220v/continentalcenter/340217047011720011/cc4a30a0d5fb15d407c0a8b7fcae2fee.jpeg',
      link: 'https://www.magazineluiza.com.br/panela-eletrica-de-arroz-wapwrc1000-5-xicaras400w-127v/p/jbcb915j73/ep/elpz/',
      status: 'available'
    },
    {
      id: '8',
      name: 'Cama Box Queen Preta + Colchão De Molas Ensacadas - Ortobom',
      category: 'casa',
      price: 2055.22,
      image: 'https://a-static.mlcdn.com.br/800x560/cama-box-queen-preta-colchao-de-molas-ensacadas-ortobom-airtech-springpocket-158x198x65cm/lucashomenew/3464/b0bdb2d91b09adfdbc51afed62b5d710.jpeg',
      link: 'https://www.magazineluiza.com.br/cama-box-queen-preta-colchao-de-molas-ensacadas-ortobom-airtech-springpocket-158x198x65cm/p/jgjh7fa6k8/co/cmbx/?seller_id=lucashomenew&region_id=123481&utm_source=google&utm_medium=cpc&utm_term=79728&utm_campaign=google_eco_per_ven_pla_mo_apo_3p_mo1-mo2-csp&utm_content=&partner_id=79728&gclsrc=aw.ds&gad_source=1&gad_campaignid=22581124484&gbraid=0AAAAAD4zZmQzbVZypAE7ThSBneh0OBT12&gclid=CjwKCAjwl_XBBhAUEiwAWK2hzrcpF6iuGwZRGBq2Ig-6Xp9EapOyEp9IDxMgnrP_D0l2DsGNxMy-0BoCtyAQAvD_BwE',
      status: 'available'
    },
    {
      id: '9',
      name: 'Kit Facas Tramontina 6 Peças',
      category: 'cozinha',
      price: 101.84,
      image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-facas-tramontina-com-cepo-plenus-23498028-6-pecas/magazineluiza/143379600/b0fc863ff0ac48e721de489fd611748e.jpg',
      link: 'https://www.magazineluiza.com.br/jogo-de-facas-tramontina-com-cepo-plenus-23498028-6-pecas/p/143379600/ud/ucep/?&seller_id=magazineluiza&utm_source=google&utm_medium=cpc&utm_term=79480&utm_campaign=google_eco_per_ven_pla_lev_apo_1p_ud-csp&utm_content=&partner_id=79480&gclsrc=aw.ds&gad_source=1&gad_campaignid=22416883677&gbraid=0AAAAAD4zZmQJQCFRZqUXo4uLKI7cx9laI&gclid=CjwKCAjwl_XBBhAUEiwAWK2hzgEQL2Glq2asSppmsspzhhOZQZSKscUq-hf3417cty-UKic8WHJ21BoCPxMQAvD_BwE',
      status: 'available'
    },
    {
      id: '10',
      name: 'Kit Copos 6 Peças Duralex',
      category: 'cozinha',
      price: 54.14,
      image: 'https://a-static.mlcdn.com.br/800x560/jogo-copos-vidro-suco-agua-aruba-465ml-nadir-cinza-6-uni-nadir-figueiredo/bazarshoppingmulticoisasltda/bsm00688/417e6a9ee5bc2db9a9e5878812ee60a2.jpeg',
      link: 'https://www.magazineluiza.com.br/jogo-copos-vidro-suco-agua-aruba-465ml-nadir-cinza-6-uni-nadir-figueiredo/p/de273e4j30/ud/coas/?&seller_id=bazarshoppingmulticoisasltda&utm_source=google&utm_medium=cpc&utm_term=79724&utm_campaign=google_eco_per_ven_pla_uti_apo_3p_cm-dec-ud-csp&utm_content=&partner_id=79724&gclsrc=aw.ds&gad_source=1&gad_campaignid=22556303744&gbraid=0AAAAAD4zZmQ1AcHRWjbmetZAvMZkPzeCS&gclid=CjwKCAjwl_XBBhAUEiwAWK2hznuLhXyAzKBZbuCfMLvQOKjrTgxceukNZjgYAlL7xu5Rf6_Hsh-3xxoCkD8QAvD_BwE',
      status: 'available'
    },
    {
      id: '11',
      name: 'Jogo de Talheres Faqueiro 24 Peças Preto Inox Positano Elegante Luxo Lyor',
      category: 'cozinha',
      price: 141.45,
      image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-talheres-faqueiro-24-pecas-preto-inox-positano-elegante-luxo-lyor/laspane/5387a2681/8636481773e4e4e7bf2e226f4c9b25a1.jpeg',
      link: 'https://www.magazineluiza.com.br/jogo-de-talheres-faqueiro-24-pecas-preto-inox-positano-elegante-luxo-lyor/p/jddh575h6f/ud/faqu/?&seller_id=laspane&utm_source=google&utm_medium=cpc&utm_term=79724&utm_campaign=google_eco_per_ven_pla_uti_apo_3p_cm-dec-ud-csp&utm_content=&partner_id=79724&gclsrc=aw.ds&gad_source=1&gad_campaignid=22556303744&gbraid=0AAAAAD4zZmQ1AcHRWjbmetZAvMZkPzeCS&gclid=CjwKCAjwl_XBBhAUEiwAWK2hzj27IF5qvJKilLxZw61Xl65cYyVkGvNmbKb01B88i8cvF2Y07vQdxhoCveYQAvD_BwE',
      status: 'available'
    },
    {
      id: '12',
      name: 'Kit Edredom Casal Queen Jogo de Lençol 06 peças Aconchego Dupla Face Casa Dona',
      category: 'casa',
      price: 161.49,
      image: 'https://m.media-amazon.com/images/I/71TSuDp8VdL._AC_SX679_.jpg',
      link: 'https://www.amazon.com.br/Edredom-Casal-Queen-Len%C3%A7ol-Aconchego/dp/B08NPZ2ZLR/ref=asc_df_B08NPZ2ZLR?mcid=22d656ed73533489a05cc1eeed94fa7c&tag=googleshopp00-20&linkCode=df0&hvadid=709968341182&hvpos=&hvnetw=g&hvrand=17064341022588744226&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9100592&hvtargid=pla-1052156380304&psc=1&language=pt_BR&gad_source=1',
      status: 'available'
    },
    {
      id: '13',
      name: 'Kit Toalhas de Banho 4 Peças',
      category: 'casa',
      price: 159.90,
      image: 'https://http2.mlstatic.com/D_NQ_NP_658405-MLB84364466058_052025-O-jogo-toalhas-banho-grande-100-algodo-4-pecas-chumbo.webp',
      link: 'https://produto.mercadolivre.com.br/MLB-3925240673-jogo-toalhas-banho-grande-100-algodo-4-pecas-chumbo-_JM?matt_tool=77109000&matt_internal_campaign_id=&matt_word=&matt_source=google&matt_campaign_id=22090354067&matt_ad_group_id=177303075550&matt_match_type=&matt_network=g&matt_device=c&matt_creative=728942947152&matt_keyword=&matt_ad_position=&matt_ad_type=pla&matt_merchant_id=5508841686&matt_product_id=MLB3925240673&matt_product_partition_id=2392713115901&matt_target_id=aud-1966490908987:pla-2392713115901&cq_src=google_ads&cq_cmp=22090354067&cq_net=g&cq_plt=gp&cq_med=pla&gad_source=1&gad_campaignid=22090354067&gbraid=0AAAAAD93qcBrkyUGY6K54x6ICOC5bBDBq&gclid=CjwKCAjwl_XBBhAUEiwAWK2hzukuAO_G2efC5A_N4j0F1-O5R-xlWXbygiXSgltaZaA7gshhxxSQoRoC0-EQAvD_BwE',
      status: 'available'
    },
    {
      id: '14',
      name: 'Jogo de Pratos 6 Peças',
      category: 'cozinha',
      price: 193.90,
      image: 'https://a-static.mlcdn.com.br/800x560/aparelho-de-jantar-12-pecas-alleanza-ceramica-branco-e-preto-redondo-ritz/magazineluiza/237743600/c1ae3386ffe7920fd8a4510d20c7a3e2.jpg',
      link: 'https://www.magazineluiza.com.br/aparelho-de-jantar-12-pecas-alleanza-ceramica-branco-e-preto-redondo-ritz/p/237743600/ud/apja/?seller_id=magazineluiza',
      status: 'available'
    },
     // Adicione mais presentes aqui
  ];

  const experiences: Experience[] = [
    {
      id: 'exp1',
      name: 'Jantar Romântico',
      description: 'Um jantar especial em um restaurante exclusivo',
      price: 500,
      image: '/images/experiences/jantar.jpg',
      status: 'available'
    },
    {
      id: 'exp2',
      name: 'Passeio de Helicóptero',
      description: 'Um passeio inesquecível sobre a cidade',
      price: 1500,
      image: '/images/experiences/helicoptero.jpg',
      status: 'available'
    },
    // Adicione mais experiências aqui
  ];

  const handleReserveGift = async (gift: GiftItem) => {
    if (!reservationName || !reservationEmail) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    try {
      // Aqui você implementaria a lógica de reserva no backend
      toast.success('Presente reservado com sucesso!');
      // Atualizar o status do presente
      gift.status = 'reserved';
      gift.reservedBy = reservationName;
    } catch (error) {
      toast.error('Erro ao reservar presente');
    }
  };

  const pixData = {
    key: '234.553.978.08',
    name: 'Fabii e Xuniim',
    bank: 'Nubank',
    agency: '1234',
    account: '56789-0'
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-wedding-primary border-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-wedding-secondary">Lista de Presentes</h3>
        <p className="text-wedding-secondary">
          Sua presença é nosso maior presente, mas se desejar nos presentear, aqui estão algumas sugestões
        </p>
      </Card>

      <Tabs defaultValue="gifts" className="w-full">
        <TabsList className="flex flex-wrap w-full bg-wedding-primary p-1 rounded-lg gap-1 mb-10">
          <TabsTrigger 
            value="gifts" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <Gift className="w-4 h-4 mr-2" />
            Presentes
          </TabsTrigger>
          <TabsTrigger 
            value="money" 
            className="flex-1 min-w-[150px] bg-wedding-secondary text-black data-[state=active]:bg-wedding-primary data-[state=active]:text-white rounded-md"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Presente em Dinheiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gifts">
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="bg-wedding-secondary text-black hover:bg-wedding-primary hover:text-white"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gifts
                .filter(gift => selectedCategory === 'all' || gift.category === selectedCategory)
                .map(gift => (
                  <Card key={gift.id} className="bg-wedding-primary border-wedding-primary">
                    <CardHeader>
                      <CardTitle className="text-wedding-secondary">{gift.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="relative w-full pt-[100%] bg-wedding-secondary/10 rounded-lg overflow-hidden">
                          <img 
                            src={gift.image} 
                            alt={gift.name}
                            className="absolute inset-0 w-full h-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/placeholder-gift.png';
                            }}
                          />
                        </div>
                        <p className="text-wedding-secondary font-semibold text-lg">
                          R$ {gift.price.toFixed(2)}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                            onClick={() => window.open(gift.link, '_blank')}
                          >
                            Ver na Loja
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="flex-1 bg-wedding-primary text-white hover:bg-wedding-primary/90"
                                disabled={gift.status !== 'available'}
                              >
                                Reservar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reservar Presente</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <Input
                                  placeholder="Seu nome"
                                  value={reservationName}
                                  onChange={(e) => setReservationName(e.target.value)}
                                />
                                <Input
                                  placeholder="Seu email"
                                  type="email"
                                  value={reservationEmail}
                                  onChange={(e) => setReservationEmail(e.target.value)}
                                />
                                <Button
                                  className="w-full bg-wedding-primary text-white"
                                  onClick={() => handleReserveGift(gift)}
                                >
                                  Confirmar Reserva
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="money">
          <Card className="bg-wedding-primary border-wedding-primary">
            <CardHeader>
              <CardTitle className="text-wedding-secondary text-2xl font-elegant">Presente em Dinheiro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-12">
                {/* Seção PIX */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="bg-wedding-secondary/10 p-6 rounded-xl w-full max-w-md">
                    <h3 className="text-xl font-semibold text-wedding-secondary text-center mb-6 flex items-center justify-center gap-2">
                      <QrCode className="w-5 h-5" />
                      PIX
                    </h3>
                    <div className="flex justify-center mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-lg">
                        <QRCodeSVG 
                          value={`PIX: ${pixData.key}`}
                          size={200}
                        />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Chave PIX</p>
                        <p className="text-wedding-secondary text-lg">{pixData.key}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-3 rounded-lg">
                        <p className="text-wedding-secondary font-semibold">Titular</p>
                        <p className="text-wedding-secondary text-lg">{pixData.name}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6 bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(pixData.key);
                        toast.success('Chave PIX copiada!');
                      }}
                    >
                      Copiar Chave PIX
                    </Button>
                  </div>
                </div>

                <div className="h-px bg-wedding-secondary/20" />

                {/* Seção Transferência Bancária */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-wedding-secondary text-center flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Transferência Bancária
                  </h3>
                  <div className="bg-wedding-secondary/10 p-6 rounded-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Banco</p>
                        <p className="text-wedding-secondary text-lg">{pixData.bank}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Agência</p>
                        <p className="text-wedding-secondary text-lg">{pixData.agency}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Conta</p>
                        <p className="text-wedding-secondary text-lg">{pixData.account}</p>
                      </div>
                      <div className="bg-wedding-secondary/20 p-4 rounded-lg">
                        <p className="text-wedding-secondary font-semibold mb-2">Titular</p>
                        <p className="text-wedding-secondary text-lg">{pixData.name}</p>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-6 bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                      onClick={() => {
                        navigator.clipboard.writeText(`${pixData.bank}\nAgência: ${pixData.agency}\nConta: ${pixData.account}\nTitular: ${pixData.name}`);
                        toast.success('Dados bancários copiados!');
                      }}
                    >
                      Copiar Dados Bancários
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GiftList;