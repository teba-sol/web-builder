import { buildBladeHeroHtml } from '../heroExport'
import type { SiteExportPayload } from './exportPayload'

function navPartial(payload: SiteExportPayload): string {
  const { accent } = payload
  return `<nav class="sticky top-0 z-50 border-b bg-white/90 backdrop-blur px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
  <a href="{{ route('home') }}" class="text-xl font-bold">{{ $settings->business_name }}</a>
  <div class="hidden md:flex gap-6 text-sm">
    <a href="{{ route('home') }}" class="hover:underline opacity-70">Home</a>
    @if($settings->page_visibility['about'] ?? false)<a href="{{ route('about') }}" class="hover:underline opacity-70">About</a>@endif
    @if($settings->page_visibility['services'] ?? false)<a href="{{ route('services') }}" class="hover:underline opacity-70">Services</a>@endif
    @if($settings->page_visibility['portfolio'] ?? false)<a href="{{ route('portfolio') }}" class="hover:underline opacity-70">Portfolio</a>@endif
    @if($settings->page_visibility['blog'] ?? false)<a href="{{ route('blog.index') }}" class="hover:underline opacity-70">Blog</a>@endif
    @if($settings->page_visibility['news'] ?? false)<a href="{{ route('news.index') }}" class="hover:underline opacity-70">News</a>@endif
    @if($settings->page_visibility['gallery'] ?? false)<a href="{{ route('gallery') }}" class="hover:underline opacity-70">Gallery</a>@endif
    @if($settings->page_visibility['contact'] ?? false)<a href="{{ route('contact') }}" class="hover:underline opacity-70">Contact</a>@endif
  </div>
  <a href="{{ route('contact') }}" class="text-white px-5 py-2 rounded-lg text-sm font-semibold" style="background-color:${accent}">{{ $settings->cta_text }}</a>
</nav>`
}

function footerPartial(): string {
  return `<footer class="border-t py-8 text-center text-sm text-slate-500">
  <div class="mb-4 flex flex-wrap justify-center gap-6 max-w-6xl mx-auto px-6">
    <a href="{{ route('home') }}" class="hover:underline opacity-70">Home</a>
    @if($settings->page_visibility['about'] ?? false)<a href="{{ route('about') }}" class="hover:underline opacity-70">About</a>@endif
    @if($settings->page_visibility['services'] ?? false)<a href="{{ route('services') }}" class="hover:underline opacity-70">Services</a>@endif
    @if($settings->page_visibility['portfolio'] ?? false)<a href="{{ route('portfolio') }}" class="hover:underline opacity-70">Portfolio</a>@endif
    @if($settings->page_visibility['blog'] ?? false)<a href="{{ route('blog.index') }}" class="hover:underline opacity-70">Blog</a>@endif
    @if($settings->page_visibility['news'] ?? false)<a href="{{ route('news.index') }}" class="hover:underline opacity-70">News</a>@endif
    @if($settings->page_visibility['gallery'] ?? false)<a href="{{ route('gallery') }}" class="hover:underline opacity-70">Gallery</a>@endif
    @if($settings->page_visibility['contact'] ?? false)<a href="{{ route('contact') }}" class="hover:underline opacity-70">Contact</a>@endif
  </div>
  <p>© {{ date('Y') }} {{ $settings->business_name }}</p>
</footer>`
}

