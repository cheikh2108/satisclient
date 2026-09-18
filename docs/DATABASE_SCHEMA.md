# SatisClient - Schéma de base de données PostgreSQL

## Vue d'ensemble

Modèle relationnel multi-tenant avec isolation stricte par organisation.

## Diagramme ERD simplifié

```
┌─────────────────┐
│ organizations   │──┐
└─────────────────┘  │
         │           │
         │ 1       * │
         │           │
┌─────────────────┐  │
│ users           │◄─┤
└─────────────────┘  │
         │           │
         │ 1         │
         │           │
      *  │           │
┌─────────────────┐  │
│ sites           │◄─┤
└─────────────────┘  │
    │    │           │
    │    └────┐      │
    │         │      │
    │ 1     1 │      │
    │         │      │
 *  │      *  │      │
┌─────────────────┐  │
│ feedbacks       │◄─┘
└─────────────────┘
         │
         │ 1
         │
      *  │
┌─────────────────┐
│ complaints      │
└─────────────────┘
         │
         │ 1
         │
      *  │
┌─────────────────┐
│ complaint_hist  │
└─────────────────┘
```

## Tables détaillées

### 1. organizations (Multi-tenant principal)

```sql
CREATE TYPE subscription_plan AS ENUM ('essentialiel', 'pro', 'business', 'institution');
CREATE TYPE organization_status AS ENUM ('active', 'suspended', 'trial', 'expired');

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL, -- URL friendly
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3B82F6',
    welcome_message TEXT,
    
    -- Subscription
    subscription_plan subscription_plan NOT NULL DEFAULT 'essentialiel',
    subscription_status organization_status NOT NULL DEFAULT 'trial',
    trial_ends_at TIMESTAMP,
    subscription_starts_at TIMESTAMP,
    subscription_ends_at TIMESTAMP,
    
    -- Limits based on plan
    max_sites INTEGER DEFAULT 1,
    max_users INTEGER DEFAULT 3,
    max_monthly_feedbacks INTEGER DEFAULT 1000,
    
    -- Settings (JSONB flexible)
    settings JSONB DEFAULT '{
        "timezone": "Africa/Dakar",
        "language": "fr",
        "enable_anonymous_feedback": true,
        "require_email_verification": false,
        "default_sla_hours": {
            "urgent": 24,
            "high": 48,
            "normal": 120,
            "low": 240
        },
        "notification_preferences": {
            "email_enabled": true,
            "sms_enabled": false,
            "whatsapp_enabled": false
        },
        "feedback_criteria": [
            {"key": "accueil", "label": "Accueil", "enabled": true},
            {"key": "qualite", "label": "Qualité du service", "enabled": true},
            {"key": "delai", "label": "Délai", "enabled": true},
            {"key": "proprete", "label": "Propreté", "enabled": true}
        ]
    }'::JSONB,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP, -- Soft delete
    
    -- Indexes
    CONSTRAINT organizations_slug_check CHECK (slug ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_status ON organizations(subscription_status) 
    WHERE deleted_at IS NULL;
```

### 2. users (Utilisateurs système)

```sql
CREATE TYPE user_role AS ENUM (
    'super_admin',      -- ATAABA team
    'org_admin',        -- Organization administrator
    'director',         -- Direction
    'quality_manager',  -- Responsable qualité
    'service_manager',  -- Responsable de service
    'agent',            -- Agent de traitement
    'client'            -- Client/usager (optionnel)
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Identity
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL, -- bcrypt
    
    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    
    -- Role & Access
    role user_role NOT NULL DEFAULT 'agent',
    status user_status NOT NULL DEFAULT 'active',
    permissions JSONB DEFAULT '[]'::JSONB, -- Custom permissions
    
    -- Sites assignments (pour agents/managers)
    assigned_site_ids UUID[] DEFAULT ARRAY[]::UUID[],
    
    -- Security
    last_login_at TIMESTAMP,
    last_login_ip INET,
    email_verified_at TIMESTAMP,
    phone_verified_at TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(32),
    
    -- Preferences
    preferences JSONB DEFAULT '{
        "language": "fr",
        "notification_email": true,
        "notification_sms": false,
        "notification_in_app": true
    }'::JSONB,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    -- Constraints
    UNIQUE(organization_id, email),
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_org_email ON users(organization_id, email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(organization_id, role) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
```

