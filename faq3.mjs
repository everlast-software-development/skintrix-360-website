import { chromium } from 'playwright-core'
const SP = process.argv[2]
const b = await chromium.launch({ channel: 'chrome' })
const errs = []
for (const [w, h, tag] of [[1440, 950, 'd'], [390, 844, 'm']]) {
  const p = await b.newPage({ viewport: { width: w, height: h } })
  p.on('console', m => { if (m.type() === 'error') errs.push(tag + ': ' + m.text()) })
  p.on('pageerror', e => errs.push(tag + ' PAGEERROR ' + e.message))
  await p.goto('http://localhost:5175/', { waitUntil: 'networkidle' })
  await p.evaluate(() => document.querySelector('#faq').scrollIntoView())
  await p.waitForTimeout(2200)
  const info = await p.evaluate(() => {
    const s = document.querySelector('#faq')
    const r = s.getBoundingClientRect()
    const btns = [...s.querySelectorAll('button')]
    const av = s.querySelector('img[src="/image-2.webp"]')
    const qb = btns[0].getBoundingClientRect()
    const ab = s.querySelector('[role="region"]')?.querySelector('div > div:last-child')?.getBoundingClientRect()
    return {
      y: r.top + window.scrollY, h: r.height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      expanded: btns.map(x => x.getAttribute('aria-expanded')),
      openPanels: s.querySelectorAll('[role="region"]').length,
      userAvatar: av ? { nw: av.naturalWidth, loaded: av.complete && av.naturalWidth > 0 } : null,
      brandSvgs: s.querySelectorAll('svg circle').length,
      qRight: Math.round(qb.right), aLeft: ab ? Math.round(ab.left) : null,
      shellRight: Math.round(s.querySelector('.shell').getBoundingClientRect().right),
    }
  })
  console.log(tag, JSON.stringify(info))
  await p.screenshot({ path: `${SP}/FAQ3-${tag}.png`, fullPage: true, clip: { x: 0, y: info.y, width: w, height: Math.min(info.h, 4000) } })
  if (tag === 'd') {
    await p.locator('#faq button').nth(2).click(); await p.waitForTimeout(900)
    console.log('click3', JSON.stringify(await p.evaluate(() => {
      const s=document.querySelector('#faq')
      return { expanded:[...s.querySelectorAll('button')].map(x=>x.getAttribute('aria-expanded')), open:s.querySelectorAll('[role="region"]').length }
    })))
    await p.screenshot({ path: `${SP}/FAQ3-d-open3.png`, fullPage: true, clip: { x: 0, y: info.y, width: w, height: Math.min(info.h, 4000) } })
  }
  await p.close()
}
console.log('CONSOLE ERRORS:', errs.length ? errs : 'none')
await b.close()
