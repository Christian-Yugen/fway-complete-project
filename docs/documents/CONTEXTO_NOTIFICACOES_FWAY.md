# Sistema de Notificações Fway - Contexto do Marketplace de Saúde

## Visão Geral

O Fway é um marketplace que conecta **pacientes** e **profissionais de saúde**, facilitando agendamentos, consultas e serviços médicos. O sistema de notificações é essencial para manter ambas as partes informadas durante todo o processo.

## Tipos de Notificações por Categoria

### 1. 📅 **NOTIFICAÇÕES DE AGENDAMENTO**

#### Para Pacientes:
- **BOOKING_CREATED**: "Seu agendamento com Dr. João foi criado para 15/07 às 14h"
- **BOOKING_CONFIRMED**: "Dr. João confirmou sua consulta de cardiologia"
- **BOOKING_CANCELLED**: "Sua consulta foi cancelada pelo profissional"
- **BOOKING_REMINDER**: "Lembrete: consulta com Dr. João em 1 hora"
- **BOOKING_COMPLETED**: "Como foi sua consulta? Avalie o atendimento"

#### Para Profissionais:
- **BOOKING_REQUEST**: "Nova solicitação de consulta de Maria Silva"
- **BOOKING_CONFIRMED**: "Você confirmou a consulta com Maria Silva"
- **BOOKING_CANCELLED**: "Paciente cancelou a consulta de amanhã"

### 2. 💳 **NOTIFICAÇÕES DE PAGAMENTO**

#### Para Pacientes:
- **PAYMENT_RECEIVED**: "Pagamento de R$ 150,00 confirmado para consulta cardiológica"
- **PAYMENT_FAILED**: "Falha no pagamento - verifique os dados do cartão"
- **PAYMENT_REFUNDED**: "Reembolso de R$ 150,00 processado"

#### Para Profissionais:
- **PAYMENT_RECEIVED**: "Você recebeu R$ 135,00 pela consulta com Maria"
- **PAYMENT_PENDING**: "Pagamento de R$ 150,00 em processamento"

### 3. 🛡️ **NOTIFICAÇÕES FWAY SHIELD (SEGURO)**

#### Para Pacientes:
- **SHIELD_COVERAGE_ACTIVATED**: "Proteção Fway Shield ativada para sua consulta"
- **SHIELD_CLAIM_CREATED**: "Solicitação de reembolso criada - Protocolo #12345"
- **SHIELD_CLAIM_APPROVED**: "Reembolso aprovado! R$ 200,00 será creditado"
- **SHIELD_CLAIM_REJECTED**: "Solicitação rejeitada - veja os motivos"

### 4. 💬 **NOTIFICAÇÕES DE CHAT**

#### Para Ambos:
- **CHAT_MESSAGE**: "Dr. João enviou: 'Lembre-se de trazer os exames'"
- **CHAT_NEW_CONVERSATION**: "Maria Silva iniciou uma conversa"
- **CHAT_FILE_SHARED**: "Novo arquivo compartilhado na conversa"

### 5. 🔐 **NOTIFICAÇÕES DE SEGURANÇA**

#### Para Ambos:
- **SECURITY_LOGIN**: "Novo login detectado em iPhone às 14:30"
- **SECURITY_PASSWORD_CHANGED**: "Senha alterada com sucesso"
- **SECURITY_SUSPICIOUS_ACTIVITY**: "Atividade suspeita detectada"

### 6. 🤖 **NOTIFICAÇÕES DE IA E ANÁLISES**

#### Para Pacientes:
- **AI_ANALYSIS_COMPLETE**: "Sua análise de sintomas está pronta"
- **AI_RECOMMENDATION**: "Recomendamos consulta com cardiologista"

#### Para Profissionais:
- **AI_PATIENT_INSIGHTS**: "Insights sobre o paciente Maria Silva disponíveis"
- **AI_DIAGNOSIS_SUPPORT**: "Sugestões de diagnóstico baseadas em IA"

### 7. ✅ **NOTIFICAÇÕES DE VERIFICAÇÃO**

#### Para Profissionais:
- **PROFESSIONAL_VERIFIED**: "Seu perfil foi verificado e aprovado"
- **DOCUMENT_APPROVED**: "CRM validado com sucesso"
- **DOCUMENT_REJECTED**: "Documento rejeitado - envie nova versão"

#### Para Pacientes:
- **PROFILE_VERIFIED**: "Perfil verificado - agora você pode agendar"

