export const ROLES = {
  ORG_ADMIN: 'OrgAdmin',
  TEAM_ADMIN: 'TeamAdmin',
  MEMBER: 'Member',
  SUPPORT: 'Support'
}

export const ROLE_HIERARCHY = {
  [ROLES.SUPPORT]: 4,
  [ROLES.ORG_ADMIN]: 3,
  [ROLES.TEAM_ADMIN]: 2,
  [ROLES.MEMBER]: 1
}

export const hasRole = (userRole, requiredRole) => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export const canManageUsers = (role) => {
  return hasRole(role, ROLES.TEAM_ADMIN)
}

export const canManageOrganization = (role) => {
  return hasRole(role, ROLES.ORG_ADMIN)
}

export const canImpersonate = (role) => {
  return role === ROLES.SUPPORT
}

export const getRoleDisplayName = (role) => {
  const names = {
    [ROLES.ORG_ADMIN]: 'Organization Administrator',
    [ROLES.TEAM_ADMIN]: 'Team Administrator',
    [ROLES.MEMBER]: 'Member',
    [ROLES.SUPPORT]: 'Support'
  }
  return names[role] || role
}

export const getRolePermissions = (role) => {
  const permissions = {
    [ROLES.SUPPORT]: [
      'impersonate_users',
      'view_all_organizations',
      'view_audit_logs',
      'manage_support_tickets'
    ],
    [ROLES.ORG_ADMIN]: [
      'manage_organization',
      'manage_teams',
      'manage_users',
      'manage_subscription',
      'create_strategic_plans',
      'manage_strategic_plans',
      'view_all_plans',
      'invite_users'
    ],
    [ROLES.TEAM_ADMIN]: [
      'manage_team_users',
      'create_team_plans',
      'manage_team_plans',
      'view_team_plans',
      'invite_team_members'
    ],
    [ROLES.MEMBER]: [
      'view_assigned_plans',
      'update_action_items',
      'add_status_updates',
      'view_team_plans'
    ]
  }
  
  return permissions[role] || []
}