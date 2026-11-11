import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { listManifests } from '../src/catalog/catalog'
import { templateDefaults } from '../src/data/defaults'
import { ROOM_PRICE_COLORS } from '../src/data/roomPrice'
import { accentLabelColor, actionBackground } from '../src/utils/accentInk'
import { generateBackend } from '../src/export/backend/generateBackend'
import { RoomPrice } from '../src/templates/booking/RoomPrice'
import { SiteApp } from '../src/templates/SiteApp'

function luminance(hex: string) {
  const raw = hex.slice(1)
  const full = raw.length === 3 ? raw.split('').map((value) => value + value).join('') : raw
  const rgb = full.match(/../g)!.map((value) => {
    const channel = parseInt(value, 16) / 255
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function contrast(foreground: string, background: string) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
  return (values[0] + 0.05) / (values[1] + 0.05)
}

for (const color of [ROOM_PRICE_COLORS.amount, ROOM_PRICE_COLORS.muted]) {
  assert.ok(contrast(color, ROOM_PRICE_COLORS.background) >= 4.5, `${color}: insufficient price contrast`)
}
assert.ok(contrast(ROOM_PRICE_COLORS.discount, ROOM_PRICE_COLORS.discountBackground) >= 4.5)

for (const accent of ['#fff', '#ffffff', '#ffff00', '#888888', '#2563eb', '#0f172a', '#000', 'invalid', '']) {
  for (const fallback of ['#fff', '#888888', '#04245c', 'invalid']) {
    assert.ok(contrast(accentLabelColor(accent, fallback), '#ffffff') >= 4.5)
    assert.ok(contrast('#ffffff', actionBackground(accent, fallback)) >= 4.5)
  }
}
assert.equal(accentLabelColor('#888888', '#04245c'), '#04245c')
assert.equal(accentLabelColor('invalid', '#fff'), '#020617')
assert.equal(accentLabelColor(' #0f172a '), '#0f172a')
assert.equal(actionBackground('#0f172a'), '#0f172a')

function checkActions(html: string, label: string) {
  const actions = html.match(/<(?:a|button)\b(?:[^>"']|"[^"]*"|'[^']*')*>See availability<\/(?:a|button)>/g) ?? []
  assert.ok(actions.length, `${label}: availability action missing`)
  for (const action of actions) {
    const background = action.match(/background-color:(#[a-f0-9]{3,6})/i)?.[1]
    assert.ok(background, `${label}: action background missing`)
    const foreground = action.includes('text-[#f4f0e6]') ? '#f4f0e6' : '#ffffff'
    assert.ok(contrast(foreground, background) >= 4.5, `${label}: action contrast is insufficient`)
  }
}

const templates = listManifests().filter((manifest) => manifest.features.includes('hospitality'))
assert.equal(templates.length, 6)
for (const manifest of templates) {
  const defaults = templateDefaults[manifest.id]
  assert.ok(defaults.roomTypes[0], `${manifest.id}: missing room type`)
  for (const currency of ['ETB', 'USD']) {
    for (const discount of [0, 20, 12.5, 100]) {
      const room = { ...defaults.roomTypes[0], basePrice: '10000', discountPercent: String(discount), currency }
      const html = renderToStaticMarkup(createElement(RoomPrice, { room, suffix: '/ night', rateHint: true }))
      const current = html.match(/<span data-price-current[^>]*>([^<]*)<\/span>/)?.[1]
      assert.equal(current, new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(10000 * (100 - discount) / 100))
      assert.match(html, /background-color:#ffffff/)
      assert.match(html, /data-price-current[^>]*color:#0f172a;text-decoration:none/)
      assert.equal(html.includes('<del '), discount > 0)
      assert.ok(!html.includes('>Now</span>'))
      assert.ok(!html.includes('Was '))
      if (discount > 0) {
        assert.match(html, /<del data-price-original[^>]*text-decoration:line-through/)
        assert.ok(html.includes(`${discount}% off`))
      }
    }
  }
  for (const palette of [null, '#ffff00', '#888888', '#020617']) {
    const content = {
      ...defaults,
      ...(palette ? { brandPrimary: palette, brandAccent: palette, brandSecondary: palette } : {}),
      roomTypes: [{ ...defaults.roomTypes[0], basePrice: '10000', discountPercent: '20', currency: 'ETB', isActive: true }],
      pageVisibility: { ...defaults.pageVisibility, rooms: true },
    }
    const schemeId = palette ? 'custom' : manifest.defaultColorSchemeId
    for (const path of ['', '/rooms']) {
      const basePath = `/site/${manifest.id}`
      const html = renderToStaticMarkup(createElement(MemoryRouter, { initialEntries: [`${basePath}${path}`] },
        createElement(Routes, null, createElement(Route, {
          path: '/site/:templateId/*',
          element: createElement(SiteApp, { templateId: manifest.id, content, basePath, colorSchemeId: schemeId }),
        })),
      ))
      assert.ok(html.includes('data-room-price'), `${manifest.id}${path}: missing shared price display`)
      assert.match(html, /data-price-current[^>]*color:#0f172a/)
      assert.match(html, /background-color:#ffffff/)
      if (path === '/rooms') checkActions(html, `${manifest.id} live`)
      assert.ok(html.includes(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(8000)))
    }
    const backend = generateBackend(manifest.id, content, schemeId, manifest.defaultLayoutVariantId, [])
    checkActions(backend['resources/views/site/rooms.blade.php'], `${manifest.id} export`)
    for (const view of ['room-detail', 'book']) {
      const html = backend[`resources/views/site/${view}.blade.php`]
      const buttons = html.match(/<button[^>]*>Reserve<\/button>/g) ?? []
      assert.ok(buttons.length, `${manifest.id}/${view}: reserve action missing`)
      for (const button of buttons) {
        const background = button.match(/background-color:(#[a-f0-9]{3,6})/i)?.[1]
        assert.ok(background && contrast('#ffffff', background) >= 4.5, `${manifest.id}/${view}: reserve contrast is insufficient`)
      }
    }
    const partial = backend['resources/views/partials/room-price.blade.php']
    assert.ok(partial, `${manifest.id}: missing exported price partial`)
    assert.match(partial, /data-room-price[^>]*background-color:#ffffff;color:#0f172a/)
    assert.match(partial, /data-price-current[^>]*color:#0f172a;text-decoration:none/)
    assert.match(partial, /<del data-price-original/)
    assert.ok(!partial.includes('>Now</span>'))
    assert.ok(!partial.includes('Was '))
    assert.ok(partial.includes('color:#ffffff;background-color:#b91c1c'))
    assert.ok(!partial.includes('color:{{ $accent }}'))
    for (const view of ['book', 'booking-confirm']) {
      const html = backend[`resources/views/site/${view}.blade.php`]
      assert.ok(html.includes('style="color:#0f172a"'), `${manifest.id}/${view}: total must use neutral price ink`)
    }
  }
}
console.log(`ok: ${templates.length} hospitality templates; regular, discounted, fractional and free rates; ETB/USD; light/dark palettes; live pages and Laravel exports; readable buttons and labels`)
console.log(`Price contrast: ${contrast(ROOM_PRICE_COLORS.amount, ROOM_PRICE_COLORS.background).toFixed(2)}:1`)
