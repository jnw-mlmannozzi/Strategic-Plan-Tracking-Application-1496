-- Enable Row Level Security on all tables
ALTER TABLE organizations_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_plans_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_priorities_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE defining_objectives_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE impersonation_sessions_mt ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs_mt ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION auth_org_id() RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT org_id 
    FROM users_mt 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role(org_id UUID) RETURNS VARCHAR AS $$
BEGIN
  RETURN (
    SELECT role 
    FROM memberships_mt 
    WHERE user_id = auth.uid() AND organization_id = org_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_teams() RETURNS TABLE(team_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT m.team_id
  FROM memberships_mt m
  WHERE m.user_id = auth.uid() AND m.team_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_support_user() RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships_mt 
    WHERE user_id = auth.uid() AND role = 'Support'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships_mt 
    WHERE user_id = auth.uid() 
    AND organization_id = org_id 
    AND role = 'OrgAdmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_team_admin_for_team(team_id UUID) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships_mt 
    WHERE user_id = auth.uid() 
    AND team_id = team_id 
    AND role = 'TeamAdmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organization" ON organizations_mt
  FOR SELECT USING (
    is_support_user() OR 
    id = auth_org_id()
  );

CREATE POLICY "OrgAdmins can update their organization" ON organizations_mt
  FOR UPDATE USING (
    is_support_user() OR 
    is_org_admin(id)
  );

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users_mt
  FOR SELECT USING (
    is_support_user() OR 
    org_id = auth_org_id()
  );

CREATE POLICY "Users can update their own profile" ON users_mt
  FOR UPDATE USING (
    is_support_user() OR 
    id = auth.uid()
  );

CREATE POLICY "Users can insert their own profile" ON users_mt
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );

-- Teams policies
CREATE POLICY "Users can view teams in their organization" ON teams_mt
  FOR SELECT USING (
    is_support_user() OR 
    organization_id = auth_org_id()
  );

CREATE POLICY "OrgAdmins can manage teams" ON teams_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

-- Memberships policies
CREATE POLICY "Users can view memberships in their organization" ON memberships_mt
  FOR SELECT USING (
    is_support_user() OR 
    organization_id = auth_org_id()
  );

CREATE POLICY "OrgAdmins can manage all memberships" ON memberships_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

CREATE POLICY "TeamAdmins can manage team memberships" ON memberships_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id) OR 
    is_team_admin_for_team(team_id)
  );

-- Subscriptions policies
CREATE POLICY "OrgAdmins can manage subscriptions" ON subscriptions_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

-- Strategic Plans policies
CREATE POLICY "Users can view strategic plans" ON strategic_plans_mt
  FOR SELECT USING (
    is_support_user() OR 
    (organization_id = auth_org_id() AND (
      team_id IS NULL OR -- Org-wide plans
      team_id IN (SELECT team_id FROM auth_user_teams()) -- Team plans user belongs to
    ))
  );

CREATE POLICY "OrgAdmins can manage all strategic plans" ON strategic_plans_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

CREATE POLICY "TeamAdmins can manage team strategic plans" ON strategic_plans_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id) OR 
    is_team_admin_for_team(team_id)
  );

-- Strategic Priorities policies
CREATE POLICY "Users can view strategic priorities" ON strategic_priorities_mt
  FOR SELECT USING (
    is_support_user() OR 
    strategic_plan_id IN (
      SELECT id FROM strategic_plans_mt 
      WHERE organization_id = auth_org_id() AND (
        team_id IS NULL OR 
        team_id IN (SELECT team_id FROM auth_user_teams())
      )
    )
  );

CREATE POLICY "Users can manage strategic priorities based on plan access" ON strategic_priorities_mt
  FOR ALL USING (
    is_support_user() OR 
    strategic_plan_id IN (
      SELECT id FROM strategic_plans_mt 
      WHERE is_org_admin(organization_id) OR 
            is_team_admin_for_team(team_id)
    )
  );

