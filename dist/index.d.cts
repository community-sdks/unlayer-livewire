import { UnlayerAlpineOptions, UnlayerAlpineComponent } from '@community-sdks/unlayer-alpinejs';
import { UnlayerState } from '@community-sdks/unlayer-ts';

type LivewireProgressEvent = CustomEvent<{
    progress: number;
}>;
type LivewireWire = {
    $set(name: string, value: unknown, live?: boolean): Promise<unknown> | void;
    $call(method: string, ...params: unknown[]): Promise<unknown>;
    $upload(name: string, file: File, finish: (uploadedFilename: string) => void, error?: (error: unknown) => void, progress?: (event: LivewireProgressEvent) => void, cancelled?: () => void): void;
};
type AlpineLike = {
    data(name: string, callback: (options: UnlayerAlpineOptions) => UnlayerAlpineComponent): void;
};
type UnlayerLivewireBridge = {
    upload(wire: LivewireWire, property?: string): (file: File) => Promise<string>;
    sync(wire: LivewireWire, property?: string, live?: boolean): (state: UnlayerState) => Promise<unknown> | void;
    exportTo(wire: LivewireWire, method?: string): (state: UnlayerState) => Promise<unknown>;
};
declare function createUnlayerLivewireBridge(): UnlayerLivewireBridge;
declare function uploadThroughLivewire(wire: LivewireWire, property: string, file: File): Promise<string>;
declare function registerUnlayerLivewire(Alpine: AlpineLike, alpineComponentName?: string): void;
declare global {
    interface Window {
        Alpine?: AlpineLike;
        UnlayerLivewire: UnlayerLivewireBridge;
    }
}

export { type UnlayerLivewireBridge, createUnlayerLivewireBridge, registerUnlayerLivewire as default, registerUnlayerLivewire, uploadThroughLivewire };