### 8. ⭐ **NOTIFICAÇÕES DE AVALIAÇÃO**

#### Para Pacientes:
- **REVIEW_REQUEST**: "Avalie sua consulta com Dr. João"
- **REVIEW_RESPONSE**: "Dr. João respondeu sua avaliação"

#### Para Profissionais:
- **REVIEW_RECEIVED**: "Nova avaliação de 5 estrelas recebida!"
- **REVIEW_ALERT**: "Avaliação negativa requer atenção"

### 9. 🔔 **NOTIFICAÇÕES DO SISTEMA**

#### Para Ambos:
- **SYSTEM_MAINTENANCE**: "Manutenção programada: 02h às 04h"
- **SYSTEM_UPDATE**: "Nova versão disponível com melhorias"
- **SYSTEM_ALERT**: "Problema técnico identificado"

### 10. 🎯 **NOTIFICAÇÕES DE MARKETING**

#### Para Pacientes:
- **MARKETING_PROMOTION**: "20% de desconto em consultas de dermatologia"
- **MARKETING_NEWSLETTER**: "Dicas de saúde semanal"
- **MARKETING_NEW_PROFESSIONAL**: "Novo cardiologista na sua região"

#### Para Profissionais:
- **MARKETING_PROMOTION**: "Destaque seu perfil por R$ 50/mês"
- **MARKETING_TIPS**: "Dicas para aumentar seus agendamentos"

## Canais de Notificação

### 📱 **IN_APP (No Aplicativo)**
- Notificações em tempo real via Socket.IO
- Badge de contagem de não lidas
- Central de notificações no app

### 📧 **EMAIL**
- Templates HTML responsivos
- Confirmações importantes
- Relatórios e resumos

### 📲 **SMS**
- Lembretes urgentes
- Códigos de verificação
- Confirmações críticas

### 🔔 **PUSH NOTIFICATIONS**
- Notificações instantâneas no dispositivo
- Funcionam mesmo com app fechado
- Personalizadas por tipo de usuário

## Configurações Personalizáveis

### Para Pacientes:
```json
{
  "enabled": true,
  "email": true,
  "sms": false,
  "push": true,
  "types": {
    "BOOKING": true,      // Agendamentos
    "PAYMENT": true,      // Pagamentos
    "SHIELD": true,       // Seguro
    "CHAT": true,         // Mensagens
    "SYSTEM": true,       // Sistema
    "MARKETING": false,   // Promoções
    "SECURITY": true,     // Segurança
    "AI": true           // IA e análises
  }
}
```

### Para Profissionais:
```json
{
  "enabled": true,
  "email": true,
  "sms": true,
  "push": true,
  "types": {
    "BOOKING": true,      // Agendamentos
    "PAYMENT": true,      // Pagamentos
    "CHAT": true,         // Mensagens
    "VERIFICATION": true, // Verificações
    "REVIEWS": true,      // Avaliações
    "SYSTEM": true,       // Sistema
    "MARKETING": false,   // Promoções
    "SECURITY": true,     // Segurança
    "AI": true           // IA e insights
  }
}
```

## Exemplos Práticos de Fluxos

### Fluxo de Agendamento:
1. **Paciente agenda** → Notificação para profissional
2. **Profissional confirma** → Notificação para paciente
3. **24h antes** → Lembrete para ambos
4. **1h antes** → Lembrete final
5. **Após consulta** → Solicitação de avaliação

### Fluxo de Pagamento:
1. **Pagamento processado** → Confirmação para paciente
2. **Valor liberado** → Notificação para profissional
3. **Se falhar** → Alerta para tentar novamente

### Fluxo Fway Shield:
1. **Problema na consulta** → Paciente cria solicitação
2. **Análise iniciada** → Notificação de protocolo
3. **Decisão tomada** → Aprovação ou rejeição
4. **Se aprovado** → Confirmação de reembolso

## Prioridades das Notificações

- **URGENT**: Emergências médicas, falhas de segurança
- **HIGH**: Confirmações de agendamento, pagamentos
- **MEDIUM**: Lembretes, mensagens de chat
- **LOW**: Marketing, dicas, atualizações

## Horário Silencioso

- **Padrão**: 22h às 7h (configurável)
- **Exceções**: Notificações URGENT sempre passam
- **Profissionais**: Podem ter horários diferentes

Este sistema garante que pacientes e profissionais estejam sempre informados sobre todas as etapas do processo de cuidado de saúde, desde o primeiro contato até o acompanhamento pós-consulta.

