<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Uploads
    |--------------------------------------------------------------------------
    |
    | Image uploads are handled by Livewire. After Livewire receives the
    | temporary file, the component stores it on the configured disk/path
    | and returns a public URL back to Unlayer.
    |
    */

    'upload' => [
        'disk' => 'public',
        'path' => 'unlayer-livewire',
        'visibility' => 'public',
    ],
];