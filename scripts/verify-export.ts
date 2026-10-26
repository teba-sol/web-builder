/**
 * Prove preview data + ZIP generators still work after the catalog migration.
 * Run: npx vite-node scripts/verify-export.ts
 */
import { listManifests, requireManifest, templateHasFeature } from '../src/catalog/catalog.ts'
import { parseTemplateJson, stringifyManifest } from '../src/catalog/io.ts'
import { buildSiteDocument, parseSiteDocument, stringifySiteDocument } from '../src/siteDocument/io.ts'
import { templateDefaults } from '../src/data/defaults.ts'
import { generateBackend } from '../src/export/backend/generateBackend.ts'
import { hasBookingFeature } from '../src/export/backend/generateBooking.ts'
import { usesBuildauraCrs } from '../src/export/backend/generateCrsBooking.ts'
import { buildAllSitePages } from '../src/export/buildSitePages.ts'
import { clonePaletteCss, isCloneTemplate, resolveClonePalette } from '../src/templates/cloneTheme.ts'

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message)
}

const manifests = listManifests()
assert(manifests.length === 28, `expected 28 templates, got ${manifests.length}`)
assert(!manifests.some((manifest) => manifest.id === 'desert' || manifest.id === 'nordic'), 'removed lodge templates must stay out of the catalog')
const gluedBlade = /[A-Za-z0-9_]@(?:elseif|endif|endforeach|endforelse|endempty|endunless|endisset|endfor|endwhile|endswitch|endphp|enderror|endauth|endguest|endonce|endpush|endverbatim|endslot|endcomponent|endsection|if|else|foreach|forelse|empty|unless|isset|for|while|switch|php|checked|selected|disabled|include|section|extends|csrf|method|error|auth|guest|once|push|verbatim|aware|json|class|style|props|slot|component)\b/g
const gluedHits: string[] = []

