-- Agregar tabla de conversaciones para el chat
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    model_used VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversations_project_id ON conversations(project_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);

-- Agregar tabla de configuración de agentes
CREATE TABLE IF NOT EXISTS agent_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    config JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, agent_name)
);

CREATE INDEX idx_agent_configs_user_id ON agent_configs(user_id);

-- RLS para conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own conversations" ON conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = conversations.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations in their projects" ON conversations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = conversations.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- RLS para agent_configs
ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent configs" ON agent_configs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent configs" ON agent_configs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agent configs" ON agent_configs
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agent configs" ON agent_configs
    FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at en agent_configs
CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON agent_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
