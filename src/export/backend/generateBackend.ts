import {
  LAYOUT_VARIANT_IDS,
  LAYOUT_VARIANT_PRESETS,
  type LayoutVariantId,
} from '../../data/layoutVariants'
import type { SiteContent, TemplateId } from '../../types'
import type { ImageAsset } from '../imageUtils'
import { buildRobotsTxt, buildSitemapXml, collectLaravelSitemapPaths } from '../seoExport'
import { buildExportPayload, resolveAssetPath, type SiteExportPayload } from './exportPayload'
import { generateAllBladeViews } from './generateBlade'
import {
  bookingRouteLines,
  bookingSettingsFields,
  generateBookingFiles,
  hasBookingFeature,
} from './generateBooking'
import { generateFilamentFiles } from './generateFilament'
import { generateSetupFiles, generateSetupToken } from './generateSetup'
import { FONT_OPTIONS } from '../../data/brand'
import { phpStr } from './phpUtils'

export type BackendFileMap = Record<string, string>

const LIST_MODELS = [
  { name: 'Stat', table: 'stats', fields: ['value', 'label'] },
  { name: 'Service', table: 'services', fields: ['title', 'description'] },
  { name: 'Step', table: 'steps', fields: ['title', 'description'] },
  {
    name: 'ShowcaseItem',
    table: 'showcase_items',
    fields: ['title', 'description', 'image', 'price', 'tag', 'link'],
  },
  { name: 'GalleryImage', table: 'gallery_images', fields: ['path'] },
  { name: 'TeamMember', table: 'team_members', fields: ['name', 'role', 'image'] },
  { name: 'Testimonial', table: 'testimonials', fields: ['quote', 'author', 'role'] },
  { name: 'BlogPost', table: 'blog_posts', fields: ['title', 'slug', 'excerpt', 'body', 'image', 'author', 'is_published', 'published_at'] },
  { name: 'NewsPost', table: 'news_posts', fields: ['title', 'slug', 'excerpt', 'body', 'image', 'author', 'is_published', 'published_at'] },
  { name: 'Faq', table: 'faqs', fields: ['question', 'answer'] },
] as const

function generatePostModel(className: string): string {
  return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class ${className} extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'body', 'image', 'author',
        'is_published', 'published_at', 'sort_order',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];
}
`
}

function generatePostMigration(table: string): string {
  return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${table}', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->text('body')->nullable();
            $table->string('image')->nullable();
            $table->string('author')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${table}');
    }
};
`
}

function generateModel(name: string, fillable: string[]): string {
  const fields = fillable.map((f) => `'${f}'`).join(', ')
  return `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class ${name} extends Model
{
    protected $fillable = [${fields}, 'sort_order'];
}
`
}

function generateMigration(table: string, columns: string[]): string {
  const cols = columns
    .map((c) => {
      if (c === 'description' || c === 'quote' || c === 'answer' || c === 'message') {
        return `$table->text('${c}');`
      }
      if (c === 'image' || c === 'path' || c === 'link') {
        return `$table->string('${c}')->nullable();`
      }
      return `$table->string('${c}');`
    })
    .join('\n            ')

  return `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('${table}', function (Blueprint $table) {
            $table->id();
            ${cols}
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('${table}');
    }
};
`
}

