import type { PageVisibility, SectionVisibility } from '../../types'
import { phpStr } from './phpUtils'

interface ResourceDef {
  name: string
  model: string
  icon: string
  label: string
  fields: Array<{ name: string; type: 'text' | 'textarea' | 'image' | 'number' | 'url' | 'boolean' | 'date'; label: string }>
}

const RESOURCE_DEFS: ResourceDef[] = [
  {
    name: 'Stat',
    model: 'Stat',
    icon: 'heroicon-o-chart-bar',
    label: 'Stats',
    fields: [
      { name: 'value', type: 'text', label: 'Value' },
      { name: 'label', type: 'text', label: 'Label' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'Service',
    model: 'Service',
    icon: 'heroicon-o-briefcase',
    label: 'Services',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'Step',
    model: 'Step',
    icon: 'heroicon-o-list-bullet',
    label: 'Process Steps',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'ShowcaseItem',
    model: 'ShowcaseItem',
    icon: 'heroicon-o-star',
    label: 'Showcase Items',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'image', type: 'image', label: 'Image' },
      { name: 'price', type: 'text', label: 'Price' },
      { name: 'tag', type: 'text', label: 'Tag' },
      { name: 'link', type: 'url', label: 'Link' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'GalleryImage',
    model: 'GalleryImage',
    icon: 'heroicon-o-photo',
    label: 'Gallery',
    fields: [
      { name: 'path', type: 'image', label: 'Image' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'TeamMember',
    model: 'TeamMember',
    icon: 'heroicon-o-user-group',
    label: 'Team',
    fields: [
      { name: 'name', type: 'text', label: 'Name' },
      { name: 'role', type: 'text', label: 'Role' },
      { name: 'image', type: 'image', label: 'Photo' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'Testimonial',
    model: 'Testimonial',
    icon: 'heroicon-o-chat-bubble-left-right',
    label: 'Testimonials',
    fields: [
      { name: 'quote', type: 'textarea', label: 'Quote' },
      { name: 'author', type: 'text', label: 'Author' },
      { name: 'role', type: 'text', label: 'Role' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'BlogPost',
    model: 'BlogPost',
    icon: 'heroicon-o-newspaper',
    label: 'Blog Posts',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'slug', type: 'text', label: 'URL Slug' },
      { name: 'excerpt', type: 'textarea', label: 'Summary' },
      { name: 'body', type: 'textarea', label: 'Content' },
      { name: 'image', type: 'image', label: 'Cover Image' },
      { name: 'author', type: 'text', label: 'Author' },
      { name: 'is_published', type: 'boolean', label: 'Published' },
      { name: 'published_at', type: 'date', label: 'Publish Date' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'NewsPost',
    model: 'NewsPost',
    icon: 'heroicon-o-megaphone',
    label: 'News Posts',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'slug', type: 'text', label: 'URL Slug' },
      { name: 'excerpt', type: 'textarea', label: 'Summary' },
      { name: 'body', type: 'textarea', label: 'Content' },
      { name: 'image', type: 'image', label: 'Cover Image' },
      { name: 'author', type: 'text', label: 'Author' },
      { name: 'is_published', type: 'boolean', label: 'Published' },
      { name: 'published_at', type: 'date', label: 'Publish Date' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'Faq',
    model: 'Faq',
    icon: 'heroicon-o-question-mark-circle',
    label: 'FAQs',
    fields: [
      { name: 'question', type: 'text', label: 'Question' },
      { name: 'answer', type: 'textarea', label: 'Answer' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
  {
    name: 'PricingPlan',
    model: 'PricingPlan',
    icon: 'heroicon-o-currency-dollar',
    label: 'Pricing Plans',
    fields: [
      { name: 'title', type: 'text', label: 'Title' },
      { name: 'price', type: 'text', label: 'Price' },
      { name: 'tag', type: 'text', label: 'Tag' },
      { name: 'description', type: 'textarea', label: 'Description' },
      { name: 'featured', type: 'boolean', label: 'Featured' },
      { name: 'sort_order', type: 'number', label: 'Sort Order' },
    ],
  },
]

function filamentField(field: ResourceDef['fields'][number]): string {
  const col = `Forms\\Components\\TextInput::make('${field.name}')`
  const area = `Forms\\Components\\Textarea::make('${field.name}')`
  const img = `\\App\\Support\\AdminImage::upload('${field.name}')`
  const num = `Forms\\Components\\TextInput::make('${field.name}')->numeric()`
  const toggle = `Forms\\Components\\Toggle::make('${field.name}')`
  const date = `Forms\\Components\\DateTimePicker::make('${field.name}')`

  const component =
    field.type === 'textarea' ? area
      : field.type === 'image' ? img
        : field.type === 'number' ? num
          : field.type === 'boolean' ? toggle
            : field.type === 'date' ? date
              : col

  return `${component}->label('${phpStr(field.label)}')`
}

const SELECT_FILTER_FIELDS = new Set(['tag', 'role', 'author'])

function filamentTableColumn(field: ResourceDef['fields'][number]): string {
  const label = `->label('${phpStr(field.label)}')`
  if (field.type === 'image') {
    return `Tables\\Columns\\ImageColumn::make('${field.name}')${label}->disk('public')->checkFileExistence(false)`
  }
  if (field.type === 'boolean') {
    return `Tables\\Columns\\IconColumn::make('${field.name}')${label}->boolean()->sortable()`
  }
  if (field.type === 'textarea') {
    const hidden = field.name === 'body' ? '->toggleable(isToggledHiddenByDefault: true)' : ''
    return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->searchable()->limit(60)->wrap()${hidden}`
  }
  if (field.type === 'date') {
    return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->dateTime('F j, Y g:i A')->sortable()`
  }
  if (field.type === 'number') {
    return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->sortable()`
  }
  return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->searchable()->sortable()`
}

function filamentFilters(def: ResourceDef): string {
  const filters: string[] = []
  for (const field of def.fields) {
    if (field.type === 'boolean') {
      filters.push(`Tables\\Filters\\TernaryFilter::make('${field.name}')->label('${phpStr(field.label)}')`)
    }
    if (SELECT_FILTER_FIELDS.has(field.name)) {
      filters.push(
        `Tables\\Filters\\SelectFilter::make('${field.name}')->label('${phpStr(field.label)}')->searchable()->options(fn () => ${def.model}::query()->whereNotNull('${field.name}')->where('${field.name}', '!=', '')->distinct()->orderBy('${field.name}')->pluck('${field.name}', '${field.name}')->all())`,
      )
    }
  }
  if (def.fields.some((field) => field.name === 'published_at')) {
    filters.push(`Tables\\Filters\\Filter::make('published_between')
                    ->label('Publish date')
                    ->form([
                        Forms\\Components\\DatePicker::make('from')->label('From'),
                        Forms\\Components\\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'] ?? null, fn ($query, $date) => $query->whereDate('published_at', '>=', $date))
                            ->when($data['until'] ?? null, fn ($query, $date) => $query->whereDate('published_at', '<=', $date));
                    })`)
  }
  return filters.join(",\n                ")
}

function postTableColumns(): string {
  return [
    `Tables\\Columns\\ImageColumn::make('image')->label('Cover')->disk('public')->checkFileExistence(false)->height(40)->width(56)->grow(false)->verticallyAlignStart()`,
    `Tables\\Columns\\TextColumn::make('title')->label('Title')->searchable()->wrap()->lineClamp(2)->width('12rem')->grow(false)->extraCellAttributes(['style' => 'max-width:12rem'])->tooltip(fn ($state): ?string => filled($state) ? (string) $state : null)->verticallyAlignStart()`,
    `Tables\\Columns\\TextColumn::make('excerpt')->label('Summary')->searchable()->wrap()->lineClamp(2)->grow()->extraCellAttributes(['style' => 'min-width:12rem'])->tooltip(fn ($state): ?string => filled($state) ? (string) $state : null)->verticallyAlignStart()`,
    `Tables\\Columns\\ToggleColumn::make('is_published')->label('Published')->grow(false)->verticallyAlignStart()`,
    `Tables\\Columns\\TextColumn::make('published_at')->label('Date')->date('M j, Y')->description(fn ($record): ?string => $record->published_at?->format('g:i A'))->sortable()->grow(false)->width('8rem')->extraCellAttributes(['style' => 'width:8rem;max-width:8rem'])->verticallyAlignStart()`,
    `Tables\\Columns\\TextColumn::make('author')->label('Author')->searchable()->toggleable()->wrap()->lineClamp(1)->grow(false)->width('8rem')->extraCellAttributes(['style' => 'max-width:8rem'])->verticallyAlignStart()`,
  ].join(",\n                ")
}

function generateResource(def: ResourceDef): string {
  const formFields = def.fields.filter((field) => field.name !== 'sort_order').map(filamentField).join(",\n                ")
  const tableCols = def.name === 'BlogPost' || def.name === 'NewsPost'
    ? postTableColumns()
    : def.fields.filter((field) => field.name !== 'sort_order').map(filamentTableColumn).join(",\n                ")
  const filters = filamentFilters(def)
  const filterChain = filters
    ? `->filters([\n                ${filters},\n            ])\n            `
    : ''

  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\${def.name}Resource\\Pages;
use App\\Models\\${def.model};
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class ${def.name}Resource extends Resource
{
    protected static ?string $model = ${def.model}::class;

    protected static ?string $navigationIcon = '${def.icon}';

    protected static ?string $navigationLabel = '${phpStr(def.label)}';

    protected static ?string $navigationGroup = 'Content';

    protected static ?int $navigationSort = ${RESOURCE_DEFS.findIndex((item) => item.name === def.name) + 1};

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Section::make()->schema([
                ${formFields},
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                ${tableCols},
            ])
            ${filterChain}->reorderable('sort_order')
            ->defaultSort('sort_order')
            ->paginated(false)
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->persistSortInSession()
            ->actions([
                Tables\\Actions\\EditAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\List${def.name}s::route('/'),
            'create' => Pages\\Create${def.name}::route('/create'),
            'edit' => Pages\\Edit${def.name}::route('/{record}/edit'),
        ];
    }
}
`
}

function generateResourcePages(def: ResourceDef): Record<string, string> {
  return {
    [`app/Filament/Resources/${def.name}Resource/Pages/List${def.name}s.php`]: `<?php

namespace App\\Filament\\Resources\\${def.name}Resource\\Pages;

use App\\Filament\\Resources\\${def.name}Resource;
use Filament\\Actions;
use Filament\\Resources\\Pages\\ListRecords;

class List${def.name}s extends ListRecords
{
    protected static string $resource = ${def.name}Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\CreateAction::make()];
    }
}
`,
    [`app/Filament/Resources/${def.name}Resource/Pages/Create${def.name}.php`]: `<?php

namespace App\\Filament\\Resources\\${def.name}Resource\\Pages;

use App\\Filament\\Resources\\${def.name}Resource;
use Filament\\Resources\\Pages\\CreateRecord;

class Create${def.name} extends CreateRecord
{
    protected static string $resource = ${def.name}Resource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $model = static::getModel();
        $data['sort_order'] = ($model::max('sort_order') ?? -1) + 1;

        return $data;
    }
}
`,
    [`app/Filament/Resources/${def.name}Resource/Pages/Edit${def.name}.php`]: `<?php

namespace App\\Filament\\Resources\\${def.name}Resource\\Pages;

use App\\Filament\\Resources\\${def.name}Resource;
use Filament\\Actions;
use Filament\\Resources\\Pages\\EditRecord;

class Edit${def.name} extends EditRecord
{
    protected static string $resource = ${def.name}Resource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\DeleteAction::make()];
    }
}
`,
  }
}

export function stayPoliciesAdminFiles(cardCheckout: boolean): Record<string, string> {
  const payHelp = cardCheckout
    ? 'When this is on, guests can pay at the property instead of paying by card, and that choice is shown while they reserve.'
    : 'When this is on, guests see that they can pay at the property when they arrive.'
  const navigationGroup = 'Hospitality'

  return {
    'app/Filament/Pages/StayPolicies.php': `<?php

namespace App\\Filament\\Pages;

use App\\Models\\SiteSetting;
use Filament\\Forms\\Components\\Toggle;
use Filament\\Forms\\Concerns\\InteractsWithForms;
use Filament\\Forms\\Contracts\\HasForms;
use Filament\\Forms\\Form;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;

class StayPolicies extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-check-badge';

    protected static ?string $navigationGroup = '${navigationGroup}';

    protected static ?string $navigationLabel = 'Stay policies';

    protected static ?string $title = 'Stay policies';

    protected static ?int $navigationSort = -10;

    protected static string $view = 'filament.pages.stay-policies';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SiteSetting::current();
        $this->form->fill([
            'free_cancellation' => (bool) $settings->free_cancellation,
            'pay_on_arrival' => (bool) $settings->pay_on_arrival,
            'free_breakfast' => (bool) $settings->free_breakfast,
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                Toggle::make('free_cancellation')
                    ->label('Free cancellation')
                    ->helperText('When this is on, guests see that they can cancel a stay at no charge.')
                    ->default(false),
                Toggle::make('pay_on_arrival')
                    ->label('Payment on arrival')
                    ->helperText('${payHelp}')
                    ->default(false),
                Toggle::make('free_breakfast')
                    ->label('Free breakfast')
                    ->helperText('When this is on, guests see that breakfast is included with the stay.')
                    ->default(false),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $state = $this->form->getState();
        SiteSetting::current()->update([
            'free_cancellation' => (bool) ($state['free_cancellation'] ?? false),
            'pay_on_arrival' => (bool) ($state['pay_on_arrival'] ?? false),
            'free_breakfast' => (bool) ($state['free_breakfast'] ?? false),
        ]);

        Notification::make()->title('Stay policies saved')->success()->send();
    }

    public function getSubheading(): ?string
    {
        return 'Turn a policy on to show it to guests while they reserve. Off policies stay hidden, and they start off.';
    }
}
`,
    'resources/views/filament/pages/stay-policies.blade.php': `<x-filament-panels::page>
    <x-filament-panels::form id="form" wire:submit="save">
        {{ $this->form }}
        <div style="margin-top:16px;">
            <x-filament::button type="submit">Save stay policies</x-filament::button>
        </div>
    </x-filament-panels::form>
</x-filament-panels::page>
`,
  }
}

function settingsPage(def: {
  className: string
  label: string
  icon: string
  sort: number
  schema: string
  fill: string
  persist: string
}): string {
  return `<?php

namespace App\\Filament\\Pages;

use App\\Models\\SiteSetting;
use Filament\\Forms;
use Filament\\Forms\\Concerns\\InteractsWithForms;
use Filament\\Forms\\Contracts\\HasForms;
use Filament\\Forms\\Form;
use Filament\\Notifications\\Notification;
use Filament\\Pages\\Page;

class ${def.className} extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = '${def.icon}';

    protected static ?string $navigationGroup = 'Website';

    protected static ?string $navigationLabel = '${phpStr(def.label)}';

    protected static ?string $title = '${phpStr(def.label)}';

    protected static ?int $navigationSort = ${def.sort};

    protected static string $view = 'filament.pages.settings-form';

    public ?array $data = [];

    public function mount(): void
    {
        $settings = SiteSetting::current();
        $this->form->fill([
            ${def.fill}
        ]);
    }

    public function form(Form $form): Form
    {
        return $form
            ->schema([
                ${def.schema}
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        $state = $this->form->getState();
        SiteSetting::current()->update([
            ${def.persist}
        ]);

        Notification::make()->title('${phpStr(def.label)} saved')->success()->send();
    }
}
`
}

function settingsFields(fields: Array<{ name: string; line: string }>): { schema: string; fill: string; persist: string } {
  return {
    schema: fields.map((field) => field.line).join(",\n                "),
    fill: fields.map((field) => `'${field.name}' => $settings->${field.name}`).join(",\n            "),
    persist: fields.map((field) => `'${field.name}' => $state['${field.name}'] ?? null`).join(",\n            "),
  }
}

function websiteSettingsPages(): Record<string, string> {
  const general = settingsFields([
    { name: 'business_name', line: `Forms\\Components\\TextInput::make('business_name')->required()` },
    { name: 'tagline', line: `Forms\\Components\\TextInput::make('tagline')` },
    { name: 'hero_subtext', line: `Forms\\Components\\Textarea::make('hero_subtext')` },
    { name: 'hero_image', line: `\\App\\Support\\AdminImage::upload('hero_image')` },
  ])
  general.persist = general.persist.replace(`'business_name' => $state['business_name'] ?? null`, `'business_name' => $state['business_name'] ?? ''`)

  const brand = settingsFields([
    { name: 'logo', line: `\\App\\Support\\AdminImage::upload('logo')->helperText('Shown in the site navigation.')` },
    { name: 'logo_show_name', line: `Forms\\Components\\Toggle::make('logo_show_name')->label('Show business name next to logo')->default(true)` },
    { name: 'brand_primary', line: `Forms\\Components\\ColorPicker::make('brand_primary')->label('Primary')->helperText('Buttons and calls to action.')` },
    { name: 'brand_secondary', line: `Forms\\Components\\ColorPicker::make('brand_secondary')->label('Secondary')` },
    { name: 'brand_accent', line: `Forms\\Components\\ColorPicker::make('brand_accent')->label('Accent')->helperText('Links, prices, and highlights.')` },
    { name: 'font_heading', line: `Forms\\Components\\Select::make('font_heading')->label('Heading font')->options(\\App\\Support\\Brand::selectOptions())->native(false)` },
    { name: 'font_body', line: `Forms\\Components\\Select::make('font_body')->label('Body font')->options(\\App\\Support\\Brand::selectOptions())->native(false)` },
  ])
  brand.persist = brand.persist.replace(
    `'logo_show_name' => $state['logo_show_name'] ?? null`,
    `'logo_show_name' => (bool) ($state['logo_show_name'] ?? false)`,
  )

  const about = settingsFields([
    { name: 'about_title', line: `Forms\\Components\\TextInput::make('about_title')` },
    { name: 'about', line: `Forms\\Components\\Textarea::make('about')` },
    { name: 'mission_statement', line: `Forms\\Components\\Textarea::make('mission_statement')` },
    { name: 'about_image', line: `\\App\\Support\\AdminImage::upload('about_image')` },
  ])

  const pageToggles = [
    ['about', 'About'],
    ['services', 'Services'],
    ['portfolio', 'Portfolio'],
    ['rooms', 'Rooms'],
    ['blog', 'Blog'],
    ['news', 'News'],
    ['gallery', 'Gallery'],
    ['contact', 'Contact'],
  ]
  const sectionToggles = [
    ['stats', 'Stats section'],
    ['steps', 'Process section'],
    ['team', 'Team section'],
    ['testimonials', 'Testimonials section'],
    ['faq', 'FAQ section'],
    ['pricing', 'Pricing section'],
    ['cta', 'Call to action'],
  ]
  const visibilitySchema = [
    ...pageToggles.map(([key, label]) => `Forms\\Components\\Toggle::make('page_visibility.${key}')->label('${label}')`),
    ...sectionToggles.map(([key, label]) => `Forms\\Components\\Toggle::make('section_visibility.${key}')->label('${label}')`),
  ].join(",\n                ")

  const sectionTitleNames = [
    'services_section_title',
    'services_section_subtitle',
    'steps_section_title',
    'showcase_section_title',
    'showcase_section_subtitle',
    'gallery_section_title',
    'testimonials_section_title',
    'blog_section_title',
    'blog_section_subtitle',
    'news_section_title',
    'news_section_subtitle',
    'pricing_section_title',
    'rooms_section_title',
    'rooms_section_subtitle',
    'booking_section_title',
    'booking_section_subtitle',
    'team_section_title',
    'faq_section_title',
  ]
  const sections = settingsFields(sectionTitleNames.map((name) => ({
    name,
    line: `Forms\\Components\\TextInput::make('${name}')`,
  })))

  const footer = settingsFields([
    { name: 'footer_blurb', line: `Forms\\Components\\Textarea::make('footer_blurb')->label('Footer text')->rows(3)->helperText('Shown under the business name. If empty, the public site uses the mission statement.')` },
    { name: 'footer_note', line: `Forms\\Components\\TextInput::make('footer_note')->label('Copyright note')->helperText('Appears after the year and business name. Hours, phone, email, and address come from Contact.')` },
  ])

  const seo = settingsFields([
    { name: 'seo_enabled', line: `Forms\\Components\\Toggle::make('seo_enabled')->label('Optimize SEO')` },
    { name: 'seo_title', line: `Forms\\Components\\TextInput::make('seo_title')->label('Meta Title')` },
    { name: 'seo_description', line: `Forms\\Components\\Textarea::make('seo_description')->label('Meta Description')->rows(3)` },
    { name: 'seo_keywords', line: `Forms\\Components\\Textarea::make('seo_keywords')->label('Keywords')->rows(2)` },
    { name: 'seo_site_url', line: `Forms\\Components\\TextInput::make('seo_site_url')->label('Live Site URL')->url()` },
  ])
  seo.persist = seo.persist.replace(
    `'seo_enabled' => $state['seo_enabled'] ?? null`,
    `'seo_enabled' => (bool) ($state['seo_enabled'] ?? false)`,
  )

  const contact = settingsFields([
    { name: 'cta_text', line: `Forms\\Components\\TextInput::make('cta_text')` },
    { name: 'cta_link', line: `Forms\\Components\\TextInput::make('cta_link')` },
    { name: 'cta_banner_title', line: `Forms\\Components\\TextInput::make('cta_banner_title')` },
    { name: 'cta_banner_text', line: `Forms\\Components\\Textarea::make('cta_banner_text')` },
    { name: 'contact_section_title', line: `Forms\\Components\\TextInput::make('contact_section_title')` },
    { name: 'contact_form_title', line: `Forms\\Components\\TextInput::make('contact_form_title')` },
    { name: 'contact_form_button_text', line: `Forms\\Components\\TextInput::make('contact_form_button_text')->label('Contact button label')->default('Send message')` },
    { name: 'email', line: `Forms\\Components\\TextInput::make('email')->email()` },
    { name: 'reservation_email', line: `Forms\\Components\\TextInput::make('reservation_email')->label('Reservations email')->email()` },
    { name: 'support_email', line: `Forms\\Components\\TextInput::make('support_email')->label('Support email')->email()` },
    { name: 'phone', line: `Forms\\Components\\TextInput::make('phone')` },
    { name: 'whatsapp', line: `Forms\\Components\\TextInput::make('whatsapp')->label('WhatsApp')` },
    { name: 'booking_url', line: `Forms\\Components\\TextInput::make('booking_url')->label('Booking or signup link')->url()` },
    { name: 'address', line: `Forms\\Components\\TextInput::make('address')` },
    { name: 'map_url', line: `Forms\\Components\\TextInput::make('map_url')->label('Google Maps link')->helperText('Paste a Google Maps URL or embed code. If empty, the map uses the office address.')` },
    { name: 'hours', line: `Forms\\Components\\TextInput::make('hours')` },
    { name: 'license_number', line: `Forms\\Components\\TextInput::make('license_number')->label('License / credentials')` },
    { name: 'instagram', line: `Forms\\Components\\TextInput::make('instagram')->label('Instagram')->url()` },
    { name: 'linkedin', line: `Forms\\Components\\TextInput::make('linkedin')->label('LinkedIn')->url()` },
    { name: 'website', line: `Forms\\Components\\TextInput::make('website')->label('Website')->url()` },
  ])

  const pages = [
    { className: 'GeneralSettings', label: 'General', icon: 'heroicon-o-building-office-2', sort: 1, ...general },
    { className: 'BrandSettings', label: 'Brand', icon: 'heroicon-o-swatch', sort: 2, ...brand },
    { className: 'AboutSettings', label: 'About', icon: 'heroicon-o-information-circle', sort: 3, ...about },
    {
      className: 'VisibilitySettings',
      label: 'Visibility',
      icon: 'heroicon-o-eye',
      sort: 4,
      schema: visibilitySchema,
      fill: `'page_visibility' => $settings->page_visibility ?? [],\n            'section_visibility' => $settings->section_visibility ?? []`,
      persist: `'page_visibility' => $state['page_visibility'] ?? [],\n            'section_visibility' => $state['section_visibility'] ?? []`,
    },
    { className: 'SectionTitleSettings', label: 'Section titles', icon: 'heroicon-o-bars-3-bottom-left', sort: 5, ...sections },
    { className: 'FooterSettings', label: 'Footer', icon: 'heroicon-o-bars-3', sort: 6, ...footer },
    { className: 'SeoSettings', label: 'SEO', icon: 'heroicon-o-magnifying-glass', sort: 7, ...seo },
    { className: 'ContactSettings', label: 'Contact', icon: 'heroicon-o-phone', sort: 8, ...contact },
  ]

  const files: Record<string, string> = {
    'resources/views/filament/pages/settings-form.blade.php': `<x-filament-panels::page>
    <x-filament-panels::form id="form" wire:submit="save">
        {{ $this->form }}
        <div style="margin-top:16px;">
            <x-filament::button type="submit">Save</x-filament::button>
        </div>
    </x-filament-panels::form>
</x-filament-panels::page>
`,
  }
  for (const page of pages) {
    files[`app/Filament/Pages/${page.className}.php`] = settingsPage(page)
  }
  return files
}

export function generateContactMessageResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\ContactMessageResource\\Pages;
use App\\Models\\ContactMessage;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class ContactMessageResource extends Resource
{
    protected static ?string $model = ContactMessage::class;

    protected static ?string $navigationIcon = 'heroicon-o-inbox';

    protected static ?string $navigationLabel = 'Contact Messages';

    protected static ?string $navigationGroup = 'Inbox';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\TextInput::make('name')->disabled(),
            Forms\\Components\\TextInput::make('email')->disabled(),
            Forms\\Components\\TextInput::make('phone')->disabled(),
            Forms\\Components\\TextInput::make('service_type')->label('Service')->disabled(),
            Forms\\Components\\Textarea::make('message')->disabled()->rows(6),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('name')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('email')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('phone')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('service_type')->label('Service')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('message')->searchable()->limit(40)->wrap()->toggleable(isToggledHiddenByDefault: true),
                Tables\\Columns\\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\\Filters\\SelectFilter::make('service_type')
                    ->label('Service')
                    ->searchable()
                    ->options(fn () => ContactMessage::query()->whereNotNull('service_type')->where('service_type', '!=', '')->distinct()->orderBy('service_type')->pluck('service_type', 'service_type')->all()),
                Tables\\Filters\\Filter::make('received_between')
                    ->label('Received')
                    ->form([
                        Forms\\Components\\DatePicker::make('from')->label('From'),
                        Forms\\Components\\DatePicker::make('until')->label('Until'),
                    ])
                    ->query(function ($query, array $data) {
                        return $query
                            ->when($data['from'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '>=', $date))
                            ->when($data['until'] ?? null, fn ($query, $date) => $query->whereDate('created_at', '<=', $date));
                    }),
            ])
            ->defaultSort('created_at', 'desc')
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->persistSortInSession()
            ->actions([
                Tables\\Actions\\ViewAction::make(),
                Tables\\Actions\\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\\ListContactMessages::route('/'),
            'view' => Pages\\ViewContactMessage::route('/{record}'),
        ];
    }
}
`
}

interface DashboardStatDef {
  model: string
  label: string
  icon: string
  color: string
  description: string
  countExpr: string
  always?: boolean
  pageKey?: keyof PageVisibility
  sectionKey?: keyof SectionVisibility
}

const DASHBOARD_STATS: DashboardStatDef[] = [
  { model: 'ContactMessage', label: 'Contact Messages', icon: 'heroicon-m-inbox', color: 'primary', description: 'Inbox total', countExpr: 'ContactMessage::count()', always: true },
  { model: 'BlogPost', label: 'Blog Posts', icon: 'heroicon-m-newspaper', color: 'success', description: 'Published posts', countExpr: "BlogPost::where('is_published', true)->count()", pageKey: 'blog' },
  { model: 'NewsPost', label: 'News Posts', icon: 'heroicon-m-megaphone', color: 'info', description: 'Published articles', countExpr: "NewsPost::where('is_published', true)->count()", pageKey: 'news' },
  { model: 'Service', label: 'Services', icon: 'heroicon-m-briefcase', color: 'warning', description: 'Listed services', countExpr: 'Service::count()', pageKey: 'services' },
  { model: 'ShowcaseItem', label: 'Portfolio Items', icon: 'heroicon-m-star', color: 'warning', description: 'Showcase entries', countExpr: 'ShowcaseItem::count()', pageKey: 'portfolio' },
  { model: 'GalleryImage', label: 'Gallery Images', icon: 'heroicon-m-photo', color: 'gray', description: 'Gallery photos', countExpr: 'GalleryImage::count()', pageKey: 'gallery' },
  { model: 'Testimonial', label: 'Testimonials', icon: 'heroicon-m-chat-bubble-left-right', color: 'success', description: 'Client reviews', countExpr: 'Testimonial::count()', always: true },
  { model: 'TeamMember', label: 'Team Members', icon: 'heroicon-m-user-group', color: 'info', description: 'Team profiles', countExpr: 'TeamMember::count()', sectionKey: 'team' },
  { model: 'Faq', label: 'FAQs', icon: 'heroicon-m-question-mark-circle', color: 'gray', description: 'Help articles', countExpr: 'Faq::count()', sectionKey: 'faq' },
  { model: 'PricingPlan', label: 'Pricing Plans', icon: 'heroicon-m-currency-dollar', color: 'warning', description: 'Pricing plans', countExpr: 'PricingPlan::count()', sectionKey: 'pricing' },
]

function isDashboardStatEnabled(
  def: DashboardStatDef,
  sectionVisibility: SectionVisibility,
  pageVisibility: PageVisibility,
): boolean {
  if (def.always) return true
  if (def.pageKey) return pageVisibility[def.pageKey]
  if (def.sectionKey) return sectionVisibility[def.sectionKey]
  return false
}

function generateSiteStatsOverview(
  sectionVisibility: SectionVisibility,
  pageVisibility: PageVisibility,
): string {
  const stats = DASHBOARD_STATS.filter((d) => isDashboardStatEnabled(d, sectionVisibility, pageVisibility))
  const models = [...new Set(stats.map((s) => s.model))]
  const imports = models.map((m) => `use App\\Models\\${m};`).join('\n')
  const statLines = stats
    .map(
      (s) => `            Stat::make('${phpStr(s.label)}', ${s.countExpr})
                ->description('${phpStr(s.description)}')
                ->descriptionIcon('${s.icon}')
                ->color('${s.color}'),`,
    )
    .join('\n')

  return `<?php

namespace App\\Filament\\Widgets;

${imports}
use Filament\\Widgets\\StatsOverviewWidget as BaseWidget;
use Filament\\Widgets\\StatsOverviewWidget\\Stat;

class SiteStatsOverview extends BaseWidget
{
    protected static ?int $sort = 1;

    protected function getStats(): array
    {
        return [
${statLines}
        ];
    }
}
`
}

function generateContactMessagesChart(): string {
  return `<?php

namespace App\\Filament\\Widgets;

use App\\Models\\ContactMessage;
use Filament\\Widgets\\ChartWidget;

class ContactMessagesChart extends ChartWidget
{
    protected static ?string $heading = 'Contact Form Activity';

    protected static ?int $sort = 2;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $data = [];

        for ($i = 5; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $labels[] = $month->format('M Y');
            $data[] = ContactMessage::query()
                ->whereYear('created_at', $month->year)
                ->whereMonth('created_at', $month->month)
                ->count();
        }

        return [
            'datasets' => [
                [
                    'label' => 'Messages received',
                    'data' => $data,
                    'borderColor' => '#6366f1',
                    'backgroundColor' => 'rgba(99, 102, 241, 0.15)',
                    'fill' => true,
                    'tension' => 0.3,
                ],
            ],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
`
}

function generateContentOverviewChart(
  sectionVisibility: SectionVisibility,
  pageVisibility: PageVisibility,
): string | null {
  const chartItems = DASHBOARD_STATS.filter(
    (d) => d.model !== 'ContactMessage' && isDashboardStatEnabled(d, sectionVisibility, pageVisibility),
  )
  if (chartItems.length < 2) return null

  const models = [...new Set(chartItems.map((s) => s.model))]
  const imports = models.map((m) => `use App\\Models\\${m};`).join('\n')
  const labels = chartItems.map((s) => `'${phpStr(s.label)}'`).join(', ')
  const data = chartItems.map((s) => s.countExpr).join(', ')

  return `<?php

namespace App\\Filament\\Widgets;

${imports}
use Filament\\Widgets\\ChartWidget;

class ContentOverviewChart extends ChartWidget
{
    protected static ?string $heading = 'Content Overview';

    protected static ?int $sort = 3;

    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        return [
            'datasets' => [
                [
                    'label' => 'Items',
                    'data' => [${data}],
                    'backgroundColor' => [
                        '#6366f1', '#22c55e', '#0ea5e9', '#f59e0b',
                        '#a855f7', '#64748b', '#14b8a6', '#ef4444',
                    ],
                ],
            ],
            'labels' => [${labels}],
        ];
    }

    protected function getType(): string
    {
        return 'bar';
    }
}
`
}

export function generateFilamentFiles(
  sectionVisibility: SectionVisibility,
  pageVisibility: PageVisibility,
  options?: { hospitality?: boolean; cardCheckout?: boolean },
): Record<string, string> {
  const files: Record<string, string> = {}

  if (options?.hospitality) {
    Object.assign(files, stayPoliciesAdminFiles(Boolean(options.cardCheckout)))
  }

  Object.assign(files, websiteSettingsPages())
  files['app/Filament/Resources/ContactMessageResource.php'] = generateContactMessageResource()

  files['app/Filament/Resources/ContactMessageResource/Pages/ListContactMessages.php'] = `<?php

namespace App\\Filament\\Resources\\ContactMessageResource\\Pages;

use App\\Filament\\Resources\\ContactMessageResource;
use Filament\\Resources\\Pages\\ListRecords;

class ListContactMessages extends ListRecords
{
    protected static string $resource = ContactMessageResource::class;
}
`

  files['app/Filament/Resources/ContactMessageResource/Pages/ViewContactMessage.php'] = `<?php

namespace App\\Filament\\Resources\\ContactMessageResource\\Pages;

use App\\Filament\\Resources\\ContactMessageResource;
use Filament\\Actions;
use Filament\\Resources\\Pages\\ViewRecord;

class ViewContactMessage extends ViewRecord
{
    protected static string $resource = ContactMessageResource::class;

    protected function getHeaderActions(): array
    {
        return [Actions\\DeleteAction::make()];
    }
}
`

  for (const def of RESOURCE_DEFS) {
    files[`app/Filament/Resources/${def.name}Resource.php`] = generateResource(def)
    Object.assign(files, generateResourcePages(def))
  }

  files['app/Filament/Widgets/SiteStatsOverview.php'] = generateSiteStatsOverview(sectionVisibility, pageVisibility)
  files['app/Filament/Widgets/ContactMessagesChart.php'] = generateContactMessagesChart()
  const contentChart = generateContentOverviewChart(sectionVisibility, pageVisibility)
  if (contentChart) {
    files['app/Filament/Widgets/ContentOverviewChart.php'] = contentChart
  }

  return files
}