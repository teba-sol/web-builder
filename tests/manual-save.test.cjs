const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { test } = require('node:test')
const ts = require('typescript')

function hooks() {
  const slots = []
  let index = 0
  let effects = []
  const changed = (a, b) => !a || a.some((v, i) => v !== b[i])
  return {
    begin() { index = 0 },
    effects() { const pending = effects; effects = []; pending.forEach((run) => run()) },
    createContext: () => ({ Provider: 'provider' }),
    useContext: () => { throw Error('Unexpected context read') },
    useState(initial) {
      const key = index++
      if (!(key in slots)) slots[key] = typeof initial === 'function' ? initial() : initial
      return [slots[key], (value) => { slots[key] = typeof value === 'function' ? value(slots[key]) : value }]
    },
    useRef(initial) {
      const key = index++
      if (!(key in slots)) slots[key] = { current: initial }
      return slots[key]
    },
    useCallback(fn, deps) {
      const key = index++
      if (!slots[key] || changed(slots[key].deps, deps)) slots[key] = { fn, deps }
      return slots[key].fn
    },
    useEffect(fn, deps) {
      const key = index++
      if (!slots[key] || changed(slots[key].deps, deps)) {
        const previous = slots[key]
        slots[key] = { deps }
        effects.push(() => { previous?.cleanup?.(); slots[key].cleanup = fn() })
      }
    },
  }
}
function load(file, mocks) {
  const source = readFileSync(new URL(`../src/${file}`, `file://${__filename}`), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  })
  const module = { exports: {} }
  new Function('require', 'module', 'exports', outputText)((name) => {
    if (name in mocks) return mocks[name]
    if (name === 'react/jsx-runtime') return require(name)
    throw Error(`Missing mock: ${name}`)
  }, module, module.exports)
  return module.exports
}
const content = { businessName: 'Sample', tagline: 'Original', pageVisibility: {}, sectionVisibility: {} }
function contextHarness() {
  const react = hooks()
  const writes = []
  let fail = false
  const { WebsiteProvider } = load('context/WebsiteContext.tsx', {
    react,
    '../api/projects': { saveProjectDraft: async (...args) => { writes.push(args); if (fail) throw Error('Save failed') } },
    '../data/colorSchemes': { getDefaultColorSchemeId: () => 'blue' },
    '../data/layoutVariants': { getDefaultLayoutVariantId: () => 'classic' },
    '../templates/cloneTheme': { brandColorsFromScheme: () => ({}) },
    '../data/pickTemplate': { CUSTOM_COLOR_SCHEME_ID: 'custom' },
    '../data/defaults': { defaultContent: content, getEditorContent: () => ({ ...content }) },
    '../data/listDefaults': {},
    '../siteDocument/io': { buildSiteDocument: (templateId, content, colorSchemeId, layoutVariantId) => ({ templateId, content, colorSchemeId, layoutVariantId }) },
    '../utils/linkResolver': { sanitizeContentLinks: (value) => value },
    '../utils/migrateContent': { migrateContent: (value) => value },
    '../utils/storage': { loadSavedSite: () => null, saveSite() {}, clearSavedSite() {}, clearPreviewSite() {} },
  })
  return {
    writes,
    fail(value) { fail = value },
    render() { react.begin(); const tree = WebsiteProvider({ children: null }); react.effects(); return tree.props.value },
  }
}
test('opening and editing never save automatically; clearing Business Name remains an edit', () => {
  const h = contextHarness()
  h.render().selectTemplate('business')
  let value = h.render()
  assert.equal(value.hasUnsavedChanges, false)
  value.updateContent({ businessName: '', tagline: 'Edited' })
  value = h.render()
  assert.equal(value.content.businessName, '')
  assert.equal(value.content.tagline, 'Edited')
  assert.equal(value.hasUnsavedChanges, true)
  assert.deepEqual(h.writes, [])
  value.discardChanges()
  value = h.render()
  assert.equal(value.hasUnsavedChanges, false)
  assert.equal(value.content.tagline, 'Original')
})
test('failed manual save preserves dirty content, retry saves it and clears dirty state', async () => {
  const h = contextHarness()
  h.render().selectTemplate('business')
  h.render().bindProject({ id: 'p1', templateId: 'business', canCloudSave: true, canEdit: true })
  h.render().updateContent({ tagline: 'Keep this' })
  h.fail(true)
  await assert.rejects(h.render().persistNow(), /Save failed/)
  assert.equal(h.render().hasUnsavedChanges, true)
  assert.equal(h.render().content.tagline, 'Keep this')
  h.fail(false)
  await h.render().persistNow()
  assert.equal(h.render().hasUnsavedChanges, false)
  assert.equal(h.writes[1][0], 'p1')
  assert.equal(h.writes[1][1].document.content.tagline, 'Keep this')
})
test('changes made during a save stay dirty and are not overwritten', async () => {
  const h = contextHarness()
  h.render().selectTemplate('business')
  h.render().bindProject({ id: 'p1', templateId: 'business', canCloudSave: true, canEdit: true })
  h.render().updateContent({ tagline: 'First edit' })
  const saving = h.render().persistNow()
  h.render().updateContent({ tagline: 'Newer edit' })
  await saving
  assert.equal(h.render().content.tagline, 'Newer edit')
  assert.equal(h.render().hasUnsavedChanges, true)
})
test('unpaid manual save is rejected without a PUT', async () => {
  const h = contextHarness()
  h.render().selectTemplate('business')
  h.render().bindProject({ id: 'p1', templateId: 'business', canCloudSave: false, canEdit: true })
  h.render().updateContent({ tagline: 'Unpaid edit' })
  await assert.rejects(h.render().persistNow(), /locked/)
  assert.equal(h.render().hasUnsavedChanges, true)
  assert.deepEqual(h.writes, [])
})
function elements(tree) {
  if (!tree || typeof tree !== 'object') return []
  return [tree, ...[tree.props?.children].flat(Infinity).flatMap(elements)]
}
function editorHarness({ canCloudSave = true, failedSave = false, subPath = '', query = '', loadProject, role = 'CONSUMER', reviewTarget = null } = {}) {
  const react = hooks()
  let creates = 0
  let saves = 0
  let proceeded = false
  let fail = failedSave
  let shouldBlock
  const listeners = new Map()
  const params = new URLSearchParams(query)
  let currentPath = `/editor/business${subPath ? `/${subPath}` : ''}`
  const blocker = { state: 'unblocked', proceed() { proceeded = true }, reset() { this.state = 'unblocked' } }
  const value = {
    templateId: 'business', content: { ...content }, colorSchemeId: 'blue', layoutVariantId: 'classic',
    projectId: null, canEdit: true, canCloudSave: false, canExport: false, hasUnsavedChanges: false,
    clearProject() {}, selectTemplate() {}, discardChanges() {}, markProjectPaid() {},
    bindProject(project) { value.projectId = project.id; value.canCloudSave = project.canCloudSave },
    async persistNow() { saves++; if (fail) throw Error('Save failed'); value.hasUnsavedChanges = false },
  }
  const user = { id: 'user', role }
  const navigate = (path) => { currentPath = path.split('?')[0]; subPath = currentPath.replace('/editor/business', '').replace(/^\//, ''); const next = new URLSearchParams(path.split('?')[1]); for (const key of [...params.keys()]) params.delete(key); next.forEach((value, key) => params.set(key, value)) }
  const Link = () => null
  const { EditorPage } = load('pages/EditorPage.tsx', {
    react,
    'react-router-dom': { Link, useNavigate: () => navigate, useParams: () => ({ templateId: 'business', '*': subPath }), useSearchParams: () => [params], useBlocker: (check) => { shouldBlock = check; return blocker } },
    'lucide-react': { Lock: Link, Save: Link, PanelLeftClose: Link, PanelLeftOpen: Link, Monitor: Link, Smartphone: Link, Tablet: Link, Maximize2: Link },
    sonner: { toast: { success() {}, error() {} } },
    '../auth/openReviewPreview': { openReviewPreview: async () => {} },
    '../auth/reviewSession': { readReviewSession: () => reviewTarget, reviewPortalUrl: () => 'http://localhost:5174' },
    '../api/projects': { listProjects: async () => ({ items: [] }), getProject: loadProject ?? (async (id) => ({ id, canCloudSave, canEdit: true })), createProject: async () => { creates++; return { id: 'p1', canCloudSave } } },
    '../auth/AuthContext': { useAuth: () => ({ user }) },
    '../auth/builderSession': { rememberProjectId() {} },
    '../context/WebsiteContext': { useWebsite: () => value },
    '../components/ContentForm': { ContentForm: Link },
    '../components/DevicePreviewFrame': { DevicePreviewFrame: function DevicePreviewFrame() {} },
    '../components/DownloadButton': { DownloadButton: Link },
    '../components/PaywallModal': { PaywallModal: Link },
    '../components/UnsavedChangesDialog': { UnsavedChangesDialog: function UnsavedChangesDialog() {} },
    '../templates/TemplateRenderer': { TemplateRenderer: function TemplateRenderer() {} },
    '../data/defaults': { getTemplateMeta: () => ({ name: 'Business' }) },
    '../data/pickTemplate': { appearanceFromSearchParams: () => null },
    '../data/templateIds': { isValidTemplateId: () => true },
    '../utils/storage': { savePreviewSite() {} },
    '../hooks/useHospitalityTemplateGuard': { useHospitalityTemplateGuard: () => false },
  })
  global.window = { addEventListener(name, fn) { listeners.set(name, fn) }, removeEventListener(name) { listeners.delete(name) } }
  function render() { react.begin(); const tree = EditorPage(); react.effects(); return tree }
  return {
    render, value, blocker, listeners, navigateTo: navigate, location: () => `${currentPath}${params.size ? `?${params}` : ''}`, shouldBlock: (nextPath, nextSearch = params.toString() ? `?${params}` : '') => shouldBlock({ currentLocation: { pathname: '/editor/business', search: params.toString() ? `?${params}` : '' }, nextLocation: { pathname: nextPath, search: nextSearch } }), counts: () => ({ creates, saves, proceeded }), retry() { fail = false },
    save() { const button = elements(render()).find((element) => element.type === 'button' && typeof element.props.children?.[1] === 'string' && element.props.children[1].startsWith('Save')); return button.props.onClick() },
    async ready() { render(); await Promise.resolve(); render() },
  }
}
test('template open and edits create nothing; explicit Save creates and saves once', async () => {
  const h = editorHarness()
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.value.content.tagline = 'Manual edit'
  h.render()
  assert.deepEqual(h.counts(), { creates: 0, saves: 0, proceeded: false })
  h.save()
  await new Promise(setImmediate)
  assert.deepEqual(h.counts(), { creates: 1, saves: 1, proceeded: false })
})
test('retry after successful creation and failed PUT reuses the same project', async () => {
  const h = editorHarness({ failedSave: true })
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.save()
  await new Promise(setImmediate)
  assert.equal(h.value.projectId, 'p1')
  assert.equal(h.value.hasUnsavedChanges, true)
  h.retry()
  h.save()
  await new Promise(setImmediate)
  assert.deepEqual(h.counts(), { creates: 1, saves: 2, proceeded: false })
})
test('Save and leave proceeds only after success; failure keeps changes and stays', async () => {
  const h = editorHarness({ failedSave: true })
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.blocker.state = 'blocked'
  let dialog = elements(h.render()).find((element) => element.type.name === 'UnsavedChangesDialog')
  dialog.props.onSave()
  await new Promise(setImmediate)
  assert.equal(h.counts().proceeded, false)
  assert.equal(h.value.hasUnsavedChanges, true)
  h.retry()
  dialog = elements(h.render()).find((element) => element.type.name === 'UnsavedChangesDialog')
  dialog.props.onSave()
  await new Promise(setImmediate)
  assert.deepEqual(h.counts(), { creates: 1, saves: 2, proceeded: true })
})

test('unpaid Save creates only the checkout project and never saves its document', async () => {
  const h = editorHarness({ canCloudSave: false })
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.save()
  await new Promise(setImmediate)
  assert.deepEqual(h.counts(), { creates: 1, saves: 0, proceeded: false })
  assert.equal(h.value.hasUnsavedChanges, true)
  h.save()
  await new Promise(setImmediate)
  assert.deepEqual(h.counts(), { creates: 1, saves: 0, proceeded: false })
})
test('dirty navigation blocks exits and project switches, permits editor pages, and warns on reload', async () => {
  const h = editorHarness()
  await h.ready()
  assert.equal(h.shouldBlock('/'), false)
  h.value.hasUnsavedChanges = true
  h.render()
  assert.equal(h.shouldBlock('/'), true)
  assert.equal(h.shouldBlock('/editor/business', '?project=other'), true)
  assert.equal(h.shouldBlock('/editor/business/contact'), false)
  assert.equal(h.shouldBlock('/preview/business'), true)
  let prevented = false
  const event = { preventDefault() { prevented = true } }
  h.listeners.get('beforeunload')(event)
  assert.equal(prevented, true)
  assert.equal(event.returnValue, '')
  h.value.hasUnsavedChanges = false
  h.render()
  assert.equal(h.listeners.has('beforeunload'), false)
})
test('Keep editing cancels departure; Discard leaves without saving', async () => {
  const h = editorHarness()
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.blocker.state = 'blocked'
  let dialog = elements(h.render()).find((element) => element.type.name === 'UnsavedChangesDialog')
  dialog.props.onStay()
  assert.equal(h.blocker.state, 'unblocked')
  h.blocker.state = 'blocked'
  dialog = elements(h.render()).find((element) => element.type.name === 'UnsavedChangesDialog')
  dialog.props.onDiscard()
  assert.deepEqual(h.counts(), { creates: 0, saves: 0, proceeded: true })
})

test('subpage navigation restores project and view mode without creating a project', async () => {
  const h = editorHarness({ query: 'project=p1&mode=view' })
  await h.ready()
  h.navigateTo('/editor/business/gallery')
  const tree = h.render()
  assert.equal(h.location(), '/editor/business/gallery?project=p1&mode=view')
  assert.ok(elements(tree).some((element) => element.props?.children === 'Viewing'))
  assert.equal(h.counts().creates, 0)
})
test('project preview waits for loaded content before mounting page visibility guards', async () => {
  let finish
  const pending = new Promise((resolve) => { finish = resolve })
  const h = editorHarness({ subPath: 'gallery', query: 'project=p1', loadProject: () => pending })
  let tree = h.render()
  assert.equal(elements(tree).some((element) => element.type?.name === 'TemplateRenderer'), false)
  finish({ id: 'p1', canCloudSave: true, canEdit: true })
  await new Promise(setImmediate)
  tree = h.render()
  assert.ok(elements(tree).some((element) => element.type?.name === 'TemplateRenderer'))
  assert.equal(h.location(), '/editor/business/gallery?project=p1')
})
test('saving a new project keeps the current subpage', async () => {
  const h = editorHarness({ subPath: 'gallery' })
  await h.ready()
  h.value.hasUnsavedChanges = true
  h.save()
  await new Promise(setImmediate)
  h.render()
  assert.equal(h.location(), '/editor/business/gallery?project=p1')
  assert.deepEqual(h.counts(), { creates: 1, saves: 1, proceeded: false })
})

test('agency handoff stays read-only even when the project response allows editing', async () => {
  const h = editorHarness({ role: 'AGENCY_ADMIN', query: 'project=p1&mode=edit', reviewTarget: { projectId: 'p1' } })
  await h.ready()
  h.value.canEdit = true
  h.value.canCloudSave = true
  const tree = h.render()
  assert.ok(elements(tree).some((element) => element.props?.children === 'Viewing'))
  assert.equal(elements(tree).some((element) => element.type?.name === 'ContentForm'), false)
  assert.equal(h.counts().creates, 0)
})
