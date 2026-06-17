// Historical performance scores for transport companies, warehouses, and airports.
// Score scale: 0–100. Labels: >=90 Excellent, >=75 Good, >=60 Moderate, >=45 Fair, <45 Poor.

export const COMPANY_SCORES = new Map([

  // ── TRANSPORT COMPANIES ──

  ['DHL Supply Chain', {
    temp:   { score: 95, reason: 'Mean temperature deviation of ≤0.3°C recorded across 4,800 GDP-audited cold-chain shipments in the last 12 months.' },
    damage: { score: 92, reason: 'Physical damage rate of 0.8% across 6,200 consignments, driven by standardised shock-monitoring and double-wall packing protocols.' },
    time:   { score: 91, reason: '91% on-time delivery rate across all lanes; average delay on late shipments limited to 0.7 h.' },
  }],

  ['Kuehne+Nagel', {
    temp:   { score: 91, reason: 'Temperature excursion rate of 0.9% across 3,100 validated cold-chain moves, backed by continuous IoT data-logger coverage.' },
    damage: { score: 89, reason: 'Damage incident rate of 1.1% across 4,000 consignments, supported by vibration-dampened loading practices.' },
    time:   { score: 88, reason: '88% on-time delivery rate; average 0.9 h delay on the 12% late shipments, mostly driven by customs clearance.' },
  }],

  ['DB Schenker', {
    temp:   { score: 82, reason: 'Temperature deviation within ±0.8°C on 2,400 cold-chain shipments; occasional excursions logged during peak summer transit.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 3,600 consignments; improvement noted after packaging audit in Q3.' },
    time:   { score: 87, reason: '87% on-time rate across Nordic and Central European corridors; average 1.1 h delay on late deliveries.' },
  }],

  ['DSV Panalpina', {
    temp:   { score: 83, reason: 'Temperature compliance at 83% of shipments within spec; ±1.0°C deviations observed on 17% of 2,200 cold moves.' },
    damage: { score: 84, reason: 'Damage rate of 1.6% across 2,900 shipments; fragile-handling SOP rolled out to reduce incidence.' },
    time:   { score: 86, reason: '86% on-time delivery rate; 14% delayed by an average of 1.3 h, primarily on Scandinavian domestic legs.' },
  }],

  ['Geodis', {
    temp:   { score: 86, reason: 'Cold-chain excursion rate of 1.4% across 2,700 pharma shipments; validated lane temperature mapping completed for key routes.' },
    damage: { score: 88, reason: 'Damage incident rate of 1.2% across 3,200 consignments; specialised pharma packing line introduced in Brussels hub.' },
    time:   { score: 85, reason: '85% on-time rate across French and Benelux corridors; 15% delayed by an average of 1.2 h.' },
  }],

  ['Ceva Logistics', {
    temp:   { score: 80, reason: 'Temperature deviation rate of 2.0% across 2,100 GDP-controlled shipments; more frequent on Iberian Peninsula routes.' },
    damage: { score: 82, reason: 'Damage rate of 1.8% across 2,800 consignments; corrective action plan in progress for handling procedures at Milan hub.' },
    time:   { score: 84, reason: '84% on-time delivery rate; average 1.4 h delay on late shipments, concentrated on cross-border EU moves.' },
  }],

  ['XPO Logistics', {
    temp:   { score: 72, reason: 'Temperature excursion rate of 2.8% across 1,800 shipments; cold-chain capability limited to ambient and single-zone refrigerated.' },
    damage: { score: 78, reason: 'Damage rate of 2.2% across 2,500 consignments; fragile goods handling not certified at primary sorting facilities.' },
    time:   { score: 82, reason: '82% on-time rate; average 1.6 h delay on the 18% late deliveries, often driven by road congestion on French corridors.' },
  }],

  ['Movianto', {
    temp:   { score: 96, reason: 'Temperature deviation of ≤0.2°C across 5,600 specialised pharma shipments; full multi-zone cold-chain validated for all active lanes.' },
    damage: { score: 94, reason: 'Damage rate of 0.6% across 4,900 consignments; dedicated pharmaceutical packaging lines and trained handlers at every hub.' },
    time:   { score: 90, reason: '90% on-time delivery rate across all European pharma lanes; average 0.6 h delay on the 10% late shipments.' },
  }],

  ['Marken', {
    temp:   { score: 97, reason: 'Temperature excursion rate of ≤0.2% across 3,800 clinical-trial and commercial pharma shipments; continuous cryo and cold data-logger coverage.' },
    damage: { score: 96, reason: 'Physical damage rate of 0.4% across 3,200 consignments; white-glove handling standard applied to all fragile and high-value shipments.' },
    time:   { score: 88, reason: '88% on-time rate; 12% late shipments averaged 0.8 h delay, driven primarily by complex regulatory documentation on clinical routes.' },
  }],

  ['World Courier', {
    temp:   { score: 98, reason: 'Temperature deviation of ≤0.1°C across 3,400 validated shipments; market-leading cryogenic and ultra-cold chain performance across all lanes.' },
    damage: { score: 95, reason: 'Damage rate of 0.5% across 2,900 consignments; purpose-built packaging and specialist couriers on all high-value pharmaceutical moves.' },
    time:   { score: 87, reason: '87% on-time delivery rate; average 0.9 h delay on late shipments, typically related to airport slot constraints.' },
  }],

  ['KLM Cargo', {
    temp:   { score: 84, reason: 'Pharma temperature compliance on 84% of 1,600 air cargo moves; GDP-validated Cool Center at Amsterdam Schiphol supports 2–8°C shipments.' },
    damage: { score: 82, reason: 'Cargo damage rate of 1.8% across 2,200 air shipments; fragile handling not available on all domestic feeders.' },
    time:   { score: 91, reason: '91% on-time rate for air freight departures; average 0.5 h departure delay on the 9% late flights.' },
  }],

  ['Lufthansa Cargo', {
    temp:   { score: 86, reason: 'Temperature excursion rate of 1.3% across 2,000 pharma air-freight shipments; td.Pro cool-chain service covers main European hubs.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 2,600 air consignments; fragile handling certified at Frankfurt and Munich.' },
    time:   { score: 89, reason: '89% on-time departure rate across European network; average 0.7 h delay on late departures.' },
  }],

  ['Air France Cargo', {
    temp:   { score: 78, reason: 'Temperature deviation noted on 2.2% of 1,400 cold-chain air shipments; single-zone refrigerated hold capability limits complex pharma moves.' },
    damage: { score: 80, reason: 'Damage rate of 2.0% across 1,900 consignments; fragile-handling protocol not consistently applied at regional French airports.' },
    time:   { score: 83, reason: '83% on-time rate; average 1.5 h delay on the 17% late shipments, primarily due to CDG slot restrictions.' },
  }],

  ['Iberia Cargo', {
    temp:   { score: 79, reason: 'Temperature excursion rate of 2.1% across 1,300 cold-chain shipments; cool-chain infrastructure under expansion at Madrid Barajas hub.' },
    damage: { score: 81, reason: 'Damage rate of 1.9% across 1,700 consignments; ISO 28000-certified handling procedures in place at main Spanish hubs.' },
    time:   { score: 81, reason: '81% on-time departure rate; average 1.7 h delay on the 19% late shipments, concentrated on Canary Islands feeder routes.' },
  }],

  ['Swiss WorldCargo', {
    temp:   { score: 88, reason: 'Temperature deviation of ≤0.8°C across 1,800 validated pharma air shipments; GDP-certified pharma handling at Zurich Airport.' },
    damage: { score: 87, reason: 'Damage rate of 1.3% across 2,100 consignments; fragile-certified ramp handling at ZRH and GVA.' },
    time:   { score: 92, reason: '92% on-time departure rate across European routes; lowest average delay of 0.4 h on late shipments in the network.' },
  }],

  ['SAS Cargo', {
    temp:   { score: 83, reason: 'Temperature excursion rate of 1.7% across 1,500 pharma shipments; cold-chain service available at Copenhagen, Stockholm and Oslo hubs.' },
    damage: { score: 84, reason: 'Damage rate of 1.6% across 1,800 consignments; fragile handling not offered on all Scandinavian domestic legs.' },
    time:   { score: 89, reason: '89% on-time departure rate across Scandinavian network; average 0.8 h delay on late shipments.' },
  }],

  ['Finnair Cargo', {
    temp:   { score: 82, reason: 'Temperature deviation rate of 1.8% across 1,200 cold-chain shipments; GDP-compliant cool-chain operating from Helsinki Vantaa.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 1,500 consignments; fragile protocols not universally applied on connecting flights.' },
    time:   { score: 88, reason: '88% on-time departure rate from Helsinki; average 0.9 h delay on the 12% late departures.' },
  }],

  ['LOT Cargo', {
    temp:   { score: 73, reason: 'Temperature excursion rate of 2.7% across 900 shipments; cold-chain capability restricted to ambient transit, no validated pharma zone at Warsaw Chopin.' },
    damage: { score: 76, reason: 'Damage rate of 2.4% across 1,100 consignments; basic handling protocols are in place but fragile SOP not formally audited.' },
    time:   { score: 79, reason: '79% on-time departure rate; average 2.0 h delay on the 21% late shipments, driven by Warsaw slot congestion.' },
  }],

  ['TAP Cargo', {
    temp:   { score: 74, reason: 'Temperature deviation rate of 2.6% across 800 cold-chain moves; ambient-only hold configuration limits pharma temperature compliance.' },
    damage: { score: 75, reason: 'Damage rate of 2.5% across 1,000 consignments; no dedicated fragile-handling zone at Lisbon hub.' },
    time:   { score: 78, reason: '78% on-time departure rate from Lisbon; average 2.1 h delay on late shipments, partly due to ATC restrictions on Atlantic routes.' },
  }],

  ['IAG Cargo', {
    temp:   { score: 81, reason: 'Temperature excursion rate of 1.9% across 1,600 pharma air shipments; Constant Climate service available at Heathrow and Madrid hubs.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 2,000 consignments; fragile-handling capability confirmed at LHR and MAD.' },
    time:   { score: 87, reason: '87% on-time departure rate across UK and Spanish network; average 1.0 h delay on late shipments.' },
  }],

  ['Brussels Airlines Cargo', {
    temp:   { score: 80, reason: 'Temperature deviation rate of 2.0% across 1,100 cold-chain shipments; limited by single-zone refrigerated hold capacity at Brussels Zaventem.' },
    damage: { score: 79, reason: 'Damage rate of 2.1% across 1,400 consignments; fragile-handling SOP under review following Q2 audit findings.' },
    time:   { score: 84, reason: '84% on-time departure rate from Brussels; average 1.4 h delay on late shipments driven by slot restrictions at BRU.' },
  }],

  ['PharmaM', {
    temp:   { score: 85, reason: 'Temperature excursion rate of 1.5% across 1,300 outbound pharmaceutical shipments; GDP-certified cold storage at Spanish distribution centre.' },
    damage: { score: 82, reason: 'Damage rate of 1.8% across 1,600 consignments; ISO 9001 quality management system governs packing and dispatch procedures.' },
    time:   { score: 83, reason: '83% on-time dispatch rate; average 1.5 h delay on the 17% late shipments, mostly related to customs pre-clearance.' },
  }],

  ['PharmaBe', {
    temp:   { score: 88, reason: 'Temperature deviation of ≤0.7°C across 1,700 GDP-certified cold-chain shipments from Belgian manufacturing site.' },
    damage: { score: 86, reason: 'Damage rate of 1.4% across 2,000 consignments; ISO 13485-certified packaging line ensures product integrity for medical devices.' },
    time:   { score: 84, reason: '84% on-time dispatch rate; average 1.4 h delay on late orders due to batch release scheduling.' },
  }],

  ['BioNorth', {
    temp:   { score: 91, reason: 'Temperature excursion rate of 0.9% across 2,100 biopharmaceutical shipments; full frozen, cold and ambient zone capability validated to GDP standard.' },
    damage: { score: 90, reason: 'Damage rate of 1.0% across 2,400 consignments; ISO 13485-certified handling with dedicated biologics packaging protocols.' },
    time:   { score: 86, reason: '86% on-time dispatch rate from Netherlands distribution hub; average 1.1 h delay on late shipments.' },
  }],

  ['PharmaIT', {
    temp:   { score: 87, reason: 'Temperature deviation rate of 1.3% across 1,500 cold-chain pharmaceutical shipments from Italian manufacturing facilities.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 1,800 consignments; ISO 13485 quality protocols applied to fragile medical device packaging.' },
    time:   { score: 82, reason: '82% on-time dispatch rate; average 1.6 h delay on the 18% late shipments, partly attributable to Italian customs processing.' },
  }],

  ['BioLogix DE', {
    temp:   { score: 84, reason: 'Temperature excursion rate of 1.6% across 1,400 cold-chain biological product shipments; GDP-compliant cold storage at German distribution site.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 1,700 consignments; base GDP certification without additional fragile-handling accreditation.' },
    time:   { score: 85, reason: '85% on-time dispatch rate; average 1.3 h delay on late shipments, primarily linked to late-afternoon batch release cycles.' },
  }],

  ['MedPol', {
    temp:   { score: 61, reason: 'Temperature deviation recorded on 3.9% of 700 shipments; no validated GDP cold-chain certification in place, relying on passive coolant systems only.' },
    damage: { score: 64, reason: 'Damage rate of 3.6% across 850 consignments; absence of formal fragile-handling or ISO certification results in above-average incident rate.' },
    time:   { score: 72, reason: '72% on-time dispatch rate; average 2.4 h delay on the 28% late shipments due to manual order processing and limited logistics infrastructure.' },
  }],

  ['PharmUK Ltd', {
    temp:   { score: 89, reason: 'Temperature excursion rate of 1.1% across 1,900 GDP-certified cold-chain shipments from UK manufacturing and distribution sites.' },
    damage: { score: 88, reason: 'Damage rate of 1.2% across 2,200 consignments; ISO 13485 certification underpins robust fragile and pharma packaging standards.' },
    time:   { score: 87, reason: '87% on-time dispatch rate; average 1.1 h delay on late shipments, commonly linked to pre-export documentation review.' },
  }],

  ['BioFrance', {
    temp:   { score: 86, reason: 'Temperature deviation rate of 1.4% across 1,600 cold-chain biological shipments; GDP certification covers both road and air export lanes.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 1,900 consignments; ISO 9001 quality management system governs dispatch and packaging for fragile biologics.' },
    time:   { score: 84, reason: '84% on-time dispatch rate from French distribution centre; average 1.4 h delay on the 16% late shipments.' },
  }],

  ['SwissMed', {
    temp:   { score: 85, reason: 'Temperature excursion rate of 1.5% across 1,200 GDP-certified pharmaceutical shipments originating from Swiss manufacturing site.' },
    damage: { score: 84, reason: 'Damage rate of 1.6% across 1,500 consignments; GDP and ISO 9001 protocols in place; fragile handling managed via third-party specialist.' },
    time:   { score: 89, reason: '89% on-time dispatch rate; average 0.9 h delay on late shipments, aided by efficient Swiss customs pre-clearance procedures.' },
  }],

  ['MedPort', {
    temp:   { score: 82, reason: 'Temperature deviation rate of 1.8% across 900 cold-chain pharmaceutical shipments from Portuguese distribution hub.' },
    damage: { score: 80, reason: 'Damage rate of 2.0% across 1,100 consignments; ISO 13485-certified packing line in place but fragile-handling capacity constrained.' },
    time:   { score: 81, reason: '81% on-time dispatch rate; average 1.7 h delay on the 19% late shipments, often linked to ferry transit to Atlantic island routes.' },
  }],

  ['NordicPharma', {
    temp:   { score: 90, reason: 'Temperature excursion rate of 1.0% across 1,400 cold-chain shipments from Finnish distribution site; GDP and ISO 13485 validated cold rooms.' },
    damage: { score: 88, reason: 'Damage rate of 1.2% across 1,600 consignments; certified fragile-handling capability for biologics and medical devices.' },
    time:   { score: 86, reason: '86% on-time dispatch rate; average 1.1 h delay on late shipments, typically driven by cross-border Scandinavian customs clearance.' },
  }],

  ['ColdChain ES', {
    temp:   { score: 93, reason: 'Temperature deviation of ≤0.4°C across 2,200 GDP-audited frozen and cold-chain shipments; tri-zone validated storage across Spanish network.' },
    damage: { score: 89, reason: 'Damage rate of 1.1% across 2,600 consignments; ISO 13485-certified packaging and fragile-handling protocols applied to all product lines.' },
    time:   { score: 83, reason: '83% on-time delivery rate; average 1.5 h delay on the 17% late shipments, largely attributable to road congestion on Madrid–Barcelona corridor.' },
  }],

  ['NordDist', {
    temp:   { score: 80, reason: 'Temperature excursion rate of 2.0% across 1,100 cold-chain shipments distributed across Danish logistics network.' },
    damage: { score: 82, reason: 'Damage rate of 1.8% across 1,400 consignments; GDP and ISO 9001 certification provides adequate standard for ambient and single-zone cold storage.' },
    time:   { score: 84, reason: '84% on-time delivery rate; average 1.4 h delay on the 16% late shipments across Nordic distribution lanes.' },
  }],

  ['MedTrans ES', {
    temp:   { score: 68, reason: 'Temperature deviation recorded on 3.2% of 800 road-freight shipments; ambient-only capability limits pharmaceutical cold-chain compliance.' },
    damage: { score: 71, reason: 'Damage rate of 2.9% across 1,000 consignments; GDP and ISO 9001 certification in place but no formal fragile-handling accreditation.' },
    time:   { score: 77, reason: '77% on-time delivery rate; average 2.2 h delay on the 23% late shipments, concentrated on last-mile urban delivery in Spanish cities.' },
  }],

  // ── WAREHOUSES ──

  ['DHL Pharma Hub Frankfurt', {
    temp:   { score: 94, reason: 'Temperature deviation of ≤0.3°C across 5,200 GDP-audited pallet storage cycles; tri-zone (frozen, cold, ambient) validated annually.' },
    damage: { score: 93, reason: 'Damage rate of 0.7% across 6,800 product lines handled; ISO 13485-certified pick-and-pack line with automated inspection.' },
    time:   { score: 96, reason: '96% order-fulfilment within agreed SLA; average 0.4 h delay on exceptions, supported by real-time WMS throughput monitoring.' },
  }],

  ['Kuehne+Nagel Frankfurt', {
    temp:   { score: 90, reason: 'Temperature excursion rate of 1.0% across 3,600 GDP-validated cold storage cycles; dedicated receiving zone for air-freight pre-conditioning.' },
    damage: { score: 88, reason: 'Damage rate of 1.2% across 4,200 product lines; fragile-handling protocols aligned to ISO 9001 quality procedures.' },
    time:   { score: 92, reason: '92% SLA adherence for outbound dispatch; average 0.6 h delay on the 8% late orders.' },
  }],

  ['Movianto Netherlands', {
    temp:   { score: 96, reason: 'Temperature deviation of ≤0.2°C across 6,100 validated cold and frozen storage cycles; industry-leading multi-zone GDP performance at Amsterdam hub.' },
    damage: { score: 94, reason: 'Damage rate of 0.6% across 7,400 product lines; specialist pharmaceutical handlers and automated integrity checks at dispatch.' },
    time:   { score: 91, reason: '91% order-fulfilment within SLA; average 0.6 h delay on exceptions across Dutch distribution network.' },
  }],

  ['DHL Amsterdam Pharma', {
    temp:   { score: 91, reason: 'Temperature excursion rate of 0.9% across 3,800 GDP-certified cold storage cycles at Amsterdam Schiphol proximity warehouse.' },
    damage: { score: 87, reason: 'Damage rate of 1.3% across 4,600 product lines; GDP and ISO 9001 certified but fragile handling managed via shared-use packing area.' },
    time:   { score: 93, reason: '93% SLA adherence; average 0.5 h delay on the 7% late outbound orders, benefiting from Schiphol airside connectivity.' },
  }],

  ['Geodis Brussels Pharma', {
    temp:   { score: 87, reason: 'Temperature deviation rate of 1.3% across 2,400 cold storage cycles; GDP and ISO 13485 validated cold room with continuous monitoring.' },
    damage: { score: 89, reason: 'Damage rate of 1.1% across 2,900 product lines; fragile-handling certification supports medical device storage and dispatch.' },
    time:   { score: 88, reason: '88% SLA adherence on outbound dispatch; average 1.0 h delay on the 12% late orders from Brussels facility.' },
  }],

  ['Movianto Mechelen', {
    temp:   { score: 95, reason: 'Temperature deviation of ≤0.2°C across 4,800 frozen and cold storage cycles; dedicated deep-freeze vault validated to –20°C GDP standard.' },
    damage: { score: 93, reason: 'Damage rate of 0.7% across 5,600 product lines; ISO 13485-certified handling with purpose-built cryogenic packaging procedures.' },
    time:   { score: 90, reason: '90% SLA adherence; average 0.7 h delay on exceptions at Mechelen hub, driven primarily by late carrier pickups.' },
  }],

  ['DHL Madrid Pharma', {
    temp:   { score: 88, reason: 'Temperature excursion rate of 1.2% across 2,800 GDP-certified cold storage cycles at Madrid distribution centre.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 3,400 product lines; GDP and ISO 9001 certified, with fragile handling managed via standard packing SOP.' },
    time:   { score: 86, reason: '86% SLA adherence; average 1.2 h delay on the 14% late orders, partly influenced by Madrid urban delivery restrictions.' },
  }],

  ['Kuehne+Nagel Madrid', {
    temp:   { score: 89, reason: 'Temperature deviation of ≤0.7°C across 2,100 GDP and ISO 13485-validated cold and frozen storage cycles at Madrid facility.' },
    damage: { score: 88, reason: 'Damage rate of 1.2% across 2,600 product lines; fragile-handling protocols support medical device and biologics storage.' },
    time:   { score: 85, reason: '85% SLA adherence; average 1.3 h delay on the 15% late dispatch orders from the Madrid hub.' },
  }],

  ['XPO Barcelona', {
    temp:   { score: 74, reason: 'Temperature deviation rate of 2.6% across 1,200 ambient storage cycles; no validated cold room on site, limiting pharmaceutical temperature compliance.' },
    damage: { score: 76, reason: 'Damage rate of 2.4% across 1,500 product lines; distribution-centre classification with GDP and ISO 9001 but no fragile-handling accreditation.' },
    time:   { score: 82, reason: '82% SLA adherence; average 1.6 h delay on the 18% late outbound orders from Barcelona facility.' },
  }],

  ['Geodis Paris Pharma', {
    temp:   { score: 86, reason: 'Temperature excursion rate of 1.4% across 2,600 GDP and ISO 13485-validated cold storage cycles at Paris Charles de Gaulle proximity hub.' },
    damage: { score: 87, reason: 'Damage rate of 1.3% across 3,100 product lines; fragile-handling certification aligned to medical device storage requirements.' },
    time:   { score: 87, reason: '87% SLA adherence; average 1.1 h delay on the 13% late orders from Geodis Paris Pharma warehouse.' },
  }],

  ['XPO Paris Pharma', {
    temp:   { score: 73, reason: 'Temperature deviation rate of 2.7% across 1,100 ambient storage cycles; single-zone ambient warehouse with no validated cold room infrastructure.' },
    damage: { score: 75, reason: 'Damage rate of 2.5% across 1,400 product lines; GDP and ISO 9001 certified but fragile-handling capability not independently audited.' },
    time:   { score: 81, reason: '81% SLA adherence; average 1.7 h delay on the 19% late dispatch orders, linked to CDG-area road congestion.' },
  }],

  ['Movianto Italy Milan', {
    temp:   { score: 94, reason: 'Temperature deviation of ≤0.3°C across 4,100 validated frozen and cold storage cycles at Movianto Milan; GDP and ISO 13485 certified.' },
    damage: { score: 91, reason: 'Damage rate of 0.9% across 5,000 product lines; specialist pharmaceutical handling with dedicated biologics packing protocols.' },
    time:   { score: 88, reason: '88% SLA adherence; average 1.0 h delay on the 12% late orders, largely due to northern Italian carrier availability.' },
  }],

  ['Ceva Logistics Milan', {
    temp:   { score: 79, reason: 'Temperature excursion rate of 2.1% across 1,400 cold storage cycles at Milan facility; GDP and ISO 9001 certified but limited to single cold zone.' },
    damage: { score: 78, reason: 'Damage rate of 2.2% across 1,700 product lines; GDP-certified for air-freight consolidation but fragile-handling not formally accredited.' },
    time:   { score: 83, reason: '83% SLA adherence; average 1.5 h delay on the 17% late orders from Milan distribution hub.' },
  }],

  ['Kuehne+Nagel Zurich', {
    temp:   { score: 91, reason: 'Temperature deviation of ≤0.6°C across 2,900 GDP, ISO 9001 and ISO 13485-validated cold storage cycles at Zurich facility.' },
    damage: { score: 90, reason: 'Damage rate of 1.0% across 3,400 product lines; fragile-handling capability certified for medical devices and biologics.' },
    time:   { score: 94, reason: '94% SLA adherence; average 0.4 h delay on the 6% late orders, supported by efficient Swiss customs pre-clearance.' },
  }],

  ['DB Schenker Warsaw', {
    temp:   { score: 80, reason: 'Temperature excursion rate of 2.0% across 1,600 cold storage cycles at Warsaw facility; GDP and ISO 9001 certified.' },
    damage: { score: 79, reason: 'Damage rate of 2.1% across 1,900 product lines; standard GDP handling without dedicated fragile-handling accreditation.' },
    time:   { score: 84, reason: '84% SLA adherence; average 1.4 h delay on the 16% late outbound orders from Warsaw hub.' },
  }],

  ['DHL Warsaw Pharma', {
    temp:   { score: 88, reason: 'Temperature deviation of ≤0.8°C across 2,400 GDP and ISO 13485-validated cold and frozen storage cycles at Warsaw pharma hub.' },
    damage: { score: 86, reason: 'Damage rate of 1.4% across 2,900 product lines; fragile-handling capability for medical devices and frozen biologics.' },
    time:   { score: 87, reason: '87% SLA adherence; average 1.1 h delay on the 13% late orders from Warsaw Pharma distribution centre.' },
  }],

  ['DSV Copenhagen Pharma', {
    temp:   { score: 83, reason: 'Temperature excursion rate of 1.7% across 1,800 GDP-validated cold and frozen storage cycles at Copenhagen facility.' },
    damage: { score: 84, reason: 'Damage rate of 1.6% across 2,100 product lines; GDP certification supports air-freight pre-conditioning for perishable pharma.' },
    time:   { score: 88, reason: '88% SLA adherence; average 1.0 h delay on the 12% late orders, with good airside connectivity at CPH.' },
  }],

  ['DSV Helsinki Pharma', {
    temp:   { score: 82, reason: 'Temperature deviation rate of 1.8% across 1,400 cold storage cycles at Helsinki facility; GDP and ISO 9001 validated.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 1,700 product lines; standard GDP handling protocols applied without dedicated fragile-handling zone.' },
    time:   { score: 87, reason: '87% SLA adherence; average 1.1 h delay on the 13% late orders from Helsinki distribution hub.' },
  }],

  ['Marken London Hub', {
    temp:   { score: 97, reason: 'Temperature deviation of ≤0.1°C across 4,400 GDP and ISO 13485-validated cold, frozen and ambient storage cycles at LHR proximity hub.' },
    damage: { score: 95, reason: 'Damage rate of 0.5% across 5,100 product lines; white-glove pharmaceutical handling with dedicated clinical-trial packaging suite.' },
    time:   { score: 89, reason: '89% SLA adherence; average 0.8 h delay on the 11% late orders, primarily driven by Heathrow customs inspection queues.' },
  }],

  ['World Courier London', {
    temp:   { score: 98, reason: 'Temperature excursion rate of ≤0.1% across 3,700 validated cryogenic, cold and frozen storage cycles; best-in-network performance at LHR hub.' },
    damage: { score: 96, reason: 'Damage rate of 0.4% across 4,300 product lines; specialist biologics handlers with purpose-built cryo packaging and integrity scanning.' },
    time:   { score: 88, reason: '88% SLA adherence; average 0.9 h delay on late orders, primarily related to Heathrow border inspection scheduling.' },
  }],

  ['Movianto Portugal Lisbon', {
    temp:   { score: 92, reason: 'Temperature deviation of ≤0.5°C across 2,600 GDP, ISO 13485 and ISO 9001-validated cold and frozen storage cycles at Lisbon hub.' },
    damage: { score: 90, reason: 'Damage rate of 1.0% across 3,100 product lines; fragile-handling protocols support biologics and medical device storage.' },
    time:   { score: 85, reason: '85% SLA adherence; average 1.3 h delay on the 15% late orders from Lisbon distribution centre.' },
  }],

  // ── AIRPORTS ──

  ['Schiphol Airport', {
    temp:   { score: 87, reason: 'Temperature excursion rate of 1.3% across 3,200 pharma air shipments handled through the GDP-certified Cool Center at Amsterdam Schiphol.' },
    damage: { score: 85, reason: 'Cargo damage rate of 1.5% across 4,100 consignments transiting AMS; fragile handling not universally available on domestic feeder connections.' },
    time:   { score: 90, reason: '90% on-time flight departure rate for pharma-priority cargo; average 0.6 h delay on the 10% late departures.' },
  }],

  ['Frankfurt Airport', {
    temp:   { score: 89, reason: 'Temperature deviation rate of 1.1% across 3,800 pharma shipments through the GDP-validated Pharma Hub at Frankfurt Airport.' },
    damage: { score: 86, reason: 'Damage rate of 1.4% across 4,700 consignments; fragile-handling certified at main FRA cargo terminal with dedicated pharma ramp zone.' },
    time:   { score: 88, reason: '88% on-time departure rate; average 1.0 h delay on late pharma cargo departures due to slot constraints at peak times.' },
  }],

  ['Brussels Airport', {
    temp:   { score: 83, reason: 'Temperature excursion rate of 1.7% across 2,100 pharma shipments transiting Brussels Zaventem; GDP-certified pharma zone in operation.' },
    damage: { score: 81, reason: 'Damage rate of 1.9% across 2,700 consignments; fragile-handling SOP under review following Q2 capacity expansion at BRU.' },
    time:   { score: 86, reason: '86% on-time departure rate; average 1.2 h delay on the 14% late cargo departures from Brussels.' },
  }],

  ['London Heathrow', {
    temp:   { score: 86, reason: 'Temperature deviation rate of 1.4% across 3,500 pharma shipments through the GDP-certified cool-chain facilities at Heathrow World Cargo Centre.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 4,400 consignments; fragile-handling available in dedicated terminal zones subject to pre-booking.' },
    time:   { score: 87, reason: '87% on-time departure rate; average 1.1 h delay on late shipments, commonly linked to border inspection and slot allocation at LHR.' },
  }],

  ['Paris Charles de Gaulle', {
    temp:   { score: 82, reason: 'Temperature excursion rate of 1.8% across 2,800 pharma shipments transiting CDG; GDP-compliant cool-room available at Air France Cargo terminal.' },
    damage: { score: 80, reason: 'Damage rate of 2.0% across 3,500 consignments; fragile protocols not consistently applied across CDG\'s multiple cargo terminals.' },
    time:   { score: 84, reason: '84% on-time departure rate; average 1.4 h delay on the 16% late shipments, driven by CDG slot restrictions and high traffic volume.' },
  }],

  ['Madrid Barajas', {
    temp:   { score: 80, reason: 'Temperature deviation rate of 2.0% across 2,200 cold-chain pharma shipments at Madrid Barajas; cool-chain infrastructure expansion ongoing.' },
    damage: { score: 79, reason: 'Damage rate of 2.1% across 2,800 consignments; fragile-handling capability present but not universally available across all cargo zones.' },
    time:   { score: 85, reason: '85% on-time departure rate; average 1.3 h delay on the 15% late shipments from Madrid Barajas.' },
  }],

  ['Milan Malpensa', {
    temp:   { score: 79, reason: 'Temperature excursion rate of 2.1% across 1,800 shipments through Milan Malpensa; cold-chain facility not GDP-certified, limiting pharma compliance.' },
    damage: { score: 77, reason: 'Damage rate of 2.3% across 2,300 consignments; no dedicated fragile-handling ramp zone at MXP main cargo apron.' },
    time:   { score: 83, reason: '83% on-time departure rate; average 1.5 h delay on the 17% late shipments, partly driven by ATC delays on Italian routes.' },
  }],

  ['Zurich Airport', {
    temp:   { score: 88, reason: 'Temperature deviation rate of 1.2% across 2,500 GDP-certified pharma shipments through Zurich Airport\'s dedicated cool-chain infrastructure.' },
    damage: { score: 85, reason: 'Damage rate of 1.5% across 3,100 consignments; fragile-handling certified at Zurich main cargo terminal for high-value pharmaceutical products.' },
    time:   { score: 91, reason: '91% on-time departure rate; average 0.5 h delay on late pharma cargo departures, aided by efficient Swiss ground-handling procedures.' },
  }],

  ['Copenhagen Airport', {
    temp:   { score: 84, reason: 'Temperature excursion rate of 1.6% across 1,900 cold-chain pharma shipments transiting Copenhagen Kastrup; GDP-certified pharma lane in operation.' },
    damage: { score: 83, reason: 'Damage rate of 1.7% across 2,400 consignments; fragile-handling protocols applied at main CPH cargo terminal.' },
    time:   { score: 89, reason: '89% on-time departure rate; average 0.8 h delay on the 11% late pharma cargo departures from Copenhagen.' },
  }],

  ['Helsinki Vantaa', {
    temp:   { score: 83, reason: 'Temperature deviation rate of 1.7% across 1,500 cold-chain pharma shipments at Helsinki Vantaa; GDP-compliant handling available through Finnair Cargo.' },
    damage: { score: 82, reason: 'Damage rate of 1.8% across 1,900 consignments; fragile-handling protocols available but not applied on all connecting Scandinavian feeder flights.' },
    time:   { score: 88, reason: '88% on-time departure rate from Helsinki; average 0.9 h delay on late cargo departures.' },
  }],

  ['Warsaw Chopin', {
    temp:   { score: 74, reason: 'Temperature excursion rate of 2.6% across 1,100 shipments through Warsaw Chopin; no validated GDP cold-chain zone in cargo terminal.' },
    damage: { score: 76, reason: 'Damage rate of 2.4% across 1,400 consignments; basic handling procedures only, no dedicated fragile or pharmaceutical ramp zone.' },
    time:   { score: 81, reason: '81% on-time departure rate; average 1.7 h delay on the 19% late shipments, driven by Warsaw slot congestion and customs processing times.' },
  }],

  ['Lisbon Humberto Delgado', {
    temp:   { score: 77, reason: 'Temperature deviation rate of 2.3% across 1,000 cold-chain pharma shipments; GDP-certified cool-chain facility available at limited capacity through TAP Cargo.' },
    damage: { score: 75, reason: 'Damage rate of 2.5% across 1,300 consignments; no dedicated fragile-handling ramp zone at Lisbon main cargo terminal.' },
    time:   { score: 82, reason: '82% on-time departure rate; average 1.6 h delay on late shipments, linked to ATC restrictions on Atlantic routes from LIS.' },
  }],

  ['Barcelona El Prat', {
    temp:   { score: 78, reason: 'Temperature excursion rate of 2.2% across 1,300 cold-chain pharma shipments through Barcelona El Prat; ISO 28000-certified security but limited GDP cold-chain zone.' },
    damage: { score: 76, reason: 'Damage rate of 2.4% across 1,700 consignments; fragile-handling capability available via Iberia Cargo ramp service subject to advance booking.' },
    time:   { score: 83, reason: '83% on-time departure rate; average 1.5 h delay on the 17% late pharma cargo departures from Barcelona El Prat.' },
  }],

])

export function getScores(name) {
  return COMPANY_SCORES.get(name) || null
}

export function scoreLabel(s) {
  return s >= 90 ? 'Excellent' : s >= 75 ? 'Good' : s >= 60 ? 'Moderate' : s >= 45 ? 'Fair' : 'Poor'
}

export function scoreColor(s) {
  return s >= 90 ? '#15803d' : s >= 75 ? '#16a34a' : s >= 60 ? '#b45309' : s >= 45 ? '#c2410c' : '#b91c1c'
}

export function scoreBg(s) {
  return s >= 90 ? '#dcfce7' : s >= 75 ? '#f0fdf4' : s >= 60 ? '#fef9c3' : s >= 45 ? '#fff7ed' : '#fef2f2'
}
