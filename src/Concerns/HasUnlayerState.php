<?php

namespace CommunitySdks\UnlayerLivewire\Concerns;

use CommunitySdks\UnlayerLivewire\Support\UnlayerState;
use Livewire\Attributes\Modelable;

trait HasUnlayerState
{
    /**
     * @var array{html: string, design: array<string, mixed>}
     */
    #[Modelable]
    public array $state = [
        'html' => '',
        'design' => [],
    ];

    /**
     * @param  array<string, mixed>  $state
     */
    public function setState(array $state): void
    {
        $this->state = $this->normalizeUnlayerState($state);
    }

    /**
     * @param  array<string, mixed>  $state
     */
    public function exported(array $state): void
    {
        $this->state = $this->normalizeUnlayerState($state);

        if (method_exists($this, 'dispatchUnlayerExported')) {
            $this->dispatchUnlayerExported($this->state);
        }
    }

    public function clear(): void
    {
        $this->state = UnlayerState::empty();

        if (method_exists($this, 'dispatchUnlayerSetState')) {
            $this->dispatchUnlayerSetState($this->state);
        }
    }

    /**
     * @param  array<string, mixed>  $design
     */
    public function loadDesign(array $design): void
    {
        $this->state['design'] = $design;

        if (method_exists($this, 'dispatchUnlayerLoadDesign')) {
            $this->dispatchUnlayerLoadDesign($design);
        }
    }

    /**
     * @param  array<string, mixed>|null  $state
     * @return array{html: string, design: array<string, mixed>}
     */
    protected function normalizeUnlayerState(?array $state): array
    {
        return UnlayerState::normalize($state);
    }
}
