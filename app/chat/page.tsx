import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SiteHeader } from '@/components/site-header'
import { ChatShell } from '@/components/chat/chat-shell'

export const metadata = {
  title: 'AI Companion — AeroPilot',
}

export default async function ChatPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Reuse the most recent conversation or create one
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let conversationId = existing?.id
  if (!conversationId) {
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    if (error || !created) redirect('/dashboard')
    conversationId = created.id
  }

  return (
    <>
      <SiteHeader />
      <main>
        <h1 className="sr-only">AI Travel Companion</h1>
        <ChatShell initialConversationId={conversationId} />
      </main>
    </>
  )
}
