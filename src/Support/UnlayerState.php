<?php

namespace CommunitySdks\UnlayerLivewire\Support;

class UnlayerState
{
    /**
     * @param  array<string, mixed>|null  $state
     * @return array{html: string, design: array<string, mixed>}
     */
    public static function normalize(?array $state): array
    {
        return [
            'html' => is_string($state['html'] ?? null) ? $state['html'] : '',
            'design' => is_array($state['design'] ?? null) ? $state['design'] : [],
        ];
    }

    /**
     * @param  array<string, mixed>|null  $state
     */
    public static function html(?array $state): string
    {
        $normalized = self::normalize($state);

        return $normalized['html'];
    }

    /**
     * @param  array<string, mixed>|null  $state
     * @return array<string, mixed>
     */
    public static function design(?array $state): array
    {
        $normalized = self::normalize($state);

        return $normalized['design'];
    }

    /**
     * @return array{html: string, design: array<string, mixed>}
     */
    public static function empty(): array
    {
        return [
            'html' => '',
            'design' => [],
        ];
    }
}