@once
    <script type="module" src="{{ route('unlayer-livewire.assets.index') }}"></script>
@endonce

<div
    wire:ignore.self
    x-data="unlayerEditor({
        id: @js($editorId),
        state: @js($state),
        displayMode: @js($displayMode),
        unlayerOptions: @js($unlayerOptions),
        templateSearch: @js($templateSearch),
        uploadImage: window.UnlayerLivewire.upload($wire, 'imageUpload'),
        onChange: window.UnlayerLivewire.sync($wire, 'state', @js($syncLive)),
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