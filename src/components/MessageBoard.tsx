
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  name: string;
  message: string;
  date: string;
  approved: boolean;
}

const MessageBoard: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      name: 'Ana Silva',
      message: 'Que alegria acompanhar essa jornada de vocês! Desejo muito amor e felicidade! 💕',
      date: '2024-05-20',
      approved: true
    },
    {
      id: '2',
      name: 'Carlos Santos',
      message: 'Vocês são um casal lindo! Que Deus abençoe essa união! 🙏',
      date: '2024-05-19',
      approved: true
    },
    {
      id: '3',
      name: 'Mariana Costa',
      message: 'Mal posso esperar para celebrar com vocês! Vai ser lindo! ✨',
      date: '2024-05-18',
      approved: true
    }
  ]);

  const [newName, setNewName] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const addMessage = () => {
    if (newName && newMessage) {
      const message: Message = {
        id: Date.now().toString(),
        name: newName,
        message: newMessage,
        date: new Date().toISOString().split('T')[0],
        approved: false
      };
      setMessages([message, ...messages]);
      setNewName('');
      setNewMessage('');
    }
  };

  const approvedMessages = messages.filter(m => m.approved);

  return (
    <div className="space-y-6">
      <Card className="p-6 text-center bg-gradient-to-r from-wedding-accent/20 to-wedding-blush/20">
        <h3 className="text-2xl font-elegant font-semibold mb-2">Recados dos Convidados</h3>
        <p className="text-muted-foreground">
          Deixe uma mensagem carinhosa para os noivos
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="text-lg font-semibold mb-4">Deixe seu Recado</h4>
        <div className="space-y-4">
          <Input
            placeholder="Seu nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Textarea
            placeholder="Escreva uma mensagem carinhosa para os noivos..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows={4}
          />
          <Button 
            onClick={addMessage}
            className="w-full bg-wedding-primary hover:bg-wedding-rose"
            disabled={!newName || !newMessage}
          >
            Enviar Mensagem
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Sua mensagem será moderada antes de aparecer publicamente
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Mensagens dos Convidados</h4>
        {approvedMessages.map((message) => (
          <Card key={message.id} className="p-4 bg-white/80">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-full bg-wedding-primary/20 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {message.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">{message.name}</h5>
                  <span className="text-xs text-muted-foreground">{message.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{message.message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MessageBoard;