for (const manifest of manifests) {
  const defaults = templateDefaults[manifest.id]
  assert(defaults?.businessName, `${manifest.id}: missing defaults`)
  const { pages, assets } = buildAllSitePages(manifest.id, defaults)
  assert(pages['index.html']?.includes('<!'), `${manifest.id}: missing index.html`)
  assert(
    pages['index.html']?.includes('<header') || pages['index.html']?.includes('<nav'),
    `${manifest.id}: home page missing header/nav`,
  )
  assert(assets.length >= 0, `${manifest.id}: assets failed`)

  const backend = generateBackend(
    manifest.id,
    defaults,
    manifest.defaultColorSchemeId,
    manifest.defaultLayoutVariantId,
    assets,
  )
  assert(backend['composer.json'], `${manifest.id}: missing composer.json`)
  const composer = JSON.parse(backend['composer.json'] ?? '{}') as {
    config?: { policy?: { advisories?: { block?: boolean } } }
  }
  assert(composer.config?.policy?.advisories?.block === false, `${manifest.id}: composer must install Laravel 11 when Packagist flags advisories`)
  assert(backend['.env.example']?.includes('DB_CONNECTION=sqlite'), `${manifest.id}: export uses SQLite`)
  assert(!backend['.env.example']?.includes('DB_CONNECTION=mysql'), `${manifest.id}: export does not default to MySQL`)
  assert(backend['config/database.php']?.includes("env('DB_CONNECTION', 'sqlite')"), `${manifest.id}: database config defaults to SQLite`)
  assert(backend['setup.sh']?.includes('touch database/database.sqlite'), `${manifest.id}: setup creates the SQLite file`)
  assert(!backend['setup.sh']?.includes('mysql'), `${manifest.id}: setup does not ask for MySQL`)
  assert(backend['app/Services/DoctorService.php']?.includes('ensureSqliteDatabase'), `${manifest.id}: site doctor creates the SQLite file`)
  assert(backend['app/Providers/Filament/AdminPanelProvider.php'], `${manifest.id}: missing Filament provider`)
  assert(backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('darkMode(false)'), `${manifest.id}: admin panel stays on the white theme`)
  assert(backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('Color::Zinc'), `${manifest.id}: admin panel uses the plain light palette`)
  assert(!backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('Color::Indigo'), `${manifest.id}: admin panel does not keep the old brand color`)
  for (const [path, source] of Object.entries(backend)) {
    if (!path.endsWith('.blade.php') || typeof source !== 'string') continue
    const glued = source.match(gluedBlade)
    if (glued) gluedHits.push(`${manifest.id}: ${path} glues a Blade directive to a word (${[...new Set(glued)].join(', ')})`)
  }

  const hospitality = templateHasFeature(manifest.id, 'hospitality')
  if (hospitality && usesBuildauraCrs(manifest.id)) {
    assert(defaults.pageVisibility.rooms, `${manifest.id}: hospitality template should enable rooms`)
    assert(defaults.roomTypes.length > 0, `${manifest.id}: hospitality template should seed rooms`)
    assert(hasBookingFeature(defaults), `${manifest.id}: booking feature should be on`)
    assert(backend['app/Services/BuildauraClient.php'], `${manifest.id}: missing Buildaura client`)
    assert(!backend['app/Services/CrsClient.php'], `${manifest.id}: hotel export should not emit the other CRS client`)
    assert(!backend['app/Models/RoomType.php'], `${manifest.id}: inventory must live in BuildAura, not a local RoomType`)
    assert(backend['app/Http/Controllers/BookingController.php'], `${manifest.id}: missing BookingController`)
    assert(backend['app/Http/Controllers/PropertyController.php']?.includes('function updateType'), `${manifest.id}: room type edit must reach Buildaura`)
    assert(backend['app/Http/Controllers/PropertyController.php']?.includes('function deleteType'), `${manifest.id}: room type delete must reach Buildaura`)
    assert(backend['app/Http/Controllers/PropertyController.php']?.includes('function updateUnit'), `${manifest.id}: room edit must reach Buildaura`)
    assert(backend['app/Http/Controllers/PropertyController.php']?.includes('function deleteUnit'), `${manifest.id}: room delete must reach Buildaura`)
    assert(backend['app/Services/BuildauraClient.php']?.includes('function updateUnit'), `${manifest.id}: Buildaura client must patch rooms`)
    assert(backend['routes/web.php']?.includes("name('units.update')"), `${manifest.id}: room update route is missing`)
    assert(backend['routes/web.php']?.includes("name('types.delete')"), `${manifest.id}: room type delete route is missing`)
    assert(backend['routes/web.php']?.includes("name('login')"), `${manifest.id}: property forms need a login route`)
    const typeAdmin = backend['resources/views/filament/pages/room-types.blade.php'] ?? ''
    const roomAdmin = backend['resources/views/filament/pages/rooms.blade.php'] ?? ''
    assert(typeAdmin.includes('editTypeAction'), `${manifest.id}: room type edit must render a Filament action`)
    assert(typeAdmin.includes('deleteTypeAction'), `${manifest.id}: room type delete must render a Filament action`)
    assert(typeAdmin.includes('width:72px'), `${manifest.id}: room type table must size the photo itself`)
    assert(!typeAdmin.includes('<details'), `${manifest.id}: room type edit must not be a dropdown`)
    assert(!typeAdmin.includes('<summary'), `${manifest.id}: room type edit must not be a dropdown`)
    assert(!typeAdmin.includes('wire:ignore'), `${manifest.id}: room type filters must not sit inside a save form`)
    assert(!typeAdmin.includes('wire:click="mountAction'), `${manifest.id}: room type row buttons must not hand-build mountAction`)
    assert(typeAdmin.includes('filters.search'), `${manifest.id}: room types must be searchable`)
    assert(!typeAdmin.includes('filters.parent'), `${manifest.id}: room types have no parent type filter`)
    assert(typeAdmin.includes('filters.active'), `${manifest.id}: room types keep an active filter`)
    assert(typeAdmin.includes('grid-template-columns:repeat(4,minmax(0,1fr))'), `${manifest.id}: room type filters align with the clear button`)
    assert(typeAdmin.includes('Ad '), `${manifest.id}: room type rows show adults and children`)
    assert(typeAdmin.includes('>Rooms<'), `${manifest.id}: room type rows show the room count`)
    assert(typeAdmin.includes('x-filament::input'), `${manifest.id}: room type filters use Filament inputs`)
    assert(typeAdmin.includes('clearTypeFilters'), `${manifest.id}: room type filters can be cleared`)
    assert(!typeAdmin.includes('All hotels'), `${manifest.id}: room types have no hotel filter`)
    assert(!typeAdmin.includes('typeHotel'), `${manifest.id}: room types have no hotel filter field`)
    const typePage = backend['app/Filament/Pages/RoomTypes.php'] ?? ''
    assert(typePage.includes("navigationGroup = 'Hospitality'"), `${manifest.id}: room types sit under Hospitality`)
    assert(!typePage.includes("navigationGroup = 'Property'"), `${manifest.id}: room types do not use a separate Property group`)
    assert(!typePage.includes('function filterParentOptions'), `${manifest.id}: room types have no parent type filter`)
    assert(!typePage.includes('parentId'), `${manifest.id}: room types have no parent type`)
    assert(!typePage.includes('maxOccupancy'), `${manifest.id}: room types have no max occupancy`)
    assert(typePage.includes('discountPercent'), `${manifest.id}: room types store a discount percent`)
    assert(typePage.includes('freeCancellation'), `${manifest.id}: room types toggle free cancellation`)
    assert(typePage.includes('freeBreakfast'), `${manifest.id}: room types toggle included breakfast`)
    assert(typePage.includes("Fieldset::make('Room amenities')"), `${manifest.id}: room type amenities are ticked from the catalog`)
    assert(typePage.includes("Checkbox::make('amenityFlags."), `${manifest.id}: each room amenity has its own checkbox`)
    assert(!typePage.includes("CheckboxList::make('amenities')"), `${manifest.id}: room amenities do not share one checkbox list`)
    assert(typePage.includes("Select::make('currency')->options(['ETB' => 'ETB', 'USD' => 'USD'])"), `${manifest.id}: room type currency is ETB or USD`)
    assert(!typePage.includes("TextInput::make('currency')"), `${manifest.id}: room type currency is not free text`)
    assert(typePage.includes('function visibleTypes'), `${manifest.id}: room types must filter the BuildAura list`)
    assert(!typePage.includes('typeHotel'), `${manifest.id}: room type page must not filter by hotel`)
    assert(!typePage.includes('filterForm'), `${manifest.id}: room type filters stay in the page view`)
    assert(typePage.includes("FileUpload::make('newPhotos')"), `${manifest.id}: room type edit must upload photos`)
    assert(typePage.includes('->multiple()'), `${manifest.id}: room types accept more than one photo`)
    assert(!typePage.includes('clearImage'), `${manifest.id}: room types do not use a remove-photo toggle`)
    assert(typePage.includes('imageEditor()'), `${manifest.id}: room photos use the image editor`)
    assert(!typePage.includes("TextInput::make('sortOrder')"), `${manifest.id}: room type form hides the sort number`)
    assert(typePage.includes("collect($this->inventory()['roomTypes']"), `${manifest.id}: new room types append to the sort order`)
    assert(typePage.includes('maxSize(5120)'), `${manifest.id}: room photos must allow 5 MB`)
    assert(typePage.includes('editTypeAction'), `${manifest.id}: room type edit opens in a slide-over`)
    assert(backend['app/Services/BuildauraClient.php']?.includes('function uploadImage'), `${manifest.id}: room photos must upload to Buildaura`)
    assert(roomAdmin.includes('editUnitAction'), `${manifest.id}: room edit must render a Filament action`)
    assert(roomAdmin.includes('deleteUnitAction'), `${manifest.id}: room delete must render a Filament action`)
    assert(!roomAdmin.includes('<details'), `${manifest.id}: room edit must not be a dropdown`)
    assert(!roomAdmin.includes('<summary'), `${manifest.id}: room edit must not be a dropdown`)
    assert(!roomAdmin.includes('wire:ignore'), `${manifest.id}: room filters must not sit inside a save form`)
    assert(!roomAdmin.includes('wire:click="mountAction'), `${manifest.id}: room row buttons must not hand-build mountAction`)
    assert(roomAdmin.includes('filters.search'), `${manifest.id}: rooms must be searchable`)
    assert(roomAdmin.includes('filters.roomType'), `${manifest.id}: rooms must filter by room type`)
    assert(roomAdmin.includes('filters.status'), `${manifest.id}: rooms must filter by status`)
    assert(roomAdmin.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), `${manifest.id}: room filters align with the clear button`)
    assert(roomAdmin.includes('clearUnitFilters'), `${manifest.id}: room filters can be cleared`)
    assert(!roomAdmin.includes('filters.active'), `${manifest.id}: rooms have no active filter`)
    assert(roomAdmin.includes('RoomCalendar::getUrl'), `${manifest.id}: each room links to its calendar`)
    assert(typeAdmin.includes('<table'), `${manifest.id}: room types list in a table`)
    assert(roomAdmin.includes('<table'), `${manifest.id}: rooms list in a table`)
    const roomsAdmin = backend['app/Filament/Pages/Rooms.php'] ?? ''
    assert(roomsAdmin.includes('function visibleUnits'), `${manifest.id}: rooms must filter the BuildAura list`)
    assert(roomsAdmin.includes('function clearUnitFilters'), `${manifest.id}: rooms must reset filters`)
    assert(!roomsAdmin.includes("filterText('active')"), `${manifest.id}: rooms must not filter by active`)
    assert(!roomsAdmin.includes('filterForm'), `${manifest.id}: room filters stay in the page view`)
    assert(roomsAdmin.includes('editUnitAction'), `${manifest.id}: room edit opens in a slide-over`)
    assert(roomsAdmin.includes("Select::make('roomTypeId')"), `${manifest.id}: room edit picks the room type in the slide-over`)
    assert(!roomsAdmin.includes("'floor'"), `${manifest.id}: rooms admin does not edit a floor`)
    assert(roomsAdmin.includes('smokingAllowed'), `${manifest.id}: rooms record whether smoking is allowed`)
    assert(roomsAdmin.includes("'BOOKED'"), `${manifest.id}: room status includes booked`)
    assert(!roomsAdmin.includes('RESERVED'), `${manifest.id}: room status does not include reserved`)
    assert(!roomsAdmin.includes("TextInput::make('sortOrder')"), `${manifest.id}: room form hides the sort number`)
    assert(roomsAdmin.includes("collect($this->inventory()['units']"), `${manifest.id}: new rooms append to the sort order`)
    const calendar = backend['app/Filament/Pages/RoomCalendar.php'] ?? ''
    const calendarBlade = backend['resources/views/filament/pages/room-calendar.blade.php'] ?? ''
    assert(calendar.includes("rooms/{unitId}/calendar"), `${manifest.id}: room calendar is a detail page`)
    assert(calendar.includes('function previousMonth'), `${manifest.id}: room calendar moves between months`)
    assert(calendar.includes('$date >= $in && $date < $out'), `${manifest.id}: checkout morning stays free`)
    assert(calendar.includes('BuildauraClient'), `${manifest.id}: room calendar reads Buildaura inventory`)
    assert(!calendar.includes('guest_name'), `${manifest.id}: room calendar does not show guest details`)
    assert(calendarBlade.includes('Timeline'), `${manifest.id}: room calendar shows a timeline`)
    assert(calendarBlade.includes('Reservations'), `${manifest.id}: room calendar lists reservations`)
    assert(calendar.includes('#34d399'), `${manifest.id}: available nights are color coded`)
    assert(calendar.includes('#7c3aed'), `${manifest.id}: booked nights are color coded`)
    assert(calendar.includes('#6b7280'), `${manifest.id}: inactive nights are color coded`)
    assert(calendar.includes("'Available'"), `${manifest.id}: calendar labels available nights`)
    assert(calendar.includes("'Booked'"), `${manifest.id}: calendar labels booked nights`)
    assert(calendar.includes("'Inactive'"), `${manifest.id}: calendar labels inactive nights`)
    assert(!calendar.includes('#f59e0b'), `${manifest.id}: calendar does not color holds`)
    assert(!calendar.includes('#0284c7'), `${manifest.id}: calendar does not color blocked nights`)
    assert(calendarBlade.includes("$day['cell']"), `${manifest.id}: calendar days use the color for that night`)
    const guestAdmin = backend['app/Filament/Pages/GuestReservations.php'] ?? ''
    assert(roomsAdmin.includes("navigationGroup = 'Hospitality'"), `${manifest.id}: rooms sit under Hospitality`)
    assert(guestAdmin.includes("navigationGroup = 'Hospitality'"), `${manifest.id}: guest reservations sit under Hospitality`)
    assert((backend['app/Filament/Pages/ApiKey.php'] ?? '').includes("navigationGroup = 'Hospitality'"), `${manifest.id}: the API key page sits under Hospitality`)
    const guestBlade = backend['resources/views/filament/pages/guest-reservations.blade.php'] ?? ''
    assert(guestBlade.includes('filters.search'), `${manifest.id}: guest reservations must be searchable`)
    assert(guestBlade.includes('filters.roomType'), `${manifest.id}: guest reservations must filter by room type`)
    assert(guestBlade.includes('filters.status'), `${manifest.id}: guest reservations must filter by status`)
    assert(guestBlade.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), `${manifest.id}: guest filters align with the clear button`)
    assert(guestAdmin.includes('room_type_name'), `${manifest.id}: guest reservations must filter by room type`)
    assert(guestAdmin.includes('function guestRoomTypeOptions'), `${manifest.id}: guest room type filter must load options`)
    assert(guestAdmin.includes('function guestStatusOptions'), `${manifest.id}: guest status filter must load options`)
    assert(!guestAdmin.includes('filterForm'), `${manifest.id}: guest filters stay in the page view`)
    assert(guestBlade.indexOf('filters.search') < guestBlade.indexOf('wire:ignore'), `${manifest.id}: guest filters must stay outside the cancel form`)
    assert((backend['resources/views/site/index.blade.php'] ?? '').includes("PublicAsset::url($room['photos'][0])"), `${manifest.id}: homepage room cards must show the room photo`)
    assert((backend['resources/views/site/index.blade.php'] ?? '').includes('bg-slate-100'), `${manifest.id}: homepage room cards keep a photo frame when the image is missing`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes("PublicAsset::url($type['photos'][0])"), `${manifest.id}: rooms page must show the room photo`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('bg-slate-100'), `${manifest.id}: rooms page keeps a photo frame when the image is missing`)
    assert((backend['resources/views/site/room-detail.blade.php'] ?? '').includes("PublicAsset::url($roomType['photos'][0])"), `${manifest.id}: room page must show the room photo`)
    assert((backend['resources/views/site/book.blade.php'] ?? '').includes("PublicAsset::url($row['type']['photos'][0])"), `${manifest.id}: booking results must show the room photo`)
    assert(backend['app/Http/Controllers/SiteController.php']?.includes("'crsRoomTypes'"), `${manifest.id}: homepage must load Buildaura rooms`)
    assert(!backend['app/Http/Controllers/SiteController.php']?.includes('array_slice($types, 0, 3)'), `${manifest.id}: homepage lists every active room type`)
    assert(!backend['app/Http/Controllers/SiteController.php']?.includes("empty($type['parentId'])"), `${manifest.id}: homepage includes room subtypes`)
    assert(!backend['app/Http/Controllers/SiteController.php']?.includes('CrsClient'), `${manifest.id}: homepage must not call the other CRS client`)
    assert(backend['.env']?.includes('BUILDAURA_API_KEY='), `${manifest.id}: .env should carry the Buildaura site key`)
    assert(backend['.env']?.includes('BUILDAURA_HOTEL_ID='), `${manifest.id}: .env should carry the Buildaura hotel id`)
    assert(backend['resources/views/site/book.blade.php']?.includes('guest_name'), `${manifest.id}: public booking still collects the guest name locally`)
    assert(!backend['app/Services/BuildauraClient.php']?.includes('guest_name'), `${manifest.id}: guest name must not be sent to Buildaura`)
  } else if (hospitality) {
    assert(defaults.pageVisibility.rooms, `${manifest.id}: hospitality template should enable rooms`)
    assert(defaults.roomTypes.length > 0, `${manifest.id}: hospitality template should seed rooms`)
    assert(hasBookingFeature(defaults), `${manifest.id}: booking feature should be on`)
    assert(backend['app/Services/CrsClient.php'], `${manifest.id}: missing CRS client`)
    assert(backend['app/Models/Reservation.php'], `${manifest.id}: missing Reservation model`)
    assert(!backend['app/Models/RoomType.php'], `${manifest.id}: inventory must live in BuildAura CRS, not local RoomType`)
    assert(backend['app/Http/Controllers/BookingController.php'], `${manifest.id}: missing BookingController`)
    assert(Object.keys(backend).some((p) => p.includes('rooms')), `${manifest.id}: missing rooms Blade view`)
    const home = backend['resources/views/site/index.blade.php'] ?? ''
    assert(!home.includes('App\\Models\\RoomType'), `${manifest.id}: home must not query a local RoomType model`)
    assert(home.includes('$roomTypes'), `${manifest.id}: home should list CRS room types`)
    assert(home.includes('PublicAsset::url($room->cover)'), `${manifest.id}: homepage room cards must show the room photo`)
    assert(home.includes('bg-slate-100'), `${manifest.id}: homepage room cards keep a photo frame when the image is missing`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('PublicAsset::url($type->cover)'), `${manifest.id}: rooms page must show the room photo`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('bg-slate-100'), `${manifest.id}: rooms page keeps a photo frame when the image is missing`)
    assert((backend['resources/views/site/room-detail.blade.php'] ?? '').includes('bg-slate-100'), `${manifest.id}: room page keeps a photo frame when the image is missing`)
    assert(!home.includes('array_slice($roomTypes'), `${manifest.id}: homepage lists every room type`)
    assert(backend['app/Support/CrsInventory.php']?.includes('function catalogue'), `${manifest.id}: inventory exposes the full room catalogue`)
    assert(backend['app/Http/Controllers/BookingController.php']?.includes('CrsInventory::catalogue'), `${manifest.id}: rooms page lists subtypes`)
    assert(!backend['app/Http/Controllers/BookingController.php']?.includes('CrsInventory::types('), `${manifest.id}: rooms page does not hide subtypes`)
    assert(backend['.env']?.includes('CRS_HOTEL_ID='), `${manifest.id}: .env should carry the hotel id slot`)
    assert(backend['.env.example']?.includes('CRS_API_KEY='), `${manifest.id}: .env.example should carry the site key slot`)
    const roomTypesAdmin = backend['app/Filament/Pages/ManageRoomTypes.php'] ?? ''
    const roomsPage = backend['app/Filament/Pages/ManageRooms.php'] ?? ''
    const inventoryTrait = backend['app/Filament/Concerns/LoadsCrsInventory.php'] ?? ''
    const typeBlade = backend['resources/views/filament/pages/manage-room-types.blade.php'] ?? ''
    const roomBlade = backend['resources/views/filament/pages/manage-rooms.blade.php'] ?? ''
    assert(!backend['app/Filament/Pages/ManageInventory.php'], `${manifest.id}: rooms admin is split into room types and rooms`)
    assert(roomTypesAdmin.includes('updateRoomType'), `${manifest.id}: room types admin must update types through CRS`)
    assert(roomTypesAdmin.includes('deleteRoomType'), `${manifest.id}: room types admin must delete types through CRS`)
    assert(roomTypesAdmin.includes('maxSize(5120)'), `${manifest.id}: room photos must allow 5 MB`)
    assert(roomTypesAdmin.includes('imageEditor()'), `${manifest.id}: room photos use the image editor`)
    assert(!roomTypesAdmin.includes("TextInput::make('sortOrder')"), `${manifest.id}: room type form hides the sort number`)
    assert(roomTypesAdmin.includes("collect($this->inventory['roomTypes']"), `${manifest.id}: new room types append to the sort order`)
    assert(!roomTypesAdmin.includes('parentId'), `${manifest.id}: room types admin does not offer a parent type`)
    assert(!roomTypesAdmin.includes('maxOccupancy'), `${manifest.id}: room types have no max occupancy`)
    assert(roomTypesAdmin.includes('discountPercent'), `${manifest.id}: room types store a discount percent`)
    assert(roomTypesAdmin.includes('freeCancellation'), `${manifest.id}: room types toggle free cancellation`)
    assert(roomTypesAdmin.includes('freeBreakfast'), `${manifest.id}: room types toggle included breakfast`)
    assert(roomTypesAdmin.includes("Fieldset::make('Room amenities')"), `${manifest.id}: room type amenities are ticked from the catalog`)
    assert(roomTypesAdmin.includes("Checkbox::make('amenityFlags."), `${manifest.id}: each room amenity has its own checkbox`)
    assert(!roomTypesAdmin.includes("CheckboxList::make('amenities')"), `${manifest.id}: room amenities do not share one checkbox list`)
    assert(roomTypesAdmin.includes("Select::make('currency')->options(['ETB' => 'ETB', 'USD' => 'USD'])"), `${manifest.id}: room type currency is ETB or USD`)
    assert(!roomTypesAdmin.includes("TextInput::make('currency')"), `${manifest.id}: room type currency is not free text`)
    assert(roomTypesAdmin.includes("FileUpload::make('newPhotos')"), `${manifest.id}: room type edit must upload photos`)
    assert(!roomTypesAdmin.includes('clearImage'), `${manifest.id}: room types do not use a remove-photo toggle`)
    assert(!roomTypesAdmin.includes("TextInput::make('slug')"), `${manifest.id}: room type slug is generated from the name`)
    assert(!roomTypesAdmin.includes('imageUrl'), `${manifest.id}: room type form must not ask for an image URL`)
    assert(!roomTypesAdmin.includes('RoomType::'), `${manifest.id}: room types admin must not use a local room model`)
    assert(inventoryTrait.includes('uploadImage'), `${manifest.id}: room photos must upload to BuildAura`)
    assert(roomsPage.includes('createUnit'), `${manifest.id}: rooms admin must create rooms through CRS`)
    assert(roomsPage.includes('updateUnit'), `${manifest.id}: rooms admin must update rooms through CRS`)
    assert(roomsPage.includes('deleteUnit'), `${manifest.id}: rooms admin must delete rooms through CRS`)
    assert(!roomsPage.includes("'floor'"), `${manifest.id}: rooms admin does not edit a floor`)
    assert(roomsPage.includes('smokingAllowed'), `${manifest.id}: rooms record whether smoking is allowed`)
    assert(inventoryTrait.includes("'BOOKED'"), `${manifest.id}: room status includes booked`)
    assert(!inventoryTrait.includes('RESERVED'), `${manifest.id}: room status does not include reserved`)
    assert(inventoryTrait.includes('function storedPhotos'), `${manifest.id}: room types keep a list of photos`)
    assert(!roomsPage.includes("TextInput::make('sortOrder')"), `${manifest.id}: room form hides the sort number`)
    assert(roomsPage.includes("collect($this->inventory['units']"), `${manifest.id}: new rooms append to the sort order`)
    assert(!roomsPage.includes('RoomType::'), `${manifest.id}: rooms admin must not use a local room model`)
    assert(typeBlade.includes('width:72px'), `${manifest.id}: room type table must size the photo itself`)
    assert(typeBlade.includes('editTypeAction'), `${manifest.id}: room type edit must render a Filament action`)
    assert(typeBlade.includes('deleteTypeAction'), `${manifest.id}: room type delete must render a Filament action`)
    assert(roomBlade.includes('editUnitAction'), `${manifest.id}: room edit must render a Filament action`)
    assert(roomBlade.includes('deleteUnitAction'), `${manifest.id}: room delete must render a Filament action`)
    assert(!typeBlade.includes('wire:click="mountAction'), `${manifest.id}: room type row buttons must not hand-build mountAction`)
    assert(!roomBlade.includes('wire:click="mountAction'), `${manifest.id}: room row buttons must not hand-build mountAction`)
    assert(typeBlade.includes('filters.search'), `${manifest.id}: room types must be searchable`)
    assert(!typeBlade.includes('filters.parent'), `${manifest.id}: room types have no parent type filter`)
    assert(typeBlade.includes('filters.active'), `${manifest.id}: room types keep an active filter`)
    assert(typeBlade.includes('grid-template-columns:repeat(4,minmax(0,1fr))'), `${manifest.id}: room type filters align with the clear button`)
    assert(typeBlade.includes('Ad '), `${manifest.id}: room type rows show adults and children`)
    assert(typeBlade.includes('>Rooms<'), `${manifest.id}: room type rows show the room count`)
    assert(typeBlade.includes('x-filament::input'), `${manifest.id}: room type filters use Filament inputs`)
    assert(!typeBlade.includes('All hotels'), `${manifest.id}: room types have no hotel filter`)
    assert(!roomTypesAdmin.includes('typeHotel'), `${manifest.id}: room type page must not filter by hotel`)
    assert(!roomTypesAdmin.includes('filterForm'), `${manifest.id}: room type filters stay in the page view`)
    assert(!roomTypesAdmin.includes('function filterParentOptions'), `${manifest.id}: room types have no parent type filter`)
    assert(roomTypesAdmin.includes('function visibleTypes'), `${manifest.id}: room types must filter the BuildAura list`)
    assert(roomBlade.includes('filters.search'), `${manifest.id}: rooms must be searchable`)
    assert(roomBlade.includes('filters.roomType'), `${manifest.id}: rooms must filter by room type`)
    assert(roomBlade.includes('grid-template-columns:repeat(5,minmax(0,1fr))'), `${manifest.id}: room filters align with the clear button`)
    assert(!roomBlade.includes('filters.active'), `${manifest.id}: rooms have no active filter`)
    assert(roomBlade.includes('RoomCalendar::getUrl'), `${manifest.id}: each room links to its calendar`)
    assert(roomsPage.includes('function visibleUnits'), `${manifest.id}: rooms must filter the BuildAura list`)
    assert(!roomsPage.includes("filterText('active')"), `${manifest.id}: rooms must not filter by active`)
    assert(!roomsPage.includes('filterForm'), `${manifest.id}: room filters stay in the page view`)
    const stayCalendar = backend['app/Filament/Pages/RoomCalendar.php'] ?? ''
    const stayCalendarBlade = backend['resources/views/filament/pages/room-calendar.blade.php'] ?? ''
    assert(stayCalendar.includes("rooms/{unitId}/calendar"), `${manifest.id}: room calendar is a detail page`)
    assert(stayCalendar.includes('function previousMonth'), `${manifest.id}: room calendar moves between months`)
    assert(stayCalendar.includes('$date >= $in && $date < $out'), `${manifest.id}: checkout morning stays free`)
    assert(stayCalendar.includes('CrsClient'), `${manifest.id}: room calendar reads CRS inventory`)
    assert(stayCalendar.includes('ManageRooms::getUrl'), `${manifest.id}: room calendar returns to the rooms list`)
    assert(!stayCalendar.includes('guest_name'), `${manifest.id}: room calendar does not show guest details`)
    assert(stayCalendarBlade.includes('Timeline'), `${manifest.id}: room calendar shows a timeline`)
    assert(stayCalendar.includes('#34d399'), `${manifest.id}: available nights are color coded`)
    assert(stayCalendar.includes('#7c3aed'), `${manifest.id}: booked nights are color coded`)
    assert(stayCalendar.includes('#6b7280'), `${manifest.id}: inactive nights are color coded`)
    assert(stayCalendar.includes("'Available'"), `${manifest.id}: calendar labels available nights`)
    assert(stayCalendar.includes("'Booked'"), `${manifest.id}: calendar labels booked nights`)
    assert(stayCalendar.includes("'Inactive'"), `${manifest.id}: calendar labels inactive nights`)
    assert(!stayCalendar.includes('#f59e0b'), `${manifest.id}: calendar does not color holds`)
    assert(!stayCalendar.includes('#0284c7'), `${manifest.id}: calendar does not color blocked nights`)
    assert(stayCalendarBlade.includes("$day['cell']"), `${manifest.id}: calendar days use the color for that night`)
    const reservations = backend['app/Filament/Resources/ReservationResource.php'] ?? ''
    assert(reservations.includes("SelectFilter::make('status')"), `${manifest.id}: reservations must filter by status`)
    assert(reservations.includes("SelectFilter::make('room_type_name')"), `${manifest.id}: reservations must filter by room type`)
    assert(reservations.includes('->searchable()'), `${manifest.id}: reservations must be searchable`)
    assert(reservations.includes('->sortable()'), `${manifest.id}: reservations must be sortable`)
    assert(reservations.includes('persistFiltersInSession()'), `${manifest.id}: reservation filters must persist`)
    assert(backend['public/.user.ini']?.includes('upload_max_filesize = 8M'), `${manifest.id}: PHP must accept a 5 MB room photo`)
    const desk = backend['app/Services/ReservationDesk.php'] ?? ''
    assert(desk.includes('occupy'), `${manifest.id}: reservation desk must hold rooms in CRS`)
    assert(desk.includes('release'), `${manifest.id}: reservation desk must release CRS holds`)
    assert(desk.includes("'admin'"), `${manifest.id}: admin reservations stay unpaid on this site`)
    assert(!desk.includes('guest_name') || desk.includes("'guest_name'"), `${manifest.id}: guest name stays on the local reservation`)
    assert(!desk.includes('card_number'), `${manifest.id}: card numbers must not be sent to CRS`)
    assert(backend['app/Filament/Resources/ReservationResource/Pages/CreateReservation.php'], `${manifest.id}: reservations need a create page`)
    assert(backend['app/Filament/Resources/ReservationResource.php']?.includes('crs_room_type_id'), `${manifest.id}: reservation form must pick a CRS room type`)
    assert(backend['app/Services/CrsClient.php']?.includes('updateRoomType'), `${manifest.id}: CRS client must patch room types`)
    assert(backend['app/Services/CrsClient.php']?.includes('function uploadImage'), `${manifest.id}: CRS client must upload room photos`)
    assert(backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('discoverPages'), `${manifest.id}: Filament must register the rooms page`)
    assert(backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('is_dir($pageDirectory)'), `${manifest.id}: missing pages directory must not crash the panel`)
    assert(backend['app/Support/PublicAsset.php']?.includes("str_starts_with($path, 'data:')"), `${manifest.id}: room photos stored as data URLs must render`)
  } else {
    assert(!hasBookingFeature(defaults), `${manifest.id}: booking should stay off`)
    assert(!backend['app/Services/CrsClient.php'], `${manifest.id}: business CMS should not emit CRS client`)
    assert(!backend['app/Filament/Pages/ManageInventory.php'], `${manifest.id}: business CMS should not emit the rooms page`)
    assert(!backend['app/Filament/Pages/ManageRoomTypes.php'], `${manifest.id}: business CMS should not emit the room types page`)
    assert(!backend['app/Filament/Pages/ManageRooms.php'], `${manifest.id}: business CMS should not emit the rooms page`)
    assert(!backend['app/Filament/Pages/RoomCalendar.php'], `${manifest.id}: business CMS should not emit the room calendar`)
    assert(backend['app/Providers/Filament/AdminPanelProvider.php']?.includes('is_dir($pageDirectory)'), `${manifest.id}: missing pages directory must not crash the panel`)
  }

  const contactAdmin = backend['app/Filament/Resources/ContactMessageResource.php'] ?? ''
  assert(contactAdmin.includes('->searchable()'), `${manifest.id}: contact messages must be searchable`)
  assert(contactAdmin.includes('->sortable()'), `${manifest.id}: contact messages must be sortable`)
  assert(contactAdmin.includes('SelectFilter'), `${manifest.id}: contact messages must filter by service`)
  assert(contactAdmin.includes('persistSearchInSession()'), `${manifest.id}: contact search must persist`)
  const pricingAdmin = backend['app/Filament/Resources/PricingPlanResource.php'] ?? ''
  assert(pricingAdmin.includes("Toggle::make('featured')"), `${manifest.id}: pricing plans can be marked featured`)
  assert(pricingAdmin.includes('->searchable()'), `${manifest.id}: pricing plans must be searchable`)
  assert(backend['app/Models/PricingPlan.php']?.includes("'featured' => 'boolean'"), `${manifest.id}: featured pricing is stored as a boolean`)
  assert(backend['database/migrations/0001_01_01_1000_create_pricing_plans_table.php']?.includes("boolean('featured')"), `${manifest.id}: pricing plans store a featured flag`)
  assert(backend['database/seeders/DatabaseSeeder.php']?.includes('use App\\Models\\PricingPlan;'), `${manifest.id}: seeder imports pricing plans`)
  assert(backend['database/seeders/DatabaseSeeder.php']?.includes('PricingPlan::class'), `${manifest.id}: seeder writes pricing plans`)
  const servicesView = backend['resources/views/site/services.blade.php'] ?? ''
  assert(servicesView.includes('$pricingPlans'), `${manifest.id}: services page renders pricing plans`)
  assert(!servicesView.includes('Ask us for a quote'), `${manifest.id}: services page does not freeze a quote placeholder`)
  assert(backend['app/Http/Controllers/PageController.php']?.includes('PricingPlan::orderBy'), `${manifest.id}: services page loads pricing plans`)
  assert(backend['app/Http/Controllers/SiteController.php']?.includes("'pricingPlans'"), `${manifest.id}: home loads pricing plans`)
  const homeBlade = backend['resources/views/site/index.blade.php'] ?? ''
  assert(homeBlade.includes('$pricingPlans'), `${manifest.id}: home renders pricing plans`)
  assert(homeBlade.includes("section_visibility['pricing']"), `${manifest.id}: home pricing follows the visibility toggle`)
  assert(backend['app/Filament/Resources/BlogPostResource.php'], `${manifest.id}: blog stays editable after export`)
  assert(backend['app/Filament/Resources/TeamMemberResource.php'], `${manifest.id}: team stays editable after export`)
  assert(backend['app/Filament/Resources/FaqResource.php'], `${manifest.id}: FAQs stay editable after export`)
  assert(backend['app/Support/SiteLinks.php']?.includes('Route::has'), `${manifest.id}: button links resolve without a missing route`)
  for (const resource of ['Stat', 'Service', 'Step', 'ShowcaseItem', 'GalleryImage', 'TeamMember', 'Testimonial', 'BlogPost', 'NewsPost', 'Faq', 'PricingPlan']) {
    const resourceAdmin = backend[`app/Filament/Resources/${resource}Resource.php`] ?? ''
    assert(resourceAdmin.includes("navigationGroup = 'Content'"), `${manifest.id}: ${resource} sits under Content`)
    assert(resourceAdmin.includes("->reorderable('sort_order')"), `${manifest.id}: ${resource} order is drag and drop`)
    assert(!resourceAdmin.includes("label('Sort Order')"), `${manifest.id}: ${resource} sort number stays off the form`)
  }
  assert(contactAdmin.includes("navigationGroup = 'Inbox'"), `${manifest.id}: contact messages sit under Inbox`)
  assert(!backend['app/Filament/Resources/SiteSettingResource.php'], `${manifest.id}: site settings are separate pages`)
  assert(!backend['app/Filament/Resources/SiteSettingResource/Pages/ManageSiteSettings.php'], `${manifest.id}: site settings are separate pages`)
  const generalSettings = backend['app/Filament/Pages/GeneralSettings.php'] ?? ''
  const brandSettings = backend['app/Filament/Pages/BrandSettings.php'] ?? ''
  const aboutSettings = backend['app/Filament/Pages/AboutSettings.php'] ?? ''
  const footerSettings = backend['app/Filament/Pages/FooterSettings.php'] ?? ''
  const contactSettings = backend['app/Filament/Pages/ContactSettings.php'] ?? ''
  const visibilitySettings = backend['app/Filament/Pages/VisibilitySettings.php'] ?? ''
  const sectionTitleSettings = backend['app/Filament/Pages/SectionTitleSettings.php'] ?? ''
  const settingsPages = [generalSettings, brandSettings, aboutSettings, footerSettings, contactSettings, visibilitySettings, sectionTitleSettings].join('\n')
  assert(generalSettings.includes("make('business_name')->required()"), `${manifest.id}: general settings require the business name`)
  assert(generalSettings.includes("'business_name' => $state['business_name'] ?? ''"), `${manifest.id}: general settings save the business name`)
  assert(!generalSettings.includes("'logo'"), `${manifest.id}: general settings do not rewrite the logo`)
  assert(generalSettings.includes("navigationGroup = 'Website'"), `${manifest.id}: general settings sit under Website`)
  assert(contactSettings.includes("make('email')"), `${manifest.id}: contact settings edit the email`)
  assert(contactSettings.includes("make('map_url')"), `${manifest.id}: contact settings edit the map link`)
  assert(visibilitySettings.includes("make('page_visibility.about')"), `${manifest.id}: visibility settings edit page toggles`)
  assert(visibilitySettings.includes("make('section_visibility.pricing')"), `${manifest.id}: visibility settings edit section toggles`)
  assert(visibilitySettings.includes("'page_visibility' => $state['page_visibility'] ?? []"), `${manifest.id}: visibility settings save page toggles`)
  assert(sectionTitleSettings.includes("make('services_section_title')"), `${manifest.id}: section titles stay editable`)
  assert(footerSettings.includes("make('footer_blurb')"), `${manifest.id}: footer text stays editable`)
  assert(brandSettings.includes("'logo_show_name' => (bool) ($state['logo_show_name'] ?? false)"), `${manifest.id}: brand settings save the logo name toggle`)
  assert(!brandSettings.includes('hero_image'), `${manifest.id}: brand settings do not rewrite the hero image`)
  assert(!backend['app/Filament/Pages/SeoSettings.php'], `${manifest.id}: exported admin has no SEO page`)
  assert(!settingsPages.includes('seo_'), `${manifest.id}: website settings do not edit SEO`)
  assert(backend['resources/views/filament/pages/settings-form.blade.php']?.includes('wire:submit="save"'), `${manifest.id}: settings pages can be saved`)
  const adminPanel = backend['app/Providers/Filament/AdminPanelProvider.php'] ?? ''
  assert(adminPanel.includes('->navigationGroups(['), `${manifest.id}: admin navigation is grouped`)
  assert(adminPanel.includes("'Website'"), `${manifest.id}: website settings are grouped`)
  assert(adminPanel.includes("'Content'"), `${manifest.id}: content resources are grouped`)
  assert(adminPanel.includes("'Inbox'"), `${manifest.id}: inbox is grouped`)
  const settingsMigration = backend['database/migrations/0001_01_01_000001_create_site_settings_table.php'] ?? ''
  assert(!settingsMigration.includes('seo_'), `${manifest.id}: site settings do not store SEO`)
  assert(!settingsMigration.includes("'free_cancellation'"), `${manifest.id}: free cancellation is not a site setting`)
  assert(!settingsMigration.includes("'free_breakfast'"), `${manifest.id}: free breakfast is not a site setting`)
  assert(settingsMigration.includes("'pay_on_arrival'"), `${manifest.id}: settings store payment on arrival`)
  assert(settingsMigration.includes("'usdt_etb_rate'"), `${manifest.id}: settings store the USDT to ETB rate`)
  assert(settingsMigration.includes("'breakfast_price'"), `${manifest.id}: settings store the breakfast price`)
  assert(settingsMigration.includes("'cancellation_fee'"), `${manifest.id}: settings store the cancellation fee`)
  assert(settingsMigration.includes("'house_rules'"), `${manifest.id}: settings store the house rules file`)
  const settingsModel = backend['app/Models/SiteSetting.php'] ?? ''
  assert(!settingsModel.includes('seo_'), `${manifest.id}: the site settings model does not store SEO`)
  assert(!settingsModel.includes("'free_cancellation'"), `${manifest.id}: free cancellation is not a site setting`)
  assert(!settingsModel.includes("'free_breakfast'"), `${manifest.id}: free breakfast is not a site setting`)
  assert(settingsModel.includes("'pay_on_arrival' => 'boolean'"), `${manifest.id}: payment on arrival is a boolean`)
  assert(settingsModel.includes("'usdt_etb_rate' => 'decimal:4'"), `${manifest.id}: the exchange rate is a decimal`)
  assert(settingsModel.includes("'breakfast_price' => 'decimal:2'"), `${manifest.id}: the breakfast price is a decimal`)
  assert(settingsModel.includes("'cancellation_fee' => 'decimal:2'"), `${manifest.id}: the cancellation fee is a decimal`)
  const settingsSeed = backend['database/seeders/DatabaseSeeder.php'] ?? ''
  assert(settingsSeed.includes('"usdt_etb_rate": 0'), `${manifest.id}: the exchange rate starts at zero`)
  assert(settingsSeed.includes('"breakfast_price": 0'), `${manifest.id}: the breakfast price starts at zero`)
  assert(settingsSeed.includes('"cancellation_fee": 0'), `${manifest.id}: the cancellation fee starts at zero`)
  assert(settingsSeed.includes('"pay_on_arrival": false'), `${manifest.id}: payment on arrival starts off`)
  assert(!settingsSeed.includes('"seo_'), `${manifest.id}: SEO is not seeded on site settings`)
  assert(!settingsSeed.includes('"free_cancellation"'), `${manifest.id}: free cancellation is not seeded on site settings`)
  if (hospitality) {
    assert(adminPanel.includes("'Hospitality'"), `${manifest.id}: hospitality navigation is grouped`)
    assert(!settingsPages.includes("Tab::make('Stay policies')"), `${manifest.id}: stay policies stay off site settings`)
    assert(!settingsPages.includes("make('free_cancellation')"), `${manifest.id}: stay policies stay off site settings`)
    assert(!settingsPages.includes("make('pay_on_arrival')"), `${manifest.id}: payment on arrival stays off site settings`)
    assert(!settingsPages.includes("make('free_breakfast')"), `${manifest.id}: free breakfast stays off site settings`)
    const stayPage = backend['app/Filament/Pages/StayPolicies.php'] ?? ''
    assert(stayPage.includes("navigationLabel = 'Hotel Policy'"), `${manifest.id}: hotel policy has its own admin page`)
    assert(stayPage.includes('SiteSetting::current()'), `${manifest.id}: hotel policy edits the site settings row`)
    assert(!stayPage.includes("'free_cancellation'"), `${manifest.id}: free cancellation stays on the room type`)
    assert(!stayPage.includes("'free_breakfast'"), `${manifest.id}: included breakfast stays on the room type`)
    assert(stayPage.includes("'pay_on_arrival'"), `${manifest.id}: hotel policy edits payment on arrival`)
    assert(stayPage.includes("'usdt_etb_rate'"), `${manifest.id}: hotel policy edits the exchange rate`)
    assert(stayPage.includes("label('USD to ETB rate')"), `${manifest.id}: hotel policy names the rate in USD`)
    const roomPrice = backend['app/Support/RoomPrice.php'] ?? ''
    assert(roomPrice.includes("self::currency($currency) === 'USD'"), `${manifest.id}: a USD price converts into ETB`)
    assert(roomPrice.includes(".' USD'"), `${manifest.id}: the other currency is USD`)
    assert(roomPrice.includes('function cancellationNote'), `${manifest.id}: guests see the cancellation fee on the rate`)
    assert(roomPrice.includes('Free cancellation.'), `${manifest.id}: a free rate still says free cancellation`)
    assert(roomPrice.includes('Cancellation fee '), `${manifest.id}: a paid cancellation names the fee`)
    assert(!roomPrice.includes(".' USDT'"), `${manifest.id}: the other currency is not labeled USDT`)
    assert(stayPage.includes("'breakfast_price'"), `${manifest.id}: hotel policy edits the breakfast price`)
    assert(stayPage.includes("'cancellation_fee'"), `${manifest.id}: hotel policy edits the cancellation fee`)
    assert(stayPage.includes("label('Cancellation fee')"), `${manifest.id}: hotel policy names the cancellation fee`)
    assert(stayPage.includes("'house_rules'"), `${manifest.id}: hotel policy uploads house rules`)
    assert(stayPage.includes('mimes:pdf,doc,docx'), `${manifest.id}: house rules accept a PDF or Word file`)
    assert(backend['resources/views/filament/pages/stay-policies.blade.php']?.includes('wire:submit="save"'), `${manifest.id}: stay policies page can be saved`)
    assert(stayPage.includes("navigationGroup = 'Hospitality'"), `${manifest.id}: stay policies sit under Hospitality`)
    assert(!stayPage.includes("navigationGroup = 'Property'"), `${manifest.id}: stay policies do not use a separate Property group`)
    const policies = backend['resources/views/partials/stay-policies.blade.php'] ?? ''
    assert(!policies.includes('Free cancellation'), `${manifest.id}: free cancellation is shown on the room, not the hotel policy`)
    assert(policies.includes('Cancellation fee'), `${manifest.id}: guests can see the cancellation fee`)
    assert(policies.includes('Payment on arrival'), `${manifest.id}: guests can see payment on arrival`)
    assert(policies.includes('House rules'), `${manifest.id}: guests can see the house rules`)
    assert(policies.includes('count($policies)'), `${manifest.id}: hidden policies stay off the page`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('RoomPrice::cancellationNote'), `${manifest.id}: guests can see free cancellation on a room`)
    assert((backend['resources/views/partials/stay-addons.blade.php'] ?? '').includes('RoomPrice::cancellationNote'), `${manifest.id}: checkout shows the cancellation fee`)
    assert((backend['resources/views/partials/stay-addons.blade.php'] ?? '').includes('room + breakfast'), `${manifest.id}: the cancellation fee stays out of the stay total`)
    assert((backend['resources/views/partials/stay-addons.blade.php'] ?? '').includes('Add breakfast'), `${manifest.id}: paid breakfast can be added or skipped`)
    assert((backend['resources/views/partials/stay-addons.blade.php'] ?? '').includes('breakfastPerNight'), `${manifest.id}: breakfast is priced per night`)
    const roomPricePartial = backend['resources/views/partials/room-price.blade.php'] ?? ''
    assert(roomPricePartial.includes('% off'), `${manifest.id}: a discount shows the off percentage`)
    assert(roomPricePartial.includes('RoomPrice::other'), `${manifest.id}: a price can show the other currency`)
    assert(roomPricePartial.includes('line-through'), `${manifest.id}: a discount strikes the original price`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('Breakfast included'), `${manifest.id}: guests can see included breakfast on a room`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('Breakfast is not included.'), `${manifest.id}: guests can see when breakfast is not included`)
    assert(!(backend['resources/views/site/rooms.blade.php'] ?? '').includes('priceRateHint'), `${manifest.id}: room list cards stay quiet when the exchange rate is missing`)
    const roomDetail = backend['resources/views/site/room-detail.blade.php'] ?? ''
    assert(roomDetail.includes('partials.stay-addons'), `${manifest.id}: the room page can add breakfast`)
    assert(roomDetail.includes('countSelectedRooms'), `${manifest.id}: breakfast follows the rooms the guest selects`)
    assert(roomDetail.includes('priceRateHint'), `${manifest.id}: the room page asks for the exchange rate when one currency is missing`)
    assert(roomDetail.includes('% off') || roomDetail.includes('partials.room-price'), `${manifest.id}: the room page shows the discounted price`)
    assert(!roomDetail.includes('About the property'), `${manifest.id}: the room page does not repeat the about section`)
    assert(!(backend['resources/views/site/rooms.blade.php'] ?? '').includes('About the property'), `${manifest.id}: the room list does not repeat the about section`)
    const checkout = backend['resources/views/site/book.blade.php'] ?? ''
    assert(checkout.includes('partials.stay-addons'), `${manifest.id}: checkout can add breakfast`)
    assert(checkout.includes('breakfastPerNight'), `${manifest.id}: checkout prices breakfast per night`)
    assert(!checkout.includes("'breakfastPrice'"), `${manifest.id}: checkout does not treat the room count as the nightly breakfast price`)
    assert(checkout.includes('priceRateHint'), `${manifest.id}: checkout asks for the exchange rate when one currency is missing`)
    assert((backend['resources/views/site/index.blade.php'] ?? '').includes('Breakfast included'), `${manifest.id}: home room cards say when breakfast is included`)
    assert(!(backend['resources/views/site/index.blade.php'] ?? '').includes('priceRateHint'), `${manifest.id}: home room cards stay quiet when the exchange rate is missing`)
    for (const view of ['rooms.blade.php', 'room-detail.blade.php', 'book.blade.php', 'booking-confirm.blade.php']) {
      assert(backend[`resources/views/site/${view}`]?.includes('partials.stay-policies'), `${manifest.id}: ${view} shows stay policies`)
    }
    assert(backend['resources/views/site/index.blade.php']?.includes('partials.stay-policies'), `${manifest.id}: home rooms section shows stay policies`)
    const staySearch = backend['resources/views/partials/stay-search.blade.php'] ?? ''
    assert(staySearch.includes('data-stay-search'), `${manifest.id}: stay search marks itself for date checks`)
    assert(!staySearch.includes("$type['id']"), `${manifest.id}: stay search does not read room types as arrays`)
    assert(!staySearch.includes('name="room_type_id"'), `${manifest.id}: stay search collects dates and guests`)
    assert(staySearch.includes('name="child_ages[]"'), `${manifest.id}: stay search collects each child age`)
    assert(staySearch.includes('max="17"'), `${manifest.id}: a child age cannot be 18 or older`)
    assert(staySearch.includes('Check-in cannot be before today.'), `${manifest.id}: stay search rejects a past check-in`)
    const stayRequest = backend['app/Support/StayRequest.php'] ?? ''
    assert(stayRequest.includes('Check-in cannot be before today.'), `${manifest.id}: the server rejects a past check-in`)
    assert(stayRequest.includes('A child must be 17 or younger. Guests 18 and older count as adults.'), `${manifest.id}: the server rejects an adult listed as a child`)
    assert(stayRequest.includes('Check-out must be after check-in.'), `${manifest.id}: the server rejects a checkout on or before check-in`)
    assert(backend['resources/views/site/rooms.blade.php']?.includes("['compact' => true]"), `${manifest.id}: room cards show stay policies`)
    assert(backend['app/Http/Controllers/BookingController.php']?.includes('StayRequest::from'), `${manifest.id}: booking uses the shared stay request`)
    assert((backend['resources/views/partials/nav.blade.php'] ?? '').includes('>Book<'), `${manifest.id}: public nav calls the rooms page Book`)
    assert((backend['resources/views/site/index.blade.php'] ?? '').includes('Browse by room type'), `${manifest.id}: home browses by room type`)
    assert((backend['resources/views/partials/hero-stay-search.blade.php'] ?? '').includes("'submitLabel' => 'Search'"), `${manifest.id}: the hero search button says Search`)
    assert((backend['resources/views/site/rooms.blade.php'] ?? '').includes('See availability'), `${manifest.id}: each room type links to its rooms`)
    assert((backend['resources/views/site/room-detail.blade.php'] ?? '').includes('Search room'), `${manifest.id}: a room type searches its own rooms`)
    assert((backend['resources/views/site/room-detail.blade.php'] ?? '').includes('House rules'), `${manifest.id}: a room type shows house rules`)
    assert((backend['resources/views/site/room-detail.blade.php'] ?? '').includes('Reservation'), `${manifest.id}: reservation is the first booking step`)
    for (const view of ['rooms.blade.php', 'room-detail.blade.php', 'book.blade.php', 'booking-confirm.blade.php']) {
      const bookingPage = backend[`resources/views/site/${view}`] ?? ''
      assert(/text-(slate|stone)-900/.test(bookingPage), `${manifest.id}: ${view} keeps dark text on its light background`)
    }
    assert((backend['resources/views/site/book.blade.php'] ?? '').includes('Payment'), `${manifest.id}: payment is the second booking step`)
    assert((backend['resources/views/site/booking-confirm.blade.php'] ?? '').includes('Confirmation'), `${manifest.id}: confirmation is the last booking step`)
    if (usesBuildauraCrs(manifest.id)) {
      assert(backend['database/migrations/0001_01_01_2100_create_guest_reservations_table.php']?.includes("json('child_ages')"), `${manifest.id}: guest reservations store child ages`)
      assert(!backend['app/Services/BuildauraClient.php']?.includes('child_ages'), `${manifest.id}: child ages stay on the website`)
    } else {
      assert(backend['database/migrations/0001_01_01_2000_create_reservations_table.php']?.includes("json('child_ages')"), `${manifest.id}: reservations store child ages`)
      const availability = backend['app/Services/AvailabilityService.php'] ?? ''
      assert(availability.includes("'child_ages'"), `${manifest.id}: a reservation keeps the child ages`)
      const occupyAt = availability.indexOf('->occupy([')
      const createAt = availability.indexOf('Reservation::create')
      assert(occupyAt >= 0 && createAt > occupyAt && !availability.slice(occupyAt, createAt).includes('child_ages'), `${manifest.id}: child ages are not sent to BuildAura`)
    }
    const book = backend['resources/views/site/book.blade.php'] ?? ''
    if (usesBuildauraCrs(manifest.id)) {
      assert(book.includes('name="payment_method"'), `${manifest.id}: hotel checkout collects a payment method`)
      assert(book.includes('value="sandbox"'), `${manifest.id}: sandbox confirms without a processor`)
      assert(book.includes('value="chapa"'), `${manifest.id}: Chapa is offered on hotel checkout`)
      assert(book.includes('name="card_number"'), `${manifest.id}: card details stay on the hotel site`)
      assert(!book.includes('name="card_number" required'), `${manifest.id}: card fields are required only when card is selected`)
      assert(backend['app/Http/Controllers/BookingController.php']?.includes("'payment_method' => 'required|in:chapa,sandbox,card'"), `${manifest.id}: hotel checkout accepts Chapa, sandbox, and card`)
      assert(backend['database/migrations/0001_01_01_2100_create_guest_reservations_table.php']?.includes("string('group_code')"), `${manifest.id}: a stay can cover more than one room`)
      assert(stayPage.includes('pay at the property when they arrive'), `${manifest.id}: hotel payment policy does not invent a card checkout`)
      const controller = backend['app/Http/Controllers/BookingController.php'] ?? ''
      const occupyAt = controller.indexOf('->occupy(')
      const createAt = controller.indexOf('GuestReservation::create')
      assert(occupyAt >= 0 && createAt > occupyAt && !controller.slice(occupyAt, createAt).includes('child_ages'), `${manifest.id}: child ages are not sent to Buildaura`)
      assert(occupyAt >= 0 && createAt > occupyAt && !controller.slice(occupyAt, createAt).includes('guest_name'), `${manifest.id}: guest name is not sent to Buildaura`)
    } else {
      assert(book.includes("@if($settings->pay_on_arrival)"), `${manifest.id}: pay on arrival is optional`)
      assert(book.includes('name="payment_method"'), `${manifest.id}: guests can choose pay on arrival`)
      assert(book.includes('name="card_number" required'), `${manifest.id}: card checkout stays required when pay on arrival is off`)
      assert(book.includes('value="sandbox"'), `${manifest.id}: sandbox confirms without a processor`)
      assert(book.includes('value="chapa"'), `${manifest.id}: Chapa is offered at checkout`)
      const controller = backend['app/Http/Controllers/BookingController.php'] ?? ''
      assert(controller.includes("$rules['payment_method'] = 'required|in:'.$methods"), `${manifest.id}: checkout payment methods are validated`)
      assert(controller.includes("'chapa,sandbox,card,arrival'"), `${manifest.id}: arrival is accepted only when the policy is on`)
      assert(controller.includes("'chapa,sandbox,card'"), `${manifest.id}: Chapa, sandbox, and card are always accepted`)
      assert(backend['database/migrations/0001_01_01_2000_create_reservations_table.php']?.includes("string('group_code')"), `${manifest.id}: a stay can cover more than one room`)
      const availability = backend['app/Services/AvailabilityService.php'] ?? ''
      assert(availability.includes("'pay_on_arrival'"), `${manifest.id}: arrival reservations are stored unpaid`)
      assert(availability.includes("'fake_card'"), `${manifest.id}: card reservations still record a card payment`)
      assert(availability.includes("'chapa'"), `${manifest.id}: Chapa is stored on the reservation`)
      assert(availability.includes("'sandbox'"), `${manifest.id}: sandbox is stored on the reservation`)
      assert(backend['resources/views/site/booking-confirm.blade.php']?.includes("payment_method === 'pay_on_arrival'"), `${manifest.id}: confirmation names pay on arrival`)
    }
  } else {
    assert(!adminPanel.includes("'Hospitality'"), `${manifest.id}: business navigation has no hospitality group`)
    assert(!backend['app/Filament/Pages/StayPolicies.php'], `${manifest.id}: business sites do not get hotel stay policies`)
    assert(!settingsPages.includes("Tab::make('Stay policies')"), `${manifest.id}: business sites do not show hotel stay policies`)
    assert(!backend['resources/views/partials/stay-policies.blade.php'], `${manifest.id}: business sites do not render stay policies`)
    assert(!backend['app/Support/StayRequest.php'], `${manifest.id}: business sites do not collect hotel stay dates`)
  }
  const quotes = backend['app/Filament/Resources/TestimonialResource.php'] ?? ''
  assert(quotes.includes('SelectFilter'), `${manifest.id}: testimonials must filter by author or role`)
  assert(quotes.includes('->searchable()'), `${manifest.id}: testimonials must be searchable`)
  assert(quotes.includes('persistSortInSession()'), `${manifest.id}: testimonial sort must persist`)
  const serviceAdmin = backend['app/Filament/Resources/ServiceResource.php'] ?? ''
  if (serviceAdmin) {
    assert(serviceAdmin.includes('->searchable()'), `${manifest.id}: services must be searchable`)
    assert(serviceAdmin.includes('->sortable()'), `${manifest.id}: services must be sortable`)
    assert(serviceAdmin.includes('persistSearchInSession()'), `${manifest.id}: service search must persist`)
  }
  const blogAdmin = backend['app/Filament/Resources/BlogPostResource.php'] ?? ''
  if (blogAdmin) {
    assert(blogAdmin.includes('TernaryFilter'), `${manifest.id}: blog posts must filter published state`)
    assert(blogAdmin.includes('published_between'), `${manifest.id}: blog posts must filter by publish date`)
    assert(blogAdmin.includes('ToggleColumn'), `${manifest.id}: blog published state is a list toggle`)
    assert(blogAdmin.includes("->label('Summary')"), `${manifest.id}: blog summary is labeled Summary`)
    assert(blogAdmin.includes("->reorderable('sort_order')"), `${manifest.id}: blog order is drag and drop`)
    assert(blogAdmin.includes('AdminImage::upload'), `${manifest.id}: blog images use the shared uploader`)
    assert(blogAdmin.includes("->format('g:i A')"), `${manifest.id}: blog dates include the time`)
    assert(blogAdmin.includes('->lineClamp(2)'), `${manifest.id}: blog title and summary stay on two lines`)
    assert(blogAdmin.includes("width('12rem')"), `${manifest.id}: blog titles stay in a narrow column`)
    assert(blogAdmin.includes('min-width:12rem'), `${manifest.id}: blog summaries keep a readable width`)
    assert(blogAdmin.indexOf("ImageColumn::make('image')") < blogAdmin.indexOf("TextColumn::make('title')"), `${manifest.id}: blog cover comes before the title`)
    assert(!blogAdmin.includes("label('Sort Order')"), `${manifest.id}: blog sort number stays off the form`)
    assert(!blogAdmin.includes("label('Excerpt')"), `${manifest.id}: blog no longer says Excerpt`)
    assert(!blogAdmin.includes("TextColumn::make('slug')"), `${manifest.id}: blog list hides the url slug`)
    assert(!blogAdmin.includes("TextInput::make('slug')"), `${manifest.id}: blog form hides the url slug`)
    const blogCreate = backend['app/Filament/Resources/BlogPostResource/Pages/CreateBlogPost.php'] ?? ''
    const blogEdit = backend['app/Filament/Resources/BlogPostResource/Pages/EditBlogPost.php'] ?? ''
    assert(blogCreate.includes('mutateFormDataBeforeCreate'), `${manifest.id}: a new blog post builds its slug`)
    assert(blogCreate.includes('uniqueSlug'), `${manifest.id}: a new blog post builds its slug from the title`)
    assert(blogEdit.includes('mutateFormDataBeforeSave'), `${manifest.id}: an edited blog post rebuilds its slug`)
    assert(blogEdit.includes('uniqueSlug'), `${manifest.id}: an edited blog post rebuilds its slug from the title`)
  }
  const newsAdmin = backend['app/Filament/Resources/NewsPostResource.php'] ?? ''
  assert(newsAdmin.includes('ToggleColumn'), `${manifest.id}: news published state is a list toggle`)
  assert(newsAdmin.includes("->label('Summary')"), `${manifest.id}: news summary is labeled Summary`)
  assert(newsAdmin.includes('->lineClamp(2)'), `${manifest.id}: news title and summary stay on two lines`)
  assert(newsAdmin.includes("->format('g:i A')"), `${manifest.id}: news dates include the time`)
  assert(!newsAdmin.includes("label('Sort Order')"), `${manifest.id}: news sort number stays off the form`)
  assert(!newsAdmin.includes("TextInput::make('slug')"), `${manifest.id}: news form hides the url slug`)
  const newsCreate = backend['app/Filament/Resources/NewsPostResource/Pages/CreateNewsPost.php'] ?? ''
  const newsEdit = backend['app/Filament/Resources/NewsPostResource/Pages/EditNewsPost.php'] ?? ''
  assert(newsCreate.includes('uniqueSlug'), `${manifest.id}: a new news post builds its slug from the title`)
  assert(newsEdit.includes('mutateFormDataBeforeSave'), `${manifest.id}: an edited news post rebuilds its slug`)
  assert(generalSettings.includes("AdminImage::upload('hero_image')"), `${manifest.id}: hero image keeps its stored file`)
  assert(brandSettings.includes("AdminImage::upload('logo')"), `${manifest.id}: logo keeps its stored file`)
  assert(aboutSettings.includes("AdminImage::upload('about_image')"), `${manifest.id}: about image keeps its stored file`)
  assert(backend['app/Support/AdminImage.php']?.includes('imageEditor()'), `${manifest.id}: admin images open the editor`)
  assert(backend['app/Support/AdminImage.php']?.includes('fetchFileInformation(false)'), `${manifest.id}: stored image urls are not dropped on save`)
  assert(settingsMigration.includes("text('hero_image')"), `${manifest.id}: hero image stores a long url`)
  assert(backend['resources/views/partials/map.blade.php']?.includes('MapEmbed::src'), `${manifest.id}: map partial builds an embed`)
  assert(backend['resources/views/site/contact.blade.php']?.includes("@include('partials.map')"), `${manifest.id}: contact page shows the map`)
  assert(!backend['resources/views/site/contact.blade.php']?.includes('urlencode($mapSrc)'), `${manifest.id}: contact map does not wrap the raw url`)
  assert((backend['resources/views/partials/home-contact.blade.php'] ?? '').includes("@include('partials.map')"), `${manifest.id}: home contact shows the map`)
  const guestNotes = backend['resources/views/partials/testimonials.blade.php'] ?? ''
  assert(guestNotes.includes('<section class="py-20">'), `${manifest.id}: guest notes stay on the page background`)
  assert(guestNotes.includes('bg-white p-8 text-slate-900'), `${manifest.id}: guest note cards use dark text on white`)
  assert(!guestNotes.includes('text-slate-600') && !guestNotes.includes('text-slate-500'), `${manifest.id}: guest note captions follow the page color`)
  const footerBlade = backend['resources/views/partials/footer.blade.php'] ?? ''
  assert(!footerBlade.includes('text-slate-600') && !footerBlade.includes('text-slate-900'), `${manifest.id}: footer text follows the page color`)
  const blogIndex = backend['resources/views/site/blog.blade.php'] ?? ''
  assert(blogIndex.includes('bg-slate-50 py-20 text-slate-900'), `${manifest.id}: the blog list uses dark text on its light band`)
  assert(blogIndex.includes('bg-white text-slate-900'), `${manifest.id}: blog cards use dark text on white`)
  const newsIndex = backend['resources/views/site/news.blade.php'] ?? ''
  assert(newsIndex.includes('<section class="py-20">'), `${manifest.id}: the news heading stays on the page background`)
  assert(newsIndex.includes('bg-white text-slate-900'), `${manifest.id}: news cards use dark text on white`)
  const homeFaq = backend['resources/views/partials/home-faq.blade.php'] ?? ''
  assert(!homeFaq.includes('text-slate-600'), `${manifest.id}: faq answers do not force a dark gray`)
  const contactForm = backend['resources/views/partials/contact-form.blade.php'] ?? ''
  if (contactForm.includes('bg-white')) {
    assert(contactForm.includes('text-slate-900'), `${manifest.id}: a white contact form uses dark text`)
  }
  const explore = backend['resources/views/partials/home-explore.blade.php'] ?? ''
  if (explore.includes('background:#fff')) {
    assert(explore.includes('color:#0f172a'), `${manifest.id}: white explore links use dark text`)
  }
  if (isCloneTemplate(manifest.id)) {
    assert(homeBlade.includes("@include('partials.map')"), `${manifest.id}: home page shows the map`)
  }
}

