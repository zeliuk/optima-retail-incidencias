type Filters = {
    status: string;
    priority: string;
    search: string;
};

type FiltersPanelProps = {
    filters: Filters;
    search: string;
    onSearchChange: (value: string) => void;
    onFilterChange: (filters: Filters) => void;
    onClear: () => void;
};

const fieldClassName = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';

export default function FiltersPanel({ filters, search, onSearchChange, onFilterChange, onClear }: FiltersPanelProps) {
    const hasFilters = Boolean(filters.status || filters.priority || search);

    return (
        <section aria-labelledby="filters-title" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <div>
                    <h2 id="filters-title" className="font-semibold text-slate-900">Buscar incidencias</h2>
                    <p className="mt-1 text-sm text-slate-500">Combina estado, prioridad y texto libre.</p>
                </div>
                {hasFilters && <button type="button" onClick={onClear} className="mt-1 self-start rounded-lg py-1 text-sm font-semibold text-indigo-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-0 sm:self-auto">Limpiar filtros</button>}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.5fr]">
                <label className="text-sm font-medium text-slate-700">
                    Estado
                    <select value={filters.status} onChange={(event) => onFilterChange({ ...filters, status: event.target.value })} className={fieldClassName}>
                        <option value="">Todos los estados</option>
                        <option value="abierta">Abierta</option>
                        <option value="en_revision">En revisión</option>
                        <option value="bloqueada">Bloqueada</option>
                        <option value="resuelta">Resuelta</option>
                    </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Prioridad
                    <select value={filters.priority} onChange={(event) => onFilterChange({ ...filters, priority: event.target.value })} className={fieldClassName}>
                        <option value="">Todas las prioridades</option>
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="critica">Crítica</option>
                    </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                    Buscar
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }}
                        placeholder="Título o descripción"
                        maxLength={180}
                        className={fieldClassName}
                    />
                </label>
            </div>
        </section>
    );
}
