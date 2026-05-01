# Unofficial Unlayer Livewire SDK

Livewire wrapper for [`@community-sdks/unlayer-alpinejs`](https://www.npmjs.com/package/@community-sdks/unlayer-alpinejs), which wraps [`@community-sdks/unlayer-ts`](https://www.npmjs.com/package/@community-sdks/unlayer-ts).

This package gives Laravel apps a Livewire component for the Unlayer editor while keeping the editor lifecycle in the TypeScript SDK and Alpine adapter.

## Getting Started

Install the PHP package:

```bash
composer require community-sdks/unlayer-livewire
```

Install the browser asset:

```bash
php artisan unlayer-livewire:install
```

This publishes the compiled browser file to:

```txt
public/unlayer-livewire.js
```

If you want to customize upload storage, publish the config file too:

```bash
php artisan unlayer-livewire:install --config
```

To overwrite previously published files:

```bash
php artisan unlayer-livewire:install --force
```

You can also publish assets or config manually:

```bash
php artisan vendor:publish --tag=unlayer-livewire-assets --force
php artisan vendor:publish --tag=unlayer-livewire-config
```

## Basic Usage

Use the Livewire component anywhere in a Blade view:

```blade
<livewire:unlayer-livewire.editor
    :state="$content"
    display-mode="email"
    height="720px"
/>
```

`state` is an array with this shape:

```php
[
    'html' => '',
    'design' => [],
]
```

Cast your model column to an array:

```php
protected function casts(): array
{
    return [
        'content' => 'array',
    ];
}
```

## Stock Templates

Template search and loading comes from the underlying TypeScript SDK and works through the Alpine adapter. You can pass default filters:

```blade
<livewire:unlayer-livewire.editor
    :state="$content"
    :template-search="[
        'search' => 'newsletter',
        'type' => 'email',
        'premium' => false,
        'limit' => 20,
        'offset' => 0,
        'collection' => '',
        'sort' => 'recent',
    ]"
/>
```

The Alpine component exposes:

```txt
mount()
isReady()
getState()
setState(state)
loadDesign(design)
exportState()
searchTemplates(options)
refreshTemplates()
loadTemplate(slug)
chooseTemplate(templateOrSlug)
openTemplates()
closeTemplates()
setTemplateSearch(search)
```

## Livewire Methods

The PHP Livewire component exposes:

```php
setState(array $state): void
loadDesign(array $design): void
clear(): void
exported(array $state): void
resolveUploadedImage(string $temporaryFilename): string
```

## Uploads

Image uploads use Livewire's JavaScript upload API. The editor uploads a file to the component property `imageUpload`, then calls `resolveUploadedImage()` to store it and return the public URL.

Configure storage in `config/unlayer-livewire.php`:

```php
return [
    'upload' => [
        'disk' => 'public',
        'path' => 'unlayer-livewire',
        'visibility' => 'public',
    ],
];
```

Make sure your public disk is linked:

```bash
php artisan storage:link
```

## Development

Build the browser adapter:

```bash
npm install
npm run build
```

Run TypeScript checks:

```bash
npm run typecheck
```

Format PHP:

```bash
vendor/bin/pint
```

## License

MIT