function jsonForPhp(obj: unknown): string {
  return JSON.stringify(obj, null, 2).replace(/'/g, "\\'")
}

function adminEmailLocal(businessName: string): string {
  const slug = (businessName || 'mysite').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mysite'
  return `admin@${slug}.local`
}

function buildSettingsRecord(payload: SiteExportPayload): Record<string, unknown> {
  const { content: c, assetMap } = payload
  const mapImage = (url: string, name: string) => resolveAssetPath(url, name, assetMap)

  return {
    business_name: c.businessName,
    tagline: c.tagline,
    hero_subtext: c.heroSubtext,
    hero_image: mapImage(c.heroImage, 'hero'),
    logo: mapImage(c.logo, 'logo'),
    logo_show_name: c.logoShowName !== false,
    brand_primary: c.brandPrimary,
    brand_secondary: c.brandSecondary,
    brand_accent: c.brandAccent,
    font_heading: c.fontHeading,
    font_body: c.fontBody,
    about_title: c.aboutTitle,
    about: c.about,
    about_image: mapImage(c.aboutImage, 'about'),
    mission_statement: c.missionStatement,
    page_visibility: c.pageVisibility,
    section_visibility: c.sectionVisibility,
    news_section_title: c.newsSectionTitle,
    news_section_subtitle: c.newsSectionSubtitle,
    pricing_section_title: c.pricingSectionTitle,
    ...bookingSettingsFields(c),
    services_section_title: c.servicesSectionTitle,
    services_section_subtitle: c.servicesSectionSubtitle,
    steps_section_title: c.stepsSectionTitle,
    showcase_section_title: c.showcaseSectionTitle,
    showcase_section_subtitle: c.showcaseSectionSubtitle,
    gallery_section_title: c.gallerySectionTitle,
    testimonials_section_title: c.testimonialsSectionTitle,
    blog_section_title: c.blogSectionTitle,
    blog_section_subtitle: c.blogSectionSubtitle,
    faq_section_title: c.faqSectionTitle,
    team_section_title: c.teamSectionTitle,
    cta_banner_title: c.ctaBannerTitle,
    cta_banner_text: c.ctaBannerText,
    cta_text: c.ctaText,
    cta_link: c.ctaLink,
    email: c.email,
    phone: c.phone,
    address: c.address,
    hours: c.hours,
    license_number: c.licenseNumber,
    instagram: c.instagram,
    linkedin: c.linkedin,
    website: c.website,
    contact_section_title: c.contactSectionTitle,
    contact_form_title: c.contactFormTitle,
    contact_form_button_text: c.contactFormButtonText,
    template_id: payload.templateId,
    color_scheme_id: payload.colorSchemeId,
    layout_variant_id: payload.layoutVariantId,
    seo_enabled: c.seoEnabled,
    seo_title: c.seoTitle,
    seo_description: c.seoDescription,
    seo_keywords: c.seoKeywords,
    seo_site_url: c.seoSiteUrl,
  }
}

function generateLayoutVariantsPhp(): string {
  const optionsPhp = LAYOUT_VARIANT_IDS.map((id: LayoutVariantId) => {
    const p = LAYOUT_VARIANT_PRESETS[id]
    return `        '${id}' => [
            'name' => '${phpStr(p.name)}',
            'description' => '${phpStr(p.description)}',
            'hero' => '${p.heroLayout}',
            'testimonials' => '${p.testimonialLayout}',
            'contact' => '${p.contactLayout}',
            'shell' => '${p.shellClass}',
        ],`
  }).join('\n')

  const selectLabels: Record<LayoutVariantId, string> = {
    classic: 'Classic — timeless & balanced',
    modern: 'Modern — clean & geometric',
    luxury: 'Luxury — premium & spacious',
  }
  const selectPhp = LAYOUT_VARIANT_IDS.map(
    (id: LayoutVariantId) => `            '${id}' => '${phpStr(selectLabels[id])}',`,
  ).join('\n')

  return `<?php

namespace App\\Support;

/**
 * Look-and-feel variants shipped with every export.
 * Admins can switch between classic / modern / luxury without changing content or colors.
 */
class LayoutVariants
{
    public const OPTIONS = [
${optionsPhp}
    ];

    public static function normalize(?string $id): string
    {
        if ($id === 'bold' || $id === 'lexury' || $id === 'luxe') {
            return 'luxury';
        }

        return array_key_exists((string) $id, self::OPTIONS) ? (string) $id : 'classic';
    }

    /** @return array{name: string, description: string, hero: string, testimonials: string, contact: string, shell: string} */
    public static function get(?string $id): array
    {
        return self::OPTIONS[self::normalize($id)];
    }

    /** Options for Filament select fields. */
    public static function selectOptions(): array
    {
        return [
${selectPhp}
        ];
    }

    public static function shellClass(?string $id): string
    {
        return self::get($id)['shell'];
    }

    public static function heroLayout(?string $id): string
    {
        return self::get($id)['hero'];
    }

    public static function testimonialLayout(?string $id): string
    {
        return self::get($id)['testimonials'];
    }

    public static function contactLayout(?string $id): string
    {
        return self::get($id)['contact'];
    }
}
`
}

function generateBrandPhp(): string {
  const fontsPhp = FONT_OPTIONS.map(
    (font) => `        '${phpStr(font.id)}' => [
            'label' => '${phpStr(font.label)}',
            'family' => '${phpStr(font.family)}',
            'google' => '${phpStr(font.google)}',
        ],`,
  ).join('\n')

  return `<?php

namespace App\\Support;

class Brand
{
    public const FONTS = [
${fontsPhp}
    ];

    public static function selectOptions(): array
    {
        $options = ['' => 'Template default'];
        foreach (self::FONTS as $id => $font) {
            $options[$id] = $font['label'];
        }

        return $options;
    }

    /** @return array{label: string, family: string, google: string}|null */
    public static function font(?string $id): ?array
    {
        $id = (string) $id;

        return self::FONTS[$id] ?? null;
    }

    public static function fontHref(?string $heading, ?string $body): string
    {
        $families = [];
        foreach ([$heading, $body] as $id) {
            $font = self::font(is_string($id) ? $id : null);
            if ($font && ! in_array($font['google'], $families, true)) {
                $families[] = $font['google'];
            }
        }

        if ($families === []) {
            return 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap';
        }

        $query = implode('&', array_map(static fn (string $family) => 'family=' . $family, $families));

        return 'https://fonts.googleapis.com/css2?' . $query . '&display=swap';
    }

    public static function isHex(?string $value): bool
    {
        return is_string($value) && (bool) preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', trim($value));
    }

    public static function css(object $settings): string
    {
        $heading = self::font($settings->font_heading ?? null);
        $body = self::font($settings->font_body ?? null);
        $primary = self::isHex($settings->brand_primary ?? null) ? trim((string) $settings->brand_primary) : '';
        $secondary = self::isHex($settings->brand_secondary ?? null) ? trim((string) $settings->brand_secondary) : '';
        $accent = self::isHex($settings->brand_accent ?? null) ? trim((string) $settings->brand_accent) : '';

        $lines = ['[data-site-brand] {'];
        if ($primary) {
            $lines[] = '  --brand-primary: ' . $primary . ';';
        }
        if ($secondary) {
            $lines[] = '  --brand-secondary: ' . $secondary . ';';
        }
        if ($accent) {
            $lines[] = '  --brand-accent: ' . $accent . ';';
        }
        if ($body) {
            $lines[] = '  --font-body: ' . $body['family'] . ';';
            $lines[] = '  font-family: var(--font-body);';
        }
        if ($heading) {
            $lines[] = '  --font-heading: ' . $heading['family'] . ';';
        }
        $lines[] = '}';
        if ($heading) {
            $lines[] = '[data-site-brand] h1, [data-site-brand] h2, [data-site-brand] h3 { font-family: var(--font-heading); }';
        }
        if ($primary) {
            $lines[] = '[data-site-brand] [data-brand-cta] { background-color: var(--brand-primary) !important; color: #fff !important; border-color: var(--brand-primary) !important; }';
        }

        return implode("\\n", $lines);
    }
}
`
}

function generateSiteSettingModel(payload: SiteExportPayload): string {
  const defaults = jsonForPhp(buildSettingsRecord(payload))

  return `<?php

namespace App\\Models;

use App\\Support\\LayoutVariants;
use Illuminate\\Database\\Eloquent\\Model;

class SiteSetting extends Model
{
    protected $fillable = [
        'business_name', 'tagline', 'hero_subtext', 'hero_image',
        'logo', 'logo_show_name', 'brand_primary', 'brand_secondary', 'brand_accent',
        'font_heading', 'font_body',
        'about_title', 'about', 'about_image', 'mission_statement',
        'page_visibility', 'section_visibility', 'services_section_title', 'services_section_subtitle',
        'news_section_title', 'news_section_subtitle', 'pricing_section_title',
        'rooms_section_title', 'rooms_section_subtitle',
        'booking_section_title', 'booking_section_subtitle',
        'steps_section_title', 'showcase_section_title', 'showcase_section_subtitle',
        'gallery_section_title', 'testimonials_section_title',
        'blog_section_title', 'blog_section_subtitle', 'faq_section_title',
        'team_section_title', 'cta_banner_title', 'cta_banner_text',
        'cta_text', 'cta_link', 'email', 'phone', 'address', 'hours',
        'license_number', 'instagram', 'linkedin', 'website',
        'contact_section_title', 'contact_form_title', 'contact_form_button_text',
        'template_id', 'color_scheme_id', 'layout_variant_id',
        'seo_enabled', 'seo_title', 'seo_description', 'seo_keywords', 'seo_site_url',
    ];

    protected $casts = [
        'page_visibility' => 'array',
        'section_visibility' => 'array',
        'logo_show_name' => 'boolean',
        'seo_enabled' => 'boolean',
    ];

    public static function current(): self
    {
        $settings = static::query()->first();
        if ($settings) {
            return $settings;
        }

        return static::create(json_decode('${defaults}', true));
    }

    /** Active look-and-feel id: classic | modern | luxury */
    public function layoutVariantId(): string
    {
        return LayoutVariants::normalize($this->layout_variant_id);
    }

    public function layoutShellClass(): string
    {
        return LayoutVariants::shellClass($this->layout_variant_id);
    }

    public function heroLayout(): string
    {
        return LayoutVariants::heroLayout($this->layout_variant_id);
    }

    public function testimonialLayout(): string
    {
        return LayoutVariants::testimonialLayout($this->layout_variant_id);
    }

    public function contactLayout(): string
    {
        return LayoutVariants::contactLayout($this->layout_variant_id);
    }
}
`
}

function generateSeeder(payload: SiteExportPayload): string {
  const { content: c, assetMap } = payload
  const defaultAdminEmail = adminEmailLocal(c.businessName)

  const mapImage = (url: string, name: string) => resolveAssetPath(url, name, assetMap)

  const settings = buildSettingsRecord(payload)

  const listData = {
    stats: c.stats.filter((s) => s.value),
    services: c.services.filter((s) => s.title),
    steps: c.steps.filter((s) => s.title),
    showcase_items: c.showcaseItems
      .filter((i) => i.title)
      .map((item, i) => ({
        ...item,
        image: mapImage(item.image, `showcase-${i + 1}`),
      })),
    gallery_images: c.galleryImages
      .filter(Boolean)
      .map((img, i) => ({ path: mapImage(img, `gallery-${i + 1}`) })),
    team: c.team
      .filter((m) => m.name)
      .map((m) => ({ ...m, image: mapImage(m.image, `team-${m.name}`) })),
    testimonials: c.testimonials.filter((t) => t.quote),
    blog_posts: c.blogPosts
      .filter((p) => p.title)
      .map((post, i) => ({
        title: post.title,
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: post.excerpt,
        body: post.body,
        author: post.author,
        image: mapImage(post.image, `blog-${post.slug || i + 1}`),
        is_published: true,
        published_at: post.date || null,
      })),
    news_posts: c.newsPosts
      .filter((p) => p.title)
      .map((post, i) => ({
        title: post.title,
        slug: post.slug || post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: post.excerpt,
        body: post.body,
        author: post.author,
        image: mapImage(post.image, `news-${post.slug || i + 1}`),
        is_published: true,
        published_at: post.date || null,
      })),
    faqs: c.faqs.filter((f) => f.question),
  }

  return `<?php

namespace Database\\Seeders;

use App\\Models\\BlogPost;
use App\\Models\\NewsPost;
use App\\Models\\ContactMessage;
use App\\Models\\Faq;
use App\\Models\\GalleryImage;
use App\\Models\\Service;
use App\\Models\\ShowcaseItem;
use App\\Models\\SiteSetting;
use App\\Models\\Stat;
use App\\Models\\Step;
use App\\Models\\TeamMember;
use App\\Models\\Testimonial;
use App\\Models\\User;
use Illuminate\\Database\\Seeder;
use Illuminate\\Support\\Facades\\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('ADMIN_EMAIL', '${phpStr(defaultAdminEmail)}')],
            [
                'name' => env('ADMIN_NAME', 'Admin'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'password')),
            ]
        );

        SiteSetting::query()->delete();
        SiteSetting::create(json_decode('${jsonForPhp(settings)}', true));

        $this->seedList(Stat::class, json_decode('${jsonForPhp(listData.stats)}', true));
        $this->seedList(Service::class, json_decode('${jsonForPhp(listData.services)}', true));
        $this->seedList(Step::class, json_decode('${jsonForPhp(listData.steps)}', true));
        $this->seedList(ShowcaseItem::class, json_decode('${jsonForPhp(listData.showcase_items)}', true));
        $this->seedList(GalleryImage::class, json_decode('${jsonForPhp(listData.gallery_images)}', true));
        $this->seedList(TeamMember::class, json_decode('${jsonForPhp(listData.team)}', true));
        $this->seedList(Testimonial::class, json_decode('${jsonForPhp(listData.testimonials)}', true));
        $this->seedList(BlogPost::class, json_decode('${jsonForPhp(listData.blog_posts)}', true));
        $this->seedList(NewsPost::class, json_decode('${jsonForPhp(listData.news_posts)}', true));
        $this->seedList(Faq::class, json_decode('${jsonForPhp(listData.faqs)}', true));
${hasBookingFeature(payload.content) ? "\n        $this->call(HospitalitySeeder::class);\n" : ''}
    }

    private function seedList(string $model, array $items): void
    {
        $model::query()->delete();
        foreach ($items as $i => $item) {
            $model::create([...$item, 'sort_order' => $i]);
        }
    }
}
`
}

function generateSkeleton(payload: SiteExportPayload, setupToken: string): BackendFileMap {
  const slug = (payload.content.businessName || 'my-website')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return {
    'composer.json': JSON.stringify(
      {
        name: `webbuilder/${slug}`,
        type: 'project',
        description: `Laravel + Filament backend for ${payload.content.businessName}`,
        require: {
          php: '^8.2',
          'laravel/framework': '^11.0',
          'filament/filament': '^3.2',
        },
        'require-dev': {
          'laravel/pint': '^1.13',
        },
        autoload: {
          'psr-4': {
            'App\\': 'app/',
            'Database\\Seeders\\': 'database/seeders/',
          },
        },
        scripts: {
          postAutoloadDump: [
            'Illuminate\\Foundation\\ComposerScripts::postAutoloadDump',
            '@php artisan package:discover --ansi',
            '@php artisan filament:upgrade',
          ],
        },
        minimum_stability: 'stable',
      },
      null,
      2,
    ),

    '.env.example': `APP_NAME="${payload.content.businessName}"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel
DB_USERNAME=root
DB_PASSWORD=

CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=sync

FILAMENT_PATH=admin

DOCTOR_TOKEN=${setupToken}

ADMIN_NAME=Admin
ADMIN_EMAIL=${adminEmailLocal(payload.content.businessName)}
ADMIN_PASSWORD=password
`,

    'artisan': `#!/usr/bin/env php
<?php

define('LARAVEL_START', microtime(true));
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\\Contracts\\Console\\Kernel::class);
$status = $kernel->handle($input = new Symfony\\Component\\Console\\Input\\ArgvInput, new Symfony\\Component\\Console\\Output\\ConsoleOutput);
$kernel->terminate($input, $status);
exit($status);
`,

    'bootstrap/app.php': `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Foundation\\Configuration\\Exceptions;
use Illuminate\\Foundation\\Configuration\\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'doctor/run',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {})
    ->create();
`,

    'bootstrap/providers.php': `<?php

return [
    App\\Providers\\AppServiceProvider::class,
    App\\Providers\\Filament\\AdminPanelProvider::class,
];
`,

    'public/index.php': `<?php

use Illuminate\\Http\\Request;

define('LARAVEL_START', microtime(true));
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->handleRequest(Request::capture());
`,

    'routes/web.php': `<?php

use App\\Http\\Controllers\\BlogController;
use App\\Http\\Controllers\\ContactController;
use App\\Http\\Controllers\\NewsController;
use App\\Http\\Controllers\\DoctorController;
use App\\Http\\Controllers\\PageController;
use App\\Http\\Controllers\\SiteController;
use Illuminate\\Support\\Facades\\Route;

Route::get('/', [SiteController::class, 'index'])->name('home');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/services', [PageController::class, 'services'])->name('services');
Route::get('/portfolio', [PageController::class, 'portfolio'])->name('portfolio');
Route::get('/gallery', [PageController::class, 'gallery'])->name('gallery');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
Route::get('/news', [NewsController::class, 'index'])->name('news.index');
Route::get('/news/{slug}', [NewsController::class, 'show'])->name('news.show');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
${hasBookingFeature(payload.content) ? bookingRouteLines() : ''}
Route::get('/doctor', [DoctorController::class, 'index'])->name('doctor.index');
Route::post('/doctor/run', [DoctorController::class, 'run'])->name('doctor.run');
`,

    'routes/console.php': `<?php

use Illuminate\\Foundation\\Inspiring;
use Illuminate\\Support\\Facades\\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
`,

    'app/Providers/AppServiceProvider.php': `<?php

namespace App\\Providers;

use Illuminate\\Support\\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void {}
}
`,

    'app/Providers/Filament/AdminPanelProvider.php': `<?php

namespace App\\Providers\\Filament;

use Filament\\Http\\Middleware\\Authenticate;
use Filament\\Http\\Middleware\\DisableBladeIconComponents;
use Filament\\Http\\Middleware\\DispatchServingFilamentEvent;
use Filament\\Pages;
use Filament\\Panel;
use Filament\\PanelProvider;
use Filament\\Support\\Colors\\Color;
use Filament\\Widgets;
use Illuminate\\Cookie\\Middleware\\AddQueuedCookiesToResponse;
use Illuminate\\Cookie\\Middleware\\EncryptCookies;
use Illuminate\\Foundation\\Http\\Middleware\\VerifyCsrfToken;
use Illuminate\\Routing\\Middleware\\SubstituteBindings;
use Illuminate\\Session\\Middleware\\AuthenticateSession;
use Illuminate\\Session\\Middleware\\StartSession;
use Illuminate\\View\\Middleware\\ShareErrorsFromSession;

class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        return $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->login()
            ->colors(['primary' => Color::Indigo])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\\\Filament\\\\Resources')
            ->discoverWidgets(in: app_path('Filament/Widgets'), for: 'App\\\\Filament\\\\Widgets')
            ->pages([Pages\\Dashboard::class])
            ->widgets([
                Widgets\\AccountWidget::class,
            ])
            ->middleware([
                EncryptCookies::class,
                AddQueuedCookiesToResponse::class,
                StartSession::class,
                AuthenticateSession::class,
                ShareErrorsFromSession::class,
                VerifyCsrfToken::class,
                SubstituteBindings::class,
                DisableBladeIconComponents::class,
                DispatchServingFilamentEvent::class,
            ])
            ->authMiddleware([Authenticate::class]);
    }
}
`,

    'app/Models/User.php': `<?php

namespace App\\Models;

use Filament\\Models\\Contracts\\FilamentUser;
use Filament\\Panel;
use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Foundation\\Auth\\User as Authenticatable;
use Illuminate\\Notifications\\Notifiable;

class User extends Authenticatable implements FilamentUser
{
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return true;
    }
}
`,

    'app/Models/SiteSetting.php': generateSiteSettingModel(payload),

    'app/Support/LayoutVariants.php': generateLayoutVariantsPhp(),
    'app/Support/Brand.php': generateBrandPhp(),

    'app/Models/ContactMessage.php': `<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;

class ContactMessage extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'service_type', 'message'];
}
`,

    'app/Http/Controllers/NewsController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Models\\NewsPost;
use App\\Models\\SiteSetting;
use Illuminate\\View\\View;

class NewsController extends Controller
{
    public function index(): View
    {
        return view('site.news', [
            'settings' => SiteSetting::current(),
            'newsPosts' => NewsPost::where('is_published', true)->orderByDesc('published_at')->orderBy('sort_order')->get(),
        ]);
    }

    public function show(string $slug): View
    {
        return view('site.news-post', [
            'settings' => SiteSetting::current(),
            'post' => NewsPost::where('slug', $slug)->where('is_published', true)->firstOrFail(),
        ]);
    }
}
`,

    'app/Http/Controllers/BlogController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Models\\BlogPost;
use App\\Models\\NewsPost;
use App\\Models\\SiteSetting;
use Illuminate\\View\\View;

class BlogController extends Controller
{
    public function index(): View
    {
        return view('site.blog', [
            'settings' => SiteSetting::current(),
            'blogPosts' => BlogPost::where('is_published', true)->orderByDesc('published_at')->orderBy('sort_order')->get(),
        ]);
    }

    public function show(string $slug): View
    {
        return view('site.blog-post', [
            'settings' => SiteSetting::current(),
            'post' => BlogPost::where('slug', $slug)->where('is_published', true)->firstOrFail(),
        ]);
    }
}
`,

    'app/Http/Controllers/PageController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Models\\Faq;
use App\\Models\\GalleryImage;
use App\\Models\\Service;
use App\\Models\\ShowcaseItem;
use App\\Models\\SiteSetting;
use App\\Models\\Step;
use App\\Models\\TeamMember;
use Illuminate\\View\\View;

class PageController extends Controller
{
    public function about(): View
    {
        return view('site.about', [
            'settings' => SiteSetting::current(),
            'team' => TeamMember::orderBy('sort_order')->get(),
        ]);
    }

    public function services(): View
    {
        return view('site.services', [
            'settings' => SiteSetting::current(),
            'services' => Service::orderBy('sort_order')->get(),
            'steps' => Step::orderBy('sort_order')->get(),
        ]);
    }

    public function portfolio(): View
    {
        return view('site.portfolio', [
            'settings' => SiteSetting::current(),
            'showcaseItems' => ShowcaseItem::orderBy('sort_order')->get(),
        ]);
    }

    public function gallery(): View
    {
        return view('site.gallery', [
            'settings' => SiteSetting::current(),
            'galleryImages' => GalleryImage::orderBy('sort_order')->get(),
        ]);
    }

    public function contact(): View
    {
        return view('site.contact', [
            'settings' => SiteSetting::current(),
            'faqs' => Faq::orderBy('sort_order')->get(),
            'services' => Service::orderBy('sort_order')->get(),
        ]);
    }
}
`,

    'app/Http/Controllers/SiteController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Models\\BlogPost;
use App\\Models\\Faq;
use App\\Models\\NewsPost;
use App\\Models\\Service;
use App\\Models\\ShowcaseItem;
use App\\Models\\SiteSetting;
use App\\Models\\Stat;
use App\\Models\\Step;
use App\\Models\\Testimonial;
use Illuminate\\View\\View;

class SiteController extends Controller
{
    public function index(): View
    {
        return view('site.index', [
            'settings' => SiteSetting::current(),
            'stats' => Stat::orderBy('sort_order')->get(),
            'services' => Service::orderBy('sort_order')->get(),
            'steps' => Step::orderBy('sort_order')->get(),
            'showcaseItems' => ShowcaseItem::orderBy('sort_order')->get(),
            'blogPosts' => BlogPost::where('is_published', true)->orderByDesc('published_at')->orderBy('sort_order')->get(),
            'newsPosts' => NewsPost::where('is_published', true)->orderByDesc('published_at')->orderBy('sort_order')->get(),
            'testimonials' => Testimonial::orderBy('sort_order')->get(),
            'faqs' => Faq::orderBy('sort_order')->get(),
        ]);
    }
}
`,

    'app/Http/Controllers/ContactController.php': `<?php

namespace App\\Http\\Controllers;

use App\\Models\\ContactMessage;
use Illuminate\\Http\\RedirectResponse;
use Illuminate\\Http\\Request;

class ContactController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'service_type' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:5000',
        ]);

        $name = trim((string) ($validated['name'] ?? ''));
        if ($name === '') {
            $name = trim(($validated['first_name'] ?? '') . ' ' . ($validated['last_name'] ?? ''));
        }
        if ($name === '') {
            $name = 'Website inquiry';
        }

        $email = $validated['email'] ?? '';
        if ($email === '') {
            $email = 'noreply@example.com';
        }

        $lines = [];
        if (!empty($validated['service_type'])) {
            $lines[] = 'Service: ' . $validated['service_type'];
        }
        if (!empty($validated['phone'])) {
            $lines[] = 'Phone: ' . $validated['phone'];
        }
        if (!empty($validated['message'])) {
            $lines[] = $validated['message'];
        }

        ContactMessage::create([
            'name' => $name,
            'email' => $email,
            'phone' => $validated['phone'] ?? null,
            'service_type' => $validated['service_type'] ?? null,
            'message' => implode("\\n", $lines) ?: 'Booking or contact request',
        ]);

        return back()->with('contact_success', 'Thank you! Your message has been sent.');
    }
}
`,

    'app/Http/Controllers/Controller.php': `<?php

namespace App\\Http\\Controllers;

abstract class Controller {}
`,

    'config/app.php': `<?php

return [
    'name' => env('APP_NAME', 'Laravel'),
    'env' => env('APP_ENV', 'production'),
    'debug' => (bool) env('APP_DEBUG', false),
    'url' => env('APP_URL', 'http://localhost'),
    'timezone' => 'UTC',
    'locale' => 'en',
    'fallback_locale' => 'en',
    'cipher' => 'AES-256-CBC',
    'key' => env('APP_KEY'),
];
`,

    'config/database.php': `<?php

return [
    'default' => env('DB_CONNECTION', 'mysql'),
    'connections' => [
        'mysql' => [
            'driver' => 'mysql',
            'host' => env('DB_HOST', '127.0.0.1'),
            'port' => env('DB_PORT', '3306'),
            'database' => env('DB_DATABASE', 'laravel'),
            'username' => env('DB_USERNAME', 'root'),
            'password' => env('DB_PASSWORD', ''),
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
            'prefix' => '',
            'strict' => true,
            'engine' => null,
        ],
        'sqlite' => [
            'driver' => 'sqlite',
            'database' => env('DB_DATABASE', database_path('database.sqlite')),
            'prefix' => '',
        ],
    ],
];
`,

    'config/auth.php': `<?php

return [
    'defaults' => ['guard' => 'web', 'passwords' => 'users'],
    'guards' => [
        'web' => ['driver' => 'session', 'provider' => 'users'],
    ],
    'providers' => [
        'users' => ['driver' => 'eloquent', 'model' => App\\Models\\User::class],
    ],
    'passwords' => [
        'users' => ['provider' => 'users', 'table' => 'password_reset_tokens', 'expire' => 60],
    ],
];
`,

    'config/cache.php': `<?php

use Illuminate\\Support\\Str;

return [
    'default' => env('CACHE_STORE', 'file'),
    'stores' => [
        'array' => [
            'driver' => 'array',
            'serialize' => false,
        ],
        'file' => [
            'driver' => 'file',
            'path' => storage_path('framework/cache/data'),
            'lock_path' => storage_path('framework/cache/data'),
        ],
        'database' => [
            'driver' => 'database',
            'connection' => env('DB_CACHE_CONNECTION'),
            'table' => env('DB_CACHE_TABLE', 'cache'),
            'lock_connection' => env('DB_CACHE_LOCK_CONNECTION'),
            'lock_table' => env('DB_CACHE_LOCK_TABLE', 'cache_locks'),
        ],
    ],
    'prefix' => env('CACHE_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_cache_'),
];
`,

    'config/session.php': `<?php

return [
    'driver' => env('SESSION_DRIVER', 'file'),
    'lifetime' => env('SESSION_LIFETIME', 120),
    'expire_on_close' => false,
    'encrypt' => false,
    'files' => storage_path('framework/sessions'),
    'connection' => env('SESSION_CONNECTION'),
    'table' => 'sessions',
    'store' => env('SESSION_STORE'),
    'lottery' => [2, 100],
    'cookie' => env('SESSION_COOKIE', 'laravel_session'),
    'path' => '/',
    'domain' => env('SESSION_DOMAIN'),
    'secure' => env('SESSION_SECURE_COOKIE'),
    'http_only' => true,
    'same_site' => 'lax',
];
`,

    'config/filesystems.php': `<?php

return [
    'default' => env('FILESYSTEM_DISK', 'local'),
    'disks' => [
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
        ],
        'public' => [
            'driver' => 'local',
            'root' => storage_path('app/public'),
            'url' => env('APP_URL').'/storage',
            'visibility' => 'public',
        ],
    ],
];
`,

    'database/migrations/0001_01_01_000000_create_users_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
`,

    'database/migrations/0001_01_01_000001_create_site_settings_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('site_settings', function (Blueprint $table) {
            $table->id();
            $table->string('business_name');
            $table->string('tagline')->nullable();
            $table->text('hero_subtext')->nullable();
            $table->string('hero_image')->nullable();
            $table->string('logo')->nullable();
            $table->boolean('logo_show_name')->default(true);
            $table->string('brand_primary')->nullable();
            $table->string('brand_secondary')->nullable();
            $table->string('brand_accent')->nullable();
            $table->string('font_heading')->nullable();
            $table->string('font_body')->nullable();
            $table->string('about_title')->nullable();
            $table->text('about')->nullable();
            $table->string('about_image')->nullable();
            $table->text('mission_statement')->nullable();
            $table->json('page_visibility')->nullable();
            $table->json('section_visibility')->nullable();
            $table->string('news_section_title')->nullable();
            $table->string('news_section_subtitle')->nullable();
            $table->string('pricing_section_title')->nullable();
            $table->string('rooms_section_title')->nullable();
            $table->string('rooms_section_subtitle')->nullable();
            $table->string('booking_section_title')->nullable();
            $table->string('booking_section_subtitle')->nullable();
            $table->string('services_section_title')->nullable();
            $table->string('services_section_subtitle')->nullable();
            $table->string('steps_section_title')->nullable();
            $table->string('showcase_section_title')->nullable();
            $table->string('showcase_section_subtitle')->nullable();
            $table->string('gallery_section_title')->nullable();
            $table->string('testimonials_section_title')->nullable();
            $table->string('blog_section_title')->nullable();
            $table->string('blog_section_subtitle')->nullable();
            $table->string('faq_section_title')->nullable();
            $table->string('team_section_title')->nullable();
            $table->string('cta_banner_title')->nullable();
            $table->text('cta_banner_text')->nullable();
            $table->string('cta_text')->nullable();
            $table->string('cta_link')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('hours')->nullable();
            $table->string('license_number')->nullable();
            $table->string('instagram')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('website')->nullable();
            $table->string('contact_section_title')->nullable();
            $table->string('contact_form_title')->nullable();
            $table->string('contact_form_button_text')->nullable();
            $table->string('template_id')->nullable();
            $table->string('color_scheme_id')->nullable();
            $table->string('layout_variant_id')->nullable();
            $table->boolean('seo_enabled')->default(false);
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->text('seo_keywords')->nullable();
            $table->string('seo_site_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('site_settings');
    }
};
`,

    'database/migrations/0001_01_01_000003_create_cache_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cache', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->mediumText('value');
            $table->integer('expiration');
        });

        Schema::create('cache_locks', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->string('owner');
            $table->integer('expiration');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cache');
        Schema::dropIfExists('cache_locks');
    }
};
`,

    'database/migrations/0001_01_01_000002_create_contact_messages_table.php': `<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contact_messages', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('service_type')->nullable();
            $table->text('message');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contact_messages');
    }
};
`,

    ...generateAllBladeViews(payload),

    'database/seeders/DatabaseSeeder.php': generateSeeder(payload),

    'database/.gitignore': `*
