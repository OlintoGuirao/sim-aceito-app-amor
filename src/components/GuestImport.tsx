import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Papa from 'papaparse';
interface Guest {
  name: string;
  email: string;
  phone: string;
  group: string;
}
interface GuestImportProps {
  onImport: () => void;
}
export function GuestImport({
  onImport
}: GuestImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  const validateGuest = (guest: any): Guest | null => {
    if (!guest.name || !guest.email) {
      return null;
    }
    return {
      name: guest.name.trim(),
      email: guest.email.trim().toLowerCase(),
      phone: guest.phone?.trim() || '',
      group: guest.group?.trim() || 'Convidados'
    };
  };
  const importGuests = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo');
      return;
    }
    setLoading(true);
    setProgress(0);
    try {
      const text = await file.text();
      const {
        data
      } = Papa.parse(text, {
        header: true,
        skipEmptyLines: true
      });
      const guests = data.map(validateGuest).filter((guest): guest is Guest => guest !== null);
      if (guests.length === 0) {
        toast.error('Nenhum convidado válido encontrado no arquivo');
        return;
      }
      const guestsRef = collection(db, "guests");
      let imported = 0;
      let skipped = 0;
      for (const guest of guests) {
        // Verificar se o convidado já existe
        const q = query(guestsRef, where("email", "==", guest.email));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          await addDoc(guestsRef, {
            ...guest,
            status: 'pending',
            createdAt: new Date().toISOString()
          });
          imported++;
        } else {
          skipped++;
        }
        setProgress(Math.round((imported + skipped) / guests.length * 100));
      }
      toast.success(`Importação concluída! ${imported} convidados importados, ${skipped} já existentes`);
      onImport(); // Recarrega a lista de convidados
    } catch (error) {
      console.error('Erro ao importar convidados:', error);
      toast.error('Erro ao importar convidados');
    } finally {
      setLoading(false);
      setProgress(0);
      setFile(null);
    }
  };
  return <Card className="w-full">
      <CardHeader className="bg-wedding-secondary">
        <CardTitle className="text-black">Importar Convidados</CardTitle>
        <CardDescription className="text-black">
          Importe uma lista de convidados através de um arquivo CSV
        </CardDescription>
      </CardHeader>
      <CardContent className="bg-wedding-secondary">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
            <Button onClick={importGuests} disabled={!file || loading} className="bg-wedding-primary text-white">
              {loading ? 'Importando...' : 'Importar'}
            </Button>
          </div>

          {loading && <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{
            width: `${progress}%`
          }} />
            </div>}

          <div className="text-sm text-muted-foreground">
            <p className="text-black">O arquivo CSV deve conter as seguintes colunas:</p>
            <ul className="list-disc list-inside mt-2">
              <li className="bg-transparent text-black">name (obrigatório)</li>
              <li className="text-black">email (obrigatório)</li>
              <li className="text-black">phone (opcional)</li>
              <li className="text-black">group (opcional, padrão: "Convidados")</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>;
}