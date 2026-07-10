import { NextResponse } from 'next/server'
import { z } from 'zod'
import { searchFlights, offerInsight } from '@/lib/flights/engine'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  origin: z.string().length(3),
  destination: z.string().length(3),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passengers: z.number().int().min(1).max(9).optional(),
  cabin: z.enum(['economy', 'premium', 'business', 'first']).optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search parameters' }, { status: 400 })
  }
  const params = parsed.data
  const offers = searchFlights(params)

  // Record search history for signed-in users (RLS-scoped)
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('search_history').insert({
        user_id: user.id,
        origin: params.origin.toUpperCase(),
        destination: params.destination.toUpperCase(),
        depart_date: params.date,
        passengers: params.passengers ?? 1,
        cabin_class: params.cabin ?? 'economy',
      })
    }
  } catch {
    // history is best-effort
  }

  return NextResponse.json({
    offers: offers.map((o) => ({ ...o, insight: offerInsight(o) })),
  })
}
