const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { posix } = require('node:path')
const { beforeEach, test } = require('node:test')
const ts = require('typescript')

const cache = new Map()
function load(name) {
  if (cache.has(name)) return cache.get(name).exports
  const source = readFileSync(`${__dirname}/../src/${name}.ts`, 'utf8').replaceAll('import.meta.env', '({})')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  })
  const module = { exports: {} }
  cache.set(name, module)
  new Function('require', 'exports', 'module', outputText)((relative) => load(posix.normalize(posix.join(posix.dirname(name), relative))), module.exports, module)
  return module.exports
}
function storage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
  }
}
const review = load('auth/reviewSession')
const client = load('api/client')
const auth = load('api/auth')
const target = review.parseReviewTarget('/editor/hotel/rooms?project=p1&mode=view')
const user = { id: 'admin', role: 'AGENCY_ADMIN', status: 'ACTIVE' }
const session = (profile = user) => ({ user: profile, accessToken: 'review-access', refreshToken: 'review-refresh' })
beforeEach(() => {
  global.localStorage = storage()
  global.sessionStorage = storage()
  client.storeTokens('personal-access', 'personal-refresh')
  global.fetch = async () => { throw Error('Unexpected request') }
})

test('agency and platform handoffs use tab storage and preserve the personal builder session', async () => {
  for (const role of ['AGENCY_ADMIN', 'PLATFORM_ADMIN']) {
    global.fetch = async (path, init) => {
      assert.equal(path, '/api/v1/auth/handoff/consume')
      assert.deepEqual(JSON.parse(init.body), { code: 'one-time-code' })
      return Response.json(session({ ...user, role }))
    }
    await auth.consumeHandoff('one-time-code', target)
    assert.equal(review.readReviewSession().projectId, 'p1')
    assert.equal(client.getAccessToken(), 'review-access')
    assert.equal(client.getRefreshToken(), null)
    assert.equal(localStorage.getItem('buildoura.accessToken'), 'personal-access')
    assert.equal(localStorage.getItem('buildoura.refreshToken'), 'personal-refresh')
  }
})
test('ordinary builder login still rejects agency and platform accounts', async () => {
  for (const role of ['AGENCY_ADMIN', 'PLATFORM_ADMIN']) {
    global.fetch = async () => Response.json(session({ ...user, role }))
    await assert.rejects(auth.login('admin@example.com', 'password'), { code: 'BUILDER_ACCOUNT_NOT_ALLOWED' })
    assert.equal(review.readReviewSession(), null)
  }
})
test('ordinary consumer and salesperson login still works', async () => {
  for (const role of ['CONSUMER', 'SALESPERSON']) {
    global.fetch = async () => Response.json({ ...session({ ...user, role }), accessToken: 'normal-access' })
    await auth.login('user@example.com', 'password')
    assert.equal(client.getAccessToken(), 'normal-access')
    assert.equal(review.readReviewSession(), null)
  }
})
test('refreshing a review tab accepts its own admin profile', async () => {
  review.storeReviewSession('review-access', user, target)
  global.fetch = async (path, init) => {
    assert.equal(path, '/api/v1/me')
    assert.equal(init.headers.get('Authorization'), 'Bearer review-access')
    return Response.json({ user })
  }
  assert.equal((await auth.fetchMe()).user.id, user.id)
})
test('a review session cannot accept a different account', async () => {
  review.storeReviewSession('review-access', user, target)
  global.fetch = async () => Response.json({ user: { ...user, id: 'different-admin' } })
  await assert.rejects(auth.fetchMe(), { code: 'REVIEW_SESSION_INVALID' })
  assert.equal(client.getAccessToken(), '')
  assert.equal(localStorage.getItem('buildoura.accessToken'), 'personal-access')
})
test('an expired review never refreshes or falls back to the personal account', async () => {
  review.storeReviewSession('review-access', user, target)
  const requests = []
  global.fetch = async (path) => { requests.push(path); return Response.json({ code: 'UNAUTHORIZED' }, { status: 401 }) }
  await assert.rejects(client.apiFetch('/api/v1/projects/p1'), { code: 'UNAUTHORIZED' })
  assert.deepEqual(requests, ['/api/v1/projects/p1'])
  client.clearTokens()
  assert.equal(client.getAccessToken(), '')
  assert.equal(localStorage.getItem('buildoura.accessToken'), 'personal-access')
})
test('leaving a review does not revoke or remove the personal builder session', async () => {
  review.storeReviewSession('review-access', user, target)
  await auth.logout()
  assert.equal(review.readReviewSession(), null)
  assert.equal(client.getAccessToken(), 'personal-access')
})
test('review links require a local project target and always request view mode', () => {
  for (const path of ['https://evil.test/editor/hotel?project=p1', '//evil.test/editor/hotel?project=p1', '/\\evil.test', '/account', '/editor/hotel']) {
    assert.throws(() => review.parseReviewTarget(path))
  }
  assert.equal(review.parseReviewTarget('/editor/hotel/rooms?project=p1&mode=edit').path, '/editor/hotel/rooms?project=p1&mode=view')
  assert.equal(review.parseReviewTarget('/site/hotel/rooms?project=p1&chromeless=true').templateId, 'hotel')
})
test('a review can browse its site but cannot switch projects, templates, or workspaces', () => {
  assert.equal(review.reviewAllowsLocation(target, '/editor/hotel/rooms', ''), true)
  assert.equal(review.reviewAllowsLocation(target, '/site/hotel/rooms', '?chromeless=true'), true)
  assert.equal(review.reviewAllowsLocation(target, '/editor/hotel', '?project=p2'), false)
  assert.equal(review.reviewAllowsLocation(target, '/editor/coastal', '?project=p1'), false)
  assert.equal(review.reviewAllowsLocation(target, '/editor/hotelevil', '?project=p1'), false)
  assert.equal(review.reviewAllowsLocation(target, '/new-site', ''), false)
  assert.equal(review.reviewAllowsLocation(target, '/', ''), false)
})