-- Defining Objectives policies
CREATE POLICY "Users can view defining objectives" ON defining_objectives_mt
  FOR SELECT USING (
    is_support_user() OR 
    strategic_priority_id IN (
      SELECT sp.id FROM strategic_priorities_mt sp
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id = auth_org_id() AND (
        spl.team_id IS NULL OR 
        spl.team_id IN (SELECT team_id FROM auth_user_teams())
      )
    )
  );

CREATE POLICY "Users can manage defining objectives based on plan access" ON defining_objectives_mt
  FOR ALL USING (
    is_support_user() OR 
    strategic_priority_id IN (
      SELECT sp.id FROM strategic_priorities_mt sp
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE is_org_admin(spl.organization_id) OR 
            is_team_admin_for_team(spl.team_id)
    )
  );

-- Action Items policies
CREATE POLICY "Users can view action items" ON action_items_mt
  FOR SELECT USING (
    is_support_user() OR 
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives_mt do
      JOIN strategic_priorities_mt sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id = auth_org_id() AND (
        spl.team_id IS NULL OR 
        spl.team_id IN (SELECT team_id FROM auth_user_teams())
      )
    )
  );

CREATE POLICY "Users can update their assigned action items" ON action_items_mt
  FOR UPDATE USING (
    is_support_user() OR 
    assigned_to = auth.uid() OR
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives_mt do
      JOIN strategic_priorities_mt sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE is_org_admin(spl.organization_id) OR 
            is_team_admin_for_team(spl.team_id)
    )
  );

CREATE POLICY "Admins can manage action items" ON action_items_mt
  FOR ALL USING (
    is_support_user() OR 
    defining_objective_id IN (
      SELECT do.id FROM defining_objectives_mt do
      JOIN strategic_priorities_mt sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE is_org_admin(spl.organization_id) OR 
            is_team_admin_for_team(spl.team_id)
    )
  );

-- Status Updates policies
CREATE POLICY "Users can view status updates" ON status_updates_mt
  FOR SELECT USING (
    is_support_user() OR 
    action_item_id IN (
      SELECT ai.id FROM action_items_mt ai
      JOIN defining_objectives_mt do ON ai.defining_objective_id = do.id
      JOIN strategic_priorities_mt sp ON do.strategic_priority_id = sp.id
      JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
      WHERE spl.organization_id = auth_org_id() AND (
        spl.team_id IS NULL OR 
        spl.team_id IN (SELECT team_id FROM auth_user_teams())
      )
    )
  );

CREATE POLICY "Users can create status updates" ON status_updates_mt
  FOR INSERT WITH CHECK (
    is_support_user() OR 
    (user_id = auth.uid() AND 
     action_item_id IN (
       SELECT ai.id FROM action_items_mt ai
       JOIN defining_objectives_mt do ON ai.defining_objective_id = do.id
       JOIN strategic_priorities_mt sp ON do.strategic_priority_id = sp.id
       JOIN strategic_plans_mt spl ON sp.strategic_plan_id = spl.id
       WHERE spl.organization_id = auth_org_id()
     ))
  );

-- Invitations policies
CREATE POLICY "OrgAdmins can manage invitations" ON invitations_mt
  FOR ALL USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

CREATE POLICY "TeamAdmins can view team invitations" ON invitations_mt
  FOR SELECT USING (
    is_support_user() OR 
    is_org_admin(organization_id) OR 
    is_team_admin_for_team(team_id)
  );

-- Impersonation Sessions policies (Support only)
CREATE POLICY "Support can manage impersonation sessions" ON impersonation_sessions_mt
  FOR ALL USING (is_support_user());

-- Audit Logs policies
CREATE POLICY "Support can view all audit logs" ON audit_logs_mt
  FOR SELECT USING (is_support_user());

CREATE POLICY "OrgAdmins can view their organization's audit logs" ON audit_logs_mt
  FOR SELECT USING (
    is_support_user() OR 
    is_org_admin(organization_id)
  );

CREATE POLICY "Users can create audit logs" ON audit_logs_mt
  FOR INSERT WITH CHECK (user_id = auth.uid());