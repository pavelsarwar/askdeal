import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ error: 'Missing authorization' }, 401)

    const admin = createClient(supabaseUrl, serviceRole, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: userData, error: userError } = await admin.auth.getUser(token)
    if (userError || !userData.user) return json({ error: 'Invalid session' }, 401)

    const { data: callerProfile } = await admin.from('profiles').select('role').eq('id', userData.user.id).single()
    if (callerProfile?.role !== 'super_admin') return json({ error: 'Super Admin access required' }, 403)

    const body = await req.json().catch(() => ({}))
    const action = body.action || 'list'

    if (action === 'list') {
      const { data: authUsers, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 })
      if (error) throw error
      const { data: profiles } = await admin.from('profiles').select('id,full_name,role,created_at')
      const map = new Map((profiles || []).map((p:any) => [p.id, p]))
      const users = authUsers.users.map((u:any) => ({
        id: u.id,
        email: u.email,
        invited_at: u.invited_at,
        last_sign_in_at: u.last_sign_in_at,
        created_at: u.created_at,
        full_name: map.get(u.id)?.full_name || u.user_metadata?.full_name || '',
        role: map.get(u.id)?.role || 'editor',
        confirmed: !!u.email_confirmed_at,
        password_set: u.user_metadata?.password_set === true
      }))
      return json({ users })
    }

    if (action === 'invite') {
      const email = String(body.email || '').trim().toLowerCase()
      const fullName = String(body.full_name || '').trim()
      const role = String(body.role || 'editor')
      const allowedRoles = ['admin', 'editor', 'merchant']
      if (!email || !email.includes('@')) return json({ error: 'Valid email is required' }, 400)
      if (!allowedRoles.includes(role)) return json({ error: 'Invalid role' }, 400)
      const redirectTo = String(body.redirect_to || '').trim() || undefined
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName, role, password_set: false },
        redirectTo
      })
      if (error) throw error
      if (data.user) {
        const { error: profileError } = await admin.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          role
        }, { onConflict: 'id' })
        if (profileError) throw profileError
      }
      return json({ success: true, user_id: data.user?.id, email, redirect_to: redirectTo })
    }

    if (action === 'update_role') {
      const userId = String(body.user_id || '')
      const role = String(body.role || '')
      if (!userId || !['admin','editor','merchant'].includes(role)) return json({ error: 'Invalid user or role' }, 400)
      const { error } = await admin.from('profiles').update({ role }).eq('id', userId)
      if (error) throw error
      return json({ success: true })
    }

    return json({ error: 'Unknown action' }, 400)
  } catch (e) {
    return json({ error: e?.message || 'Unexpected error' }, 500)
  }
})

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}