!.gitignore
`,

    'bootstrap/cache/.gitignore': `*
!.gitignore
`,

    'storage/app/.gitignore': `*
!public/
!.gitignore
`,

    'storage/app/public/.gitignore': `*
!.gitignore
`,

    'storage/framework/.gitignore': `*
!cache/
!sessions/
!views/
!.gitignore
`,

    'storage/framework/cache/.gitignore': `*
!data/
!.gitignore
`,

    'storage/framework/cache/data/.gitignore': `*
!.gitignore
`,

    'storage/framework/sessions/.gitignore': `*
!.gitignore
`,

    'storage/framework/views/.gitignore': `*
!.gitignore
`,

    'storage/logs/.gitignore': `*
!.gitignore
`,

    'setup.sh': `#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> Installing PHP dependencies..."
composer install --no-interaction

echo "==> Setting up environment..."
if [ ! -f .env ]; then cp .env.example .env; fi
php artisan key:generate --force

echo "==> Creating required directories..."
mkdir -p bootstrap/cache storage/framework/{cache/data,sessions,views} database

echo ""
echo "Make sure MySQL is running and credentials in .env are correct:"
echo "  DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD"
echo "Create the database if it does not exist, e.g.:"
echo "  mysql -u root -e \\"CREATE DATABASE IF NOT EXISTS laravel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\\""
echo ""

