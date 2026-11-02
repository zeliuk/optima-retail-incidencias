import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';

export type Incident = {
    id: number;
    title: string;
    status: string;
    priority: string;
    requester_name: string;
    assigned_to: string | null;
    created_at: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

const statusLabels: Record<string, string> = {
    abierta: 'Abierta',
    en_revision: 'En revisión',
    bloqueada: 'Bloqueada',
    resuelta: 'Resuelta',
};

const statusStyles: Record<string, string> = {
    abierta: 'bg-sky-50 text-sky-700 ring-sky-600/15',
    en_revision: 'bg-violet-50 text-violet-700 ring-violet-600/15',
    bloqueada: 'bg-amber-50 text-amber-800 ring-amber-600/20',
    resuelta: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
};

const priorityLabels: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
};

const priorityStyles: Record<string, string> = {
    baja: 'bg-slate-100 text-slate-600',
    media: 'bg-blue-50 text-blue-700',
    alta: 'bg-orange-50 text-orange-800',
    critica: 'bg-rose-50 text-rose-700',
};

function Badge({ children, className }: { children: ReactNode; className: string }) {
    return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
    return <Badge className={`ring-1 ring-inset ${statusStyles[status] ?? 'bg-slate-100 text-slate-700 ring-slate-500/15'}`}>{statusLabels[status] ?? status}</Badge>;
}

export function PriorityBadge({ priority }: { priority: string }) {
    return <Badge className={priorityStyles[priority] ?? 'bg-slate-100 text-slate-700'}>{priorityLabels[priority] ?? priority}</Badge>;
}

export function StatusSummary({ incidents }: { incidents: Incident[] }) {
    const items = [
        { key: 'abierta', label: 'Abiertas', marker: 'bg-sky-500' },
        { key: 'en_revision', label: 'En revisión', marker: 'bg-violet-500' },
        { key: 'bloqueada', label: 'Bloqueadas', marker: 'bg-amber-500' },
        { key: 'resuelta', label: 'Resueltas', marker: 'bg-emerald-500' },
    ];

    return (
        <section aria-labelledby="summary-title" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <h2 id="summary-title" className="sr-only">Resumen de incidencias por estado</h2>
            {items.map((item) => (
                <article key={item.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span aria-hidden="true" className={`size-2 rounded-full ${item.marker}`} />
                        {item.label}
                    </div>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                        {incidents.filter((incident) => incident.status === item.key).length}
                    </p>
                </article>
            ))}
        </section>
    );
}

export function EmptyState({ filtered = false }: { filtered?: boolean }) {
    return (
        <div className="px-6 py-16 text-center sm:py-20">
            <div aria-hidden="true" className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">—</div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">{filtered ? 'No hay resultados para estos filtros' : 'Todavía no hay incidencias'}</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {filtered ? 'Prueba a cambiar los criterios de búsqueda o limpia los filtros para ver más incidencias.' : 'Cuando se registren incidencias, aparecerán aquí con su estado y prioridad.'}
            </p>
        </div>
    );
}

export function Pagination({ links }: { links: PaginationLink[] }) {
    if (links.length < 2) return null;

    return (
        <nav aria-label="Paginación de incidencias" className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 px-4 py-4 sm:justify-between sm:px-6">
            <p className="hidden text-sm text-slate-500 sm:block">Navega por las páginas de incidencias</p>
            <div className="flex flex-wrap justify-center gap-1.5">
                {links.map((link, index) => {
                    const isPrevious = index === 0;
                    const isNext = index === links.length - 1;
                    const label = isPrevious ? 'Anterior' : isNext ? 'Siguiente' : link.label;
                    return link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            aria-current={link.active ? 'page' : undefined}
                            aria-label={isPrevious || isNext ? label : `Página ${label}`}
                            className={`min-w-9 rounded-lg px-3 py-2 text-center text-sm font-medium transition ${link.active ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'} ${isPrevious || isNext ? '' : 'hidden sm:block'}`}
                        >
                            {label}
                        </Link>
                    ) : (
                        <span key={`${link.label}-${index}`} aria-hidden="true" className="min-w-9 rounded-lg px-3 py-2 text-center text-sm text-slate-300">{label}</span>
                    );
                })}
            </div>
        </nav>
    );
}
