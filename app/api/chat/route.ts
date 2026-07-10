import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  tool,
  type UIMessage,
} from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getAirport } from '@/lib/flights/airports'
import {
  flexibleDatePrices,
  formatDuration,
  searchFlights,
  seasonalTrend,
} from '@/lib/flights/engine'

export const maxDuration = 60

const cabinSchema = z.enum(['economy', 'premium', 'business', 'first'])

export async function POST(req: Request) {
  const {
    messages,
    conversationId,
  }: { messages: UIMessage[]; conversationId?: string } = await req.json()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return new Response('Unauthorized', { status: 401 })

  // ----- personalization context -----
  const [{ data: profile }, { data: history }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('search_history')
      .select('origin, destination, depart_date, cabin_class')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // ----- persist the incoming user message -----
  const lastMessage = messages[messages.length - 1]
  if (conversationId && lastMessage?.role === 'user') {
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content: lastMessage.parts,
    })
    // set a title from the first user message
    const firstText = lastMessage.parts.find((p) => p.type === 'text')
    if (messages.filter((m) => m.role === 'user').length === 1 && firstText) {
      await supabase
        .from('conversations')
        .update({
          title: (firstText as { text: string }).text.slice(0, 60),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
        .eq('user_id', user.id)
    }
  }

  const profileContext = profile
    ? `User profile: home airport ${profile.home_airport ?? 'unknown'}, prefers ${profile.cabin_class ?? 'economy'} cabin, ${profile.prefers_direct ? 'prefers direct flights' : 'open to connections'}, seat preference ${profile.seat_preference ?? 'window'}, budget level ${profile.budget_level ?? 'moderate'}${profile.preferred_airlines?.length ? `, preferred airlines: ${profile.preferred_airlines.join(', ')}` : ''}.`
    : 'No profile information available.'

  const historyContext = history?.length
    ? `Recent searches: ${history.map((h) => `${h.origin}->${h.destination}${h.depart_date ? ` on ${h.depart_date}` : ''}`).join('; ')}.`
    : 'No recent searches.'

  const today = new Date().toISOString().slice(0, 10)

  const result = streamText({
    model: google('gemini-2.0-flash'),
    instructions: `You are AeroPilot, an expert AI air travel companion. Today is ${today}.
${profileContext}
${historyContext}

Rules:
- ALWAYS use the provided tools for any flight data (prices, schedules, comparisons, trends). Never invent flight numbers or prices.
- Personalize recommendations using the user's profile and recent searches (e.g. default to their home airport and preferred cabin when unspecified).
- Airports are identified by IATA codes from a fixed set of ~60 major world airports. If a city is ambiguous or unsupported, say so and suggest the nearest supported airport.
- After a tool returns, give a concise recommendation (2-4 sentences). The UI renders tool results as rich cards, so don't repeat raw listings in text.
- Use ISO dates (YYYY-MM-DD). If the user gives a relative date, resolve it from today's date.
- When the user asks to save a trip, use the saveTrip tool.`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(6),
    tools: {
      searchFlights: tool({
        description:
          'Search ranked flight offers between two airports on a date. Returns direct and 1-stop options with prices.',
        inputSchema: z.object({
          origin: z.string().describe('Origin IATA code, e.g. JFK'),
          destination: z.string().describe('Destination IATA code, e.g. LHR'),
          date: z.string().describe('Departure date YYYY-MM-DD'),
          passengers: z.number().int().min(1).max(9).default(1),
          cabin: cabinSchema.default('economy'),
        }),
        execute: async ({ origin, destination, date, passengers, cabin }) => {
          const offers = searchFlights({ origin, destination, date, cabin })
          if (offers.length === 0)
            return { error: `No flights found for ${origin} to ${destination}. Check that both are supported IATA codes.` }
          await supabase.from('search_history').insert({
            user_id: user.id,
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            depart_date: date,
            passengers,
            cabin_class: cabin,
          })
          return { offers: offers.slice(0, 5), passengers }
        },
      }),

      planMultiCity: tool({
        description:
          'Plan a sequential multi-city itinerary. Each segment has origin, destination and date. Returns best offer per leg and grand total.',
        inputSchema: z.object({
          segments: z
            .array(
              z.object({
                origin: z.string(),
                destination: z.string(),
                date: z.string(),
              }),
            )
            .min(2)
            .max(6),
          cabin: cabinSchema.default('economy'),
        }),
        execute: async ({ segments, cabin }) => {
          const legs = segments.map((s) => {
            const offers = searchFlights({ ...s, cabin })
            return {
              origin: s.origin.toUpperCase(),
              destination: s.destination.toUpperCase(),
              date: s.date,
              best: offers[0] ?? null,
              alternatives: offers.slice(1, 3),
            }
          })
          const missing = legs.filter((l) => !l.best)
          const total = legs.reduce((sum, l) => sum + (l.best?.price ?? 0), 0)
          return {
            legs,
            totalPrice: total,
            currency: 'USD',
            ...(missing.length
              ? { warning: `No offers found for ${missing.map((l) => `${l.origin}->${l.destination}`).join(', ')}` }
              : {}),
          }
        },
      }),

      compareDirectVsConnecting: tool({
        description:
          'Compare direct vs connecting flights on a route: price difference vs time difference tradeoff analysis.',
        inputSchema: z.object({
          origin: z.string(),
          destination: z.string(),
          date: z.string(),
          cabin: cabinSchema.default('economy'),
        }),
        execute: async ({ origin, destination, date, cabin }) => {
          const offers = searchFlights({ origin, destination, date, cabin })
          const direct = offers.filter((o) => o.stops === 0)
          const connecting = offers.filter((o) => o.stops > 0)
          if (!direct.length && !connecting.length)
            return { error: 'No flights found for this route.' }
          const bestDirect = direct[0] ?? null
          const bestConnecting = connecting[0] ?? null
          const savings =
            bestDirect && bestConnecting
              ? bestDirect.price - bestConnecting.price
              : 0
          const extraTime =
            bestDirect && bestConnecting
              ? bestConnecting.totalDurationMin - bestDirect.totalDurationMin
              : 0
          return {
            bestDirect,
            bestConnecting,
            analysis:
              bestDirect && bestConnecting
                ? {
                  savingsUSD: savings,
                  extraTimeMin: extraTime,
                  extraTimeFormatted: formatDuration(Math.max(0, extraTime)),
                  savingsPerHour:
                    extraTime > 0 ? Math.round(savings / (extraTime / 60)) : 0,
                }
                : null,
          }
        },
      }),

      flexibleDates: tool({
        description:
          'Get the cheapest fare for each day within +/- N days of a center date, identifying the cheapest day.',
        inputSchema: z.object({
          origin: z.string(),
          destination: z.string(),
          centerDate: z.string().describe('Center date YYYY-MM-DD'),
          windowDays: z.number().int().min(1).max(7).default(3),
        }),
        execute: async ({ origin, destination, centerDate, windowDays }) => {
          const prices = flexibleDatePrices(origin, destination, centerDate, windowDays)
          if (!prices.length) return { error: 'No flights found for this route.' }
          return {
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            centerDate,
            prices,
            cheapest: prices.find((p) => p.cheapest),
          }
        },
      }),

      seasonalTrends: tool({
        description:
          '12-month price and demand curve for a route. Use to advise on the best time of year to fly.',
        inputSchema: z.object({
          origin: z.string(),
          destination: z.string(),
        }),
        execute: async ({ origin, destination }) => {
          const trend = seasonalTrend(origin, destination)
          if (!trend.length) return { error: 'Route not supported.' }
          const cheapest = trend.reduce((a, b) => (b.avgPrice < a.avgPrice ? b : a))
          return {
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            trend,
            cheapestMonth: cheapest.month,
          }
        },
      }),

      saveTrip: tool({
        description:
          "Save a trip to the user's account. Use after the user confirms they want to save an itinerary.",
        inputSchema: z.object({
          title: z.string().describe('Short trip title, e.g. "NYC to London, Mar 15"'),
          tripType: z.enum(['one-way', 'round-trip', 'multi-city']).default('one-way'),
          segments: z.array(
            z.object({
              origin: z.string(),
              destination: z.string(),
              date: z.string(),
              airline: z.string().optional(),
              flightNumber: z.string().optional(),
              price: z.number().optional(),
              stops: z.number().optional(),
              durationMin: z.number().optional(),
            }),
          ),
          totalPrice: z.number(),
          notes: z.string().optional(),
        }),
        execute: async ({ title, tripType, segments, totalPrice, notes }) => {
          const { data, error } = await supabase
            .from('saved_trips')
            .insert({
              user_id: user.id,
              title,
              trip_type: tripType,
              segments,
              total_price: totalPrice,
              currency: 'USD',
              notes: notes ?? null,
            })
            .select('id, title')
            .single()
          if (error) return { error: `Could not save trip: ${error.message}` }
          return { saved: true, tripId: data.id, title: data.title }
        },
      }),
    },
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      onError: (error) => {
        const message = error instanceof Error ? error.message : String(error)
        if (message.includes('credit card') || message.includes('unauthenticated')) {
          return 'The AI Gateway is not set up yet for this project. Free credits need to be unlocked on the Vercel team before the copilot can respond.'
        }
        return 'The AI model could not be reached. Please try again.'
      },
      onEnd: async ({ messages: finalMessages }) => {
        if (!conversationId) return
        const newMessages = finalMessages.slice(messages.length)
        const rows = newMessages
          .filter((m) => m.role === 'assistant' && m.parts.length > 0)
          .map((m) => ({
            conversation_id: conversationId,
            user_id: user.id,
            role: m.role,
            content: m.parts,
          }))
        if (rows.length) {
          await supabase.from('chat_messages').insert(rows)
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)
            .eq('user_id', user.id)
        }
      },
    }),
  })
}