echo "==> Running migrations & seeding your content..."
php artisan migrate --seed --force

echo "==> Linking storage for website images..."
php artisan storage:link --force

echo "==> Publishing Filament admin assets (CSS/JS)..."
php artisan filament:assets

echo ""
echo "Setup complete!"
echo "  Website: http://localhost:8000"
echo "  Admin:   http://localhost:8000/admin"
echo ""
echo "Run: php artisan serve"
`,

    'README.md': `# ${payload.content.businessName} — Laravel + Filament Backend

This folder is a **deploy-ready** Laravel 11 + Filament 3 admin panel, pre-filled with your WebBuilder content.

## What's included

- **Public website** at \`/\` — dynamic Blade template powered by your database
- **Filament admin** at \`/admin\` — full styled dashboard to manage content
- **3 look-and-feel variants** — Classic, Modern, and Luxury ship with every export; switch anytime under **Admin → Site Settings → Look & Feel**
- **MySQL by default** — configure credentials in \`.env\` before migrate/seed

## Quick start — browser setup (no terminal)

1. Upload the \`backend/\` folder to your host
2. Run \`composer install\` once (or upload vendor folder)
3. Copy \`.env.example\` to \`.env\` and set MySQL credentials (\`DB_*\`)
4. Create the MySQL database named in \`DB_DATABASE\`
5. Visit **\`/doctor?token=YOUR_DOCTOR_TOKEN\`** (token is in \`.env\` as \`DOCTOR_TOKEN\`)
6. Click **Run All Recommended Steps**

## Quick start — terminal

1. Ensure MySQL is running and create a database (default name: \`laravel\`)
2. Edit \`.env\` (created by setup) with your \`DB_*\` credentials if needed
3. Run:

\`\`\`bash
cd backend
chmod +x setup.sh
./setup.sh
php artisan serve
\`\`\`

## Manual setup

\`\`\`bash
cd backend
composer install
cp .env.example .env
# Edit .env: set DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan key:generate
mkdir -p bootstrap/cache storage/framework/{cache/data,sessions,views}
php artisan migrate --seed
php artisan storage:link
php artisan filament:assets   # required — publishes Filament CSS/JS
php artisan serve
\`\`\`

- Website: http://localhost:8000
- Admin: http://localhost:8000/admin

## Default admin login

Set these in your \`.env\` before running migrate/seed:

- **ADMIN_EMAIL:** ${adminEmailLocal(payload.content.businessName)}
- **ADMIN_PASSWORD:** \`password\`

Change \`ADMIN_PASSWORD\` immediately after first login, then re-run **Migrate & Seed** from Site Doctor (or \`php artisan db:seed\`).

## Look & Feel (layout variants)

Every export includes **Classic**, **Modern**, and **Luxury** presentation styles.

1. Open **Admin → Site Settings → General**
2. Change **Look & Feel**
3. Save — the public site updates immediately (hero layout, review layout, spacing/radius)

This does **not** change your content or color theme. The style chosen in the WebBuilder export is the default seed value.

## Filament resources (based on your template)

Your export includes admin panels for the sections you enabled:
${Object.entries(payload.content.sectionVisibility)
  .filter(([, v]) => v)
  .map(([k]) => `- ${k}`)
  .join('\n')}
- Site Settings (hero, about, contact info, CTA)
- Contact Messages (form submissions)
- Testimonials (always available)
- Blog Posts (always available)
${hasBookingFeature(payload.content) ? `
## Hospitality booking