### 3. sites (Hiérarchie des sites)

```sql
CREATE TYPE site_type AS ENUM (
    'organization',  -- Racine (1 par org)
    'region',        -- Région
    'agency',        -- Agence/Établissement
    'service',       -- Service/Département
    'point'          -- Point de prestation
);

CREATE TABLE sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES sites(id) ON DELETE CASCADE, -- Hierarchical
    
    -- Identity
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50), -- Code interne (ex: AG-DKR-001)
    type site_type NOT NULL,
    
    -- Location
    address TEXT,
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(2) DEFAULT 'SN', -- ISO code
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone VARCHAR(20),
    email VARCHAR(255),
    
    -- QR Code & Links
    qr_code_url TEXT, -- Lien vers QR code image
    feedback_link_code VARCHAR(20) UNIQUE, -- Code court pour URL publique
    
    -- Manager
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Settings (peut override org settings)
    settings JSONB DEFAULT '{}'::JSONB,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_sites_org ON sites(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sites_parent ON sites(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sites_type ON sites(organization_id, type);
CREATE INDEX idx_sites_feedback_code ON sites(feedback_link_code) WHERE feedback_link_code IS NOT NULL;

-- Fonction pour obtenir le path complet d'un site
CREATE OR REPLACE FUNCTION get_site_path(site_id UUID) 
RETURNS TEXT AS $$
    WITH RECURSIVE site_tree AS (
        SELECT id, name, parent_id, 1 as level
        FROM sites WHERE id = site_id
        UNION ALL
        SELECT s.id, s.name, s.parent_id, st.level + 1
        FROM sites s
        JOIN site_tree st ON s.id = st.parent_id
    )
    SELECT string_agg(name, ' > ' ORDER BY level DESC)
    FROM site_tree;
$$ LANGUAGE SQL;
```

### 4. feedbacks (Avis et notations)

```sql
CREATE TYPE sentiment AS ENUM ('positive', 'neutral', 'negative', 'unknown');

CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    
    -- Respondent (optionnel si anonyme)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    respondent_email VARCHAR(255),
    respondent_phone VARCHAR(20),
    respondent_name VARCHAR(255),
    
    -- Rating (1-5 stars or 1-10)
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 10),
    
    -- Criteria ratings (JSONB flexible)
    criteria_ratings JSONB DEFAULT '{}'::JSONB,
    /* Example:
    {
        "accueil": 5,
        "qualite": 4,
        "delai": 3,
        "proprete": 5,
        "professionnalisme": 4
    }
    */
    
    -- Comment
    comment TEXT,
    comment_sentiment sentiment DEFAULT 'unknown',
    comment_keywords TEXT[], -- Extracted keywords
    
    -- Context
    service_date DATE, -- Date du service évalué
    feedback_channel VARCHAR(50) DEFAULT 'web', -- web, qr_code, sms, email, tablet
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Processing
    is_processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP,
    needs_response BOOLEAN DEFAULT FALSE,
    response_sent_at TIMESTAMP,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feedbacks_org_site ON feedbacks(organization_id, site_id);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at DESC);
CREATE INDEX idx_feedbacks_rating ON feedbacks(overall_rating);
CREATE INDEX idx_feedbacks_sentiment ON feedbacks(comment_sentiment);
CREATE INDEX idx_feedbacks_processed ON feedbacks(is_processed) WHERE is_processed = FALSE;

-- Index GIN pour recherche full-text dans comments
CREATE INDEX idx_feedbacks_comment_search ON feedbacks USING gin(to_tsvector('french', comment));
```

### 5. surveys (Enquêtes)

