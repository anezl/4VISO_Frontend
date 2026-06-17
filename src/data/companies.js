// Certified carrier, warehouse and airport database for 4VISO
// Used for: search suggestions, company autocomplete, and carrier certification checks

export const TRANSPORT_COMPANIES = [
  { id: 'tc-dhl',      name: 'DHL Supply Chain',         type: 'freight_forwarder', countries: ['DE','NL','BE','FR','ES','IT','PL','UK'], certificates: ['GDP','ISO 9001','ISO 13485'],   tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-kn',       name: 'Kuehne+Nagel',              type: 'freight_forwarder', countries: ['CH','DE','NL','UK','ES','DK'],           certificates: ['GDP','ISO 9001','ISO 13485'],   tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-dbs',      name: 'DB Schenker',               type: 'freight_forwarder', countries: ['DE','PL','SE','DK','FI','AT'],           certificates: ['GDP','ISO 9001','ISO 28000'],          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-dsv',      name: 'DSV Panalpina',             type: 'freight_forwarder', countries: ['DK','SE','FI','NL','UK','DE'],           certificates: ['GDP','ISO 9001'],               tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-geodis',   name: 'Geodis',                    type: 'freight_forwarder', countries: ['FR','BE','ES','IT','DE','NL'],           certificates: ['GDP','ISO 13485','ISO 9001'],          tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-ceva',     name: 'Ceva Logistics',            type: 'freight_forwarder', countries: ['NL','FR','BE','ES','IT','DE','UK'],      certificates: ['GDP','ISO 9001'],               tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-xpo',      name: 'XPO Logistics',             type: 'freight_forwarder', countries: ['FR','ES','UK','NL','DE','IT','PL'],      certificates: ['GDP','ISO 9001','ISO 28000'],          tempCapabilities: ['ambient'],                 fragileCapable: false },
  { id: 'tc-movianto', name: 'Movianto',                  type: 'pharma_specialist', countries: ['NL','BE','DE','FR','IT','ES','DK','UK'], certificates: ['GDP','ISO 13485','ISO 9001'],          tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-marken',   name: 'Marken',                    type: 'pharma_specialist', countries: ['UK','BE','DE','ES','IT','NL','CH'],      certificates: ['GDP','ISO 13485'],              tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-wc',       name: 'World Courier',             type: 'pharma_specialist', countries: ['UK','DE','NL','BE','ES','IT','CH','FR'], certificates: ['GDP','ISO 13485'],              tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-klm',      name: 'KLM Cargo',                 type: 'air_carrier',       countries: ['NL'],                                   certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-lhc',      name: 'Lufthansa Cargo',           type: 'air_carrier',       countries: ['DE'],                                   certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-afc',      name: 'Air France Cargo',          type: 'air_carrier',       countries: ['FR'],                                   certificates: ['GDP'],                          tempCapabilities: ['ambient'],                 fragileCapable: false },
  { id: 'tc-ibc',      name: 'Iberia Cargo',              type: 'air_carrier',       countries: ['ES'],                                   certificates: ['GDP','ISO 28000'],              tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-swc',      name: 'Swiss WorldCargo',          type: 'air_carrier',       countries: ['CH'],                                   certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-sas',      name: 'SAS Cargo',                 type: 'air_carrier',       countries: ['DK','SE','NO'],                         certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-fai',      name: 'Finnair Cargo',             type: 'air_carrier',       countries: ['FI'],                                   certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-lot',      name: 'LOT Cargo',                 type: 'air_carrier',       countries: ['PL'],                                   certificates: [],                               tempCapabilities: ['ambient'],                 fragileCapable: false },
  { id: 'tc-tap',      name: 'TAP Cargo',                 type: 'air_carrier',       countries: ['PT'],                                   certificates: ['GDP'],                          tempCapabilities: ['ambient'],                 fragileCapable: false },
  { id: 'tc-iag',      name: 'IAG Cargo',                 type: 'air_carrier',       countries: ['UK','ES'],                              certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-bru',      name: 'Brussels Airlines Cargo',   type: 'air_carrier',       countries: ['BE'],                                   certificates: ['GDP'],                          tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-pharmam',  name: 'PharmaM',                   type: 'pharma_company',    countries: ['ES'],                                   certificates: ['GDP','ISO 9001'],                      tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-pharmabe', name: 'PharmaBe',                  type: 'pharma_company',    countries: ['BE'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-bionorth', name: 'BioNorth',                  type: 'pharma_company',    countries: ['NL'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-pharmait', name: 'PharmaIT',                  type: 'pharma_company',    countries: ['IT'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-biolog',   name: 'BioLogix DE',               type: 'pharma_company',    countries: ['DE'],                                   certificates: ['GDP'],                                 tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-medpol',   name: 'MedPol',                    type: 'pharma_company',    countries: ['PL'],                                   certificates: [],                                      tempCapabilities: ['ambient'],                 fragileCapable: false },
  { id: 'tc-pharmuk',  name: 'PharmUK Ltd',               type: 'pharma_company',    countries: ['UK'],                                   certificates: ['ISO 13485','GDP'],              tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-biofr',    name: 'BioFrance',                 type: 'pharma_company',    countries: ['FR'],                                   certificates: ['GDP','ISO 9001'],               tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-swmed',    name: 'SwissMed',                  type: 'pharma_company',    countries: ['CH'],                                   certificates: ['GDP','ISO 9001'],                      tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-medport',  name: 'MedPort',                   type: 'pharma_company',    countries: ['PT'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-norph',    name: 'NordicPharma',              type: 'pharma_company',    countries: ['FI'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['cold','ambient'],          fragileCapable: true  },
  { id: 'tc-coldch',   name: 'ColdChain ES',              type: 'warehouse_operator',countries: ['ES'],                                   certificates: ['GDP','ISO 13485'],                     tempCapabilities: ['frozen','cold','ambient'], fragileCapable: true  },
  { id: 'tc-norddist', name: 'NordDist',                  type: 'warehouse_operator',countries: ['DK'],                                   certificates: ['GDP','ISO 9001'],                      tempCapabilities: ['cold','ambient'],          fragileCapable: false },
  { id: 'tc-medtrans', name: 'MedTrans ES',               type: 'road_carrier',      countries: ['ES'],                                   certificates: ['GDP','ISO 9001'],                      tempCapabilities: ['ambient'],                 fragileCapable: false },
]

export const WAREHOUSES = [
  { id:'wh-fra-01', name:'DHL Pharma Hub Frankfurt',  city:'Frankfurt',  country:'Germany',     company:'DHL Supply Chain',      type:'warehouse',    certificates:['GDP','ISO 9001','ISO 13485'], tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25},{label:'Deep-freeze',min:-20,max:-10}], tempCapabilities:['frozen','cold','ambient'], fragileCapable:true  },
  { id:'wh-fra-02', name:'Kuehne+Nagel Frankfurt',    city:'Frankfurt',  country:'Germany',     company:'Kuehne+Nagel',          type:'warehouse',    certificates:['GDP','ISO 9001'],      tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:true  },
  { id:'wh-ams-01', name:'Movianto Netherlands',      city:'Amsterdam',  country:'Netherlands', company:'Movianto',              type:'warehouse',    certificates:['GDP','ISO 13485','ISO 9001'], tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25},{label:'Deep-freeze',min:-20,max:-10}], tempCapabilities:['frozen','cold','ambient'], fragileCapable:true  },
  { id:'wh-ams-02', name:'DHL Amsterdam Pharma',      city:'Amsterdam',  country:'Netherlands', company:'DHL Supply Chain',      type:'warehouse',    certificates:['GDP','ISO 9001'],             tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:false },
  { id:'wh-bru-01', name:'Geodis Brussels Pharma',    city:'Brussels',   country:'Belgium',     company:'Geodis',                type:'warehouse',    certificates:['GDP','ISO 13485'],            tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:true  },
  { id:'wh-mch-01', name:'Movianto Mechelen',         city:'Mechelen',   country:'Belgium',     company:'Movianto',              type:'warehouse',    certificates:['GDP','ISO 13485','ISO 9001'], tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
  { id:'wh-mad-01', name:'DHL Madrid Pharma',         city:'Madrid',     country:'Spain',       company:'DHL Supply Chain',      type:'warehouse',    certificates:['GDP','ISO 9001'],             tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:false },
  { id:'wh-mad-02', name:'Kuehne+Nagel Madrid',       city:'Madrid',     country:'Spain',       company:'Kuehne+Nagel',          type:'warehouse',    certificates:['GDP','ISO 13485'],            tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
  { id:'wh-bcn-01', name:'XPO Barcelona',             city:'Barcelona',  country:'Spain',       company:'XPO Logistics',         type:'distribution', certificates:['GDP','ISO 9001','ISO 28000'], tempZones:[{label:'Ambient',min:15,max:25}],                                                                  tempCapabilities:['ambient'],                 fragileCapable:false },
  { id:'wh-cdg-01', name:'Geodis Paris Pharma',       city:'Paris',      country:'France',      company:'Geodis',                type:'warehouse',    certificates:['GDP','ISO 13485','ISO 9001'], tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:true  },
  { id:'wh-cdg-02', name:'XPO Paris Pharma',          city:'Paris',      country:'France',      company:'XPO Logistics',         type:'warehouse',    certificates:['GDP','ISO 9001'],             tempZones:[{label:'Ambient',min:15,max:25}],                                                                  tempCapabilities:['ambient'],                 fragileCapable:false },
  { id:'wh-mil-01', name:'Movianto Italy Milan',      city:'Milan',      country:'Italy',       company:'Movianto',              type:'warehouse',    certificates:['GDP','ISO 13485'],            tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
  { id:'wh-mil-02', name:'Ceva Logistics Milan',      city:'Milan',      country:'Italy',       company:'Ceva Logistics',        type:'warehouse',    certificates:['GDP','ISO 9001'],      tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:false },
  { id:'wh-zrh-01', name:'Kuehne+Nagel Zurich',      city:'Zurich',     country:'Switzerland', company:'Kuehne+Nagel',          type:'warehouse',    certificates:['GDP','ISO 9001','ISO 13485'], tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:true  },
  { id:'wh-waw-01', name:'DB Schenker Warsaw',        city:'Warsaw',     country:'Poland',      company:'DB Schenker',           type:'warehouse',    certificates:['GDP','ISO 9001'],             tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:false },
  { id:'wh-waw-02', name:'DHL Warsaw Pharma',         city:'Warsaw',     country:'Poland',      company:'DHL Supply Chain',      type:'warehouse',    certificates:['GDP','ISO 9001','ISO 13485'], tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
  { id:'wh-cph-01', name:'DSV Copenhagen Pharma',     city:'Copenhagen', country:'Denmark',     company:'DSV Panalpina',         type:'warehouse',    certificates:['GDP','ISO 9001'],      tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:false },
  { id:'wh-hel-01', name:'DSV Helsinki Pharma',       city:'Helsinki',   country:'Finland',     company:'DSV Panalpina',         type:'warehouse',    certificates:['GDP','ISO 9001'],             tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25}],                                       tempCapabilities:['cold','ambient'],          fragileCapable:false },
  { id:'wh-lhr-01', name:'Marken London Hub',         city:'London',     country:'UK',          company:'Marken',                type:'warehouse',    certificates:['GDP','ISO 13485'],      tempZones:[{label:'Cold',min:2,max:8},{label:'Ambient',min:15,max:25},{label:'Deep-freeze',min:-20,max:-10}], tempCapabilities:['frozen','cold','ambient'], fragileCapable:true  },
  { id:'wh-lhr-02', name:'World Courier London',      city:'London',     country:'UK',          company:'World Courier',         type:'warehouse',    certificates:['GDP','ISO 13485'],      tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
  { id:'wh-lis-01', name:'Movianto Portugal Lisbon',  city:'Lisbon',     country:'Portugal',    company:'Movianto',              type:'warehouse',    certificates:['GDP','ISO 13485','ISO 9001'], tempZones:[{label:'Cold',min:2,max:8},{label:'Deep-freeze',min:-20,max:-10}],                                 tempCapabilities:['frozen','cold'],           fragileCapable:true  },
]

export const AIRPORTS = [
  { id:'ap-fra', iata:'FRA', name:'Frankfurt Airport',        city:'Frankfurt',  country:'Germany',     company:'Lufthansa Cargo',        type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:true  },
  { id:'ap-ams', iata:'AMS', name:'Schiphol Airport',         city:'Amsterdam',  country:'Netherlands', company:'KLM Cargo',              type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-lhr', iata:'LHR', name:'London Heathrow',          city:'London',     country:'UK',          company:'IAG Cargo',              type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:true  },
  { id:'ap-cdg', iata:'CDG', name:'Paris Charles de Gaulle',  city:'Paris',      country:'France',      company:'Air France Cargo',       type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-mad', iata:'MAD', name:'Madrid Barajas',           city:'Madrid',     country:'Spain',       company:'Iberia Cargo',           type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-bru', iata:'BRU', name:'Brussels Airport',         city:'Brussels',   country:'Belgium',     company:'Brussels Airlines Cargo', type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-mxp', iata:'MXP', name:'Milan Malpensa',           city:'Milan',      country:'Italy',       company:'Ceva Logistics',         type:'airport', certificates:['GDP'],             coldChain:false, tempCapabilities:['ambient'],        fragileCapable:false },
  { id:'ap-zrh', iata:'ZRH', name:'Zurich Airport',           city:'Zurich',     country:'Switzerland', company:'Swiss WorldCargo',       type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:true  },
  { id:'ap-cph', iata:'CPH', name:'Copenhagen Airport',       city:'Copenhagen', country:'Denmark',     company:'SAS Cargo',              type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-hel', iata:'HEL', name:'Helsinki Vantaa',          city:'Helsinki',   country:'Finland',     company:'Finnair Cargo',          type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-waw', iata:'WAW', name:'Warsaw Chopin',            city:'Warsaw',     country:'Poland',      company:'LOT Cargo',              type:'airport', certificates:[],                   coldChain:false, tempCapabilities:['ambient'],        fragileCapable:false },
  { id:'ap-bcn', iata:'BCN', name:'Barcelona El Prat',        city:'Barcelona',  country:'Spain',       company:'Iberia Cargo',           type:'airport', certificates:['GDP','ISO 28000'], coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
  { id:'ap-lis', iata:'LIS', name:'Lisbon Humberto Delgado',  city:'Lisbon',     country:'Portugal',    company:'TAP Cargo',              type:'airport', certificates:['GDP'],             coldChain:true,  tempCapabilities:['cold','ambient'], fragileCapable:false },
]

// --- Search helpers ---

export const searchEntities = (query) => {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const results = []
  for (const w of WAREHOUSES) {
    if (w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q) || w.company.toLowerCase().includes(q)) {
      results.push({ id: w.id, _kind: 'warehouse', _label: w.name, _sub: `${w.city}, ${w.country}`, city: w.city, company: w.company })
    }
  }
  for (const a of AIRPORTS) {
    if (a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.iata.toLowerCase() === q || a.company.toLowerCase().includes(q)) {
      results.push({ id: a.id, _kind: 'airport', _label: `${a.name} (${a.iata})`, _sub: `${a.city}, ${a.country}`, city: a.city, company: a.company })
    }
  }
  for (const c of TRANSPORT_COMPANIES) {
    if (c.name.toLowerCase().includes(q)) {
      results.push({ id: c.id, _kind: 'company', _label: c.name, _sub: c.certificates.join(' · ') || 'No certs listed', city: null, company: c.name })
    }
  }
  return results.slice(0, 8)
}

export const searchCompanies = (query) => {
  if (!query || query.length < 1) return []
  const q = query.toLowerCase()
  const seen = new Set()
  const results = []
  for (const c of TRANSPORT_COMPANIES) {
    if (c.name.toLowerCase().includes(q) && !seen.has(c.name)) {
      seen.add(c.name)
      results.push({ id: c.id, name: c.name, type: c.type, certificates: c.certificates, countries: c.countries })
    }
  }
  for (const w of WAREHOUSES) {
    if (w.company.toLowerCase().includes(q) && !seen.has(w.company)) {
      seen.add(w.company)
      results.push({ id: w.id, name: w.company, type: 'warehouse_operator', certificates: w.certificates, countries: [w.country] })
    }
  }
  for (const a of AIRPORTS) {
    if (a.company.toLowerCase().includes(q) && !seen.has(a.company)) {
      seen.add(a.company)
      results.push({ id: a.id, name: a.company, type: 'air_carrier', certificates: a.certificates, countries: [a.country] })
    }
  }
  return results.slice(0, 6)
}

export const getAllCompanies = (limit = 8) =>
  TRANSPORT_COMPANIES.slice(0, limit).map(c => ({
    id: c.id, name: c.name, type: c.type, certificates: c.certificates, countries: c.countries
  }))

export const searchLocations = (query) => {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const results = []
  for (const w of WAREHOUSES) {
    if (w.name.toLowerCase().includes(q) || w.city.toLowerCase().includes(q)) {
      results.push({ id: w.id, label: w.name, sub: `${w.city}, ${w.country}`, city: w.city, company: w.company, facilityType: w.type, certificates: w.certificates })
    }
  }
  for (const a of AIRPORTS) {
    if (a.name.toLowerCase().includes(q) || a.city.toLowerCase().includes(q) || a.iata.toLowerCase() === q) {
      results.push({ id: a.id, label: `${a.name} (${a.iata})`, sub: `${a.city}, ${a.country} · Airport`, city: a.city, company: a.company, facilityType: 'airport', certificates: a.certificates })
    }
  }
  return results.slice(0, 6)
}
