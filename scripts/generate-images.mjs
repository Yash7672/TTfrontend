// ---------------------------------------------------------------------------
// FIXORA — category artwork generator
//
// Replaces the random placeholder photos with deterministic, on-brand SVG
// artwork: one image per category and one (slightly varied) image per service,
// each using the category's Lucide icon and colour.
//
// Output:
//   public/images/categories/<category-slug>.svg
//   public/images/services/<service-slug>.svg
//   public/images/providers/<provider-slug>.svg
//
// Usage (from this repository root, after `npm install`):
//   node scripts/generate-images.mjs
//
// The slugs produced here are identical to the slug() method in
// backend/.../SeedDataInitializer.java, so the generated files line up with the
// rows the backend seeds.
// ---------------------------------------------------------------------------

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const ICON_DIR = join(ROOT, 'node_modules', 'lucide-react', 'dist', 'esm', 'icons')

// Category name -> slug, Lucide icon, gradient. Mirrors SeedDataInitializer.
const CATEGORIES = [
  ['Home Cleaning', 'home-cleaning', 'sparkles', '#06b6d4', '#0e7490'],
  ['Electrician', 'electrician', 'zap', '#f59e0b', '#d97706'],
  ['Plumbing', 'plumbing', 'droplets', '#3b82f6', '#1d4ed8'],
  ['AC Services', 'ac-services', 'wind', '#0ea5e9', '#0369a1'],
  ['Appliance Repair', 'appliance-repair', 'washing-machine', '#8b5cf6', '#6d28d9'],
  ['Carpentry', 'carpentry', 'hammer', '#b45309', '#92400e'],
  ['Painting', 'painting', 'paint-roller', '#ec4899', '#be185d'],
  ['Pest Control', 'pest-control', 'bug', '#22c55e', '#15803d'],
  ['Beauty and Personal Care', 'beauty-and-personal-care', 'scissors', '#f43f5e', '#be123c'],
  ['Salon at Home', 'salon-at-home', 'wand-sparkles', '#d946ef', '#a21caf'],
  ['Appliance Installation', 'appliance-installation', 'plug', '#14b8a6', '#0f766e'],
  ['Vehicle Services', 'vehicle-services', 'car', '#475569', '#1e293b'],
  ['Technology Repair', 'technology-repair', 'laptop', '#6366f1', '#4338ca'],
  ['Other Services', 'other-services', 'wrench', '#78716c', '#44403c'],
]

// category slug -> service names. Mirrors the CATALOGUE map in SeedDataInitializer.
const SERVICES = {
  'home-cleaning': [
    'Full Home Cleaning', 'Bathroom Deep Cleaning', 'Kitchen Deep Cleaning', 'Sofa Cleaning',
    'Carpet Cleaning', 'Mattress Cleaning', 'Move-In / Move-Out Cleaning', 'Balcony Cleaning',
  ],
  electrician: [
    'Fan Installation', 'Fan Repair', 'Light Installation', 'Switch and Socket Repair',
    'Wiring Inspection', 'MCB and Fuse Repair', 'Electrical Troubleshooting', 'Appliance Connection',
  ],
  plumbing: [
    'Tap Repair', 'Tap Installation', 'Washbasin Installation', 'Toilet Repair', 'Flush Repair',
    'Pipe Leakage Repair', 'Drain Cleaning', 'Bathroom Fitting Installation',
  ],
  'ac-services': [
    'AC Inspection', 'AC General Service', 'AC Deep Cleaning', 'AC Gas Refill', 'AC Installation',
    'AC Uninstallation', 'AC Repair', 'Cooling Problem Diagnosis',
  ],
  'appliance-repair': [
    'Washing Machine Repair', 'Refrigerator Repair', 'Microwave Repair', 'Dishwasher Repair',
    'Water Purifier Service', 'Geyser Repair', 'Chimney Cleaning', 'Induction Cooktop Repair',
  ],
  carpentry: [
    'Furniture Assembly', 'Door Repair', 'Lock Installation', 'Drawer Repair', 'Bed Assembly',
    'Shelf Installation', 'Hinge Repair',
  ],
  painting: [
    'Room Painting', 'Full Home Painting', 'Wall Touch-Up', 'Texture Painting',
    'Waterproofing Assessment', 'Exterior Painting Consultation',
  ],
  'pest-control': [
    'General Pest Inspection', 'Cockroach Control', 'Ant Control', 'Mosquito Control',
    'Termite Inspection', 'Bed Bug Treatment', 'Rodent Control',
  ],
  'beauty-and-personal-care': [
    "Women's Haircut", 'Hair Styling', 'Facial', 'Cleanup', 'Manicure', 'Pedicure', 'Waxing',
    "Men's Grooming", 'Bridal Makeup Consultation',
  ],
  'salon-at-home': ['Haircut at Home', 'Hair Colouring', 'Hair Spa', 'Beard Styling', 'Grooming Packages'],
  'appliance-installation': [
    'TV Installation', 'Washing Machine Installation', 'Water Purifier Installation',
    'Geyser Installation', 'Kitchen Appliance Installation',
  ],
  'vehicle-services': [
    'Car Wash', 'Bike Service', 'Car Battery Assistance', 'Basic Vehicle Inspection',
    'Puncture Assistance', 'Interior Car Cleaning',
  ],
  'technology-repair': [
    'Computer Repair', 'Laptop Repair', 'Laptop Hardware Diagnosis', 'Mobile Repair',
    'Mobile Screen Replacement', 'Printer Repair', 'Wi-Fi Troubleshooting',
  ],
  'other-services': [
    'Home Shifting Assistance', 'Furniture Moving', 'Gardening', 'General Handyman Services',
  ],
}