```sql
CREATE TABLE surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Questions (JSONB structure)
    questions JSONB NOT NULL,
    /* Example:
    [
        {
            "id": "q1",
            "type": "single_choice",
            "question": "Comment avez-vous connu nos services ?",
            "options": ["Recommandation", "Publicité", "Internet", "Autre"],
            "required": true
        },
        {
            "id": "q2",
            "type": "rating",
            "question": "Notez votre satisfaction globale",
            "scale": 5,
            "required": true
        },
        {
            "id": "q3",
            "type": "text",
            "question": "Suggestions d'amélioration ?",
            "required": false
        }
    ]
    */
    
    -- Target
    target_site_ids UUID[], -- Null = tous les sites
    
    -- Schedule
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    
    -- Type
    survey_type VARCHAR(50) DEFAULT 'one_time', -- one_time, recurring, post_service, event
    
    -- Settings
    settings JSONB DEFAULT '{
        "allow_multiple_responses": false,
        "show_progress_bar": true,
        "randomize_options": false,
        "thank_you_message": "Merci pour votre participation !"
    }'::JSONB,
    
    -- Stats (denormalized for performance)
    total_responses INTEGER DEFAULT 0,
    avg_completion_time_seconds INTEGER,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_surveys_org ON surveys(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_surveys_active ON surveys(is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
```

### 6. survey_responses (Réponses aux enquêtes)

```sql
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    
    -- Respondent
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    respondent_email VARCHAR(255),
    
    -- Answers (JSONB structure)
    answers JSONB NOT NULL,
    /* Example:
    {
        "q1": "Recommandation",
        "q2": 5,
        "q3": "Excellent service, rien à dire"
    }
    */
    
    -- Metrics
    completion_time_seconds INTEGER,
    is_completed BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    -- Audit
    submitted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id);
CREATE INDEX idx_survey_responses_org ON survey_responses(organization_id);
CREATE INDEX idx_survey_responses_submitted ON survey_responses(submitted_at DESC);

-- Index GIN pour recherche dans answers JSONB
CREATE INDEX idx_survey_responses_answers ON survey_responses USING gin(answers);
```

### 7. complaints (Réclamations)

```sql
CREATE TYPE complaint_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE complaint_status AS ENUM (
    'received',           -- Reçue
    'qualified',          -- Qualifiée
    'assigned',           -- Affectée
    'in_progress',        -- En cours
    'awaiting_info',      -- Info complémentaire demandée
    'transferred',        -- Transférée
    'on_hold',            -- En attente
    'resolved',           -- Résolue
    'closed',             -- Clôturée
    'rejected',           -- Rejetée
    'reopened'            -- Réouverte
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    
    -- Tracking number
    ticket_number VARCHAR(50) UNIQUE NOT NULL, -- SAT-2026-000145
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- "Facturation", "Qualité", "Délai", etc.
    subcategory VARCHAR(100),
    
    -- Priority & SLA
    priority complaint_priority NOT NULL DEFAULT 'normal',
    status complaint_status NOT NULL DEFAULT 'received',
    
    -- Dates
    incident_date DATE, -- Date de l'incident
    sla_due_date TIMESTAMP, -- Calculé selon priority
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Complainant
    complainant_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    complainant_name VARCHAR(255),
    complainant_email VARCHAR(255),
    complainant_phone VARCHAR(20),
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Resolution
    resolution_summary TEXT,
    resolution_category VARCHAR(100), -- "Résolu", "Non fondé", "Hors périmètre", etc.
    
    -- Satisfaction après résolution
    resolution_rating INTEGER CHECK (resolution_rating BETWEEN 1 AND 5),
    resolution_comment TEXT,
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::JSONB,
    /* Example:
    [
        {
            "filename": "facture.pdf",
            "url": "https://...",
            "mime_type": "application/pdf",
            "size_bytes": 145632,
            "uploaded_at": "2026-09-17T10:30:00Z"
        }
    ]
    */
    
    -- Flags
    is_escalated BOOLEAN DEFAULT FALSE,
    escalated_at TIMESTAMP,
    escalated_to UUID REFERENCES users(id) ON DELETE SET NULL,
    
    is_overdue BOOLEAN DEFAULT FALSE, -- Computed field
    is_critical BOOLEAN DEFAULT FALSE, -- Flagged by manager
    
    -- Related
    related_complaint_ids UUID[], -- Réclamations similaires
    related_feedback_id UUID REFERENCES feedbacks(id) ON DELETE SET NULL,
    
    -- Metadata
    source VARCHAR(50) DEFAULT 'web', -- web, mobile, qr_code, email, phone
    ip_address INET,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_complaints_org ON complaints(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_site ON complaints(site_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_ticket ON complaints(ticket_number);
CREATE INDEX idx_complaints_status ON complaints(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_complaints_assigned ON complaints(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_overdue ON complaints(is_overdue) WHERE is_overdue = TRUE;
CREATE INDEX idx_complaints_sla ON complaints(sla_due_date) WHERE status NOT IN ('closed', 'rejected');
CREATE INDEX idx_complaints_created ON complaints(created_at DESC);

-- Full-text search index
CREATE INDEX idx_complaints_search ON complaints USING gin(
    to_tsvector('french', coalesce(title, '') || ' ' || coalesce(description, ''))
);

-- Fonction pour générer ticket number
CREATE SEQUENCE complaint_ticket_seq START 1;

CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    year_part VARCHAR(4);
    seq_part VARCHAR(6);
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::VARCHAR;
    seq_part := LPAD(nextval('complaint_ticket_seq')::VARCHAR, 6, '0');
    RETURN 'SAT-' || year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;
```

