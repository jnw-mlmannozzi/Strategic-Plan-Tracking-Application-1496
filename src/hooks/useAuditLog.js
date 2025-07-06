import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export const useAuditLog = () => {
  const { user, organization } = useAuth()

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'unknown'
    }
  }

  const logAction = async (action, resourceType, resourceId, details = {}) => {
    try {
      if (!user || !organization) return

      const auditEntry = {
        user_id: user.id,
        organization_id: organization.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
        ip_address: await getUserIP(),
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('audit_logs_mt')
        .insert([auditEntry])

      if (error) {
        console.error('Error logging audit action:', error)
      }
    } catch (error) {
      console.error('Error in audit logging:', error)
    }
  }

  return { logAction }
}