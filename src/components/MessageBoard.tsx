import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface Message {
  id: string;
  author: string;
  text: string;
  createdAt: Date;
  approved: boolean;
}

const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesRef = collection(db, 'party_messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedMessages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate()
      })) as Message[];
      
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async () => {
    if (newName && newMessage) {
      try {
        const messagesRef = collection(db, 'party_messages');
        const messageData = {
          author: newName,
          text: newMessage,
          createdAt: Timestamp.now(),
        approved: false
      };

        await addDoc(messagesRef, messageData);
        toast.success('Mensagem enviada com sucesso!');
      setNewName('');
      setNewMessage('');
        fetchMessages();
      } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        toast.error('Erro ao enviar mensagem');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20 bg-wedding-primary">
        <h3 className="text-2xl font-elegant font-semibold mb-2 text-slate-50">Recados dos Convidados</h3>
        <p className="text-slate-50">
          Deixe uma mensagem carinhosa para os noivos
        </p>
      </Card>

      <Card className="p-6 bg-wedding-primary">
        <h4 className="text-lg font-semibold mb-4 text-slate-50">Deixe seu Recado</h4>
        <div className="space-y-4">
          <Input
            placeholder="Seu nome"
            value={newName}
            onChange={e => setNewName(e.target.value)} 
            className="bg-wedding-secondary text-black placeholder:text-black/60" 
          />
          <Textarea
            placeholder="Escreva uma mensagem carinhosa para os noivos..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)} 
            rows={4}
            className="bg-wedding-secondary text-black placeholder:text-black/60" 
          />
          <Button 
            onClick={addMessage}
            disabled={!newName || !newMessage}
            className="w-full text-black bg-wedding-secondary hover:bg-wedding-gold font-semibold"
          >
            Enviar Mensagem
          </Button>
          <p className="text-xs text-center text-slate-50">
            Sua mensagem será moderada antes de aparecer publicamente
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-slate-50">Mensagens dos Convidados</h4>
        {loading ? (
          <div className="text-center text-slate-50">Carregando mensagens...</div>
        ) : messages.filter(m => m.approved).length === 0 ? (
          <div className="text-center text-slate-50">Nenhuma mensagem ainda. Seja o primeiro a deixar um recado!</div>
        ) : (
          messages.filter(m => m.approved).map(message => (
            <Card key={message.id} className="p-4 bg-wedding-primary/50 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-wedding-secondary/20 flex items-center justify-center">
                  <span className="text-sm font-medium text-slate-50">
                    {message.author.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-slate-50">{message.author}</h5>
                    <span className="text-xs text-slate-50/70">
                      {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                </div>
                  <p className="text-sm text-slate-50">{message.text}</p>
              </div>
            </div>
          </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default MessageBoard;