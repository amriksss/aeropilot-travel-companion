export type CabinClass = 'economy' | 'premium' | 'business' | 'first'

export interface FlightLeg {
  airline: string
  airlineCode: string
  flightNumber: string
  origin: string
  destination: string
  departTime: string // ISO
  arriveTime: string // ISO
  durationMin: number
}

export interface FlightOffer {
  id: string
  origin: string
  destination: string
  date: string // YYYY-MM-DD
  legs: FlightLeg[]
  stops: number
  via?: string
  totalDurationMin: number
  price: number
  currency: string
  cabin: CabinClass
  seatsLeft: number
}

export interface SearchParams {
  origin: string
  destination: string
  date: string
  passengers?: number
  cabin?: CabinClass
}

export interface AircraftPosition {
  icao24: string
  lon: number
  lat: number
  heading: number
  velocity: number
  callsign: string
}

export interface RouteArc {
  from: { lat: number; lon: number; iata: string }
  to: { lat: number; lon: number; iata: string }
}