const keyed = generateBackend(
  'hotel',
  templateDefaults.hotel,
  requireManifest('hotel').defaultColorSchemeId,
  requireManifest('hotel').defaultLayoutVariantId,
  [],
  { apiBaseUrl: 'http://localhost:8080', apiKey: 'crs_abc', hotelId: '11111111-1111-4111-8111-111111111111' },
)
assert(keyed['.env']?.includes('CRS_API_KEY=crs_abc'), 'export should bake the site key into .env')
assert(keyed['.env.example']?.includes('CRS_HOTEL_ID=11111111-1111-4111-8111-111111111111'), 'export should bake the hotel id into .env.example')
assert(!keyed['resources/views/site/index.blade.php']?.includes('Models\\\\RoomType') && !keyed['resources/views/site/index.blade.php']?.includes('App\\Models\\RoomType'), 'keyed hotel home has no RoomType class')

const hotelJson = stringifyManifest(requireManifest('hotel'))
const parsedHotel = parseTemplateJson(hotelJson)
assert(parsedHotel.ok, 'hotel JSON should round-trip')
if (parsedHotel.ok) {
  assert(parsedHotel.manifest.id === 'hotel', 'round-tripped hotel id')
  assert(parsedHotel.manifest.features.includes('hospitality'), 'round-tripped hotel features')
}

