import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { testFirebaseConnection, testSpecificCollection } from '@/lib/testConnection';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw
} from 'lucide-react';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  details?: any;
}

const FirebaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const addResult = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => [...prev, { test, status, message, details }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    clearResults();
    
    try {
      // Teste 1: Verificar inicialização do Firebase
      addResult('Inicialização', 'loading', 'Verificando inicialização do Firebase...');
      
      if (db && auth) {
        addResult('Inicialização', 'success', 'Firebase inicializado corretamente');
      } else {
        addResult('Inicialização', 'error', 'Falha na inicialização do Firebase');
        return;
      }

      // Teste 2: Verificar conectividade básica
      addResult('Conectividade', 'loading', 'Testando conectividade...');
      
      try {
        await testFirebaseConnection();
        addResult('Conectividade', 'success', 'Conexão com Firebase estabelecida');
      } catch (error: any) {
        addResult('Conectividade', 'error', `Erro de conectividade: ${error.message}`);
      }

      // Teste 3: Verificar coleções principais
      const collections = ['guests', 'gifts', 'users', 'messages'];
      
      for (const collectionName of collections) {
        addResult(`Coleção ${collectionName}`, 'loading', `Verificando acesso à coleção ${collectionName}...`);
        
        try {
          const collectionRef = collection(db, collectionName);
          const snapshot = await getDocs(collectionRef);
          addResult(
            `Coleção ${collectionName}`, 
            'success', 
            `${snapshot.size} documentos encontrados`,
            { count: snapshot.size }
          );
        } catch (error: any) {
          let status: DiagnosticResult['status'] = 'error';
          let message = `Erro ao acessar: ${error.message}`;
          
          if (error.code === 'permission-denied') {
            status = 'warning';
            message = 'Acesso negado - verificar regras de segurança';
          } else if (error.code === 'not-found') {
            status = 'warning';
            message = 'Coleção não encontrada (pode ser normal se vazia)';
          }
          
          addResult(`Coleção ${collectionName}`, status, message, { error: error.code });
        }
      }

      // Teste 4: Verificar autenticação
      addResult('Autenticação', 'loading', 'Verificando sistema de autenticação...');
      
      return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            addResult('Autenticação', 'success', `Usuário autenticado: ${user.email}`);
          } else {
            addResult('Autenticação', 'success', 'Sistema de autenticação funcionando (nenhum usuário logado)');
          }
          unsubscribe();
          resolve(true);
        });
      });

    } catch (error: any) {
      addResult('Diagnóstico Geral', 'error', `Erro geral: ${error.message}`);
    } finally {
      setIsRunning(false);
      setLastRun(new Date());
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'loading':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      loading: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={variants[status]}>
        {status === 'success' && 'Sucesso'}
        {status === 'error' && 'Erro'}
        {status === 'warning' && 'Aviso'}
        {status === 'loading' && 'Carregando'}
      </Badge>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Database className="w-6 h-6 text-wedding-primary" />
          <h2 className="text-xl font-semibold">Diagnóstico do Firebase</h2>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={clearResults}
            variant="outline"
            size="sm"
            disabled={isRunning}
          >
            Limpar
          </Button>
          
          <Button
            onClick={runDiagnostic}
            disabled={isRunning}
            className="bg-wedding-primary text-white hover:bg-wedding-primary/90"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Executar Diagnóstico
              </>
            )}
          </Button>
        </div>
      </div>

      {lastRun && (
        <p className="text-sm text-gray-500 mb-4">
          Última execução: {lastRun.toLocaleString('pt-BR')}
        </p>
      )}

      {results.length === 0 && !isRunning && (
        <div className="text-center py-8 text-gray-500">
          <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Clique em "Executar Diagnóstico" para verificar a conectividade</p>
        </div>
      )}

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
            {getStatusIcon(result.status)}
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium">{result.test}</h3>
                {getStatusBadge(result.status)}
              </div>
              <p className="text-sm text-gray-600">{result.message}</p>
              {result.details && (
                <pre className="text-xs bg-gray-100 p-2 mt-2 rounded">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
      </div>

      {results.length > 0 && !isRunning && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Resumo:</h3>
          <div className="flex gap-4 text-sm">
            <span>✅ Sucessos: {results.filter(r => r.status === 'success').length}</span>
            <span>⚠️ Avisos: {results.filter(r => r.status === 'warning').length}</span>
            <span>❌ Erros: {results.filter(r => r.status === 'error').length}</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default FirebaseDiagnostic; 