# Integração Frontend-Backend

Este documento descreve como o frontend está integrado com o backend da API Smart Meeting.

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto client com:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1
```

### Dependências

- **axios**: Para requisições HTTP
- **react**: Framework base
- **typescript**: Tipagem estática

## 📋 Endpoints Utilizados

### Meetings
- `POST /api/meetings/` - Criar reunião
- `GET /api/meetings/{meeting_id}` - Buscar reunião por ID

### Transcriptions
- `POST /api/transcriptions/transcribe?meeting_id={id}` - Transcrever áudio
- `POST /api/transcriptions/summary/{meeting_id}` - Gerar resumo
- `GET /api/transcriptions/{meeting_id}` - Buscar transcrição

## 🏗️ Estrutura dos Serviços

### `src/services/api.ts`
Configuração base do axios com interceptors para:
- Logs de requisições/respostas
- Tratamento de erros
- Timeouts configuráveis

### `src/services/meetings.ts`
Serviços para gerenciar reuniões:
- Criar reuniões
- Buscar reuniões
- Upload de arquivos de áudio
- Formatação de dados

### `src/services/transcriptions.ts`
Serviços para transcrições:
- Iniciar transcrição
- Buscar transcrição
- Gerar resumo
- Verificar status

## 📊 Tipos TypeScript

### Meeting
```typescript
interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO string
  participants: string[]; // JSON array
  status: 'created' | 'processing' | 'analyzing' | 'completed' | 'error';
  audio_file_path?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}
```

### Transcription
```typescript
interface Transcription {
  id: string;
  meeting_id: string;
  content: string;
  summary?: string;
  speakers: TranscriptionSpeaker[];
  created_at: string;
  updated_at: string;
}
```

## 🎯 Contexto de Estado

### MeetingContext
Gerencia o estado global das reuniões:
- `createMeeting()` - Cria nova reunião
- `loadMeeting()` - Carrega reunião específica
- `transcribeMeeting()` - Inicia transcrição
- `generateSummary()` - Gera resumo
- `loadTranscription()` - Carrega transcrição

## 🔄 Fluxo de Uso

### 1. Criar Reunião
```typescript
const { createMeeting } = useMeeting();

const meeting = await createMeeting({
  title: 'Reunião de Planejamento',
  description: 'Planejamento semanal',
  date: new Date(),
  participants: ['João', 'Maria'],
  audioFile: file // opcional
});
```

### 2. Transcrever Áudio
```typescript
const { transcribeMeeting } = useMeeting();

await transcribeMeeting(meetingId, audioFile);
```

### 3. Gerar Resumo
```typescript
const { generateSummary } = useMeeting();

await generateSummary(meetingId);
```

## 🚀 Iniciando o Projeto

1. Instalar dependências:
```bash
npm install
```

2. Configurar variáveis de ambiente:
```bash
cp .env.example .env
# Editar .env com suas configurações
```

3. Iniciar desenvolvimento:
```bash
npm run dev
```

## 🔍 Debugger e Logs

O sistema inclui logs detalhados:
- 🚀 Requisições enviadas
- ✅ Respostas recebidas
- ❌ Erros de API
- 📤 Uploads de arquivo

## ⚠️ Tratamento de Erros

Todos os erros são tratados de forma consistente:
- Mensagens de erro amigáveis
- Status codes HTTP
- Detalhes técnicos (em desenvolvimento)
- Fallbacks para erros de rede

## 🔒 Segurança

- Validação de tipos TypeScript
- Sanitização de dados
- Timeouts configuráveis
- Tratamento de erros HTTP 