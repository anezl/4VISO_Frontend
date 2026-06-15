export const TEMP_BLOCKS = [
  { key: 'frozen',  label: 'Deep Freeze', sub: '-20°C to -10°C', min: -20, max: -10, icon: '❄️', color: '#2585A3' },
  { key: 'cold',    label: 'Cold Chain',  sub: '2°C to 8°C',     min: 2,   max: 8,   icon: '🧊', color: '#5488CB' },
  { key: 'ambient', label: 'Ambient',     sub: '15°C to 25°C',   min: 15,  max: 25,  icon: '🌡️', color: '#D97448' },
]

// risk assessment for transport+tempBlock combination
export const TRANSPORT_TEMP_RISK = {
  frozen: {
    road:      { ok: true,  risk: 'ok',       reason: 'Reefer truck with GDP cert is standard for deep freeze.' },
    air:       { ok: true,  risk: 'ok',       reason: 'Air cold-room cargo is optimal for deep-freeze transit.' },
    sea:       { ok: false, risk: 'critical', reason: 'Sea transit time breaks deep-freeze integrity.' },
    rail:      { ok: false, risk: 'warning',  reason: 'Rail has limited deep-freeze infrastructure.' },
    warehouse: { ok: true,  risk: 'ok',       reason: 'Deep-freeze warehouse is appropriate.' },
  },
  cold: {
    road:      { ok: true,  risk: 'ok',      reason: 'GDP-certified reefer truck is standard cold chain.' },
    air:       { ok: true,  risk: 'ok',      reason: 'Air cargo with cold storage is suitable for cold chain.' },
    sea:       { ok: false, risk: 'warning', reason: 'Sea transit time risks cold chain compliance.' },
    rail:      { ok: false, risk: 'warning', reason: 'Rail cold chain control is limited.' },
    warehouse: { ok: true,  risk: 'ok',      reason: 'Cold chain warehouse is appropriate.' },
  },
  ambient: {
    road:      { ok: true, risk: 'ok', reason: 'Road suitable for ambient cargo.' },
    air:       { ok: true, risk: 'ok', reason: 'Air suitable for ambient cargo.' },
    sea:       { ok: true, risk: 'ok', reason: 'Sea suitable for ambient cargo.' },
    rail:      { ok: true, risk: 'ok', reason: 'Rail suitable for ambient cargo.' },
    warehouse: { ok: true, risk: 'ok', reason: 'Warehouse suitable for ambient cargo.' },
  },
}