function contactFormPartial(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@if(session('contact_success'))
<div class="rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 mb-4">{{ session('contact_success') }}</div>
@endif
<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <form class="space-y-4" action="{{ route('contact.store') }}" method="POST">
    @csrf
    <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Your Name</label><input name="name" type="text" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /></div>
    <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input name="email" type="email" required class="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm" /></div>
    <div><label class="block text-sm font-medium text-slate-700 mb-1.5">Message</label><textarea name="message" required rows="5" class="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"></textarea></div>
    <button type="submit" class="w-full text-white px-6 py-3 rounded-lg font-semibold" style="background-color:${accent}">{{ $settings->contact_form_button_text }}</button>
  </form>
</div>`
}

export function generateBladePartials(payload: SiteExportPayload): Record<string, string> {
  return {
    'resources/views/partials/nav.blade.php': navPartial(payload),
    'resources/views/partials/footer.blade.php': footerPartial(),
    'resources/views/partials/contact-form.blade.php': contactFormPartial(payload),
  }
}

export function generateBladeView(payload: SiteExportPayload): string {
  const { accent, accentDark, templateId, layout } = payload
  const heroSection = buildBladeHeroHtml({
    templateId,
    heroLayout: layout.heroLayout,
    heroImage: 'hero',
    businessName: payload.content.businessName,
    tagline: payload.content.tagline,
    heroSubtext: payload.content.heroSubtext,
    ctaText: payload.content.ctaText,
    ctaHref: 'contact',
  })
  return `@extends('layouts.site')

@section('content')
${heroSection}

@if(($settings->section_visibility['stats'] ?? false) && $stats->isNotEmpty())
<section class="py-16 text-white" style="background-color:${accent}">
  <div class="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
    @foreach($stats as $stat)
    <div class="text-center"><p class="text-3xl font-bold">{{ $stat->value }}</p><p class="text-sm opacity-70 mt-1">{{ $stat->label }}</p></div>
    @endforeach
  </div>
</section>
@endif

@if(($settings->page_visibility['blog'] ?? false) && $blogPosts->isNotEmpty())
<section class="bg-slate-50 py-20">
  <div class="max-w-6xl mx-auto px-6">
    <div class="flex flex-wrap justify-between items-end gap-4 mb-10">
      <div>
        <h2 class="text-3xl font-bold">{{ $settings->blog_section_title }}</h2>
        <p class="text-slate-600 mt-2">{{ $settings->blog_section_subtitle }}</p>
      </div>
      <a href="{{ route('blog.index') }}" class="text-sm font-semibold" style="color:${accent}">View all posts →</a>
    </div>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      @foreach($blogPosts->take(3) as $post)
      <a href="{{ route('blog.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">
        @if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif
        <div class="p-6">
          @if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif
          <h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3>
          <p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p>
          <span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span>
        </div>
      </a>
      @endforeach
    </div>
  </div>
</section>
@endif

@if($settings->section_visibility['cta'] ?? false)
<section class="text-white py-20 text-center" style="background-color:${accentDark}">
  <div class="max-w-3xl mx-auto px-6">
    <h2 class="text-3xl font-bold mb-4">{{ $settings->cta_banner_title }}</h2>
    <p class="mb-8 text-lg opacity-80">{{ $settings->cta_banner_text }}</p>
    <a href="{{ route('contact') }}" class="inline-block bg-white px-8 py-3 rounded-lg font-semibold" style="color:${accentDark}">{{ $settings->cta_text }}</a>
  </div>
</section>
@endif
@endsection`
}

export function generateAboutView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
  <div><h1 class="text-4xl font-bold mb-6">{{ $settings->about_title }}</h1><p class="text-lg leading-relaxed text-slate-600 mb-6">{{ $settings->about }}</p>@if($settings->mission_statement)<p class="border-l-4 pl-6 italic text-slate-600" style="border-color:${accent}">{{ $settings->mission_statement }}</p>@endif</div>
  @if($settings->about_image)<img src="{{ \\App\\Support\\PublicAsset::url($settings->about_image) }}" class="rounded-2xl w-full" alt="" />@endif
</div></section>
@if(($settings->section_visibility['team'] ?? false) && $team->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->team_section_title }}</h2><div class="grid md:grid-cols-3 gap-8">@foreach($team as $member)<div class="text-center">@if($member->image)<img src="{{ \\App\\Support\\PublicAsset::url($member->image) }}" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover" alt="" />@endif<h3 class="font-semibold">{{ $member->name }}</h3><p class="opacity-70">{{ $member->role }}</p></div>@endforeach</div></div></section>
@endif
@endsection`
}

export function generateServicesView(_payload: SiteExportPayload): string {
  return `@extends('layouts.site')
@section('content')
@if($services->isNotEmpty())
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->services_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->services_section_subtitle }}</p><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">@foreach($services as $service)<div class="rounded-xl border p-6"><h3 class="font-semibold text-lg mb-2">{{ $service->title }}</h3><p class="opacity-80">{{ $service->description }}</p></div>@endforeach</div></div></section>
@endif
@if(($settings->section_visibility['steps'] ?? false) && $steps->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->steps_section_title }}</h2><div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">@foreach($steps as $step)<div><span class="text-2xl font-bold opacity-40">0{{ $loop->iteration }}</span><h3 class="font-semibold mt-2">{{ $step->title }}</h3><p class="opacity-80 mt-1">{{ $step->description }}</p></div>@endforeach</div></div></section>
@endif
@endsection`
}

