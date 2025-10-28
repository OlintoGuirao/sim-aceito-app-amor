import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, Send, Music, Plus, ThumbsUp, ThumbsDown, Heart, Camera, Clock, Gift, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { collection, query, orderBy, addDoc, onSnapshot, updateDoc, doc, arrayUnion, arrayRemove, getDoc, serverTimestamp, setDoc, runTransaction, Bytes } from 'firebase/firestore';
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
  // Campos opcionais para imagens armazenadas como blob no Firestore
  imageBytes?: unknown;
  imageMimeType?: string;
  // URL criada localmente para exibir a imagem
  imageUrl?: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface SuggestedMusic {
  id: string;
  title?: string;
  link: string;
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
  const [musicLink, setMusicLink] = useState('');
  const [suggestedMusics, setSuggestedMusics] = useState<SuggestedMusic[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const [currentPlay, setCurrentPlay] = useState<{ type: 'audio' | 'youtube'; url: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Imagens do Dresscode vindas da pasta public. 
  // Coloque seus arquivos em public/dresscode/ e liste aqui os nomes.
  const assetBaseUrl = (import.meta as any)?.env?.BASE_URL || '/';
  const dresscodeImages = [
    'Padrinhos (1).jpg',
    'Padrinhos (2).jpg',
    'Padrinhos (3).jpg',
    'Padrinhos (4).jpg',
    'Padrinhos (5).jpg',
    'Padrinhos (6).jpg'
  ].map((fileName) => `${assetBaseUrl}${encodeURIComponent(fileName)}`);

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
      // Revoga URLs anteriores para evitar vazamento de memória
      try {
        messages.forEach(m => {
          if (m.imageUrl) URL.revokeObjectURL(m.imageUrl);
        });
      } catch {}

      const newMessages = snapshot.docs.map(d => {
        const data = d.data() as any;
        const base: Message = {
          id: d.id,
          ...data,
          createdAt: data.createdAt?.toDate()
        };

        if (data.imageBytes) {
          // `Bytes` do Firestore possui `toUint8Array()`
          const bytesObj = data.imageBytes as { toUint8Array?: () => Uint8Array } | Uint8Array;
          const uint8 = (bytesObj && typeof (bytesObj as any).toUint8Array === 'function')
            ? (bytesObj as any).toUint8Array()
            : new Uint8Array(bytesObj as Uint8Array);
          const blob = new Blob([uint8], { type: data.imageMimeType || 'application/octet-stream' });
          const url = URL.createObjectURL(blob);
          return { ...base, imageUrl: url } as Message;
        }
        return base;
      });
      
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
          { id: '1', label: 'Roupa/vestido comprado', checked: false },
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

  // Rolar apenas o container do chat para a última mensagem quando a lista mudar (sem mover a página)
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    try {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } catch {}
  }, [messages]);

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

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      const buffer = await file.arrayBuffer();
      const bytes = Bytes.fromUint8Array(new Uint8Array(buffer));
      await addDoc(collection(db, 'padrinhosChat'), {
        userId: user.uid,
        userName: user.email,
        createdAt: serverTimestamp(),
        imageBytes: bytes,
        imageMimeType: file.type || 'application/octet-stream',
      });
      // limpa o input pra permitir re-seleção do mesmo arquivo
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Imagem enviada!');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Não foi possível enviar a imagem.');
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
    if (!musicTitle.trim() || !musicLink.trim() || !user) return;

    try {
      await addDoc(collection(db, 'suggestedMusics'), {
        title: musicTitle,
        link: musicLink,
        suggestedBy: user.email,
        userId: user.uid,
        likes: [],
        dislikes: []
      });

      setMusicTitle('');
      setMusicLink('');
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

  // Helpers para player
  const parseMusicLink = (url: string): { type: 'audio' | 'youtube' | 'unsupported'; embedUrl?: string } => {
    try {
      const u = new URL(url);
      // áudio direto
      if (/\.(mp3|ogg|wav)(\?|#|$)/i.test(u.pathname)) {
        return { type: 'audio', embedUrl: url };
      }
      // YouTube
      if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
        let videoId = '';
        if (u.hostname.includes('youtu.be')) {
          videoId = u.pathname.replace('/', '');
        } else {
          videoId = u.searchParams.get('v') || '';
        }
        if (videoId) {
          const embed = `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&enablejsapi=1`;
          return { type: 'youtube', embedUrl: embed };
        }
      }
    } catch {}
    return { type: 'unsupported' };
  };

  const handlePlay = (link: string) => {
    const parsed = parseMusicLink(link);
    if (parsed.type === 'unsupported') {
      window.open(link, '_blank');
      return;
    }
    setCurrentPlay(parsed.type === 'audio' ? { type: 'audio', url: parsed.embedUrl as string } : { type: 'youtube', url: parsed.embedUrl as string });
    setIsMuted(false);
  };

  const handleStop = () => {
    if (currentPlay?.type === 'audio' && audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {}
    }
    setCurrentPlay(null);
  };

  const toggleMute = () => {
    if (!currentPlay) return;
    if (currentPlay.type === 'youtube' && youtubeIframeRef.current?.contentWindow) {
      const willMute = !isMuted;
      try {
        youtubeIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: willMute ? 'mute' : 'unMute', args: [] }),
          '*'
        );
      } catch {}
      setIsMuted(willMute);
      return;
    }
    setIsMuted((prev) => !prev);
  };

  useEffect(() => {
    // aplicar mute no áudio direto
    if (currentPlay?.type === 'audio' && audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!audioRef.current.src) {
        audioRef.current.src = currentPlay.url;
      }
      audioRef.current.play().catch(() => {});
    }
  }, [currentPlay, isMuted]);

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
                  <div className="aspect-video w-full bg-wedding-secondary/20 rounded-xl overflow-hidden flex items-center justify-center md:max-h-[500px] max-w-xl md:max-w-2xl mx-auto transform hover:scale-[1.02] transition-transform">
                    <div className="overflow-hidden w-full h-full min-w-0 min-h-0" ref={emblaRef}>
                      <div className="flex h-full min-w-0">
                        {dresscodeImages.map((src, idx) => (
                          <img
                            key={src}
                            src={src}
                            alt={`Exemplo de Dresscode ${idx + 1}`}
                            className="w-full h-full object-contain flex-[0_0_100%] min-w-0 min-h-0 shrink-0 bg-white"
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
                      <li>Padrinhos: Traje esporte fino na cor preta (Sem terno) </li>
                      <li>Madrinhas: Vestido longo na cor preta</li>
                      <li>Sapatos sociais escuros para padrinhos</li>
                    </ul>
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
                    Sugestões de Músicas (por link)
                  </h2>
                </div>
                <form onSubmit={handleMusicSubmit} className="mb-6 space-y-4">
                  <div className="bg-wedding-secondary/10 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        value={musicTitle}
                        onChange={(e) => setMusicTitle(e.target.value)}
                        placeholder="Nome da música"
                        className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                      />
                      <Input
                        type="url"
                        value={musicLink}
                        onChange={(e) => setMusicLink(e.target.value)}
                        placeholder="Link da música (YouTube ou .mp3/.ogg/.wav)"
                        className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Enviar Link
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
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-3 min-w-0">
                        <div className="flex-1 w-full md:max-w-[65%] min-w-0">
                            {/* Título */}
                            <div className="flex items-center gap-2 min-w-0">
                              <Music className="w-4 h-4 text-wedding-gold shrink-0" />
                              <h3
                                className="font-semibold text-slate-50 truncate"
                                style={{ maxWidth: '100%' }}
                                title={music.title || 'Sugestão'}
                              >
                                {music.title || 'Sugestão'}
                              </h3>

                            </div>

                            {/* Link */}
                            <p className="text-xs text-slate-50/70 mt-1 min-w-0">
                              <a
                                href={music.link}
                                target="_blank"
                                rel="noreferrer"
                                className="hover:underline block truncate"
                                style={{ maxWidth: '100%' }}
                                title={music.link}
                              >
                                {music.link}
                              </a>
                            </p>
                          </div>
                          <div className="flex-none flex flex-row flex-nowrap items-center gap-1 justify-end">
                            {currentPlay && currentPlay.url && parseMusicLink(music.link).type !== 'unsupported' && currentPlay.url === parseMusicLink(music.link).embedUrl ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleStop}
                                className="hover:bg-wedding-secondary/20 text-slate-50 w-8 h-8 p-0 justify-center"
                                title="Parar"
                              >
                                <Pause className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handlePlay(music.link)}
                                className="hover:bg-wedding-secondary/20 text-slate-50 w-8 h-8 p-0 justify-center"
                                title="Reproduzir"
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                            )}
                            {parseMusicLink(music.link).type !== 'unsupported' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleMute}
                                className={`hover:bg-wedding-secondary/20 ${isMuted ? 'text-red-400' : 'text-slate-50'} w-8 h-8 p-0 justify-center`}
                                title={isMuted ? 'Ativar som' : 'Silenciar'}
                              >
                                {isMuted ? (
                                  <VolumeX className="w-4 h-4" />
                                ) : (
                                  <Volume2 className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMusicVote(music.id, 'like')}
                              className={`hover:bg-wedding-secondary/20 w-8 h-8 p-0 justify-center ${
                                music.likes.includes(user?.uid || '')
                                  ? 'text-green-500'
                                  : 'text-slate-50'
                              }`}
                              title="Curtir"
                            >
                              <ThumbsUp className="w-4 h-4 shrink-0" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleMusicVote(music.id, 'dislike')}
                              className={`hover:bg-wedding-secondary/20 w-8 h-8 p-0 justify-center ${
                                music.dislikes.includes(user?.uid || '')
                                  ? 'text-red-500'
                                  : 'text-slate-50'
                              }`}
                              title="Não curtir"
                            >
                              <ThumbsDown className="w-4 h-4 shrink-0" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
                {/* Player */}
                {currentPlay?.type === 'audio' && (
                  <audio ref={audioRef} src={currentPlay.url} className="w-full mt-3" controls />
                )}
                {currentPlay?.type === 'youtube' && (
                  <div className="aspect-video mt-3">
                    <iframe
                      ref={youtubeIframeRef}
                      key={currentPlay.url}
                      src={currentPlay.url}
                      className="w-full h-full rounded-md"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                      title="YouTube player"
                    />
                  </div>
                )}
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
                <div
                  className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar"
                  ref={chatContainerRef}
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.userId === user?.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 bg-wedding-gold text-black break-words ${
                          message.userId === user?.uid
                            ? 'bg-wedding-gold text-black'
                            : 'bg-wedding-secondary/20 text-slate-50'
                        }`}
                      >
                        <div className="text-sm font-medium mb-1">
                          {message.userId === user?.uid ? 'Você' : formatPadrinhosNames(message.userName)}
                        </div>
                        {message.imageUrl ? (
                          <img src={message.imageUrl} alt="Imagem enviada" className="rounded-md max-w-full h-auto" />
                        ) : (
                          <div>{message.text}</div>
                        )}
                        <div className="text-xs mt-1 opacity-70">
                          {message.createdAt?.toLocaleTimeString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="bg-wedding-secondary/20 text-slate-50 border-wedding-secondary/30 focus:border-wedding-gold"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="hidden"
                  />
                  {/*
                  <Button
                    type="button"
                    onClick={handleOpenFileDialog}
                    className="bg-wedding-secondary text-black hover:bg-wedding-gold transition-colors"
                    title="Enviar imagem"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  */}
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