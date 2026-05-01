<?php

namespace CommunitySdks\UnlayerLivewire;

use CommunitySdks\UnlayerLivewire\Commands\InstallCommand;
use CommunitySdks\UnlayerLivewire\Components\UnlayerEditor;
use Illuminate\Support\ServiceProvider;
use Livewire\Livewire;

class UnlayerLivewireServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/unlayer-livewire.php',
            'unlayer-livewire',
        );
    }

    public function boot(): void
    {
        $this->loadViewsFrom(
            __DIR__ . '/../resources/views',
            'unlayer-livewire',
        );

        Livewire::component('unlayer-livewire.editor', UnlayerEditor::class);

        $this->publishes([
            __DIR__ . '/../config/unlayer-livewire.php' => config_path('unlayer-livewire.php'),
        ], 'unlayer-livewire-config');

        $this->publishes([
            __DIR__ . '/../dist/index.js' => public_path('unlayer-livewire.js'),
        ], 'unlayer-livewire-assets');

        if ($this->app->runningInConsole()) {
            $this->commands([
                InstallCommand::class,
            ]);
        }
    }
}