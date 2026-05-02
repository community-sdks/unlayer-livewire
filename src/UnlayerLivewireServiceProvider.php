<?php

namespace CommunitySdks\UnlayerLivewire;

use CommunitySdks\UnlayerLivewire\Commands\InstallCommand;
use CommunitySdks\UnlayerLivewire\Components\UnlayerEditor;
use CommunitySdks\UnlayerLivewire\Http\Controllers\TemplateController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class UnlayerLivewireServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__.'/../config/unlayer-livewire.php',
            'unlayer-livewire',
        );
    }

    public function boot(): void
    {
        $this->loadViewsFrom(
            __DIR__.'/../resources/views',
            'unlayer-livewire',
        );

        Livewire::component('unlayer-livewire.editor', UnlayerEditor::class);

        $this->registerRoutes();

        $this->publishes([
            __DIR__.'/../config/unlayer-livewire.php' => config_path('unlayer-livewire.php'),
        ], 'unlayer-livewire-config');

        $this->publishes([
            __DIR__.'/../dist/index.js' => public_path('unlayer-livewire.js'),
        ], 'unlayer-livewire-assets');

        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
            ]);
        }
    }

    private function registerRoutes(): void
    {
        Route::middleware(config('unlayer-livewire.routes.middleware', ['web']))
            ->prefix(config('unlayer-livewire.routes.prefix', 'unlayer-livewire'))
            ->name('unlayer-livewire.')
            ->group(function (): void {
                Route::get('templates', [TemplateController::class, 'search'])->name('templates.search');
                Route::get('templates/{template}', [TemplateController::class, 'show'])->name('templates.show');
            });
    }
}
