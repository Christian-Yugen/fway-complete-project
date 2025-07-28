# Instruções de Instalação e Configuração do ASPV

## Pré-requisitos

Antes de instalar o ASPV, certifique-se de que você tem:

1. **Node.js 18+** instalado
2. **PostgreSQL** rodando (via Docker ou instalação local)
3. **Projeto Fway** já configurado e funcionando
4. **Chaves de API** para serviços externos (opcional para desenvolvimento)

## Instalação do Frontend

### 1. Instalar Dependências Adicionais

```bash
cd fway-frontend
npm install lucide-react
```

### 2. Arquivos Criados

Os seguintes arquivos foram adicionados ao projeto:

- `src/pages/VoiceAgent.jsx` - Página principal do ASPV
- `src/components/VoiceVisualizer.jsx` - Componente de visualização de áudio
- `src/services/voiceAgentService.js` - Serviço de comunicação com backend

### 3. Modificações em Arquivos Existentes

- `src/App.jsx` - Adicionada rota `/voice-agent`
- `src/components/Header.jsx` - Adicionado link no menu "Avançado"

## Instalação do Backend

### 1. Arquivos Criados

- `src/services/voiceAgent/voiceAgentService.js` - Lógica principal do ASPV
- `src/routes/voiceAgent.js` - Rotas da API
- `src/database/migrations/add_voice_interactions.sql` - Migração do banco

### 2. Configurar Banco de Dados

Execute a migração SQL:

```sql
-- Conecte ao seu banco PostgreSQL e execute:
\i src/database/migrations/add_voice_interactions.sql
```

### 3. Configurar Variáveis de Ambiente

Adicione ao seu arquivo `.env`:

```env
# Configurações do ASPV
OPENAI_API_KEY=sua_chave_openai_aqui
VOICE_AGENT_ENABLED=true
VOICE_AGENT_DEBUG=false

# Configurações de áudio (opcional)
SPEECH_RECOGNITION_LANG=pt-BR
SPEECH_SYNTHESIS_VOICE=pt-BR
```

### 4. Registrar Rotas

Adicione ao seu arquivo principal do servidor (ex: `src/server.js`):

```javascript
const voiceAgentRoutes = require('./routes/voiceAgent');
app.use('/api/voice-agent', voiceAgentRoutes);
```

## Testando a Instalação

### 1. Iniciar o Backend

```bash
cd fway-backend
npm start
```

### 2. Iniciar o Frontend

```bash
cd fway-frontend
npm run dev
```

### 3. Acessar o ASPV

1. Abra o navegador em `http://localhost:3000`
2. Clique em "Avançado" no menu superior
3. Selecione "Agente de Voz IA"
4. Permita acesso ao microfone quando solicitado
5. Teste uma interação de voz

## Configurações Avançadas

### Personalização de Voz

Edite `src/pages/VoiceAgent.jsx` para ajustar:

```javascript
// Configurações de reconhecimento de voz
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'pt-BR';
recognition.continuous = false;
recognition.interimResults = true;

// Configurações de síntese de voz
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'pt-BR';
utterance.rate = 0.9;
utterance.pitch = 1.0;
```

### Integração com APIs Externas

Para integrar com serviços como OpenAI ou Google Speech:

1. Instale as dependências necessárias
2. Configure as chaves de API no `.env`
3. Modifique `voiceAgentService.js` para usar os serviços externos

## Solução de Problemas

### Erro de Permissão de Microfone

- Certifique-se de que o site está sendo servido via HTTPS ou localhost
- Verifique as configurações de privacidade do navegador

### Erro de Banco de Dados

- Verifique se o PostgreSQL está rodando
- Confirme que a migração foi executada corretamente
- Verifique as credenciais de conexão no `.env`

### Problemas de Performance

- Verifique se há erros no console do navegador
- Monitore o uso de CPU durante o reconhecimento de voz
- Considere ajustar as configurações de áudio

## Deploy em Produção

### Considerações de Segurança

1. **HTTPS Obrigatório** - Reconhecimento de voz requer conexão segura
2. **Validação de Entrada** - Sempre valide dados de voz no backend
3. **Rate Limiting** - Implemente limites para evitar abuso
4. **Auditoria** - Registre todas as interações para conformidade

### Configurações de Produção

```env
NODE_ENV=production
VOICE_AGENT_DEBUG=false
VOICE_AGENT_LOG_LEVEL=warn
VOICE_AGENT_MAX_RECORDING_TIME=30000
```

### Monitoramento

Configure alertas para:
- Erros de reconhecimento de voz
- Tempo de resposta da API
- Uso de recursos do servidor
- Falhas de síntese de voz

## Próximos Passos

1. **Teste com Usuários Reais** - Colete feedback sobre usabilidade
2. **Otimize Performance** - Monitore e ajuste conforme necessário
3. **Adicione Funcionalidades** - Implemente recursos específicos do seu domínio
4. **Integre com IA** - Conecte com serviços de IA mais avançados
5. **Melhore Acessibilidade** - Adicione suporte para diferentes necessidades

## Suporte

Para suporte técnico ou dúvidas sobre a implementação:

1. Consulte a documentação completa em `DOCUMENTACAO_ASPV.md`
2. Verifique os logs do sistema para erros específicos
3. Teste em diferentes navegadores e dispositivos
4. Considere as limitações da Web Speech API

---

**Nota**: Esta implementação utiliza APIs nativas do navegador que podem ter limitações em alguns ambientes. Para produção, considere integrar com serviços de reconhecimento de voz mais robustos.

