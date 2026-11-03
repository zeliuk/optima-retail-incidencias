import { Link, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import CreateIncidentForm from './CreateIncidentForm';
import FiltersPanel from './FiltersPanel';
import { EmptyState, Pagination, PriorityBadge, StatusBadge, StatusSummary, type Incident, type PaginationLink } from './components';

type Filters = {
    status: string;
    priority: string;
    search: string;
};

type IncidentPageProps = {
    incidents: {
        data: Incident[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Filters;
    success: string | null;
};

function formatDate(value: string) {
    return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
}

function detailUrl(id: number) {
    const query = window.location.search;
    return `/incidents/${id}${query ? `?return=${encodeURIComponent(`/incidents${query}`)}` : ''}`;
}

function IncidentRow({ incident }: { incident: Incident }) {
    const contact = incident.assigned_to || incident.requester_name;
    const contactLabel = incident.assigned_to ? 'Responsable' : 'Solicitante';

    return (
        <tr className="group bg-white transition hover:bg-slate-50">
            <td className="px-6 py-4">
                <div className="max-w-lg">
                    <Link href={detailUrl(incident.id)} className="font-semibold text-slate-900 decoration-brand-blue underline-offset-4 hover:text-brand-primary hover:underline">
                        {incident.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">INC-{String(incident.id).padStart(4, '0')}</p>
                </div>
            </td>
            <td className="px-6 py-4"><PriorityBadge priority={incident.priority} /></td>
            <td className="px-6 py-4"><StatusBadge status={incident.status} /></td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(incident.created_at)}</td>
            <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-700">{contact || 'Sin asignar'}</p>
                <p className="mt-0.5 text-xs text-slate-500">{contact ? contactLabel : 'Responsable'}</p>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-right">
                <Link href={detailUrl(incident.id)} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-primary hover:text-brand-secondary">
                    Ver detalle <span aria-hidden="true">→</span>
                </Link>
            </td>
        </tr>
    );
}

function IncidentCard({ incident }: { incident: Incident }) {
    const contact = incident.assigned_to || incident.requester_name;
    const contactLabel = incident.assigned_to ? 'Responsable' : 'Solicitante';

    return (
        <article className="rounded-[20px] border border-slate-200 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500">INC-{String(incident.id).padStart(4, '0')}</span>
                <StatusBadge status={incident.status} />
            </div>
            <h3 className="mt-3 font-semibold leading-6 text-slate-900">
                <Link href={detailUrl(incident.id)} className="hover:text-brand-primary">{incident.title}</Link>
            </h3>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <PriorityBadge priority={incident.priority} />
                <time dateTime={incident.created_at} className="text-sm text-slate-500">{formatDate(incident.created_at)}</time>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                    <p className="text-sm font-medium text-slate-700">{contact || 'Sin asignar'}</p>
                    <p className="text-xs text-slate-500">{contact ? contactLabel : 'Responsable'}</p>
                </div>
                <Link href={detailUrl(incident.id)} className="text-sm font-semibold text-brand-primary">Ver detalle <span aria-hidden="true">→</span></Link>
            </div>
        </article>
    );
}

export default function Index({ incidents, filters: serverFilters, success }: IncidentPageProps) {
    const [filters, setFilters] = useState(serverFilters);
    const [search, setSearch] = useState(serverFilters.search);
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hasIncidents = incidents.data.length > 0;
    const hasActiveFilters = Boolean(filters.status || filters.priority || filters.search || search.trim());

    useEffect(() => {
        setFilters(serverFilters);
        setSearch(serverFilters.search);
    }, [serverFilters.status, serverFilters.priority, serverFilters.search]);

    function applyFilters(nextFilters: Filters) {
        if (searchTimer.current) clearTimeout(searchTimer.current);
        const params = Object.fromEntries(Object.entries(nextFilters).filter(([, value]) => value !== ''));
        setFilters(nextFilters);
        router.get('/incidents', params, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            only: ['incidents', 'filters', 'success'],
        });
    }

    useEffect(() => {
        if (search.trim() === filters.search) return;
        searchTimer.current = setTimeout(() => {
            applyFilters({ ...filters, search: search.trim() });
        }, 450);
        return () => {
            if (searchTimer.current) clearTimeout(searchTimer.current);
        };
    }, [search]);

    function clearFilters() {
        setSearch('');
        applyFilters({ status: '', priority: '', search: '' });
    }

    return (
        <main className="min-h-screen bg-white text-slate-900">
            <header className="bg-gradient-to-b from-white via-white/95 to-transparent pt-2 pb-3 md:sticky md:top-0 md:z-30">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex min-h-[67px] items-center rounded-full bg-[#f6f6f6] px-5 py-2.5 sm:px-[35px]">
                        <Link href="/incidents" aria-label="Ir al listado de incidencias" className="inline-flex rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary">
                            <img src="/images/optima-retail-logo.svg" alt="" className="h-auto w-[250px] max-w-full shrink-0" />
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-brand-primary">Centro de operaciones</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Incidencias</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Consulta el estado y la prioridad de las incidencias registradas.</p>
                    </div>
                    {incidents.total > 0 && (
                        <p className="text-sm text-slate-500">
                            Mostrando <span className="font-semibold text-slate-700">{incidents.from}–{incidents.to}</span> de <span className="font-semibold text-slate-700">{incidents.total}</span>
                        </p>
                    )}
                </section>

                <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-500">Recuento por estado de la página visible</p>
                    <StatusSummary incidents={incidents.data} />
                </div>

                <FiltersPanel
                    filters={filters}
                    search={search}
                    onSearchChange={setSearch}
                    onFilterChange={(nextFilters) => applyFilters({ ...nextFilters, search: search.trim() })}
                    onClear={clearFilters}
                />

                {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{success}</p>}

                <section aria-labelledby="incident-list-title" className="brand-surface overflow-hidden">
                    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 id="incident-list-title" className="font-semibold text-slate-900">Listado de incidencias</h2>
                            <p className="mt-1 text-sm text-slate-500">Prioridad, estado y persona de contacto</p>
                        </div>
                        {hasIncidents && <span className="text-xs font-medium text-slate-500">Actualizado con los registros disponibles</span>}
                    </div>

                    {!hasIncidents ? <EmptyState filtered={hasActiveFilters} /> : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[850px] text-left">
                                    <thead className="bg-white/70 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Incidencia</th>
                                            <th scope="col" className="px-6 py-3">Prioridad</th>
                                            <th scope="col" className="px-6 py-3">Estado</th>
                                            <th scope="col" className="px-6 py-3">Fecha</th>
                                            <th scope="col" className="px-6 py-3">Contacto</th>
                                            <th scope="col" className="px-6 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {incidents.data.map((incident) => <IncidentRow key={incident.id} incident={incident} />)}
                                    </tbody>
                                </table>
                            </div>
                            <div className="space-y-3 p-4 md:hidden">
                                {incidents.data.map((incident) => <IncidentCard key={incident.id} incident={incident} />)}
                            </div>
                            <Pagination links={incidents.links} />
                        </>
                    )}
                </section>

                <CreateIncidentForm />

            </div>
            <footer className="mt-7 w-full bg-gradient-to-r from-brand-secondary to-brand-primary px-3 py-3 text-center text-xs text-white">
                Panel operativo · Entorno de demostración
            </footer>
        </main>
    );
}