function componentHarness(name, dependencies) {
  const slots = []
  let index = 0
  let effects = []
  const react = {
    createContext: () => ({ Provider: 'provider' }),
    useContext: () => null,
    useState(initial) {
      const key = index++
      if (!(key in slots)) slots[key] = initial
      return [slots[key], (next) => { slots[key] = next }]
    },
    useRef(initial) { return slots[index++] ??= { current: initial } },
    useMemo(fn) { return fn() },
    useCallback(fn) { return fn },
    useEffect(fn) { const key = index++; if (!(key in slots)) { slots[key] = true; effects.push(fn) } },
  }
  const source = readFileSync(`${__dirname}/../src/${name}.tsx`, 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  })
  const module = { exports: {} }
  new Function('require', 'exports', 'module', outputText)((name) => {
    if (name === 'react') return react
    if (name === 'react/jsx-runtime') return require(name)
    if (name in dependencies) return dependencies[name]
    throw Error(`Unexpected dependency ${name}`)
  }, module.exports, module)
  return {
    render(exportName, props = {}) { index = 0; return module.exports[exportName](props) },
    effects() { const pending = effects; effects = []; return pending },
  }
}

test('Strict Mode effect replay consumes a one-time handoff only once', async () => {
  let finish
  let calls = 0
  const pending = new Promise((resolve) => { finish = resolve })
  const navigations = []
  const harness = componentHarness('pages/HandoffPage', {
    'react-router-dom': { useNavigate: () => (...args) => navigations.push(args), useSearchParams: () => [new URLSearchParams('code=one-time&next=%2Feditor%2Fhotel%3Fproject%3Dp1')] },
    '../api/types': load('api/types'),
    '../auth/AuthContext': { useAuth: () => ({ completeHandoff: () => { calls++; return pending } }) },
    '../auth/reviewSession': review,
  })
  harness.render('HandoffPage')
  const effect = harness.effects()[0]
  const cleanup = effect()
  cleanup()
  effect()
  assert.equal(calls, 1)
  finish()
  await new Promise(setImmediate)
  assert.equal(navigations.length, 1)
  assert.equal(navigations[0][0], '/editor/hotel?project=p1&mode=view')
})

