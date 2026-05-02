@assets
    <script src="{{ asset('unlayer-livewire.js') }}"></script>
@endassets

@php
    $syncState = <<<'JS'
        (state) => {
            window.dispatchEvent(new CustomEvent('unlayer-livewire:exported', {
                detail: {
                    id: EDITOR_ID,
                    state,
                },
            }))

            return window.UnlayerLivewire.sync($wire, 'state', SYNC_LIVE)(state)
        }
    JS;
@endphp

<div
    wire:ignore.self
    x-data="unlayerEditor({
        id: @js($editorId),
        state: @js($state),
        displayMode: @js($displayMode),
        unlayerOptions: @js($unlayerOptions),
        templateSearch: @js($templateSearch),
        templatePicker: @js($templatePicker),
        templateClient: window.UnlayerLivewire.templates(),
        uploadImage: window.UnlayerLivewire.upload($wire, 'imageUpload'),
        onChange: {{ str_replace(['EDITOR_ID', 'SYNC_LIVE'], [json_encode($editorId, JSON_THROW_ON_ERROR), json_encode($syncLive, JSON_THROW_ON_ERROR)], $syncState) }},
    })"
    x-on:unlayer-livewire:set-state.window="
        if ($event.detail.id === @js($editorId)) {
            setState($event.detail.state)
        }
    "
    x-on:unlayer-livewire:load-design.window="
        if ($event.detail.id === @js($editorId)) {
            loadDesign($event.detail.design)
        }
    "
>
    <div
        wire:ignore
        id="{{ $editorId }}"
        style="height: {{ $height }};"
    ></div>
</div>
