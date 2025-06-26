# Smart Meeting - Gestão de Reuniões com Transcrição Automática

Uma aplicação React moderna para gestão de reuniões com transcrição automática de áudio, extração de tarefas e geração de relatórios inteligentes.

## 🚀 Funcionalidades

- **Dashboard Intuitivo**: Visão geral das reuniões, estatísticas e métricas
- **Criação de Reuniões**: Interface simples para criar e organizar reuniões
- **Upload de Áudio**: Suporte a múltiplos formatos de áudio (MP3, WAV, M4A)
- **Transcrição Automática**: Processamento de áudio com geração de texto
- **Análise Inteligente**: Extração automática de:
  - Resumo da reunião
  - Lista de participantes com tempo de fala
  - Tarefas e ações identificadas
  - Análise de participação
- **Relatórios Detalhados**: Visualização completa das transcrições
- **Design Responsivo**: Interface adaptável para desktop e mobile
- **Tema Dark**: Suporte a modo escuro com tons de roxo
- **Interface Moderna**: Componentes shadcn-ui com design minimalista

## 🎨 Design e UX

- **Layout Minimalista**: Design limpo focado na usabilidade
- **Tema Purple**: Paleta de cores em tons de roxo
- **Modo Escuro**: Alternância entre temas claro e escuro
- **Efeitos Glass**: Elementos com efeito de vidro (glass morphism)
- **Animações Suaves**: Transições e feedback visual
- **Responsividade**: Funciona perfeitamente em todos os dispositivos

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework de estilos
- **shadcn-ui** - Biblioteca de componentes
- **Lucide React** - Ícones modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **Date-fns** - Manipulação de datas

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (shadcn-ui)
│   ├── layout/         # Componentes de layout
│   └── features/       # Componentes específicos de funcionalidades
├── contexts/           # Contextos React (estado global)
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── services/           # Serviços e APIs
└── types/              # Definições de tipos TypeScript
```

## 🚦 Como Executar

### Pré-requisitos

- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd smart-meeting-client
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o projeto:
```bash
npm run dev
```

4. Acesse no navegador:
```
http://localhost:5173
```

## 📱 Como Usar

### 1. Dashboard
- Visualize estatísticas gerais das reuniões
- Acompanhe reuniões recentes e seus status
- Acesse ações rápidas para criação de conteúdo

### 2. Criar Nova Reunião
- Preencha título e descrição da reunião
- Faça upload do arquivo de áudio
- Acompanhe o processamento da transcrição
- Visualize o resultado final

### 3. Relatórios de Reunião
- **Resumo**: Síntese automática do conteúdo
- **Participantes**: Lista com tempo de fala e score de participação
- **Tarefas**: Ações identificadas com responsáveis e prazos
- **Transcrição Completa**: Texto integral da reunião

### 4. Navegação
- Use a barra lateral para navegar entre seções
- Alterne entre modo claro e escuro no cabeçalho
- Interface responsiva funciona em mobile e desktop

## 🎯 Funcionalidades Futuras

- [ ] Integração com APIs de transcrição reais
- [ ] Suporte a reuniões ao vivo
- [ ] Integração com calendário
- [ ] Notificações de tarefas
- [ ] Exportação em múltiplos formatos
- [ ] Compartilhamento de relatórios
- [ ] Análise de sentimentos
- [ ] Reconhecimento de voz por participante

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Executa linting do código

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato através do email: [seu-email@exemplo.com]

---

Desenvolvido com ❤️ usando React e TypeScript
