<?php

namespace CommunitySdks\UnlayerLivewire\Http\Controllers;

use Illuminate\Http\Client\Factory as HttpFactory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TemplateController
{
    public function __construct(
        private readonly HttpFactory $http,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $limit = $request->integer('limit', 20);
        $offset = $request->integer('offset', 0);

        $response = $this->http
            ->timeout(15)
            ->acceptJson()
            ->asJson()
            ->post('https://unlayer.com/templates/search', [
                'page' => (int) floor($offset / max($limit, 1)) + 1,
                'perPage' => $limit,
                'filter' => [
                    'premium' => $request->boolean('premium') ? 'true' : '',
                    'collection' => $request->string('collection')->toString(),
                    'name' => $request->string('search')->toString(),
                    'sortBy' => $request->string('sort', 'recent')->toString(),
                    'type' => $request->string('type', 'email')->toString(),
                ],
            ])
            ->throw();

        $templates = collect($response->json('data', []))
            ->map(function (array $template): ?array {
                $slug = $template['slug'] ?? null;

                if (! is_string($slug) || $slug === '') {
                    return null;
                }

                return [
                    ...$template,
                    'slug' => $slug,
                    'name' => is_string($template['name'] ?? null) ? $template['name'] : 'Untitled template',
                    'rating' => $template['rating'] ?? null,
                    'premium' => (bool) ($template['premium'] ?? false),
                    'thumbnail' => "https://api.unlayer.com/v2/stock-templates/{$slug}/thumbnail?width=500",
                ];
            })
            ->filter()
            ->values()
            ->all();

        return response()->json([
            'data' => $templates,
        ]);
    }

    public function show(string $template): JsonResponse
    {
        $response = $this->http
            ->timeout(15)
            ->acceptJson()
            ->asJson()
            ->post('https://studio.unlayer.com/api/v1/graphql', [
                'query' => <<<'GRAPHQL'
                    query StockTemplateLoad($slug: String!) {
                        StockTemplate(slug: $slug) {
                            StockTemplatePages {
                                design
                            }
                        }
                    }
                    GRAPHQL,
                'variables' => [
                    'slug' => $template,
                ],
            ])
            ->throw();

        $design = $response->json('data.StockTemplate.StockTemplatePages.0.design');

        abort_if(! is_array($design), 404, "Unlayer template [{$template}] did not return a design.");

        return response()->json([
            'data' => [
                'slug' => $template,
                'design' => $design,
            ],
        ]);
    }
}
