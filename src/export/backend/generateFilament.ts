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
      { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
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
      { name: 'excerpt', type: 'textarea', label: 'Excerpt' },
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
]

const PAGE_VISIBILITY_MAP: Record<string, keyof PageVisibility> = {
  Service: 'services',
  ShowcaseItem: 'portfolio',
  GalleryImage: 'gallery',
  BlogPost: 'blog',
  NewsPost: 'news',
}

const SECTION_VISIBILITY_MAP: Record<string, keyof SectionVisibility> = {
  Stat: 'stats',
  Step: 'steps',
  TeamMember: 'team',
  Faq: 'faq',
}

function filamentField(field: ResourceDef['fields'][number]): string {
  const col = `Forms\\Components\\TextInput::make('${field.name}')`
  const area = `Forms\\Components\\Textarea::make('${field.name}')`
  const img = `Forms\\Components\\FileUpload::make('${field.name}')->image()->disk('public')->directory('uploads')`
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
    return `Tables\\Columns\\ImageColumn::make('${field.name}')${label}->disk('public')`
  }
  if (field.type === 'boolean') {
    return `Tables\\Columns\\IconColumn::make('${field.name}')${label}->boolean()->sortable()`
  }
  if (field.type === 'textarea') {
    const hidden = field.name === 'body' ? '->toggleable(isToggledHiddenByDefault: true)' : ''
    return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->searchable()->limit(60)->wrap()${hidden}`
  }
  if (field.type === 'date') {
    return `Tables\\Columns\\TextColumn::make('${field.name}')${label}->dateTime()->sortable()`
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

function generateResource(def: ResourceDef): string {
  const formFields = def.fields.map(filamentField).join(",\n                ")
  const tableCols = def.fields.map(filamentTableColumn).join(",\n                ")
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
            ${filterChain}->defaultSort('sort_order')
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

export function generateSiteSettingsResource(): string {
  return `<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\SiteSettingResource\\Pages;
use App\\Models\\SiteSetting;
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class SiteSettingResource extends Resource
{
    protected static ?string $model = SiteSetting::class;

    protected static ?string $navigationIcon = 'heroicon-o-cog-6-tooth';

    protected static ?string $navigationLabel = 'Site Settings';

    protected static ?string $modelLabel = 'Site Settings';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\\Components\\Tabs::make('Settings')->tabs([
                Forms\\Components\\Tabs\\Tab::make('General')->schema([
                    Forms\\Components\\TextInput::make('business_name')->required(),
                    Forms\\Components\\TextInput::make('tagline'),
                    Forms\\Components\\Textarea::make('hero_subtext'),
                    Forms\\Components\\FileUpload::make('hero_image')->image()->disk('public')->directory('uploads'),
                ]),
                Forms\\Components\\Tabs\\Tab::make('Brand')->schema([
                    Forms\\Components\\FileUpload::make('logo')->image()->disk('public')->directory('uploads')->helperText('Shown in the site navigation.'),
                    Forms\\Components\\Toggle::make('logo_show_name')->label('Show business name next to logo')->default(true),
                    Forms\\Components\\ColorPicker::make('brand_primary')->label('Primary')->helperText('Buttons and calls to action.'),
                    Forms\\Components\\ColorPicker::make('brand_secondary')->label('Secondary'),
                    Forms\\Components\\ColorPicker::make('brand_accent')->label('Accent')->helperText('Links, prices, and highlights.'),
                    Forms\\Components\\Select::make('font_heading')->label('Heading font')->options(\\App\\Support\\Brand::selectOptions())->native(false),
                    Forms\\Components\\Select::make('font_body')->label('Body font')->options(\\App\\Support\\Brand::selectOptions())->native(false),
                ]),
                Forms\\Components\\Tabs\\Tab::make('About')->schema([
                    Forms\\Components\\TextInput::make('about_title'),
                    Forms\\Components\\Textarea::make('about'),
                    Forms\\Components\\Textarea::make('mission_statement'),
                    Forms\\Components\\FileUpload::make('about_image')->image()->disk('public')->directory('uploads'),
                ]),
                Forms\\Components\\Tabs\\Tab::make('Sections')->schema([
                    Forms\\Components\\TextInput::make('services_section_title'),
                    Forms\\Components\\TextInput::make('services_section_subtitle'),
                    Forms\\Components\\TextInput::make('steps_section_title'),
                    Forms\\Components\\TextInput::make('showcase_section_title'),
                    Forms\\Components\\TextInput::make('showcase_section_subtitle'),
                    Forms\\Components\\TextInput::make('gallery_section_title'),
                    Forms\\Components\\TextInput::make('testimonials_section_title'),
                    Forms\\Components\\TextInput::make('blog_section_title'),
                    Forms\\Components\\TextInput::make('blog_section_subtitle'),
                    Forms\\Components\\TextInput::make('team_section_title'),
                    Forms\\Components\\TextInput::make('faq_section_title'),
                ]),
                Forms\\Components\\Tabs\\Tab::make('SEO')->schema([
                    Forms\\Components\\Toggle::make('seo_enabled')->label('Optimize SEO'),
                    Forms\\Components\\TextInput::make('seo_title')->label('Meta Title'),
                    Forms\\Components\\Textarea::make('seo_description')->label('Meta Description')->rows(3),
                    Forms\\Components\\Textarea::make('seo_keywords')->label('Keywords')->rows(2),
                    Forms\\Components\\TextInput::make('seo_site_url')->label('Live Site URL')->url(),
                ]),
                Forms\\Components\\Tabs\\Tab::make('CTA & Contact')->schema([
                    Forms\\Components\\TextInput::make('cta_text'),
                    Forms\\Components\\TextInput::make('cta_link'),
                    Forms\\Components\\TextInput::make('cta_banner_title'),
                    Forms\\Components\\Textarea::make('cta_banner_text'),
                    Forms\\Components\\TextInput::make('contact_section_title'),
                    Forms\\Components\\TextInput::make('contact_form_title'),
                    Forms\\Components\\TextInput::make('contact_form_button_text'),
                    Forms\\Components\\TextInput::make('email')->email(),
                    Forms\\Components\\TextInput::make('phone'),
                    Forms\\Components\\TextInput::make('address'),
                    Forms\\Components\\TextInput::make('map_url')->label('Google Maps link')->helperText('Paste a Google Maps URL or embed code. If empty, the map uses the office address.'),
                    Forms\\Components\\TextInput::make('hours'),
                    Forms\\Components\\TextInput::make('license_number')->label('License / credentials'),
                    Forms\\Components\\TextInput::make('instagram')->label('Instagram')->url(),
                    Forms\\Components\\TextInput::make('linkedin')->label('LinkedIn')->url(),
                    Forms\\Components\\TextInput::make('website')->label('Website')->url(),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('business_name')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('email')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('phone')->searchable()->sortable(),
                Tables\\Columns\\TextColumn::make('updated_at')->dateTime()->sortable(),
            ])
            ->defaultSort('updated_at', 'desc')
            ->persistSearchInSession()
            ->persistFiltersInSession()
            ->persistSortInSession()
            ->actions([Tables\\Actions\\EditAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\\ManageSiteSettings::route('/')];
    }
}
`
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
): Record<string, string> {
  const files: Record<string, string> = {}

  files['app/Filament/Resources/SiteSettingResource.php'] = generateSiteSettingsResource()
  files['app/Filament/Resources/ContactMessageResource.php'] = generateContactMessageResource()

  files['app/Filament/Resources/SiteSettingResource/Pages/ManageSiteSettings.php'] = `<?php

namespace App\\Filament\\Resources\\SiteSettingResource\\Pages;

use App\\Filament\\Resources\\SiteSettingResource;
use App\\Models\\SiteSetting;
use Filament\\Resources\\Pages\\EditRecord;

class ManageSiteSettings extends EditRecord
{
    protected static string $resource = SiteSettingResource::class;

    public function mount(int|string $record = null): void
    {
        $this->record = SiteSetting::current();
        parent::mount($this->record->getKey());
    }
}
`

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
    const pageKey = PAGE_VISIBILITY_MAP[def.name]
    const sectionKey = SECTION_VISIBILITY_MAP[def.name]
    const include =
      def.name === 'Testimonial'
      || (pageKey && pageVisibility[pageKey])
      || (sectionKey && sectionVisibility[sectionKey])
    if (include) {
      files[`app/Filament/Resources/${def.name}Resource.php`] = generateResource(def)
      Object.assign(files, generateResourcePages(def))
    }
  }

  files['app/Filament/Widgets/SiteStatsOverview.php'] = generateSiteStatsOverview(sectionVisibility, pageVisibility)
  files['app/Filament/Widgets/ContactMessagesChart.php'] = generateContactMessagesChart()
  const contentChart = generateContentOverviewChart(sectionVisibility, pageVisibility)
  if (contentChart) {
    files['app/Filament/Widgets/ContentOverviewChart.php'] = contentChart
  }

  return files
}