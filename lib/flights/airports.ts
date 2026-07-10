export interface Airport {
  iata: string
  name: string
  city: string
  country: string
  lat: number
  lon: number
  tz: string
  hub: boolean
}

export const AIRPORTS: Airport[] = [
  { iata: 'JFK', name: 'John F. Kennedy Intl', city: 'New York', country: 'US', lat: 40.6413, lon: -73.7781, tz: 'America/New_York', hub: true },
  { iata: 'EWR', name: 'Newark Liberty Intl', city: 'Newark', country: 'US', lat: 40.6895, lon: -74.1745, tz: 'America/New_York', hub: true },
  { iata: 'LAX', name: 'Los Angeles Intl', city: 'Los Angeles', country: 'US', lat: 33.9416, lon: -118.4085, tz: 'America/Los_Angeles', hub: true },
  { iata: 'SFO', name: 'San Francisco Intl', city: 'San Francisco', country: 'US', lat: 37.6213, lon: -122.379, tz: 'America/Los_Angeles', hub: true },
  { iata: 'ORD', name: "O'Hare Intl", city: 'Chicago', country: 'US', lat: 41.9742, lon: -87.9073, tz: 'America/Chicago', hub: true },
  { iata: 'ATL', name: 'Hartsfield-Jackson Atlanta Intl', city: 'Atlanta', country: 'US', lat: 33.6407, lon: -84.4277, tz: 'America/New_York', hub: true },
  { iata: 'DFW', name: 'Dallas/Fort Worth Intl', city: 'Dallas', country: 'US', lat: 32.8998, lon: -97.0403, tz: 'America/Chicago', hub: true },
  { iata: 'DEN', name: 'Denver Intl', city: 'Denver', country: 'US', lat: 39.8561, lon: -104.6737, tz: 'America/Denver', hub: true },
  { iata: 'SEA', name: 'Seattle-Tacoma Intl', city: 'Seattle', country: 'US', lat: 47.4502, lon: -122.3088, tz: 'America/Los_Angeles', hub: true },
  { iata: 'MIA', name: 'Miami Intl', city: 'Miami', country: 'US', lat: 25.7959, lon: -80.287, tz: 'America/New_York', hub: true },
  { iata: 'BOS', name: 'Logan Intl', city: 'Boston', country: 'US', lat: 42.3656, lon: -71.0096, tz: 'America/New_York', hub: false },
  { iata: 'IAD', name: 'Washington Dulles Intl', city: 'Washington', country: 'US', lat: 38.9531, lon: -77.4565, tz: 'America/New_York', hub: true },
  { iata: 'PHX', name: 'Phoenix Sky Harbor Intl', city: 'Phoenix', country: 'US', lat: 33.4373, lon: -112.0078, tz: 'America/Phoenix', hub: false },
  { iata: 'LAS', name: 'Harry Reid Intl', city: 'Las Vegas', country: 'US', lat: 36.086, lon: -115.1537, tz: 'America/Los_Angeles', hub: false },
  { iata: 'MCO', name: 'Orlando Intl', city: 'Orlando', country: 'US', lat: 28.4312, lon: -81.3081, tz: 'America/New_York', hub: false },
  { iata: 'IAH', name: 'George Bush Intercontinental', city: 'Houston', country: 'US', lat: 29.9902, lon: -95.3368, tz: 'America/Chicago', hub: true },
  { iata: 'YYZ', name: 'Toronto Pearson Intl', city: 'Toronto', country: 'CA', lat: 43.6777, lon: -79.6248, tz: 'America/Toronto', hub: true },
  { iata: 'YVR', name: 'Vancouver Intl', city: 'Vancouver', country: 'CA', lat: 49.1967, lon: -123.1815, tz: 'America/Vancouver', hub: true },
  { iata: 'MEX', name: 'Benito Juárez Intl', city: 'Mexico City', country: 'MX', lat: 19.4363, lon: -99.0721, tz: 'America/Mexico_City', hub: true },
  { iata: 'GRU', name: 'São Paulo/Guarulhos Intl', city: 'São Paulo', country: 'BR', lat: -23.4356, lon: -46.4731, tz: 'America/Sao_Paulo', hub: true },
  { iata: 'EZE', name: 'Ministro Pistarini Intl', city: 'Buenos Aires', country: 'AR', lat: -34.8222, lon: -58.5358, tz: 'America/Argentina/Buenos_Aires', hub: true },
  { iata: 'BOG', name: 'El Dorado Intl', city: 'Bogotá', country: 'CO', lat: 4.7016, lon: -74.1469, tz: 'America/Bogota', hub: true },
  { iata: 'SCL', name: 'Arturo Merino Benítez Intl', city: 'Santiago', country: 'CL', lat: -33.393, lon: -70.7858, tz: 'America/Santiago', hub: true },
  { iata: 'LIM', name: 'Jorge Chávez Intl', city: 'Lima', country: 'PE', lat: -12.0219, lon: -77.1143, tz: 'America/Lima', hub: true },
  { iata: 'LHR', name: 'Heathrow', city: 'London', country: 'GB', lat: 51.47, lon: -0.4543, tz: 'Europe/London', hub: true },
  { iata: 'LGW', name: 'Gatwick', city: 'London', country: 'GB', lat: 51.1537, lon: -0.1821, tz: 'Europe/London', hub: false },
  { iata: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'FR', lat: 49.0097, lon: 2.5479, tz: 'Europe/Paris', hub: true },
  { iata: 'AMS', name: 'Amsterdam Schiphol', city: 'Amsterdam', country: 'NL', lat: 52.3105, lon: 4.7683, tz: 'Europe/Amsterdam', hub: true },
  { iata: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'DE', lat: 50.0379, lon: 8.5622, tz: 'Europe/Berlin', hub: true },
  { iata: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'DE', lat: 48.3538, lon: 11.7861, tz: 'Europe/Berlin', hub: true },
  { iata: 'MAD', name: 'Adolfo Suárez Madrid-Barajas', city: 'Madrid', country: 'ES', lat: 40.4983, lon: -3.5676, tz: 'Europe/Madrid', hub: true },
  { iata: 'BCN', name: 'Barcelona-El Prat', city: 'Barcelona', country: 'ES', lat: 41.2974, lon: 2.0833, tz: 'Europe/Madrid', hub: false },
  { iata: 'FCO', name: 'Leonardo da Vinci-Fiumicino', city: 'Rome', country: 'IT', lat: 41.8003, lon: 12.2389, tz: 'Europe/Rome', hub: true },
  { iata: 'MXP', name: 'Milan Malpensa', city: 'Milan', country: 'IT', lat: 45.6306, lon: 8.7281, tz: 'Europe/Rome', hub: false },
  { iata: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'CH', lat: 47.4647, lon: 8.5492, tz: 'Europe/Zurich', hub: true },
  { iata: 'VIE', name: 'Vienna Intl', city: 'Vienna', country: 'AT', lat: 48.1103, lon: 16.5697, tz: 'Europe/Vienna', hub: true },
  { iata: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'DK', lat: 55.618, lon: 12.656, tz: 'Europe/Copenhagen', hub: true },
  { iata: 'ARN', name: 'Stockholm Arlanda', city: 'Stockholm', country: 'SE', lat: 59.6498, lon: 17.9238, tz: 'Europe/Stockholm', hub: false },
  { iata: 'OSL', name: 'Oslo Gardermoen', city: 'Oslo', country: 'NO', lat: 60.1976, lon: 11.1004, tz: 'Europe/Oslo', hub: false },
  { iata: 'HEL', name: 'Helsinki-Vantaa', city: 'Helsinki', country: 'FI', lat: 60.3183, lon: 24.9497, tz: 'Europe/Helsinki', hub: true },
  { iata: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'IE', lat: 53.4264, lon: -6.2499, tz: 'Europe/Dublin', hub: false },
  { iata: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'PT', lat: 38.7756, lon: -9.1354, tz: 'Europe/Lisbon', hub: true },
  { iata: 'ATH', name: 'Athens Intl', city: 'Athens', country: 'GR', lat: 37.9364, lon: 23.9445, tz: 'Europe/Athens', hub: false },
  { iata: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'TR', lat: 41.2753, lon: 28.7519, tz: 'Europe/Istanbul', hub: true },
  { iata: 'DXB', name: 'Dubai Intl', city: 'Dubai', country: 'AE', lat: 25.2532, lon: 55.3657, tz: 'Asia/Dubai', hub: true },
  { iata: 'DOH', name: 'Hamad Intl', city: 'Doha', country: 'QA', lat: 25.2609, lon: 51.6138, tz: 'Asia/Qatar', hub: true },
  { iata: 'AUH', name: 'Zayed Intl', city: 'Abu Dhabi', country: 'AE', lat: 24.4331, lon: 54.6511, tz: 'Asia/Dubai', hub: true },
  { iata: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'IL', lat: 32.0055, lon: 34.8854, tz: 'Asia/Jerusalem', hub: false },
  { iata: 'CAI', name: 'Cairo Intl', city: 'Cairo', country: 'EG', lat: 30.1219, lon: 31.4056, tz: 'Africa/Cairo', hub: true },
  { iata: 'JNB', name: 'O.R. Tambo Intl', city: 'Johannesburg', country: 'ZA', lat: -26.1367, lon: 28.2411, tz: 'Africa/Johannesburg', hub: true },
  { iata: 'CPT', name: 'Cape Town Intl', city: 'Cape Town', country: 'ZA', lat: -33.9715, lon: 18.6021, tz: 'Africa/Johannesburg', hub: false },
  { iata: 'LOS', name: 'Murtala Muhammed Intl', city: 'Lagos', country: 'NG', lat: 6.5774, lon: 3.3212, tz: 'Africa/Lagos', hub: true },
  { iata: 'NBO', name: 'Jomo Kenyatta Intl', city: 'Nairobi', country: 'KE', lat: -1.3192, lon: 36.9278, tz: 'Africa/Nairobi', hub: true },
  { iata: 'DEL', name: 'Indira Gandhi Intl', city: 'New Delhi', country: 'IN', lat: 28.5562, lon: 77.1, tz: 'Asia/Kolkata', hub: true },
  { iata: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'IN', lat: 19.0896, lon: 72.8656, tz: 'Asia/Kolkata', hub: true },
  { iata: 'BLR', name: 'Kempegowda Intl', city: 'Bengaluru', country: 'IN', lat: 13.1986, lon: 77.7066, tz: 'Asia/Kolkata', hub: false },
  { iata: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'SG', lat: 1.3644, lon: 103.9915, tz: 'Asia/Singapore', hub: true },
  { iata: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'TH', lat: 13.69, lon: 100.7501, tz: 'Asia/Bangkok', hub: true },
  { iata: 'KUL', name: 'Kuala Lumpur Intl', city: 'Kuala Lumpur', country: 'MY', lat: 2.7456, lon: 101.7099, tz: 'Asia/Kuala_Lumpur', hub: true },
  { iata: 'CGK', name: 'Soekarno-Hatta Intl', city: 'Jakarta', country: 'ID', lat: -6.1256, lon: 106.6559, tz: 'Asia/Jakarta', hub: true },
  { iata: 'MNL', name: 'Ninoy Aquino Intl', city: 'Manila', country: 'PH', lat: 14.5086, lon: 121.0194, tz: 'Asia/Manila', hub: false },
  { iata: 'HKG', name: 'Hong Kong Intl', city: 'Hong Kong', country: 'HK', lat: 22.308, lon: 113.9185, tz: 'Asia/Hong_Kong', hub: true },
  { iata: 'PVG', name: 'Shanghai Pudong Intl', city: 'Shanghai', country: 'CN', lat: 31.1443, lon: 121.8083, tz: 'Asia/Shanghai', hub: true },
  { iata: 'PEK', name: 'Beijing Capital Intl', city: 'Beijing', country: 'CN', lat: 40.0799, lon: 116.6031, tz: 'Asia/Shanghai', hub: true },
  { iata: 'ICN', name: 'Incheon Intl', city: 'Seoul', country: 'KR', lat: 37.4602, lon: 126.4407, tz: 'Asia/Seoul', hub: true },
  { iata: 'NRT', name: 'Narita Intl', city: 'Tokyo', country: 'JP', lat: 35.772, lon: 140.3929, tz: 'Asia/Tokyo', hub: true },
  { iata: 'HND', name: 'Tokyo Haneda', city: 'Tokyo', country: 'JP', lat: 35.5494, lon: 139.7798, tz: 'Asia/Tokyo', hub: true },
  { iata: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'AU', lat: -33.9399, lon: 151.1753, tz: 'Australia/Sydney', hub: true },
  { iata: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'AU', lat: -37.669, lon: 144.841, tz: 'Australia/Melbourne', hub: false },
  { iata: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'NZ', lat: -37.0082, lon: 174.785, tz: 'Pacific/Auckland', hub: true },
  { iata: 'HNL', name: 'Daniel K. Inouye Intl', city: 'Honolulu', country: 'US', lat: 21.3187, lon: -157.9225, tz: 'Pacific/Honolulu', hub: false },
]

const byIata = new Map(AIRPORTS.map((a) => [a.iata, a]))

export function getAirport(iata: string): Airport | undefined {
  return byIata.get(iata.toUpperCase())
}

export function searchAirports(query: string, limit = 8): Airport[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const starts: Airport[] = []
  const contains: Airport[] = []
  for (const a of AIRPORTS) {
    const iata = a.iata.toLowerCase()
    const city = a.city.toLowerCase()
    const name = a.name.toLowerCase()
    if (iata === q || iata.startsWith(q) || city.startsWith(q)) starts.push(a)
    else if (city.includes(q) || name.includes(q)) contains.push(a)
  }
  return [...starts, ...contains].slice(0, limit)
}