const siteDoc = buildSiteDocument('hotel', templateDefaults.hotel, 'gold', 'luxury')
assert(siteDoc.kind === 'webbuilder-site', 'site document kind')
assert(siteDoc.schemaVersion === 1, 'site document version')
assert(siteDoc.templateId === 'hotel', 'site document template id')
assert(siteDoc.content.businessName === templateDefaults.hotel.businessName, 'site document keeps edited content')
assert(siteDoc.template.id === 'hotel', 'site document embeds template design')
const parsedSite = parseSiteDocument(stringifySiteDocument(siteDoc))
assert(parsedSite.ok, 'site document round-trips')
if (parsedSite.ok) {
  assert(parsedSite.document.content.businessName === siteDoc.content.businessName, 'restored content matches')
  assert('logo' in parsedSite.document.content, 'site document keeps logo')
  assert('brandPrimary' in parsedSite.document.content, 'site document keeps brand colors')
  assert('fontHeading' in parsedSite.document.content, 'site document keeps fonts')
}

const branded = {
  ...templateDefaults.hotel,
  logo: 'https://example.com/brand-logo.png',
  logoShowName: false,
  brandPrimary: '#112233',
  brandSecondary: '#445566',
  brandAccent: '#778899',
  fontHeading: 'playfair',
  fontBody: 'inter',
}
const brandedDoc = buildSiteDocument('hotel', branded, 'gold', 'luxury')
assert(brandedDoc.content.logo === branded.logo, 'branded site document stores logo')
assert(brandedDoc.content.brandPrimary === '#112233', 'branded site document stores primary')
assert(brandedDoc.content.fontHeading === 'playfair', 'branded site document stores heading font')

