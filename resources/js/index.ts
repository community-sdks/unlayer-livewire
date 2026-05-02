import {
    registerUnlayerAlpine,
    type UnlayerAlpineComponent,
    type UnlayerAlpineOptions,
} from '@community-sdks/unlayer-alpinejs'
import { HttpTemplateClient, type TemplateClient, type UnlayerState } from '@community-sdks/unlayer-ts'

type LivewireProgressEvent = CustomEvent<{
    progress: number
}>

type LivewireWire = {
    $set(name: string, value: unknown, live?: boolean): Promise<unknown> | void

    $call(method: string, ...params: unknown[]): Promise<unknown>

    $upload?: LivewireUploadMethod

    upload?: LivewireUploadMethod
}

type LivewireUploadMethod = (
    name: string,
    file: File,
    finish: (uploadedFilename: string) => void,
    error?: (error: unknown) => void,
    progress?: (event: LivewireProgressEvent) => void,
    cancelled?: () => void,
) => void

type AlpineLike = {
    data(
        name: string,
        callback: (options: UnlayerAlpineOptions) => UnlayerAlpineComponent,
    ): void
}

let registeredAlpine = false

export type UnlayerLivewireBridge = {
    upload(wire: LivewireWire, property?: string): (file: File) => Promise<string>

    templates(searchUrl?: string, loadUrl?: string): TemplateClient

    sync(
        wire: LivewireWire,
        property?: string,
        live?: boolean,
    ): (state: UnlayerState) => Promise<unknown> | void

    exportTo(
        wire: LivewireWire,
        method?: string,
    ): (state: UnlayerState) => Promise<unknown>
}

export function createUnlayerLivewireBridge(): UnlayerLivewireBridge {
    return {
        upload(wire: LivewireWire, property = 'imageUpload') {
            return function uploadImage(file: File): Promise<string> {
                return uploadThroughLivewire(wire, property, file)
            }
        },

        templates(
            searchUrl = '/unlayer-livewire/templates',
            loadUrl = '/unlayer-livewire/templates',
        ) {
            return new HttpTemplateClient(searchUrl, loadUrl)
        },

        sync(wire: LivewireWire, property = 'state', live = false) {
            return function syncState(state: UnlayerState): Promise<unknown> | void {
                return wire.$set(property, state, live)
            }
        },

        exportTo(wire: LivewireWire, method = 'exported') {
            return function exportState(state: UnlayerState): Promise<unknown> {
                return wire.$call(method, state)
            }
        },
    }
}

export function uploadThroughLivewire(
    wire: LivewireWire,
    property: string,
    file: File,
): Promise<string> {
    const upload = wire.$upload ?? wire.upload

    if (! upload) {
        return Promise.reject(new Error('Livewire upload API is not available.'))
    }

    return new Promise((resolve, reject) => {
        upload.call(
            wire,
            property,
            file,
            (uploadedFilename: string) => {
                wire.$call('resolveUploadedImage', uploadedFilename)
                    .then((url) => resolve(String(url)))
                    .catch(reject)
            },
            reject,
        )
    })
}

export function registerUnlayerLivewire(
    Alpine: AlpineLike,
    alpineComponentName = 'unlayerEditor',
): void {
    if (registeredAlpine) {
        return
    }

    registerUnlayerAlpine(Alpine, alpineComponentName)
    registeredAlpine = true

    window.UnlayerLivewire = createUnlayerLivewireBridge()
}

declare global {
    interface Window {
        Alpine?: AlpineLike
        UnlayerLivewire: UnlayerLivewireBridge
    }
}

document.addEventListener('alpine:init', () => {
    if (window.Alpine) {
        registerUnlayerLivewire(window.Alpine)
    }
})

if (window.Alpine) {
    registerUnlayerLivewire(window.Alpine)
}

if (! window.UnlayerLivewire) {
    window.UnlayerLivewire = createUnlayerLivewireBridge()
}

export default registerUnlayerLivewire