This site includes a full property management booking stack:

- **Room Types** — categories and subtypes (parent/child) with pricing, occupancy, amenities
- **Room Units** — physical inventory (codes, status: available / maintenance / out of service)
- **Seasonal Rates** — date-range price overrides per room type
- **Reservations** — guest stays with status workflow (pending → confirmed → checked in → checked out / cancelled / no-show)

Public pages:
- \`/rooms\` — catalogue
- \`/rooms/{slug}\` — detail
- \`/book\` — availability search + reserve
- \`/book/confirm/{code}\` — confirmation

Only free units can be booked for overlapping dates. Manage inventory and stays in **Admin → Hospitality**.
` : ''}

## Deploying to production

1. Set \`APP_ENV=production\` and \`APP_DEBUG=false\` in \`.env\`
2. Set production MySQL credentials in \`.env\` (\`DB_HOST\`, \`DB_DATABASE\`, \`DB_USERNAME\`, \`DB_PASSWORD\`)
3. Run \`php artisan migrate --seed\`
4. Run \`php artisan storage:link\`
5. Run \`php artisan filament:assets\`
6. Point your web server document root to \`public/\`

## Frontend folder

The \`frontend/\` folder contains a static HTML snapshot (works without PHP).
Use the \`backend/\` folder when you want dynamic content and an admin dashboard.
`,
  }
}