const brandedPages = buildAllSitePages('hotel', branded)
assert(brandedPages.pages['index.html']?.includes('brand-logo.png'), 'static export includes logo')
assert(brandedPages.pages['index.html']?.includes('--brand-primary: #112233'), 'static export includes primary color')
assert(brandedPages.pages['index.html']?.includes('--brand-secondary: #445566'), 'static export includes secondary color')
assert(brandedPages.pages['index.html']?.includes('Playfair+Display'), 'static export loads heading font')
assert(brandedPages.pages['index.html']?.includes('data-site-brand'), 'static export marks brand root')

const brandedBackend = generateBackend('hotel', branded, 'gold', 'luxury', [])
assert(brandedBackend['app/Support/Brand.php']?.includes('playfair'), 'Laravel Brand helper includes fonts')
assert(brandedBackend['database/migrations/0001_01_01_000001_create_site_settings_table.php']?.includes("'logo'"), 'settings migration has logo')
assert(brandedBackend['app/Filament/Pages/BrandSettings.php']?.includes("navigationLabel = 'Brand'"), 'Filament has a Brand page')
assert(brandedBackend['app/Filament/Pages/FooterSettings.php']?.includes("navigationLabel = 'Footer'"), 'Filament has a Footer page')
assert(brandedBackend['resources/views/partials/footer.blade.php']?.includes('footer_blurb'), 'Blade footer reads footer text')
assert(brandedBackend['database/migrations/0001_01_01_000001_create_site_settings_table.php']?.includes('footer_note'), 'settings migration stores the copyright note')
assert(brandedBackend['resources/views/layouts/site.blade.php']?.includes('data-site-brand'), 'Blade layout uses brand root')
assert(!brandedPages.pages['index.html']?.includes('property="og:'), 'static export has no Open Graph tags')
assert(!brandedBackend['public/robots.txt'], 'export does not write robots.txt')
assert(!brandedBackend['public/sitemap.xml'], 'export does not write a sitemap')
assert(!brandedBackend['resources/views/layouts/site.blade.php']?.includes('og:'), 'Blade layout has no Open Graph tags')
assert(brandedBackend['resources/views/partials/nav.blade.php']?.includes('$settings->logo'), 'Blade nav renders logo')

