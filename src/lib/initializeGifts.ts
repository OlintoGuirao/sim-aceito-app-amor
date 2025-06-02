import { initializeGifts, Gift } from './firestore';

const defaultGifts: Omit<Gift, 'id'>[] = [
  {
    name: 'Jogo de Panelas Tramontina',
    category: 'cozinha',
    price: 427.41,
    image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-panelas-10-pecas-turim-antiaderente-tramontina/walaplace/tra20297064/1f539946889e61c6d643d9b494f2d692.jpeg',
    link: 'https://www.magazineluiza.com.br/jogo-de-panelas-10-pecas-turim-antiaderente-tramontina/p/gjehg54kh5/ud/cjpn/',
    status: 'available'
  },
  {
    name: 'Liquidificador Oster',
    category: 'cozinha',
    price: 233.65,
    image: 'https://a-static.mlcdn.com.br/1500x1500/liquidificador-oster-1400-full-32l-preto/techshop/liqost00009/ed713034c6adfdcb230064ff2d9eadb7.jpeg',
    link: 'https://www.magazineluiza.com.br/liquidificador-oster-1400-full-32l-preto/p/dhk55j13j7/ep/liqu/',
    status: 'available'
  },
  {
    name: 'Lava Louças 8 Serviços Preta Midea',
    category: 'cozinha',
    price: 1899.00,
    image: 'https://a-static.mlcdn.com.br/800x560/lava-loucas-8-servicos-preta-midea/mideacarrier/dwa08p1/9ca05f019e8890c9b8a0fc1dbbf7dcbf.jpeg',
    link: 'https://www.magazineluiza.com.br/lava-loucas-8-servicos-preta-midea/p/cc1a2h5d2k/ed/l08s/',
    status: 'available'
  },
  {
    name: 'Cooktop 5 Bocas Mondial A Gas Glp Preto Ctg 02',
    category: 'cozinha',
    price: 483.55,
    image: 'https://a-static.mlcdn.com.br/800x560/cooktop-5-bocas-mondial-a-gas-glp-preto-ctg-02/magazineluiza/227131700/6e612e3fe78b04c7976fb45ab8b22184.jpg',
    link: 'https://www.magazineluiza.com.br/cooktop-5-bocas-mondial-a-gas-glp-preto-ctg-02/p/227131700/ed/ck5b/',
    status: 'available'
  },
  {
    name: 'Forno Elétrico de Embutir Mueller Decorato',
    category: 'cozinha',
    price: 939.91,
    image: 'https://a-static.mlcdn.com.br/800x560/forno-eletrico-de-embutir-mueller-decorato-preto-44l/multiloja/12954/b46b99d54ca98e28e672557387cb62e9.jpeg',
    link: 'https://www.magazineluiza.com.br/forno-eletrico-de-embutir-mueller-decorato-preto-44l/p/kcgg1jge0e/ed/frne/',
    status: 'available'
  },
  {
    name: 'Air Fryer Philips Walita Série 1000 XL NA130 Preta com Timer 6,2L',
    category: 'cozinha',
    price: 398.05,
    image: 'https://a-static.mlcdn.com.br/800x560/air-fryer-philips-walita-serie-1000-xl-na130-preta-com-timer-62l/magazineluiza/238674700/94ff2d09f2c72d63d220bb1c875a6ec0.jpg',
    link: 'https://www.magazineluiza.com.br/air-fryer-philips-walita-serie-1000-xl-na130-preta-com-timer-62l/p/238674700/ep/efso/',
    status: 'available'
  },
  {
    name: 'Panela Elétrica de Arroz WAPWRC1000 5 Xícaras400W',
    category: 'cozinha',
    price: 195.00,
    image: 'https://a-static.mlcdn.com.br/800x560/panela-eletrica-de-arroz-wapwrc1000-5-xicaras400w-220v/continentalcenter/340217047011720011/cc4a30a0d5fb15d407c0a8b7fcae2fee.jpeg',
    link: 'https://www.magazineluiza.com.br/panela-eletrica-de-arroz-wapwrc1000-5-xicaras400w-127v/p/jbcb915j73/ep/elpz/',
    status: 'available'
  },
  {
    name: 'Cama Box Queen Preta + Colchão De Molas Ensacadas - Ortobom',
    category: 'casa',
    price: 2055.22,
    image: 'https://a-static.mlcdn.com.br/800x560/cama-box-queen-preta-colchao-de-molas-ensacadas-ortobom-airtech-springpocket-158x198x65cm/lucashomenew/3464/b0bdb2d91b09adfdbc51afed62b5d710.jpeg',
    link: 'https://www.magazineluiza.com.br/cama-box-queen-preta-colchao-de-molas-ensacadas-ortobom-airtech-springpocket-158x198x65cm/p/jgjh7fa6k8/co/cmbx/',
    status: 'available'
  },
  {
    name: 'Kit Facas Tramontina 6 Peças',
    category: 'cozinha',
    price: 101.84,
    image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-facas-tramontina-com-cepo-plenus-23498028-6-pecas/magazineluiza/143379600/b0fc863ff0ac48e721de489fd611748e.jpg',
    link: 'https://www.magazineluiza.com.br/jogo-de-facas-tramontina-com-cepo-plenus-23498028-6-pecas/p/143379600/ud/ucep/',
    status: 'available'
  },
  {
    name: 'Kit Copos 6 Peças Duralex',
    category: 'cozinha',
    price: 54.14,
    image: 'https://a-static.mlcdn.com.br/800x560/jogo-copos-vidro-suco-agua-aruba-465ml-nadir-cinza-6-uni-nadir-figueiredo/bazarshoppingmulticoisasltda/bsm00688/417e6a9ee5bc2db9a9e5878812ee60a2.jpeg',
    link: 'https://www.magazineluiza.com.br/jogo-copos-vidro-suco-agua-aruba-465ml-nadir-cinza-6-uni-nadir-figueiredo/p/de273e4j30/ud/coas/',
    status: 'available'
  },
  {
    name: 'Jogo de Talheres Faqueiro 24 Peças Preto Inox Positano Elegante Luxo Lyor',
    category: 'cozinha',
    price: 141.45,
    image: 'https://a-static.mlcdn.com.br/800x560/jogo-de-talheres-faqueiro-24-pecas-preto-inox-positano-elegante-luxo-lyor/laspane/5387a2681/8636481773e4e4e7bf2e226f4c9b25a1.jpeg',
    link: 'https://www.magazineluiza.com.br/jogo-de-talheres-faqueiro-24-pecas-preto-inox-positano-elegante-luxo-lyor/p/jddh575h6f/ud/faqu/',
    status: 'available'
  },
  {
    name: 'Kit Edredom Casal Queen Jogo de Lençol 06 peças Aconchego Dupla Face Casa Dona',
    category: 'casa',
    price: 161.49,
    image: 'https://m.media-amazon.com/images/I/71TSuDp8VdL._AC_SX679_.jpg',
    link: 'https://www.amazon.com.br/Edredom-Casal-Queen-Len%C3%A7ol-Aconchego/dp/B08NPZ2ZLR',
    status: 'available'
  },
  {
    name: 'Kit Toalhas de Banho 4 Peças',
    category: 'casa',
    price: 159.90,
    image: 'https://http2.mlstatic.com/D_NQ_NP_658405-MLB84364466058_052025-O-jogo-toalhas-banho-grande-100-algodo-4-pecas-chumbo.webp',
    link: 'https://produto.mercadolivre.com.br/MLB-3925240673-jogo-toalhas-banho-grande-100-algodo-4-pecas-chumbo-_JM',
    status: 'available'
  },
  {
    name: 'Jogo de Pratos 6 Peças',
    category: 'cozinha',
    price: 193.90,
    image: 'https://a-static.mlcdn.com.br/800x560/aparelho-de-jantar-12-pecas-alleanza-ceramica-branco-e-preto-redondo-ritz/magazineluiza/237743600/c1ae3386ffe7920fd8a4510d20c7a3e2.jpg',
    link: 'https://www.magazineluiza.com.br/aparelho-de-jantar-12-pecas-alleanza-ceramica-branco-e-preto-redondo-ritz/p/237743600/ud/apja/',
    status: 'available'
  }
];

export const initializeDefaultGifts = async () => {
  try {
    await initializeGifts(defaultGifts);
    console.log('Lista de presentes inicializada com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar lista de presentes:', error);
  }
}; 