// Seeded providers -> gradient + representative category icon for the watermark.
// Mirrors the providers created in SeedDataInitializer.
const PROVIDERS = [
  ['Hyderabad Home Experts', 'sparkles', '#06b6d4', '#0e7490'],
  ['Deccan Appliance Care', 'washing-machine', '#8b5cf6', '#6d28d9'],
  ['Charminar Cleaning Co', 'bug', '#22c55e', '#15803d'],
  ['Zenith Beauty & Auto Care', 'scissors', '#f43f5e', '#be123c'],
]

/** First letters of the first two words, e.g. "Deccan Appliance Care" -> "DA". */
function initials(value) {
  const words = String(value).trim().split(/\s+/).filter(Boolean)
  return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'
}

/** Identical logic to SeedDataInitializer.slug(). */
function slug(value) {
  return value
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\//g, ' ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Deterministic 0..n-1 hash for a string. */
function hash(value) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) % 100000
  return h
}

/** Pull the child-node array out of a lucide-react icon module. */
function iconChildren(icon) {
  const text = readFileSync(join(ICON_DIR, `${icon}.js`), 'utf8')
  const start = text.indexOf('createLucideIcon(')
  const comma = text.indexOf(',', start)
  let depth = 0
  let begin = -1
  let end = -1
  for (let i = comma; i < text.length; i += 1) {
    const c = text[i]
    if (c === '[') {
      if (depth === 0) begin = i
      depth += 1
    } else if (c === ']') {
      depth -= 1
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const nodes = new Function(`return ${text.slice(begin, end + 1)}`)()
  const geometry = /^(d|cx|cy|r|x|y|x1|y1|x2|y2|width|height|points|rx|ry)$/
  return nodes
    .map(([tag, attrs]) => {
      const a = Object.entries(attrs || {})
        .filter(([k]) => geometry.test(k))
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
      return a ? `<${tag} ${a}/>` : `<${tag}/>`
    })
    .join('')
}

const DIRECTIONS = [
  ['0', '0', '1', '1'],
  ['1', '0', '0', '1'],
  ['0', '1', '1', '0'],
  ['1', '1', '0', '0'],
]

/** Four decorative layouts; the chosen variant varies per item. */
function decoration(variant) {
  switch (variant % 4) {
    case 0:
      return `
  <circle cx="120" cy="90" r="150" fill="#ffffff" fill-opacity="0.10"/>
  <circle cx="540" cy="360" r="170" fill="#000000" fill-opacity="0.10"/>`
    case 1:
      return `
  <circle cx="320" cy="210" r="210" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="2"/>
  <circle cx="90" cy="340" r="90" fill="#000000" fill-opacity="0.10"/>
  <circle cx="560" cy="80" r="70" fill="#ffffff" fill-opacity="0.12"/>`
    case 2:
      return `
  <path d="M-40 340 L360 -40 L520 -40 L120 380 Z" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="520" cy="330" r="120" fill="#000000" fill-opacity="0.10"/>`
    default:
      return `
  <circle cx="320" cy="210" r="150" fill="none" stroke="#ffffff" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="320" cy="210" r="110" fill="none" stroke="#ffffff" stroke-opacity="0.10" stroke-width="2"/>
  <circle cx="120" cy="330" r="80" fill="#000000" fill-opacity="0.10"/>`
  }
}

function buildSvg({ icon, from, to, label, variant }) {
  const [x1, y1, x2, y2] = DIRECTIONS[variant % DIRECTIONS.length]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="bg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.38" r="0.75">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.30"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="640" height="420" fill="url(#bg)"/>${decoration(variant)}
  <rect width="640" height="420" fill="url(#glow)"/>
  <g transform="translate(242,132) scale(6.5)" fill="none" stroke="#ffffff" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round">${iconChildren(icon)}</g>
</svg>
`
}

/**
 * Provider logo: a square brand avatar with the business monogram on the
 * provider's gradient, plus a faint watermark of its main category icon so it
 * still reads as part of the Fixora catalogue at a glance.
 */
function buildProviderSvg({ name, icon, from, to, variant }) {
  const [x1, y1, x2, y2] = DIRECTIONS[variant % DIRECTIONS.length]
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="bg" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" fill="url(#bg)"/>
  <g transform="translate(96,214) scale(4.5)" fill="none" stroke="#ffffff" stroke-opacity="0.16" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">${iconChildren(icon)}</g>
  <circle cx="128" cy="128" r="112" fill="none" stroke="#ffffff" stroke-opacity="0.22" stroke-width="2"/>
  <circle cx="196" cy="60" r="70" fill="#000000" fill-opacity="0.08"/>
  <text x="128" y="128" text-anchor="middle" dominant-baseline="central" font-size="104" font-weight="800"
        letter-spacing="2" fill="#ffffff"
        font-family="'Segoe UI', system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif">${initials(name)}</text>
</svg>
`
}

const catDir = join(ROOT, 'public', 'images', 'categories')
const svcDir = join(ROOT, 'public', 'images', 'services')
const providerDir = join(ROOT, 'public', 'images', 'providers')
mkdirSync(catDir, { recursive: true })
mkdirSync(svcDir, { recursive: true })
mkdirSync(providerDir, { recursive: true })

let categoryCount = 0
let serviceCount = 0
let providerCount = 0

for (const [name, catSlug, icon, from, to] of CATEGORIES) {
  writeFileSync(join(catDir, `${catSlug}.svg`), buildSvg({ icon, from, to, label: name, variant: 0 }))
  categoryCount += 1

  const services = SERVICES[catSlug] || []
  for (const service of services) {
    const svcSlug = slug(service)
    const variant = 1 + (hash(svcSlug) % 3)
    writeFileSync(join(svcDir, `${svcSlug}.svg`), buildSvg({ icon, from, to, label: service, variant }))
    serviceCount += 1
  }
}

for (const [name, icon, from, to] of PROVIDERS) {
  const providerSlug = slug(name)
  writeFileSync(
    join(providerDir, `${providerSlug}.svg`),
    buildProviderSvg({ name, icon, from, to, variant: hash(providerSlug) % 4 }),
  )
  providerCount += 1
}

console.log(
  `Wrote ${categoryCount} category images, ${serviceCount} service images and ${providerCount} provider logos.`,
)

// Optional: verify filenames against a running instance so the backend mapping
// can never silently drift from the generated files.
const base = process.env.FIXORA_API || 'http://localhost:3000/api'
try {
  // The API caps a page at 60, so walk every page.
  const actual = new Set()
  for (let page = 0; ; page += 1) {
    const list = await (await fetch(`${base}/services?page=${page}&size=60`)).json()
    for (const service of list.content || []) actual.add(service.slug)
    if (page + 1 >= (list.totalPages ?? 1)) break
  }
  const expected = new Set(
    Object.entries(SERVICES).flatMap(([, names]) => names.map((n) => slug(n))),
  )
  const missing = [...expected].filter((s) => !actual.has(s))
  const extra = [...actual].filter((s) => !expected.has(s))
  if (missing.length || extra.length) {
    console.warn('Slug check — missing files for:', missing, '| extra API rows:', extra)
  } else {
    console.log(`Slug check OK: ${actual.size} service slugs match the generated set.`)
  }
} catch {
  console.log('Slug check skipped (API not reachable).')
}