const customId = 'my-new-lodge'
const customDoc = buildSiteDocument('hotel', { ...templateDefaults.hotel, businessName: 'New Lodge' }, 'gold', 'classic')
customDoc.templateId = customId
customDoc.template = { ...customDoc.template, id: customId, name: 'New Lodge layout' }
const parsedCustom = parseSiteDocument(stringifySiteDocument(customDoc))
assert(parsedCustom.ok, 'custom template site document is valid')
if (parsedCustom.ok) {
  assert(parsedCustom.document.templateId === customId, 'new template id survives')
}

const business = requireManifest('business')
const hotel = requireManifest('hotel')
assert(business.features.includes('cms') && !business.features.includes('hospitality'), 'business should be CMS-only')
assert(hotel.features.includes('hospitality'), 'hotel should include hospitality')
assert(hotel.navShell === 'hotel', 'hotel nav shell should stay hotel')

const cpa = requireManifest('cpa')
assert(cpa.category === 'finance', 'cpa should be in the finance category')
assert(cpa.navShell === 'cpa', 'cpa nav shell should stay cpa')
assert(cpa.features.includes('cms') && !cpa.features.includes('hospitality'), 'cpa should be CMS-only')
assert(templateDefaults.cpa?.licenseNumber, 'cpa should seed a license number')

