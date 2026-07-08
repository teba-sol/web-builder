import type { SectionVisibility } from '../../types'
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

const VISIBILITY_MAP: Record<string, keyof SectionVisibility> = {
  Stat: 'stats',
  Service: 'services',
  Step: 'steps',
  ShowcaseItem: 'showcase',
  GalleryImage: 'gallery',
  TeamMember: 'team',
  Testimonial: 'stats', // testimonials always shown
  BlogPost: 'blog',
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

function filamentTableColumn(field: ResourceDef['fields'][number]): string {
  if (field.type === 'image') {
    return `Tables\\Columns\\ImageColumn::make('${field.name}')->disk('public')`
  }
  if (field.type === 'textarea') {
    return `Tables\\Columns\\TextColumn::make('${field.name}')->limit(50)`
  }
  return `Tables\\Columns\\TextColumn::make('${field.name}')`
}

function generateResource(def: ResourceDef): string {
  const formFields = def.fields.map(filamentField).join(",\n                ")
  const tableCols = def.fields
    .filter((f) => f.name !== 'sort_order' || def.fields.length <= 3)
    .slice(0, 4)
    .map(filamentTableColumn)
    .join(",\n                ")

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
            ->defaultSort('sort_order')
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
                    Forms\\Components\\TextInput::make('hours'),
                ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('business_name'),
                Tables\\Columns\\TextColumn::make('updated_at')->dateTime(),
            ])
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
            Forms\\Components\\Textarea::make('message')->disabled()->rows(6),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('name')->searchable(),
                Tables\\Columns\\TextColumn::make('email'),
                Tables\\Columns\\TextColumn::make('message')->limit(40),
                Tables\\Columns\\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
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

export function generateFilamentFiles(visibility: SectionVisibility): Record<string, string> {
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
        $this->record = SiteSetting::firstOrCreate([]);
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
    const visKey = VISIBILITY_MAP[def.name]
    if (def.name === 'Testimonial' || def.name === 'BlogPost' || (visKey && visibility[visKey])) {
      files[`app/Filament/Resources/${def.name}Resource.php`] = generateResource(def)
      Object.assign(files, generateResourcePages(def))
    }
  }

  return files
}