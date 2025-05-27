import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Camera, Upload, Heart, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { collection, addDoc, query, orderBy, limit, startAfter, getDocs, updateDoc, doc, increment, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadImage } from '@/lib/cloudinary';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback } from 'react';
interface PartyPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: string;
  uploadedAt: Date;
  likes: number;
  comments: Comment[];
}
interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
}
const PartyGallery: React.FC = () => {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [photos, setPhotos] = useState<PartyPhoto[]>([]);
  const [newCaption, setNewCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true
  });
  const [showCamera, setShowCamera] = useState(false);
  const [cameraMode, setCameraMode] = useState<'front' | 'back'>('back');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showUploaderNameModal, setShowUploaderNameModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [uploaderName, setUploaderName] = useState('');
  const [tempComment, setTempComment] = useState('');
  const [tempCaption, setTempCaption] = useState('');
  useEffect(() => {
    fetchPhotos();
  }, []);
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);
  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const photosRef = collection(db, 'party_photos');
      const q = query(photosRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedPhotos = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadedAt: doc.data().uploadedAt.toDate()
      })) as PartyPhoto[];
      setPhotos(fetchedPhotos);
    } catch (error) {
      console.error('Erro ao buscar fotos:', error);
      toast.error('Erro ao carregar fotos');
    } finally {
      setLoading(false);
    }
  };
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecione uma foto primeiro');
      return;
    }
    if (!newCaption) {
      toast.error('Adicione uma legenda para a foto');
      return;
    }
    if (!uploaderName) {
      setTempCaption(newCaption);
      setShowUploaderNameModal(true);
      return;
    }
    try {
      setUploading(true);

      // Upload da imagem para o Cloudinary
      const imageUrl = await uploadImage(selectedFile);

      // Salvar informações no Firestore
      const photoData = {
        url: imageUrl,
        caption: newCaption,
        uploadedBy: uploaderName,
        uploadedAt: new Date(),
        likes: 0,
        comments: []
      };
      await addDoc(collection(db, 'party_photos'), photoData);
      toast.success('Foto enviada com sucesso!');
      setNewCaption('');
      setSelectedFile(null);
      fetchPhotos(); // Recarrega as fotos
    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };
  const handleLike = async (photoId: string) => {
    try {
      const photoRef = doc(db, 'party_photos', photoId);
      await updateDoc(photoRef, {
        likes: increment(1)
      });
      setPhotos(prev => prev.map(photo => photo.id === photoId ? {
        ...photo,
        likes: photo.likes + 1
      } : photo));
    } catch (error) {
      console.error('Erro ao curtir foto:', error);
      toast.error('Erro ao curtir foto');
    }
  };
  const handleComment = async (photoId: string) => {
    if (!newComment) return;
    if (!guestName) {
      setTempComment(newComment);
      setShowNameModal(true);
      return;
    }
    try {
      const photoRef = doc(db, 'party_photos', photoId);
      const comment = {
        id: Date.now().toString(),
        text: newComment,
        author: guestName,
        createdAt: new Date()
      };

      // Atualiza o Firestore
      await updateDoc(photoRef, {
        comments: arrayUnion(comment)
      });

      // Atualiza o estado local
      setPhotos(prev => prev.map(photo => photo.id === photoId ? {
        ...photo,
        comments: [...photo.comments, comment]
      } : photo));
      setNewComment('');
      toast.success('Comentário adicionado!');
    } catch (error) {
      console.error('Erro ao comentar:', error);
      toast.error('Erro ao adicionar comentário');
    }
  };
  const handleNameSubmit = () => {
    if (!guestName.trim()) {
      toast.error('Por favor, digite seu nome');
      return;
    }
    setShowNameModal(false);
    handleComment(selectedPhoto !== null ? photos[selectedPhoto].id : '');
  };
  const handleUploaderNameSubmit = () => {
    if (!uploaderName.trim()) {
      toast.error('Por favor, digite seu nome');
      return;
    }
    setShowUploaderNameModal(false);
    handleUpload();
  };
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode === 'front' ? 'user' : 'environment',
          width: {
            ideal: 1920
          },
          height: {
            ideal: 1080
          }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast.error('Não foi possível acessar a câmera. Verifique se você deu permissão de acesso.');
    }
  };
  const toggleCamera = async () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraMode(prev => prev === 'front' ? 'back' : 'front');
    await startCamera();
  };
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };
  const takePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      canvas.toBlob(blob => {
        if (blob) {
          const file = new File([blob], `foto-${Date.now()}.jpg`, {
            type: 'image/jpeg'
          });
          setSelectedFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);
  return <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-pearl/20 bg-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Hora da Festa</h3>
        <p className="text-slate-50">
          Compartilhe seus momentos especiais do nosso casamento!
        </p>
      </Card>

      {loading ? <div className="text-center text-slate-50">Carregando fotos...</div> : <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {photos.map((photo, index) => <div key={photo.id} className="flex-[0_0_100%] min-w-0 relative">
                  <Card className="mx-4 overflow-hidden bg-wedding-secondary">
                    <div className="aspect-[4/3] relative">
                      <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                        <p className="text-white font-medium">{photo.caption}</p>
                        <p className="text-white/80 text-sm">Por: {photo.uploadedBy}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <Button variant="ghost" size="sm" onClick={() => handleLike(photo.id)} className="text-white hover:text-red-500 bg-transparent">
                            <Heart className="w-4 h-4 mr-1" />
                            {photo.likes}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedPhoto(index)} className="text-white hover:text-blue-500 bg-transparent">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {photo.comments.length}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>)}
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {photos.map((_, index) => <button key={index} onClick={() => emblaApi?.scrollTo(index)} className={`w-2 h-2 rounded-full transition-all ${index === selectedIndex ? 'bg-wedding-primary w-4' : 'bg-gray-300 hover:bg-gray-400'}`} />)}
          </div>
        </div>}

      <Card className="p-6 bg-wedding-secondary/20">
        <h4 className="text-lg font-semibold mb-4 text-slate-50">Compartilhe Suas Fotos</h4>
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Button variant="outline" className="bg-wedding-primary text-white hover:bg-wedding-primary/90" onClick={() => document.getElementById('photo-upload')?.click()} disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Escolher Foto'}
            </Button>
            <Button variant="outline" className="bg-wedding-primary text-white hover:bg-wedding-primary/90" onClick={() => document.getElementById('camera-capture')?.click()} disabled={uploading}>
              <Camera className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Tirar Foto'}
            </Button>
            <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            <input id="camera-capture" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} disabled={uploading} />
            {selectedFile && <div className="flex-1 min-w-0">
                <span className="text-slate-50 truncate block">
                  {selectedFile.name}
                </span>
              </div>}
          </div>

          <Input placeholder="Adicione uma legenda para sua foto" value={newCaption} onChange={e => setNewCaption(e.target.value)} className="bg-wedding-primary text-slate-50" disabled={uploading} />

          <Button className="w-full bg-wedding-primary text-white hover:bg-wedding-primary/90" onClick={handleUpload} disabled={!selectedFile || !newCaption || uploading}>
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Enviando...' : 'Enviar Foto'}
          </Button>
        </div>
      </Card>

      {showUploaderNameModal && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowUploaderNameModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-black">Qual o seu nome?</h3>
            <Input placeholder="Digite seu nome" value={uploaderName} onChange={e => setUploaderName(e.target.value)} className="mb-4" />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploaderNameModal(false)} className="text-white bg-wedding-primary">
                Cancelar
              </Button>
              <Button onClick={handleUploaderNameSubmit} disabled={!uploaderName.trim()} className="text-black bg-wedding-secondary">
                Confirmar
              </Button>
            </div>
          </div>
        </div>}

      {showNameModal && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowNameModal(false)}>
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-md mx-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl md:text-2xl font-semibold mb-6 text-center text-black">
              Como devemos te chamar?
            </h3>
            <Input placeholder="Digite seu nome" value={guestName} onChange={e => setGuestName(e.target.value)} className="mb-6 text-base md:text-lg h-12 bg-gray-50 border-gray-200 focus:border-wedding-primary focus:ring-wedding-primary" />
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => setShowNameModal(false)} className="w-full sm:w-auto text-base h-12 border-wedding-primary bg-wedding-primary text-slate-50">
                Cancelar
              </Button>
              <Button onClick={handleNameSubmit} disabled={!guestName.trim()} className="w-full sm:w-auto text-base h-12 disabled:opacity-50 bg-wedding-secondary text-black">
                Confirmar
              </Button>
            </div>
          </div>
        </div>}

      {selectedPhoto !== null && <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPhoto(null)}>
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white rounded-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4">
              <div className="relative aspect-[4/3] mb-4">
                <img src={photos[selectedPhoto].url} alt={photos[selectedPhoto].caption} className="w-full h-full object-cover rounded-lg" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-center font-medium text-lg text-black">{photos[selectedPhoto].caption}</p>
                  <p className="text-center text-sm text-gray-600 mt-1">
                    Por: {photos[selectedPhoto].uploadedBy}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Button variant="ghost" size="sm" onClick={e => {
                e.stopPropagation();
                handleLike(photos[selectedPhoto].id);
              }} className="text-gray-600 hover:text-red-500">
                    <Heart className="w-4 h-4 mr-1" />
                    {photos[selectedPhoto].likes}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-500">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {photos[selectedPhoto].comments.length}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Input placeholder="Adicione um comentário..." value={newComment} onChange={e => setNewComment(e.target.value)} onClick={e => e.stopPropagation()} className="flex-1 text-white bg-wedding-primary text-white" />
                  <Button onClick={e => {
                e.stopPropagation();
                handleComment(photos[selectedPhoto].id);
              }} disabled={!newComment} className="text-black bg-wedding-secondary">
                    Comentar
                  </Button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {photos[selectedPhoto].comments.map(comment => <div key={comment.id} className="p-2 rounded bg-wedding-primary">
                      <p className="text-base font-medium text-wedding-secondary">{comment.author}</p>
                      <p className="text-sm text-white">{comment.text}</p>
                    </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>}
    </div>;
};
export default PartyGallery;