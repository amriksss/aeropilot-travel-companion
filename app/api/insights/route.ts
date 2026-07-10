import { NextResponse } from 'next/server'
import { z } from 'zod'
import { offerInsight } from '@/lib/flights/engine'
import type { FlightOffer } from '@/lib/flights/types'

const bodySchema = z.object({
  offers: z
    .array(
      z.object({
        id: z.string(),
        origin: z.string(),
        destination: z.string(),
        date: z.string(),
        price: z.number(),
        stops: z.number(),
        totalDurationMin: z.number(),
        seatsLeft: z.number(),
        cabin: z.enum(['economy', 'premium', 'business', 'first']),
      }),
    )
    .max(20),
})

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  const insights: Record<string, string> = {}
  for (const offer of parsed.data.offers) {
    insights[offer.id] = offerInsight(offer as unknown as FlightOffer)
  }
  return NextResponse.json({ insights })
}