export function generatePortfolioView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
@if($showcaseItems->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->showcase_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->showcase_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($showcaseItems as $item)<a href="{{ route('contact') }}" class="block rounded-xl border overflow-hidden hover:shadow-lg">@if($item->image)<img src="{{ \\App\\Support\\PublicAsset::url($item->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6"><h3 class="font-semibold text-lg mb-2">{{ $item->title }}</h3><p class="opacity-80">{{ $item->description }}</p>@if($item->price)<p class="text-lg font-bold mt-2" style="color:${accent}">{{ $item->price }}</p>@endif</div></a>@endforeach</div></div></section>
@endif
@endsection`
}

export function generateGalleryView(): string {
  return `@extends('layouts.site')
@section('content')
@if($galleryImages->isNotEmpty())
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">{{ $settings->gallery_section_title }}</h1><div class="grid md:grid-cols-3 gap-4">@foreach($galleryImages as $image)<img src="{{ \\App\\Support\\PublicAsset::url($image->path) }}" class="w-full rounded-xl aspect-[4/3] object-cover" alt="" />@endforeach</div></div></section>
@endif
@endsection`
}

export function generateReviewsView(): string {
  return `@extends('layouts.site')
@section('content')
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->testimonials_section_title }}</h1><p class="text-center text-slate-600 mb-12">What our clients say about us</p>@if($testimonials->isNotEmpty())<div class="grid md:grid-cols-3 gap-6">@foreach($testimonials as $t)<div class="border rounded-xl p-6"><div class="text-amber-400 mb-3">★★★★★</div><p class="italic mb-4 text-lg">"{{ $t->quote }}"</p><p class="font-semibold">{{ $t->author }}</p><p class="text-sm opacity-70">{{ $t->role }}</p></div>@endforeach</div>@endif</div></section>
@endsection`
}

export function generateBlogIndexView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="bg-slate-50 py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->blog_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->blog_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($blogPosts as $post)<a href="{{ route('blog.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p><span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span></div></a>@endforeach</div></div></section>
@endsection`
}

export function generateBlogPostView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="{{ route('blog.index') }}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back to blog</a>
@if($post->published_at)<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">{{ $post->published_at->format('F j, Y') }}</p>@endif
<h1 class="text-4xl font-bold mb-4">{{ $post->title }}</h1>
@if($post->author)<p class="text-slate-500 mb-8">By {{ $post->author }}</p>@endif
@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" alt="" />@endif
@if($post->excerpt)<p class="text-xl text-slate-700 mb-10 border-l-4 pl-6 italic" style="border-color:${accent}">{{ $post->excerpt }}</p>@endif
<div class="prose prose-slate max-w-none">{!! nl2br(e($post->body)) !!}</div>
</div></article>
@endsection`
}

export function generateFaqView(): string {
  return `@extends('layouts.site')
@section('content')
@if($faqs->isNotEmpty())
<section class="py-20"><div class="max-w-3xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-12">{{ $settings->faq_section_title }}</h1>@foreach($faqs as $faq)<div class="border-b py-5"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="opacity-80">{{ $faq->answer }}</p></div>@endforeach</div></section>
@endif
@endsection`
}

export function generateNewsIndexView(payload: SiteExportPayload): string {
  const { accent } = payload
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold text-center mb-4">{{ $settings->news_section_title }}</h1><p class="text-center text-slate-600 mb-12">{{ $settings->news_section_subtitle }}</p><div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">@foreach($newsPosts as $post)<a href="{{ route('news.show', $post->slug) }}" class="block rounded-xl border overflow-hidden hover:shadow-lg bg-white">@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full aspect-[4/3] object-cover" alt="" />@endif<div class="p-6">@if($post->published_at)<p class="text-xs uppercase tracking-wider opacity-60 mb-2">{{ $post->published_at->format('F j, Y') }}</p>@endif<h3 class="font-semibold text-lg mb-2">{{ $post->title }}</h3><p class="opacity-80 line-clamp-3">{{ $post->excerpt }}</p><span class="inline-block mt-3 text-sm font-semibold" style="color:${accent}">Read more →</span></div></a>@endforeach</div></div></section>
@endsection`
}

