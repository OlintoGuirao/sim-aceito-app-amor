import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, Music, Plus, ThumbsUp, ThumbsDown, Heart, Camera, Clock, Gift } from 'lucide-react';
import { collection, query, orderBy, addDoc, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, getDoc, serverTimestamp, setDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useEmblaCarousel from 'embla-carousel-react';

// Interfaces
interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface SuggestedMusic {
  id: string;
  title: string;
  artist: string;
  suggestedBy: string;
  userId: string;
  likes: string[];
  dislikes: string[];
}

const PadrinhoPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [musicTitle, setMusicTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [suggestedMusics, setSuggestedMusics] = useState<SuggestedMusic[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const dresscodeImages = [
    'https://img.ltwebstatic.com/images3_pi/2025/01/07/82/17362321262a1b76b66ac9c105912006bd9a006254_thumbnail_405x.webp',
    'https://img.ltwebstatic.com/images3_pi/2025/01/07/c5/1736232128d9cb88e830eed010850ea40dc429da17_thumbnail_560x.webp',
    'https://img.ltwebstatic.com/images3_pi/2024/01/24/da/1706063409dfa5184aa50df866ba90c32a92094bf8_wk_1746698871_thumbnail_900x.webp',
    'https://img.ltwebstatic.com/images3_pi/2024/01/24/af/1706063405e2ad54118a292d0edaa0bc17a662ac68_wk_1746698870_thumbnail_900x.webp',
  ];

  // Função para formatar o nome dos padrinhos
  const formatPadrinhosNames = (email: string | undefined) => {
    if (!email) return '';
    
    // Remove o domínio do email
    const namesOnly = email.split('@')[0];
    
    // Substitui & por ' & ' para melhor espaçamento e capitaliza os nomes
    return namesOnly
      .split('&')
      .map(name => name.charAt(0).toUpperCase() + name.slice(1))
      .join(' & ');
  };

  // Carregar mensagens do chat
  useEffect(() => {
    const messagesRef = collection(db, 'padrinhosChat');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as Message[];
      
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  // Carregar checklist
  useEffect(() => {
    if (!user) return;

    const checklistRef = collection(db, 'padrinhosChecklist', user.uid, 'items');
    
    // Configurar o listener para atualizações em tempo real
    const unsubscribe = onSnapshot(checklistRef, (snapshot) => {
      if (snapshot.empty) {
        // Se não houver itens, criar os itens padrão
        const defaultItems = [
          { id: '1', label: 'Terno/vestido comprado', checked: false },
          { id: '2', label: 'Presença confirmada', checked: false },
          { id: '3', label: 'Música enviada', checked: false },
          { id: '4', label: 'Acessórios escolhidos', checked: false }
        ];

        // Criar cada item individualmente
        Promise.all(defaultItems.map(item => 
          setDoc(doc(checklistRef, item.id), item)
        )).catch(error => {
          console.error('Erro ao criar itens padrão:', error);
          toast.error('Erro ao criar checklist. Tente novamente.');
        });
      } else {
        // Converter os documentos em array de itens
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChecklistItem[];
        
        // Ordenar os itens pelo ID
        items.sort((a, b) => a.id.localeCompare(b.id));
        setChecklist(items);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Carregar músicas sugeridas
  useEffect(() => {
    const musicsRef = collection(db, 'suggestedMusics');
    const q = query(musicsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const musics = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SuggestedMusic[];
      
      setSuggestedMusics(musics);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi]);

  // Funções de manipulação
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, 'padrinhosChat'), {
        text: newMessage,
        userId: user.uid,
        userName: user.email,
        createdAt: serverTimestamp()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const toggleChecklistItem = async (itemId: string) => {
    if (!user) return;

    try {
      const itemRef = doc(db, 'padrinhosChecklist', user.uid, 'items', itemId);
      
      // Buscar o item atual
      const itemSnap = await getDoc(itemRef);
      if (!itemSnap.exists()) {
        // Se o item não existir, criar com o estado atual do checklist
        const currentItem = checklist.find(item => item.id === itemId);
        if (!currentItem) {
          throw new Error('Item não encontrado');
        }

        await setDoc(itemRef, {
          ...currentItem,
          checked: !currentItem.checked
        });
      } else {
        // Se o item existir, atualizar
        const currentItem = itemSnap.data() as ChecklistItem;
        await updateDoc(itemRef, {
          checked: !currentItem.checked
        });
      }

      // Feedback visual
      toast.success('Checklist atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar checklist:', error);
      toast.error('Erro ao atualizar o checklist. Tente novamente.');
    }
  };

  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicTitle.trim() || !artist.trim() || !user) return;

    try {
      await addDoc(collection(db, 'suggestedMusics'), {
        title: musicTitle,
        artist,
        suggestedBy: user.email,
        userId: user.uid,
        likes: [],
        dislikes: []
      });

      setMusicTitle('');
      setArtist('');
    } catch (error) {
      console.error('Erro ao sugerir música:', error);
    }
  };

  const handleMusicVote = async (musicId: string, voteType: 'like' | 'dislike') => {
    if (!user) return;

    const musicRef = doc(db, 'suggestedMusics', musicId);
    const music = suggestedMusics.find(m => m.id === musicId);
    
    if (!music) return;

    try {
      if (voteType === 'like') {
        if (music.likes.includes(user.uid)) {
          await updateDoc(musicRef, {
            likes: arrayRemove(user.uid)
          });
        } else {
          await updateDoc(musicRef, {
            likes: arrayUnion(user.uid),
            dislikes: arrayRemove(user.uid)
          });
        }
      } else {
        if (music.dislikes.includes(user.uid)) {
          await updateDoc(musicRef, {
            dislikes: arrayRemove(user.uid)
          });
        } else {
          await updateDoc(musicRef, {
            dislikes: arrayUnion(user.uid),
            likes: arrayRemove(user.uid)
          });
        }
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-wedding-primary/5 to-wedding-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header com animação */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8 bg-wedding-primary p-6 rounded-xl shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-wedding-gold flex items-center justify-center">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-elegant font-semibold text-slate-50">
                Bem-vindo(a), {formatPadrinhosNames(user?.email)}
              </h1>
              <p className="text-slate-50/70">Área exclusiva dos padrinhos</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            className="bg-wedding-secondary text-black hover:bg-wedding-gold border-wedding-primary"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna da Esquerda */}
          <div className="space-y-8">
            {/* Dresscode com animação */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-wedding-primary shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <Camera className="w-6 h-6 text-wedding-gold" />
                  <h2 className="text-2xl font-elegant font-semibold text-slate-50">
                    Dresscode
                  </h2>
                </div>
                <div className="space-y-6 text-slate-50">
                  <div className="aspect-video bg-wedding-secondary/20 rounded-xl overflow-hidden flex items-center justify-center md:h-[500px] mx-auto transform hover:scale-[1.02] transition-transform">
                    <div className="overflow-hidden w-full h-full" ref={emblaRef}>
                      <div className="flex h-full">
                        {dresscodeImages.map((src, idx) => (
                          <img
                            key={src}
                            src={src}
                            alt={`Exemplo de Dresscode ${idx + 1}`}
                            className="w-full h-full object-contain flex-[0_0_100%] min-w-0 bg-white"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    {dresscodeImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => emblaApi && emblaApi.scrollTo(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${selectedIndex === idx ? 'bg-wedding-gold w-4' : 'bg-gray-300 hover:bg-gray-400'}`}
                        aria-label={`Ir para o exemplo ${idx + 1}`}
                      />
                    ))}
                  </div>
                  <div className="bg-wedding-secondary/10 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-wedding-gold" />
                      Orientações
                    </h3>
                    <ul className="list-disc space-y-3 marker:text-wedding-gold">
                      <li>Padrinhos: Traje esporte fino na cor preta</li>
                      <li>Madrinhas: Vestido longo na cor preta</li>
                      <li>Sapatos sociais escuros para padrinhos</li>
                    </ul>
                  </div>
                  <div className="bg-wedding-secondary/10 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Lojas Sugeridas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <a
                        href="https://br.shein.com/ark/3715?goods_id=52661242&test=5051&url_from=adhub1194581989&scene=1&pf=google&ad_type=DPA&language=pt-br&siteuid=br&landing_page_id=3715&ad_test_id=9800&requestId=olw-4qexi4abracw&gad_source=1&skucode=I54vr06nq35g&coloration=1&onelink=0/googlefeed_br&gad_campaignid=22215650136&gclid=CjwKCAjwl_XBBhAUEiwAWK2hznSHm0M-WwYkr6G3OaZ4GKJk7S5MLbpFPCMksE_mk0u16SWZY4FxuhoC-DEQAvD_BwE&gbraid=0AAAAADm0yO6b-vhJONRXrjTcimfjh5ZoR&currency=BRL&lang=pt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-wedding-gold hover:underline hover:text-wedding-gold/80 transition-colors"
                      >
                        <Gift className="w-4 h-4" />
                        Loja 1 - Camisa
                      </a>
                      <a
                        href="https://br.shein.com/EVER-PRETTYVestidodeDamadeHonraFormalPretocomDecoteProfundoeFendaLateral,VestidodeConvidadodeCasamento-p-29542985-cat-3091.html?share_from=null&url_from=GM71101396375&ref=www&rep=dir&ret=br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-wedding-gold hover:underline hover:text-wedding-gold/80 transition-colors"
                      >
                        <Gift className="w-4 h-4" />
                        Loja 2 - Vestidos
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Sugestões de Música com animação */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-wedding-primary shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <Music className="w-6 h-6 text-wedding-gold" />
                  <h2 className="text-2xl font-elegant font-semibold text-slate-50">
                    Sugestões de Músicas
                  </h2>
                </div>
                <form onSubmit={handleMusicSubmit} className="mb-6 space-y-4">
                  <div className="bg-wedding-secondary/10 p-4 rounded-lg space-y-4">
                    <Input
                      value={musicTitle}
                      onChange={(e) => setMusicTitle(e.target.value)}
                      placeholder="Nome da música"
                      className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                    />
                    <Input
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Artista"
                      className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                    />
                    <Button
                      type="submit"
                      className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Sugerir Música
                    </Button>
                  </div>
                </form>
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {suggestedMusics.map((music) => (
                    <motion.div
                      key={music.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="transform hover:-translate-y-1 transition-all"
                    >
                      <Card className="p-4 bg-wedding-secondary/20 hover:bg-wedding-secondary/30">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Music className="w-4 h-4 text-wedding-gold" />
                              <h3 className="font-semibold text-slate-50">{music.title}</h3>
                            </div>
                            <p className="text-sm text-slate-50/70">{music.artist}</p>
                            <p className="text-xs text-slate-50/50 mt-1">
                              Sugerido por: {music.suggestedBy}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMusicVote(music.id, 'like')}
                              className={`hover:bg-wedding-secondary/20 ${
                                music.likes.includes(user?.uid || '')
                                  ? 'text-green-500'
                                  : 'text-slate-50'
                              }`}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              {music.likes.length}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMusicVote(music.id, 'dislike')}
                              className={`hover:bg-wedding-secondary/20 ${
                                music.dislikes.includes(user?.uid || '')
                                  ? 'text-red-500'
                                  : 'text-slate-50'
                              }`}
                            >
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              {music.dislikes.length}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Coluna da Direita */}
          <div className="space-y-8">
            {/* Checklist com animação */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 bg-wedding-primary shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-wedding-gold" />
                    <h2 className="text-2xl font-elegant font-semibold text-slate-50">
                      Seu Checklist
                    </h2>
                  </div>
                  <div className="text-wedding-gold bg-wedding-secondary/20 px-4 py-2 rounded-full">
                    <span className="text-lg font-semibold">
                      {checklist.filter(item => item.checked).length}
                    </span>
                    <span className="text-slate-50/70">/{checklist.length}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {checklist.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="transform hover:-translate-y-1 transition-all"
                    >
                      <div className="flex items-center space-x-3 bg-wedding-secondary/20 p-4 rounded-lg hover:bg-wedding-secondary/30">
                        <Checkbox
                          checked={item.checked}
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                          className="border-wedding-gold data-[state=checked]:bg-wedding-gold data-[state=checked]:text-black"
                        />
                        <label className="text-slate-50 flex-1 cursor-pointer">{item.label}</label>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {checklist.every(item => item.checked) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-wedding-gold/20 rounded-lg text-center"
                  >
                    <p className="text-wedding-gold font-semibold">
                      Parabéns! Você completou todas as tarefas! 🎉
                    </p>
                  </motion.div>
                )}
              </Card>
            </motion.div>

            {/* Chat com animação */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 bg-wedding-primary shadow-lg h-[500px] flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-6 h-6 text-wedding-gold" />
                  <h2 className="text-2xl font-elegant font-semibold text-slate-50">
                    Chat dos Padrinhos
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.userId === user?.uid
                            ? 'bg-wedding-gold text-black'
                            : 'bg-wedding-secondary/20 text-slate-50'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.userId === user?.uid ? 'Você' : formatPadrinhosNames(message.userName)}
                        </div>
                        <div>{message.text}</div>
                        <div className="text-xs mt-1 opacity-70">
                          {message.createdAt?.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                  />
                  <Button
                    type="submit"
                    className="bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PadrinhoPage; 