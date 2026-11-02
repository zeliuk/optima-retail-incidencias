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

function IncidentRow({ incident }: { incident: Incident }) {
    const contact = incident.assigned_to || incident.requester_name;
    const contactLabel = incident.assigned_to ? 'Responsable' : 'Solicitante';

    return (
        <tr className="group transition hover:bg-slate-50/80">
            <td className="px-6 py-4">
                <div className="max-w-lg">
                    <Link href={`/incidents/${incident.id}`} className="font-semibold text-slate-900 decoration-indigo-400 underline-offset-4 hover:text-indigo-700 hover:underline">
                        {incident.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-400">INC-{String(incident.id).padStart(4, '0')}</p>
                </div>
            </td>
            <td className="px-6 py-4"><PriorityBadge priority={incident.priority} /></td>
            <td className="px-6 py-4"><StatusBadge status={incident.status} /></td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">{formatDate(incident.created_at)}</td>
            <td className="px-6 py-4">
                <p className="text-sm font-medium text-slate-700">{contact || 'Sin asignar'}</p>
                <p className="mt-0.5 text-xs text-slate-400">{contact ? contactLabel : 'Responsable'}</p>
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-right">
                <Link href={`/incidents/${incident.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
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
        <article className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-400">INC-{String(incident.id).padStart(4, '0')}</span>
                <StatusBadge status={incident.status} />
            </div>
            <h3 className="mt-3 font-semibold leading-6 text-slate-900">
                <Link href={`/incidents/${incident.id}`} className="hover:text-indigo-700">{incident.title}</Link>
            </h3>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <PriorityBadge priority={incident.priority} />
                <time dateTime={incident.created_at} className="text-sm text-slate-500">{formatDate(incident.created_at)}</time>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <div>
                    <p className="text-sm font-medium text-slate-700">{contact || 'Sin asignar'}</p>
                    <p className="text-xs text-slate-400">{contact ? contactLabel : 'Responsable'}</p>
                </div>
                <Link href={`/incidents/${incident.id}`} className="text-sm font-semibold text-indigo-700">Ver detalle <span aria-hidden="true">→</span></Link>
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
        <main className="min-h-screen bg-slate-50 text-slate-900">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl bg-indigo-700 text-sm font-bold tracking-tight text-white shadow-sm">OR</div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">Optima Retail</p>
                            <h1 className="mt-0.5 text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">Panel operativo de incidencias</h1>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p className="max-w-xs text-sm text-slate-500">Seguimiento y coordinación de incidencias operativas.</p>
                        <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">Carlos Turmo · Demo</span>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-7xl space-y-7 px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                <section className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-indigo-700">Centro de operaciones</p>
                        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">Incidencias</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Consulta el estado y la prioridad de las incidencias registradas.</p>
                    </div>
                    {incidents.total > 0 && (
                        <p className="text-sm text-slate-500">
                            Mostrando <span className="font-semibold text-slate-700">{incidents.from}–{incidents.to}</span> de <span className="font-semibold text-slate-700">{incidents.total}</span>
                        </p>
                    )}
                </section>

                <>
                    <p className="-mb-5 text-xs font-medium text-slate-500">Recuento por estado de la página visible</p>
                    <StatusSummary incidents={incidents.data} />
                </>

                <FiltersPanel
                    filters={filters}
                    search={search}
                    onSearchChange={setSearch}
                    onFilterChange={(nextFilters) => applyFilters({ ...nextFilters, search: search.trim() })}
                    onClear={clearFilters}
                />

                {success && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{success}</p>}

                <section aria-labelledby="incident-list-title" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-1 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div>
                            <h2 id="incident-list-title" className="font-semibold text-slate-900">Listado de incidencias</h2>
                            <p className="mt-1 text-sm text-slate-500">Prioridad, estado y persona de contacto</p>
                        </div>
                        {hasIncidents && <span className="text-xs font-medium text-slate-400">Actualizado con los registros disponibles</span>}
                    </div>

                    {!hasIncidents ? <EmptyState filtered={hasActiveFilters} /> : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[850px] text-left">
                                    <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Incidencia</th>
                                            <th scope="col" className="px-6 py-3">Prioridad</th>
                                            <th scope="col" className="px-6 py-3">Estado</th>
                                            <th scope="col" className="px-6 py-3">Fecha</th>
                                            <th scope="col" className="px-6 py-3">Contacto</th>
                                            <th scope="col" className="px-6 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {incidents.data.map((incident) => <IncidentRow key={incident.id} incident={incident} />)}
                                    </tbody>
                                </table>
                            </div>
                            <div className="divide-y divide-slate-100 md:hidden">
                                {incidents.data.map((incident) => <IncidentCard key={incident.id} incident={incident} />)}
                            </div>
                            <Pagination links={incidents.links} />
                        </>
                    )}
                </section>

                <CreateIncidentForm />

                <footer className="pb-2 text-center text-xs text-slate-400">Panel operativo · Entorno de demostración</footer>
            </div>
        </main>
    );
}