const taxfighters = requireManifest('taxfighters')
assert(taxfighters.category === 'finance', 'taxfighters should be in the finance category')
assert(taxfighters.navShell === 'taxfighters', 'taxfighters nav shell should stay taxfighters')
assert(templateDefaults.taxfighters?.businessName === 'Revenue Desk', 'taxfighters should seed Revenue Desk')
assert(templateDefaults.taxfighters?.phone === '+1 404 555 8299', 'taxfighters should seed the storefront phone')
assert(templateDefaults.taxfighters?.contactFormButtonText === 'Send message', 'contact button should read Send message')

const aureum = requireManifest('aureum')
assert(aureum.category === 'finance', 'aureum should be in the finance category')
assert(aureum.navShell === 'aureum', 'aureum nav shell should stay aureum')
assert(templateDefaults.aureum?.businessName === 'Ledger Studio', 'aureum should seed Ledger Studio')

const flux = requireManifest('flux')
assert(flux.category === 'finance', 'flux should be in the finance category')
assert(flux.navShell === 'flux', 'flux nav shell should stay flux')
assert(templateDefaults.flux?.businessName === 'Hearth Advisory', 'flux should seed Hearth Advisory')

const axiom = requireManifest('axiom')
assert(axiom.category === 'finance', 'axiom should be in the finance category')
assert(axiom.navShell === 'axiom', 'axiom nav shell should stay axiom')
assert(templateDefaults.axiom?.businessName === 'Northline Audit', 'axiom should seed Northline Audit')

