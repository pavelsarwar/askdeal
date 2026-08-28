import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders})
  try{
    const supabaseUrl=Deno.env.get('SUPABASE_URL')!
    const serviceRole=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const resendKey=Deno.env.get('RESEND_API_KEY')!
    if(!resendKey)return json({error:'RESEND_API_KEY secret is not configured'},500)

    const authHeader=req.headers.get('Authorization')||''
    if(!authHeader.startsWith('Bearer '))return json({error:'Missing authorization'},401)
    const admin=createClient(supabaseUrl,serviceRole,{auth:{autoRefreshToken:false,persistSession:false}})
    const token=authHeader.replace('Bearer ','')
    const {data:userData,error:userError}=await admin.auth.getUser(token)
    if(userError||!userData.user)return json({error:'Invalid session'},401)
    const {data:profile}=await admin.from('profiles').select('role').eq('id',userData.user.id).single()
    if(!['super_admin','admin'].includes(profile?.role||''))return json({error:'Admin access required'},403)

    const body=await req.json().catch(()=>({}))
    const action=String(body.action||'list')

    if(action==='list'){
      const r=await resend('/emails/receiving',resendKey)
      const filter=String(body.filter||'all').toLowerCase()
      let rows=Array.isArray(r.data)?r.data:[]
      if(filter==='support')rows=rows.filter((m:any)=>(m.to||[]).some((x:string)=>x.toLowerCase()==='support@askdeal.com.my'))
      if(filter==='social')rows=rows.filter((m:any)=>(m.to||[]).some((x:string)=>x.toLowerCase()==='social@askdeal.com.my'))
      return json({emails:rows,has_more:!!r.has_more})
    }

    if(action==='get'){
      const id=String(body.id||'').trim();if(!id)return json({error:'Email id is required'},400)
      const email=await resend(`/emails/receiving/${encodeURIComponent(id)}`,resendKey)
      return json({email})
    }

    if(action==='attachment'){
      const emailId=String(body.email_id||'').trim(),attachmentId=String(body.attachment_id||'').trim()
      if(!emailId||!attachmentId)return json({error:'Email and attachment id are required'},400)
      const attachment=await resend(`/emails/receiving/${encodeURIComponent(emailId)}/attachments/${encodeURIComponent(attachmentId)}`,resendKey)
      return json({attachment})
    }

    if(action==='send'){
      const fromAddress=String(body.from||'support@askdeal.com.my').trim().toLowerCase()
      const allowedFrom=['support@askdeal.com.my','social@askdeal.com.my']
      if(!allowedFrom.includes(fromAddress))return json({error:'Invalid sender address'},400)

      const to=parseAddresses(body.to)
      const cc=parseAddresses(body.cc)
      const bcc=parseAddresses(body.bcc)
      const subject=String(body.subject||'').trim()
      const text=String(body.text||'').trim()
      const html=String(body.html||'').trim()
      if(!to.length||!subject||(!text&&!html))return json({error:'To, subject and message are required'},400)

      const payload:any={
        from:`Ask Deal <${fromAddress}>`,
        to,
        subject,
        reply_to:fromAddress,
      }
      if(cc.length)payload.cc=cc
      if(bcc.length)payload.bcc=bcc
      if(text)payload.text=text
      if(html)payload.html=html
      if(body.in_reply_to)payload.headers={'In-Reply-To':String(body.in_reply_to),'References':String(body.in_reply_to)}

      const sent=await resend('/emails',resendKey,{method:'POST',body:JSON.stringify(payload)})
      return json({success:true,sent})
    }

    return json({error:'Unknown action'},400)
  }catch(e){return json({error:e?.message||'Unexpected error'},500)}
})

function parseAddresses(value:any){
  const raw=Array.isArray(value)?value.join(','):String(value||'')
  return raw.split(',').map((x:string)=>x.trim()).filter((x:string)=>x&&x.includes('@')).slice(0,50)
}
async function resend(path:string,key:string,init:RequestInit={}){
  const res=await fetch('https://api.resend.com'+path,{...init,headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(init.headers||{})}})
  const data=await res.json().catch(()=>({}))
  if(!res.ok)throw new Error(data?.message||data?.error||`Resend request failed (${res.status})`)
  return data
}
function json(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers:{...corsHeaders,'Content-Type':'application/json'}})}
