<?php

namespace CommunitySdks\UnlayerLivewire\Components;

use CommunitySdks\UnlayerLivewire\Concerns\DispatchesUnlayerEvents;
use CommunitySdks\UnlayerLivewire\Concerns\HasUnlayerState;
use CommunitySdks\UnlayerLivewire\Concerns\HasUnlayerUploads;
use Illuminate\Contracts\View\View;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;

class UnlayerEditor extends Component
{
    use DispatchesUnlayerEvents;
    use HasUnlayerState;
    use HasUnlayerUploads;
    use WithFileUploads;

    public string $editorId = '';

    public string $displayMode = 'email';

    public string $height = '700px';

    public bool $syncLive = false;

    /**
     * @var array<string, mixed>
     */
    public array $unlayerOptions = [];

    /**
     * @var array<string, mixed>
     */
    public array $templateSearch = [];

    /**
     * @var array<string, mixed>
     */
    public array $templatePicker = [];

    /**
     * @param  array<string, mixed>|null  $state
     * @param  array<string, mixed>  $unlayerOptions
     * @param  array<string, mixed>  $templateSearch
     * @param  array<string, mixed>  $templatePicker
     */
    public function mount(
        ?array $state = null,
        string $displayMode = 'email',
        string $height = '700px',
        bool $syncLive = false,
        array $unlayerOptions = [],
        array $templateSearch = [],
        array $templatePicker = [],
        ?string $editorId = null,
    ): void {
        $this->state = $this->normalizeUnlayerState($state);
        $this->displayMode = $displayMode;
        $this->height = $height;
        $this->syncLive = $syncLive;
        $this->unlayerOptions = $unlayerOptions;
        $this->templateSearch = $templateSearch;
        $this->templatePicker = $templatePicker;
        $this->editorId = $editorId ?: 'unlayer-livewire-'.Str::uuid()->toString();
    }

    public function render(): View
    {
        return view('unlayer-livewire::components.editor');
    }
}