test('a delayed personal profile cannot replace an established admin handoff', async () => {
  for (const startProfileFirst of [true, false]) {
    let finishProfile
    let finishHandoff
    const profile = new Promise((resolve) => { finishProfile = resolve })
    const handoff = new Promise((resolve) => { finishHandoff = resolve })
    const harness = componentHarness('auth/AuthContext', {
      '../api/auth': { fetchMe: () => profile, consumeHandoff: () => handoff },
      '../api/client': { getAccessToken: () => 'personal-access', clearTokens: () => assert.fail('A stale request must not clear tokens') },
      '../api/types': load('api/types'),
    })
    let value = harness.render('AuthProvider').props.value
    const effect = harness.effects()[0]
    if (startProfileFirst) effect()
    const completing = value.completeHandoff('code', target)
    if (!startProfileFirst) effect()
    finishHandoff(session())
    await completing
    finishProfile({ user: { id: 'personal-user', role: 'CONSUMER' } })
    await new Promise(setImmediate)
    value = harness.render('AuthProvider').props.value
    assert.equal(value.user.id, user.id)
    assert.equal(value.loading, false)
  }
})

function fullscreenHarness(request) {
  return componentHarness('pages/SiteViewPage', {
    'react-router-dom': { Link: () => null, useNavigate: () => () => assert.fail('A review must not redirect before its project loads'), useParams: () => ({ templateId: 'hotel', '*': 'rooms' }), useSearchParams: () => [new URLSearchParams('project=p1&chromeless=true')] },
    sonner: { toast: { error() {} } },
    '../auth/openReviewPreview': { openReviewPreview: async () => {} },
    '../api/projects': { getProject: (id) => { assert.equal(id, 'p1'); return request() } },
    '../auth/reviewSession': { ...review, readReviewSession: () => ({ ...target, role: 'AGENCY_ADMIN' }) },
    '../data/defaults': { getTemplateDefaults: () => ({ businessName: 'Template default' }) },
    '../data/templateIds': { isValidTemplateId: () => true },
    '../hooks/useHospitalityTemplateGuard': { useHospitalityTemplateGuard: () => false },
    '../templates/TemplateRenderer': { TemplateRenderer: function TemplateRenderer() {} },
    '../utils/migrateContent': { migrateContent: (content) => content },
    '../utils/storage': { loadSavedSite: () => ({ templateId: 'hotel', content: { businessName: 'Personal draft' } }), loadPreviewSite: () => null },
  })
}

test('fullscreen review loads its selected project instead of a personal local draft', async () => {
  let finish
  const pending = new Promise((resolve) => { finish = resolve })
  const harness = fullscreenHarness(() => pending)
  let tree = harness.render('SiteViewPage')
  assert.notEqual(tree.type?.name, 'TemplateRenderer')
  harness.effects().forEach((effect) => effect())
  finish({ id: 'p1', templateId: 'hotel', document: { content: { businessName: 'Agency website' }, colorSchemeId: 'gold', layoutVariantId: 'modern' } })
  await new Promise(setImmediate)
  tree = harness.render('SiteViewPage')
  assert.equal(tree.type.name, 'TemplateRenderer')
  assert.equal(tree.props.content.businessName, 'Agency website')
  assert.equal(tree.props.layoutVariantId, 'modern')
})

test('denied fullscreen project access never falls back to personal content', async () => {
  const harness = fullscreenHarness(async () => { throw Error('You do not have access to this project') })
  harness.render('SiteViewPage')
  harness.effects().forEach((effect) => effect())
  await new Promise(setImmediate)
  const tree = harness.render('SiteViewPage')
  assert.notEqual(tree.type?.name, 'TemplateRenderer')
  assert.ok(JSON.stringify(tree).includes('You do not have access to this project'))
  assert.ok(!JSON.stringify(tree).includes('Personal draft'))
})
