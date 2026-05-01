<?php

namespace CommunitySdks\UnlayerLivewire\Commands;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    protected $signature = 'unlayer-livewire:install
        {--force : Overwrite existing published files}
        {--config : Publish the configuration file}';

    protected $description = 'Install Unlayer Livewire assets and optionally publish the configuration file.';

    public function handle(): int
    {
        $this->components->info('Publishing Unlayer Livewire browser asset...');

        $this->callSilent('vendor:publish', [
            '--tag' => 'unlayer-livewire-assets',
            '--force' => $this->option('force'),
        ]);

        if ($this->option('config')) {
            $this->components->info('Publishing Unlayer Livewire configuration...');

            $this->callSilent('vendor:publish', [
                '--tag' => 'unlayer-livewire-config',
                '--force' => $this->option('force'),
            ]);
        }

        $this->components->info('Unlayer Livewire installed successfully.');

        $this->newLine();

        $this->components->twoColumnDetail('Asset', public_path('unlayer-livewire.js'));

        if (! $this->option('config')) {
            $this->components->warn('Config was not published. Use --config if you want to customize uploads.');
        }

        return self::SUCCESS;
    }
}