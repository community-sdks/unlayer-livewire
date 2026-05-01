<?php

namespace CommunitySdks\UnlayerLivewire\Concerns;

trait DispatchesUnlayerEvents
{
    /**
     * @param  array<string, mixed>  $state
     */
    protected function dispatchUnlayerSetState(array $state): void
    {
        $this->dispatch(
            'unlayer-livewire:set-state',
            id: $this->editorId,
            state: $state,
        );
    }

    /**
     * @param  array<string, mixed>  $design
     */
    protected function dispatchUnlayerLoadDesign(array $design): void
    {
        $this->dispatch(
            'unlayer-livewire:load-design',
            id: $this->editorId,
            design: $design,
        );
    }

    /**
     * @param  array<string, mixed>  $state
     */
    protected function dispatchUnlayerExported(array $state): void
    {
        $this->dispatch(
            'unlayer-livewire:exported',
            id: $this->editorId,
            state: $state,
        );
    }
}