### 8. complaint_history (Historique des réclamations)

```sql
CREATE TABLE complaint_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Action
    action VARCHAR(100) NOT NULL, -- status_changed, assigned, commented, escalated, etc.
    
    -- Changes
    old_status complaint_status,
    new_status complaint_status,
    old_assigned_to UUID,
    new_assigned_to UUID,
    
    -- Comment
    comment TEXT,
    internal_note BOOLEAN DEFAULT FALSE, -- Visible only by staff
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255), -- Denormalized
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB, -- Flexible additional data
    ip_address INET,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_complaint_history_complaint ON complaint_history(complaint_id, created_at DESC);
CREATE INDEX idx_complaint_history_user ON complaint_history(user_id);
```

### 9. suggestions (Suggestions d'amélioration)

```sql
CREATE TYPE suggestion_status AS ENUM (
    'submitted',      -- Soumise
    'reviewing',      -- En examen
    'approved',       -- Approuvée
    'in_progress',    -- En cours de mise en œuvre
    'implemented',    -- Mise en œuvre
    'rejected',       -- Rejetée
    'archived'        -- Archivée
);

CREATE TABLE suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    
    -- Content
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    expected_impact TEXT, -- Bénéfice attendu
    
    -- Status
    status suggestion_status NOT NULL DEFAULT 'submitted',
    
    -- Submitter
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    submitter_name VARCHAR(255),
    submitter_email VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Assignment
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_at TIMESTAMP,
    
    -- Implementation
    implementation_notes TEXT,
    implemented_at TIMESTAMP,
    implementation_proof_urls TEXT[], -- Photos, documents
    
    -- Feedback on implementation
    feedback_requested BOOLEAN DEFAULT FALSE,
    feedback_provided BOOLEAN DEFAULT FALSE,
    
    -- Votes (gamification - future)
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_suggestions_org ON suggestions(organization_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_suggestions_site ON suggestions(site_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_suggestions_status ON suggestions(status);
CREATE INDEX idx_suggestions_created ON suggestions(created_at DESC);
```

### 10. notifications (Notifications multi-canal)

