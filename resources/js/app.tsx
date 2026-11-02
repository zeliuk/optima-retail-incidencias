import { createInertiaApp, type ResolvedComponent } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const pages = import.meta.glob<ResolvedComponent>('./Pages/**/*.tsx');

createInertiaApp({
    resolve: (name) => resolvePageComponent(`./Pages/${name}.tsx`, pages),
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
});
