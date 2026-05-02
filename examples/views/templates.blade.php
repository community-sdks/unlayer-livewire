<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unlayer Livewire Template Picker Example</title>
    @livewireStyles
</head>
<body style="margin:0; font-family: Arial, sans-serif; background:#eff6ff; color:#0f172a;">
    @php
        $content = [
            'html' => '',
            'design' => [],
        ];
    @endphp

    <main style="max-width: 1280px; margin: 24px auto; padding: 0 16px; display:grid; gap:16px;">
        <section style="background:#fff; border:1px solid #bfdbfe; border-radius:20px; padding:24px; box-shadow:0 20px 40px rgba(15, 23, 42, 0.08); display:grid; gap:12px;">
            <h1 style="margin:0; font-size:32px; line-height:1.1;">Unlayer Livewire template picker example</h1>
            <p style="margin:0; color:#475569;">This page enables the built-in template picker and configures the default template search through the package's same-origin Laravel proxy routes.</p>
        </section>

        <section style="background:#fff; border:1px solid #bfdbfe; border-radius:20px; padding:16px; box-shadow:0 20px 40px rgba(15, 23, 42, 0.08);">
            <livewire:unlayer-livewire.editor
                :state="$content"
                display-mode="email"
                height="760px"
                :template-search="[
                    'search' => 'newsletter',
                    'type' => 'email',
                    'premium' => false,
                    'limit' => 12,
                    'sort' => 'recent',
                ]"
                :template-picker="[
                    'showTrigger' => true,
                    'label' => 'Backend template browser',
                    'triggerLabel' => 'Browse templates',
                    'title' => 'Templates from your backend',
                    'placeholder' => 'Search templates',
                    'emptyText' => 'No templates returned from the backend.',
                ]"
            />
        </section>
    </main>

    @livewireScripts
</body>
</html>