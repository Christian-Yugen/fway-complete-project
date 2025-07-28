-- Migração para adicionar tabela de interações de voz do ASPV
-- Execute este SQL no seu banco de dados PostgreSQL

CREATE TABLE IF NOT EXISTS voice_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id UUID NOT NULL,
    user_input TEXT NOT NULL,
    assistant_response TEXT NOT NULL,
    intent VARCHAR(100),
    confidence DECIMAL(3,2),
    entities JSONB,
    actions JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para melhor performance
    CONSTRAINT fk_voice_interactions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_voice_interactions_user_id ON voice_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_session_id ON voice_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_timestamp ON voice_interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_voice_interactions_intent ON voice_interactions(intent);

-- Tabela para armazenar feedback das interações
CREATE TABLE IF NOT EXISTS voice_interaction_feedback (
    id SERIAL PRIMARY KEY,
    interaction_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_voice_feedback_interaction_id FOREIGN KEY (interaction_id) REFERENCES voice_interactions(id) ON DELETE CASCADE,
    CONSTRAINT fk_voice_feedback_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para tabela de feedback
CREATE INDEX IF NOT EXISTS idx_voice_feedback_interaction_id ON voice_interaction_feedback(interaction_id);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_user_id ON voice_interaction_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_feedback_rating ON voice_interaction_feedback(rating);

-- Tabela para armazenar configurações do agente de voz por usuário
CREATE TABLE IF NOT EXISTS voice_agent_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE,
    voice_enabled BOOLEAN DEFAULT true,
    voice_language VARCHAR(10) DEFAULT 'pt-BR',
    voice_rate DECIMAL(3,2) DEFAULT 0.9,
    voice_pitch DECIMAL(3,2) DEFAULT 1.0,
    voice_volume DECIMAL(3,2) DEFAULT 0.8,
    auto_speak_responses BOOLEAN DEFAULT true,
    continuous_listening BOOLEAN DEFAULT false,
    emergency_contacts JSONB DEFAULT '[]',
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_voice_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índice para configurações do agente de voz
CREATE INDEX IF NOT EXISTS idx_voice_settings_user_id ON voice_agent_settings(user_id);

-- Tabela para armazenar contextos de emergência
CREATE TABLE IF NOT EXISTS emergency_contexts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_id UUID NOT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    description TEXT,
    location JSONB,
    status VARCHAR(20) DEFAULT 'active',
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_emergency_contexts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para contextos de emergência
CREATE INDEX IF NOT EXISTS idx_emergency_contexts_user_id ON emergency_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contexts_status ON emergency_contexts(status);
CREATE INDEX IF NOT EXISTS idx_emergency_contexts_created_at ON emergency_contexts(created_at);

-- Função para atualizar timestamp de updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_voice_interactions_updated_at 
    BEFORE UPDATE ON voice_interactions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voice_agent_settings_updated_at 
    BEFORE UPDATE ON voice_agent_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_contexts_updated_at 
    BEFORE UPDATE ON emergency_contexts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão para usuários existentes
INSERT INTO voice_agent_settings (user_id)
SELECT id FROM users 
WHERE id NOT IN (SELECT user_id FROM voice_agent_settings);

-- Comentários para documentação
COMMENT ON TABLE voice_interactions IS 'Armazena todas as interações entre usuários e o Agente de Saúde Pessoal por Voz';
COMMENT ON TABLE voice_interaction_feedback IS 'Armazena feedback dos usuários sobre as interações com o agente de voz';
COMMENT ON TABLE voice_agent_settings IS 'Configurações personalizadas do agente de voz para cada usuário';
COMMENT ON TABLE emergency_contexts IS 'Contextos de emergência acionados pelo agente de voz';

COMMENT ON COLUMN voice_interactions.entities IS 'Entidades extraídas do texto do usuário (JSON)';
COMMENT ON COLUMN voice_interactions.actions IS 'Ações executadas pelo agente (JSON)';
COMMENT ON COLUMN voice_agent_settings.emergency_contacts IS 'Lista de contatos de emergência (JSON)';
COMMENT ON COLUMN voice_agent_settings.notification_preferences IS 'Preferências de notificação (JSON)';
COMMENT ON COLUMN emergency_contexts.location IS 'Localização do usuário durante a emergência (JSON)';

-- Exemplo de dados de teste (opcional)
-- INSERT INTO voice_interactions (user_id, session_id, user_input, assistant_response, intent, confidence)
-- VALUES (1, gen_random_uuid(), 'Olá, como está minha pressão?', 'Sua pressão arterial atual está em 120/80 mmHg...', 'blood_pressure_inquiry', 0.95);

-- Verificar se as tabelas foram criadas corretamente
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('voice_interactions', 'voice_interaction_feedback', 'voice_agent_settings', 'emergency_contexts')
ORDER BY table_name, ordinal_position;

