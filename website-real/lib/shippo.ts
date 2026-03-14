// Lightweight Shippo helper using direct HTTP calls (avoids the shippo npm package differences)
// Uses global fetch on the server (Node 18+ / Next.js runtime).

const SHIPPO_TOKEN = process.env.SHIPPO_API_TOKEN || process.env.SHIPPO_TOKEN || ''
const SHIPPO_API = 'https://api.goshippo.com'

export interface ShippoAddress {
  name: string
  street1: string
  street2?: string | null
  city: string
  state: string
  zip: string
  country: string
  phone?: string | null
  email?: string
}

export interface ShippoParcel {
  length: string
  width: string
  height: string
  weight: string
  distance_unit: 'in' | 'cm'
  mass_unit: 'lb' | 'kg'
}

export interface ShippoShipmentResult {
  object_id: string
  rates: any[]
}

export interface ShippoLabelResult {
  tracking_number: string
  tracking_url_provider: string
  label_url: string
  carrier: string
  service_level: string
}

function shippoFetch(path: string, opts: RequestInit = {}) {
  const url = `${SHIPPO_API}${path}`
  const headers = Object.assign({
    Authorization: `ShippoToken ${SHIPPO_TOKEN}`,
    'Content-Type': 'application/json',
  }, opts.headers || {})

  return fetch(url, Object.assign({}, opts, { headers }))
    .then(async (res) => {
      const text = await res.text()
      let body: any = text
      try { body = text ? JSON.parse(text) : {} } catch (e) { /* non-json response */ }
      if (!res.ok) {
        const err = new Error(`Shippo API error: ${res.status} ${res.statusText} - ${JSON.stringify(body)}`)
        ;(err as any).status = res.status
        ;(err as any).body = body
        throw err
      }
      return body
    })
}

const FROM_ADDRESS = {
  name: '',
  company: ' LLC',
  street1: '37-30 Review Avenue',
  city: 'Long Island City',
  state: 'NY',
  zip: '11101',
  country: 'US',
  phone: '+',
  email: 'info@ny.com',
}

function ensureToken() {
  if (!SHIPPO_TOKEN) throw new Error('Missing Shippo token (set SHIPPO_API_TOKEN or SHIPPO_TOKEN)')
}

export async function createShippoShipment(
  toAddress: ShippoAddress,
  parcel: ShippoParcel = {
    length: '10',
    width: '8',
    height: '4',
    weight: '1',
    distance_unit: 'in',
    mass_unit: 'lb',
  }
): Promise<ShippoShipmentResult> {
  ensureToken()

  const payload = {
    address_from: FROM_ADDRESS,
    address_to: toAddress,
    parcels: [parcel],
    async: false,
  }

  const res = await shippoFetch('/shipments/', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  // res should contain object_id and rates
  return {
    object_id: res.object_id,
    rates: res.rates || [],
  }
}

function getCheapestRate(rates: any[]) {
  if (!rates || rates.length === 0) throw new Error('No rates available')
  // rates typically have an 'amount' string
  const sorted = rates.slice().sort((a, b) => {
    const aAmt = parseFloat(a.amount || a.price || a.rate || 0)
    const bAmt = parseFloat(b.amount || b.price || b.rate || 0)
    return aAmt - bAmt
  })
  return sorted[0]
}

/**
 * Purchase a shipping label using a Shippo rate id
 */
export async function purchaseShippoLabel(
  shipmentId: string,
  rateId?: string
): Promise<ShippoLabelResult> {
  ensureToken()

  // If rateId not provided, fetch shipment to get rates
  if (!rateId) {
    const shipment = await shippoFetch(`/shipments/${shipmentId}/`, { method: 'GET' })
    const cheapest = getCheapestRate(shipment.rates || [])
    rateId = cheapest.object_id || cheapest.rate_id || cheapest.object_id
  }

  const payload = {
    rate: rateId,
    async: false,
    label_file_type: 'PDF',
  }

  const tx = await shippoFetch('/transactions/', { method: 'POST', body: JSON.stringify(payload) })

  if (!tx || tx.status !== 'SUCCESS') {
    const msg = tx && tx.messages ? JSON.stringify(tx.messages) : 'unknown'
    throw new Error(`Shippo transaction failed: ${msg}`)
  }

  return {
    tracking_number: tx.tracking_number || tx.tracking_number || '',
    tracking_url_provider: tx.tracking_url_provider || '',
    label_url: tx.label_url || (tx.label_urls && tx.label_urls.pdf) || '',
    carrier: tx.rate?.carrier_account || tx.rate?.carrier || 'unknown',
    service_level: tx.rate?.servicelevel?.name || tx.rate?.servicelevel || 'unknown',
  }
}

/**
 * Create shipment and purchase label in one step
 */
export async function createAndPurchaseLabel(
  toAddress: ShippoAddress,
  parcel?: ShippoParcel
): Promise<ShippoLabelResult> {
  const shipment = await createShippoShipment(toAddress, parcel)
  const cheapest = getCheapestRate(shipment.rates)
  const label = await purchaseShippoLabel(shipment.object_id, cheapest.object_id || cheapest.rate_id)
  return label
}