export function generateBackend(
  templateId: TemplateId,
  content: SiteContent,
  colorSchemeId: string | undefined,
  layoutVariantId: string | undefined,
  assets: ImageAsset[],
): BackendFileMap {
  const payload = buildExportPayload(templateId, content, colorSchemeId, layoutVariantId, assets)
  const setupToken = generateSetupToken()
  const files: BackendFileMap = {}

  Object.assign(files, generateSkeleton(payload, setupToken))
  Object.assign(files, generateSetupFiles())

  for (const model of LIST_MODELS) {
    files[`app/Models/${model.name}.php`] =
      model.name === 'BlogPost' || model.name === 'NewsPost'
        ? generatePostModel(model.name)
        : generateModel(model.name, [...model.fields])
    files[`database/migrations/0001_01_01_1000_create_${model.table}_table.php`] =
      model.table === 'blog_posts' || model.table === 'news_posts'
        ? generatePostMigration(model.table)
        : generateMigration(model.table, [...model.fields])
  }

  Object.assign(files, generateFilamentFiles(content.sectionVisibility, content.pageVisibility))
  Object.assign(files, generateBookingFiles(payload))

  if (content.seoEnabled) {
    files['public/robots.txt'] = buildRobotsTxt(content.seoSiteUrl)
    files['public/sitemap.xml'] = buildSitemapXml(content.seoSiteUrl, collectLaravelSitemapPaths(content))
  }

  return files
}

/** Map frontend asset paths to storage/app/public (served via storage:link). */
export function mapAssetsForBackend(assets: ImageAsset[]): Record<string, Uint8Array> {
  const map: Record<string, Uint8Array> = {}
  for (const asset of assets) {
    map[`storage/app/public/${asset.zipPath}`] = asset.data
  }
  return map
}