```sql
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp', 'in_app');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'delivered', 'failed', 'bounced');

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Recipient
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recipient_email VARCHAR(255),
    recipient_phone VARCHAR(20),
    
    -- Type & Channel
    notification_type VARCHAR(100) NOT NULL, -- complaint_assigned, sla_warning, feedback_received, etc.
    channel notification_channel NOT NULL,
    status notification_status NOT NULL DEFAULT 'pending',
    
    -- Content
    subject VARCHAR(255),
    body TEXT NOT NULL,
    template_id VARCHAR(100), -- Pour réutilisation templates
    
    -- Context (lien vers entité concernée)
    related_entity_type VARCHAR(50), -- complaint, feedback, survey, etc.
    related_entity_id UUID,
    
    -- Delivery
    scheduled_for TIMESTAMP DEFAULT NOW(),
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    read_at TIMESTAMP, -- Pour in_app
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- External IDs (pour tracking providers)
    external_id VARCHAR(255), -- Twilio Message SID, etc.
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_status ON notifications(status) WHERE status IN ('pending', 'failed');
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for) WHERE status = 'pending';
CREATE INDEX idx_notifications_type ON notifications(organization_id, notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

### 11. audit_logs (Journal d'audit)

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    
    -- Actor
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255), -- Denormalized
    user_role user_role,
    
    -- Action
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc.
    entity_type VARCHAR(50) NOT NULL, -- user, complaint, feedback, etc.
    entity_id UUID,
    
    -- Changes (JSONB pour flexibility)
    changes JSONB,
    /* Example:
    {
        "old": {"status": "received"},
        "new": {"status": "assigned", "assigned_to": "uuid..."}
    }
    */
    
    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_method VARCHAR(10), -- GET, POST, etc.
    request_path VARCHAR(500),
    
    -- Result
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- Partition par mois (pour performance long-terme)
-- À implémenter plus tard avec pg_partman
```

### 12. qr_codes (Gestion des QR codes)

```sql
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    
    -- Code
    code VARCHAR(50) UNIQUE NOT NULL, -- Short code
    qr_image_url TEXT, -- URL vers image QR générée
    
    -- Target
    target_type VARCHAR(50) NOT NULL, -- feedback, survey, complaint_form
    target_id UUID, -- survey_id si target = survey
    
    -- URL
    destination_url TEXT NOT NULL,
    
    -- Stats
    scan_count INTEGER DEFAULT 0,
    last_scanned_at TIMESTAMP,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP,
    
    -- Customization
    custom_message TEXT,
    
    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_org ON qr_codes(organization_id);
CREATE INDEX idx_qr_codes_site ON qr_codes(site_id);
CREATE INDEX idx_qr_codes_code ON qr_codes(code) WHERE is_active = TRUE;
```

## Row Level Security (RLS) pour Multi-Tenant

```sql
-- Activer RLS sur toutes les tables principales
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
-- ... etc pour toutes les tables

-- Politique: un utilisateur ne voit que les données de son organisation
CREATE POLICY org_isolation_policy ON users
    USING (organization_id = current_setting('app.current_org_id')::UUID);

CREATE POLICY org_isolation_policy ON sites
    USING (organization_id = current_setting('app.current_org_id')::UUID);

-- À définir au début de chaque requête backend:
-- SET app.current_org_id = 'uuid-de-lorganisation';
```

## Vues matérialisées pour performance

```sql
-- Vue: Stats par site (rafraîchie périodiquement)
CREATE MATERIALIZED VIEW site_statistics AS
SELECT 
    s.id AS site_id,
    s.organization_id,
    s.name AS site_name,
    COUNT(DISTINCT f.id) AS total_feedbacks,
    AVG(f.overall_rating) AS avg_rating,
    COUNT(DISTINCT c.id) AS total_complaints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'closed') AS closed_complaints,
    COUNT(DISTINCT c.id) FILTER (WHERE c.is_overdue = TRUE) AS overdue_complaints,
    AVG(EXTRACT(EPOCH FROM (c.closed_at - c.created_at))/3600) AS avg_resolution_hours
FROM sites s
LEFT JOIN feedbacks f ON f.site_id = s.id
LEFT JOIN complaints c ON c.site_id = s.id
WHERE s.deleted_at IS NULL
GROUP BY s.id, s.organization_id, s.name;

CREATE UNIQUE INDEX ON site_statistics(site_id);
CREATE INDEX ON site_statistics(organization_id);

-- Rafraîchir toutes les heures via CRON job
```