const helix = requireManifest('helix')
assert(helix.category === 'finance', 'helix should be the sixth tax template')
assert(helix.navShell === 'helix', 'helix nav shell should stay helix')
assert(templateDefaults.helix?.businessName === 'Civic Tax Desk', 'helix should seed Civic Tax Desk')

const financeIds = ['cpa', 'taxfighters', 'aureum', 'flux', 'axiom', 'helix'] as const
for (const id of financeIds) {
  const defaults = templateDefaults[id]
  const { pages } = buildAllSitePages(id, defaults)
  const nameInHtml = defaults.businessName.replace(/&/g, '&amp;')
  assert(pages['index.html']?.includes(nameInHtml) || pages['index.html']?.includes(defaults.businessName), `${id}: static home missing business name`)
  const firstService = (defaults.services[0]?.title ?? '').replace(/&/g, '&amp;')
  assert(
    !firstService || pages['services.html']?.includes(firstService) || pages['services.html']?.includes(defaults.services[0].title),
    `${id}: services page missing first service`,
  )
  assert(pages['contact.html']?.includes(defaults.phone) || pages['contact.html']?.includes(defaults.email), `${id}: contact page missing phone/email`)
  const backend = generateBackend(id, defaults, requireManifest(id).defaultColorSchemeId, requireManifest(id).defaultLayoutVariantId, [])
  assert(backend['resources/views/site/index.blade.php']?.includes('@extends'), `${id}: missing Blade home`)
  assert(backend['resources/views/partials/nav.blade.php'], `${id}: missing Blade nav`)
  assert(backend['app/Http/Controllers/SiteController.php'] || Object.keys(backend).some((p) => p.includes('Controller')), `${id}: missing site controller`)
  assert(backend['database/seeders/DatabaseSeeder.php']?.includes(defaults.businessName), `${id}: seeder missing business name`)
  assert(backend['app/Filament/Resources/ServiceResource.php'], `${id}: missing Service Filament resource`)
  assert(backend['app/Filament/Resources/FaqResource.php'], `${id}: missing FAQ Filament resource`)
  assert(backend['app/Filament/Pages/ContactSettings.php']?.includes('license_number'), `${id}: Filament should edit license`)
  assert(backend['routes/web.php']?.includes("route('contact')") || backend['routes/web.php']?.includes('contact'), `${id}: missing contact route`)
  assert(!backend['app/Models/RoomType.php'], `${id}: finance export must not include booking models`)
  assert(pages['index.html']?.includes('js-clone-form'), `${id}: static home must include working clone forms`)
  assert(pages['index.html']?.includes('booking-modal'), `${id}: static home must include booking modal`)
  assert(pages['index.html']?.includes('name="phone"'), `${id}: static forms must collect phone`)
  assert(backend['resources/views/site/index.blade.php']?.includes('contact.store'), `${id}: Blade home must post to contact.store`)
  assert(backend['resources/views/site/index.blade.php']?.includes('@csrf'), `${id}: Blade forms must include CSRF`)
  assert(backend['app/Http/Controllers/ContactController.php']?.includes('service_type'), `${id}: ContactController must accept booking fields`)
}

assert(generateBackend('taxfighters', templateDefaults.taxfighters, 'burgundy-fight', 'classic', [])['resources/views/site/index.blade.php']?.includes('#e60039'), 'taxfighters Blade home should keep rose')
assert(generateBackend('aureum', templateDefaults.aureum, requireManifest('aureum').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#9333ea'), 'aureum Blade home should keep purple')
assert(generateBackend('flux', templateDefaults.flux, requireManifest('flux').defaultColorSchemeId, 'modern', [])['resources/views/site/index.blade.php']?.includes('#FA6B34'), 'flux Blade home should keep orange')
assert(generateBackend('axiom', templateDefaults.axiom, requireManifest('axiom').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#0B4F8A'), 'axiom Blade home should keep blue')
assert(generateBackend('helix', templateDefaults.helix, requireManifest('helix').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#800020'), 'helix Blade home should keep burgundy')
assert(generateBackend('cpa', templateDefaults.cpa, requireManifest('cpa').defaultColorSchemeId, 'classic', [])['resources/views/site/index.blade.php']?.includes('#16302A'), 'cpa Blade home should keep forest')

const cpaNative = resolveClonePalette('cpa', templateDefaults.cpa, requireManifest('cpa').defaultColorSchemeId)
assert(cpaNative.ink.toLowerCase() === '#16302a', 'cpa first scheme ink is forest')
assert(cpaNative.accent.toLowerCase() === '#a8d93f', 'cpa first scheme accent is lime')
assert(cpaNative.surface.toLowerCase() === '#f6f3ea', 'cpa first scheme surface is cream')
const cpaAlt = resolveClonePalette('cpa', { ...templateDefaults.cpa, brandPrimary: '#ff0000', brandSecondary: '#00ff00', brandAccent: '#0000ff' }, 'forest-trust')
assert(cpaAlt.ink.toLowerCase() === '#00ff00', 'custom brand color overrides the scheme ink')
assert(cpaAlt.accent.toLowerCase() === '#ff0000', 'custom brand color overrides the scheme accent')
assert(cpaAlt.surface.toLowerCase() === '#f7d6ce', 'custom brand color tints the surface')
const fluxNative = resolveClonePalette('flux', templateDefaults.flux, requireManifest('flux').defaultColorSchemeId)
assert(fluxNative.surface.toLowerCase() === '#fff9f4', 'flux first scheme keeps warm peach surface')
assert(fluxNative.accent.toLowerCase() === '#fa6b34', 'flux first scheme keeps ember accent')
const helixNative = resolveClonePalette('helix', templateDefaults.helix, requireManifest('helix').defaultColorSchemeId)
assert(helixNative.accent.toLowerCase() === '#800020', 'helix first scheme keeps burgundy')
const cpaCss = clonePaletteCss('cpa', cpaNative)
assert(cpaCss.includes('--clone-surface: #F6F3EA') || cpaCss.toLowerCase().includes('--clone-surface: #f6f3ea'), 'cpa palette css emits cream surface')
const cpaAltCss = clonePaletteCss('cpa', cpaAlt)
assert(cpaAltCss.toLowerCase().includes('#ff0000'), 'custom brand color is emitted in the palette css')

const hotelBackend = generateBackend('hotel', templateDefaults.hotel, hotel.defaultColorSchemeId, hotel.defaultLayoutVariantId, [], {
  apiBaseUrl: 'http://localhost:8080',
  hotelId: '11111111-1111-1111-1111-111111111111',
  apiKey: 'crs_abc',
})
assert(!hotelBackend['app/Models/RoomType.php'], 'hotel Laravel export should manage rooms through Buildaura')
assert(hotelBackend['.env.example']?.includes('BUILDAURA_API_KEY="crs_abc"'), 'hotel .env.example should contain the working key')
assert(hotelBackend['.env.example']?.includes('BUILDAURA_HOTEL_ID="11111111-1111-1111-1111-111111111111"'), 'hotel .env.example should contain the hotel id')
assert(Object.keys(hotelBackend).some((path) => path.includes('BookingController')), 'hotel Laravel export should include booking')
assert(hotelBackend['app/Filament/Pages/ApiKey.php']?.includes('class ApiKey'), 'hotel admin should request a new API key')
const alpineBackend = generateBackend('alpine', templateDefaults.alpine, requireManifest('alpine').defaultColorSchemeId, requireManifest('alpine').defaultLayoutVariantId, [])
assert(!alpineBackend['app/Models/RoomType.php'], 'alpine inventory stays on the CRS client')
assert(alpineBackend['app/Services/CrsClient.php'], 'alpine keeps the site CRS client')
assert(!alpineBackend['.env.example']?.includes('BUILDAURA_API_KEY'), 'alpine must not receive a Buildaura key')
assert(gluedHits.length === 0, `glued Blade directives:\n${gluedHits.join('\n')}`)

console.log(`ok: ${manifests.length} templates, preview defaults + static ZIP + Laravel ZIP`)
