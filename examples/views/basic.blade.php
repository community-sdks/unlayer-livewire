<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unlayer Livewire Basic Example</title>
    @livewireStyles
</head>
<body style="margin:0; font-family: Arial, sans-serif; background:#f8fafc; color:#0f172a;">
    @php
        $content = [
            'html' => '',
            'design' => [],
        ];
    @endphp

    <main style="max-width: 1200px; margin: 24px auto; padding: 0 16px; display:grid; gap:16px;">
        <section style="background:#fff; border:1px solid #d1d5db; border-radius:16px; padding:24px; box-shadow:0 20px 40px rgba(15, 23, 42, 0.08);">
            <h1 style="margin:0 0 8px; font-size:32px; line-height:1.1;">Unlayer Livewire basic example</h1>
            <p style="margin:0; color:#475569;">This page renders the packaged Livewire component with a basic empty state.</p>
        </section>

        <section style="background:#fff; border:1px solid #d1d5db; border-radius:16px; padding:16px; box-shadow:0 20px 40px rgba(15, 23, 42, 0.08);">
            <livewire:unlayer-livewire.editor
                :state="$content"
                display-mode="email"
                height="720px"
            />
        </section>
    </main>

    @livewireScripts
</body>
</html>