## Triggers automatiques

```sql
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... pour toutes les tables avec updated_at

-- Auto-calcul SLA due date pour complaints
CREATE OR REPLACE FUNCTION calculate_sla_due_date()
RETURNS TRIGGER AS $$
DECLARE
    sla_hours INTEGER;
    org_settings JSONB;
BEGIN
    -- Récupérer les settings de l'organisation
    SELECT settings INTO org_settings FROM organizations WHERE id = NEW.organization_id;
    
    -- Extraire le SLA selon priority
    sla_hours := (org_settings->'default_sla_hours'->>NEW.priority::TEXT)::INTEGER;
    
    -- Calculer due date
    NEW.sla_due_date := NEW.created_at + (sla_hours || ' hours')::INTERVAL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_complaint_sla BEFORE INSERT ON complaints
    FOR EACH ROW EXECUTE FUNCTION calculate_sla_due_date();

-- Auto-incrément stats survey responses
CREATE OR REPLACE FUNCTION increment_survey_responses()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE surveys 
    SET total_responses = total_responses + 1
    WHERE id = NEW.survey_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_survey_stats AFTER INSERT ON survey_responses
    FOR EACH ROW EXECUTE FUNCTION increment_survey_responses();
```

## Seed data (données de test)

```sql
-- Organisation de test
INSERT INTO organizations (name, slug, email, subscription_plan, subscription_status)
VALUES ('Clinique Espoir', 'clinique-espoir', 'contact@cliniqueespoir.sn', 'pro', 'active');

-- Admin user
INSERT INTO users (organization_id, email, password_hash, first_name, last_name, role)
VALUES (
    (SELECT id FROM organizations WHERE slug = 'clinique-espoir'),
    'admin@cliniqueespoir.sn',
    '$2b$10$...', -- hash de 'password123'
    'Amadou',
    'Diallo',
    'org_admin'
);

-- Sites
INSERT INTO sites (organization_id, name, type, parent_id)
VALUES 
    ((SELECT id FROM organizations WHERE slug = 'clinique-espoir'), 'Siège Dakar', 'organization', NULL),
    ((SELECT id FROM organizations WHERE slug = 'clinique-espoir'), 'Agence Plateau', 'agency', 
     (SELECT id FROM sites WHERE name = 'Siège Dakar')),
    ((SELECT id FROM organizations WHERE slug = 'clinique-espoir'), 'Service Pédiatrie', 'service',
     (SELECT id FROM sites WHERE name = 'Agence Plateau'));
```

## Indexes de performance critiques

```sql
-- Recherche rapide de réclamations en retard
CREATE INDEX CONCURRENTLY idx_complaints_sla_critical 
    ON complaints(organization_id, sla_due_date, status) 
    WHERE status NOT IN ('closed', 'rejected', 'resolved') 
    AND sla_due_date < NOW();

-- Dashboard: feedbacks récents
CREATE INDEX CONCURRENTLY idx_feedbacks_recent_dashboard
    ON feedbacks(organization_id, created_at DESC)
    INCLUDE (overall_rating, site_id);

-- Analytics: groupement par période
CREATE INDEX CONCURRENTLY idx_feedbacks_date_trunc
    ON feedbacks(organization_id, date_trunc('day', created_at));
```

## Maintenance recommandée

```sql
-- Vacuum régulier (automatique avec autovacuum)
-- Analyser les stats régulièrement
ANALYZE;

-- Rafraîchir les vues matérialisées (CRON job)
REFRESH MATERIALIZED VIEW CONCURRENTLY site_statistics;

-- Archive des anciennes notifications (> 90 jours)
DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days' AND status IN ('sent', 'delivered');

-- Archive des audit logs (> 1 an) vers table cold storage
```

## Prochaines étapes

1. ✅ Schéma complet défini
2. ⏳ Convertir en Prisma schema
3. ⏳ Générer migrations
4. ⏳ Seed data pour dev
5. ⏳ Tests performance
