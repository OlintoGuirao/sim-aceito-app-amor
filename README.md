# Sim Aceito - Aplicativo de Gerenciamento de Convidados para Casamento

Um aplicativo web moderno para gerenciar a lista de convidados de casamento, com recursos de confirmação de presença via QR Code e envio de convites por email.

## Funcionalidades

- 📱 Interface administrativa para gerenciar convidados
- 📧 Envio de convites por email com QR Code
- 📊 Dashboard com estatísticas de confirmações
- 📝 Importação de lista de convidados
- 🔍 Geração de QR Code individual para cada convidado
- 📱 Página de confirmação de presença para convidados

## Tecnologias Utilizadas

- Next.js
- TypeScript
- Tailwind CSS
- Firebase
- Nodemailer
- QR Code

## Configuração do Ambiente

1. Clone o repositório
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

## Estrutura do Projeto

```
src/
  ├── components/     # Componentes React
  ├── lib/           # Utilitários e configurações
  ├── pages/         # Páginas e APIs
  └── styles/        # Estilos globais
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