export function generateNewsPostView(_payload: SiteExportPayload): string {
  return `@extends('layouts.site')
@section('content')
<article class="py-16"><div class="max-w-3xl mx-auto px-6">
<a href="{{ route('news.index') }}" class="text-sm opacity-70 hover:underline mb-8 inline-block">← Back to news</a>
@if($post->published_at)<p class="text-sm uppercase tracking-wider text-slate-400 mb-4">{{ $post->published_at->format('F j, Y') }}</p>@endif
<h1 class="text-4xl font-bold mb-4">{{ $post->title }}</h1>
@if($post->image)<img src="{{ \\App\\Support\\PublicAsset::url($post->image) }}" class="w-full rounded-2xl mb-10 aspect-[16/9] object-cover" alt="" />@endif
<div class="prose prose-slate max-w-none">{!! nl2br(e($post->body)) !!}</div>
</div></article>
@endsection`
}

export function generateContactView(): string {
  return `@extends('layouts.site')
@section('content')
<section class="py-20"><div class="max-w-6xl mx-auto px-6"><h1 class="text-4xl font-bold mb-10">{{ $settings->contact_section_title }}</h1><div class="grid lg:grid-cols-2 gap-12"><div><h2 class="text-xl font-semibold mb-6">{{ $settings->contact_form_title }}</h2><div class="grid sm:grid-cols-2 gap-6 text-sm">@if($settings->email)<div><p class="opacity-60 mb-1">Email</p><p>{{ $settings->email }}</p></div>@endif @if($settings->phone)<div><p class="opacity-60 mb-1">Phone</p><p>{{ $settings->phone }}</p></div>@endif @if($settings->address)<div><p class="opacity-60 mb-1">Address</p><p>{{ $settings->address }}</p></div>@endif @if($settings->hours)<div><p class="opacity-60 mb-1">Hours</p><p>{{ $settings->hours }}</p></div>@endif</div></div><div>@include('partials.contact-form')</div></div></section>
@if(($settings->section_visibility['faq'] ?? false) && $faqs->isNotEmpty())
<section class="py-16"><div class="max-w-3xl mx-auto px-6"><h2 class="text-3xl font-bold text-center mb-12">{{ $settings->faq_section_title }}</h2>@foreach($faqs as $faq)<div class="border-b py-5"><h3 class="font-semibold mb-2">{{ $faq->question }}</h3><p class="opacity-80">{{ $faq->answer }}</p></div>@endforeach</div></section>
@endif
@if($settings->section_visibility['terms'] ?? false)
@if($settings->terms_content)<section class="bg-slate-50 py-16"><div class="max-w-3xl mx-auto px-6"><h2 class="text-2xl font-bold mb-6">{{ $settings->terms_section_title }}</h2><p class="text-slate-600">{{ $settings->terms_content }}</p></div></section>@endif
@endif
@endsection`
}

export function generateSiteLayout(payload: SiteExportPayload): string {
  const title = payload.content.businessName || 'My Website'
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>@yield('title', '${title}')</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-800">
  @include('partials.nav')
  @yield('content')
  @include('partials.footer')
</body>
</html>`
}

export function generateAllBladeViews(payload: SiteExportPayload): Record<string, string> {
  return {
    ...generateBladePartials(payload),
    'resources/views/layouts/site.blade.php': generateSiteLayout(payload),
    'resources/views/site/index.blade.php': generateBladeView(payload),
    'resources/views/site/about.blade.php': generateAboutView(payload),
    'resources/views/site/services.blade.php': generateServicesView(payload),
    'resources/views/site/portfolio.blade.php': generatePortfolioView(payload),
    'resources/views/site/gallery.blade.php': generateGalleryView(),
    'resources/views/site/blog.blade.php': generateBlogIndexView(payload),
    'resources/views/site/blog-post.blade.php': generateBlogPostView(payload),
    'resources/views/site/news.blade.php': generateNewsIndexView(payload),
    'resources/views/site/news-post.blade.php': generateNewsPostView(payload),
    'resources/views/site/contact.blade.php': generateContactView(),
  }
}