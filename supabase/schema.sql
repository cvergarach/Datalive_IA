-- DataLIVE Database Schema
-- Ejecutar este script en el SQL Editor de Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- ============================================
-- TABLA: projects
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100), -- fintech, telco, mining, banking, ecommerce, meta, public-market, other
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: documents
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- pdf, url
    url TEXT,
    storage_path TEXT,
    file_size BIGINT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, analyzing, completed, failed
    analysis_result JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: apis
-- ============================================
CREATE TABLE IF NOT EXISTS apis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    base_url TEXT NOT NULL,
    description TEXT,
    auth_type VARCHAR(50), -- api_key, oauth, jwt, basic, none
    endpoints JSONB, -- Array de endpoints descubiertos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: credentials
-- ============================================
CREATE TABLE IF NOT EXISTS credentials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL, -- Encriptado en la aplicación
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: executions
-- ============================================
CREATE TABLE IF NOT EXISTS executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    endpoint VARCHAR(500) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_params JSONB,
    request_headers JSONB,
    request_body JSONB,
    response_status INTEGER,
    response_data JSONB,
    response_time INTEGER, -- milliseconds
    status VARCHAR(50) DEFAULT 'pending', -- pending, success, failed
    error_message TEXT,
    ai_explanation TEXT,
    ai_model VARCHAR(100), -- gemini-2.5-flash, claude-sonnet-3.5, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: reports
-- ============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- executive, technical, custom
    content JSONB NOT NULL,
    format VARCHAR(20) DEFAULT 'json', -- json, pdf, excel
    file_url TEXT,
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: insights
-- ============================================
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- trend, pattern, recommendation, alert
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    data JSONB,
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: dashboards
-- ============================================
CREATE TABLE IF NOT EXISTS dashboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layout JSONB NOT NULL, -- Configuración de widgets y layout
    data_sources JSONB, -- Referencias a APIs y datos
    ai_model VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: logs
-- ============================================
CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    level VARCHAR(20) NOT NULL, -- debug, info, warn, error
    module VARCHAR(100) NOT NULL, -- auth, api, ai, etc.
    message TEXT NOT NULL,
    metadata JSONB,
    stack_trace TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA: ai_model_preferences
-- ============================================
CREATE TABLE IF NOT EXISTS ai_model_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_type VARCHAR(100) NOT NULL, -- document_analysis, api_execution, report_generation, etc.
    model VARCHAR(100) NOT NULL, -- gemini-2.5-flash, claude-sonnet-3.5, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, task_type)
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_documents_project_id ON documents(project_id);
CREATE INDEX idx_apis_project_id ON apis(project_id);
CREATE INDEX idx_credentials_api_id ON credentials(api_id);
CREATE INDEX idx_executions_api_id ON executions(api_id);
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_insights_project_id ON insights(project_id);
CREATE INDEX idx_dashboards_project_id ON dashboards(project_id);
CREATE INDEX idx_logs_user_id ON logs(user_id);
CREATE INDEX idx_logs_project_id ON logs(project_id);
CREATE INDEX idx_logs_created_at ON logs(created_at);
CREATE INDEX idx_ai_model_preferences_user_id ON ai_model_preferences(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_preferences ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Políticas para projects
CREATE POLICY "Users can view their own projects" ON projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para documents
CREATE POLICY "Users can view documents of their projects" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = documents.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create documents in their projects" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = documents.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents in their projects" ON documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = documents.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents in their projects" ON documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = documents.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Políticas para apis (similar a documents)
CREATE POLICY "Users can view apis of their projects" ON apis
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = apis.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create apis in their projects" ON apis
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = apis.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update apis in their projects" ON apis
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = apis.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete apis in their projects" ON apis
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = apis.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Políticas para credentials
CREATE POLICY "Users can view credentials of their apis" ON credentials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = credentials.api_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create credentials in their apis" ON credentials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = credentials.api_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update credentials in their apis" ON credentials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = credentials.api_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete credentials in their apis" ON credentials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = credentials.api_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Políticas similares para executions, reports, insights, dashboards
CREATE POLICY "Users can view executions of their apis" ON executions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = executions.api_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create executions in their apis" ON executions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM apis 
            JOIN projects ON projects.id = apis.project_id
            WHERE apis.id = executions.api_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view reports of their projects" ON reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = reports.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create reports in their projects" ON reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = reports.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view insights of their projects" ON insights
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = insights.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create insights in their projects" ON insights
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = insights.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view dashboards of their projects" ON dashboards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = dashboards.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create dashboards in their projects" ON dashboards
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = dashboards.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update dashboards in their projects" ON dashboards
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = dashboards.project_id 
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete dashboards in their projects" ON dashboards
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects 
            WHERE projects.id = dashboards.project_id 
            AND projects.user_id = auth.uid()
        )
    );

-- Políticas para logs
CREATE POLICY "Users can view their own logs" ON logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create logs" ON logs
    FOR INSERT WITH CHECK (true); -- El backend puede crear logs

-- Políticas para ai_model_preferences
CREATE POLICY "Users can view their own preferences" ON ai_model_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own preferences" ON ai_model_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON ai_model_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" ON ai_model_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apis_updated_at BEFORE UPDATE ON apis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credentials_updated_at BEFORE UPDATE ON credentials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON dashboards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_model_preferences_updated_at BEFORE UPDATE ON ai_model_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Crear usuario administrador por defecto
-- Contraseña: admin123 (cambiar en producción)
-- Hash generado con bcrypt rounds=10
INSERT INTO users (email, password_hash, full_name, role) 
VALUES (
    'admin@datalive.com',
    '$2b$10$rKZqGqZ5J5J5J5J5J5J5JeO5J5J5J5J5J5J5J5J5J5J5J5J5J5J5J',
    'Administrador',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Nota: El hash anterior es un placeholder. En la aplicación se generará correctamente.
