<?php

namespace CommunitySdks\UnlayerLivewire\Concerns;

use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use RuntimeException;

trait HasUnlayerUploads
{
    public ?TemporaryUploadedFile $imageUpload = null;

    public function resolveUploadedImage(string $temporaryFilename): string
    {
        if (! $this->imageUpload instanceof TemporaryUploadedFile) {
            throw new RuntimeException('No uploaded image is available.');
        }

        $disk = (string) config('unlayer-livewire.upload.disk', 'public');
        $path = (string) config('unlayer-livewire.upload.path', 'unlayer-livewire');
        $visibility = (string) config('unlayer-livewire.upload.visibility', 'public');

        $storedPath = $this->imageUpload->storePublicly($path, [
            'disk' => $disk,
            'visibility' => $visibility,
        ]);

        $this->imageUpload = null;

        return Storage::disk($disk)->url($storedPath);
    }
}