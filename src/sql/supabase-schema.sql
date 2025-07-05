-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  stripe_plan_id VARCHAR(255),
  plan_name VARCHAR(100),
  status VARCHAR(50),
  amount INTEGER,
  currency VARCHAR(3) DEFAULT 'usd',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  last4 VARCHAR(4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategic_plans table
CREATE TABLE IF NOT EXISTS strategic_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create strategic_priorities table
CREATE TABLE IF NOT EXISTS strategic_priorities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategic_plan_id UUID REFERENCES strategic_plans(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  priority_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create defining_objectives table
CREATE TABLE IF NOT EXISTS defining_objectives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  strategic_priority_id UUID REFERENCES strategic_priorities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_value DECIMAL,
  current_value DECIMAL DEFAULT 0,
  unit VARCHAR(50),
  due_date DATE,
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create action_items table
CREATE TABLE IF NOT EXISTS action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  defining_objective_id UUID REFERENCES defining_objectives(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  priority VARCHAR(50) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create status_updates table
CREATE TABLE IF NOT EXISTS status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_item_id UUID REFERENCES action_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  update_text TEXT NOT NULL,
  progress INTEGER CHECK (progress >= 0 AND progress <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_organization_id ON strategic_plans(organization_id);
CREATE INDEX IF NOT EXISTS idx_strategic_priorities_plan_id ON strategic_priorities(strategic_plan_id);
CREATE INDEX IF NOT EXISTS idx_defining_objectives_priority_id ON defining_objectives(strategic_priority_id);
CREATE INDEX IF NOT EXISTS idx_action_items_objective_id ON action_items(defining_objective_id);
CREATE INDEX IF NOT EXISTS idx_action_items_assigned_to ON action_items(assigned_to);
CREATE INDEX IF NOT EXISTS idx_action_items_due_date ON action_items(due_date);
CREATE INDEX IF NOT EXISTS idx_status_updates_action_item_id ON status_updates(action_item_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);

-- Row Level Security Policies

-- Organizations: Users can only see their own organization
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Users: Users can see other users in their organization
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (id = auth.uid());

-- Subscriptions: Only admins can view/modify subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage subscriptions" ON subscriptions
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Strategic Plans: Users can view all plans in their organization
ALTER TABLE strategic_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view strategic plans in their organization" ON strategic_plans
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage strategic plans" ON strategic_plans
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Strategic Priorities: Users can view all priorities in their organization
ALTER TABLE strategic_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view strategic priorities in their organization" ON strategic_priorities
  FOR SELECT USING (
    strategic_plan_id IN (
      SELECT id FROM strategic_plans 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage strategic priorities" ON strategic_priorities
  FOR ALL USING (
    strategic_plan_id IN (
      SELECT id FROM strategic_plans 
      WHERE organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Defining Objectives: Users can view all objectives in their organization
ALTER TABLE defining_objectives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view defining objectives in their organization" ON defining_objectives
  FOR SELECT USING (
    strategic_priority_id IN (
      SELECT sp.id FROM strategic_priorities sp
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can manage defining objectives" ON defining_objectives
  FOR ALL USING (
    strategic_priority_id IN (
      SELECT sp.id FROM strategic_priorities sp
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Action Items: Users can view all, but only edit their own or if admin
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view action items in their organization" ON action_items
  FOR SELECT USING (
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives do
      JOIN strategic_priorities sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their assigned action items" ON action_items
  FOR UPDATE USING (
    assigned_to = auth.uid() OR
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives do
      JOIN strategic_priorities sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Admins can manage action items" ON action_items
  FOR ALL USING (
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives do
      JOIN strategic_priorities sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users 
        WHERE id = auth.uid() AND role = 'admin'
      )
    )
  );

-- Status Updates: Users can view all updates in their organization
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view status updates in their organization" ON status_updates
  FOR SELECT USING (
    action_item_id IN (
      SELECT ai.id FROM action_items ai
      JOIN defining_objectives do ON ai.defining_objective_id = do.id
      JOIN strategic_priorities sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create status updates" ON status_updates
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    action_item_id IN (
      SELECT ai.id FROM action_items ai
      JOIN defining_objectives do ON ai.defining_objective_id = do.id
      JOIN strategic_priorities sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_plans_updated_at BEFORE UPDATE ON strategic_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategic_priorities_updated_at BEFORE UPDATE ON strategic_priorities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_defining_objectives_updated_at BEFORE UPDATE ON defining_objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_action_items_updated_at BEFORE UPDATE ON action_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();