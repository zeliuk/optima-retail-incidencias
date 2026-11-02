import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type IncidentForm = {
    title: string;
    description: string;
    priority: string;
    requester_name: string;
    assigned_to: string;
};

const initialValues: IncidentForm = {
    title: '',
    description: '',
    priority: 'media',
    requester_name: '',
    assigned_to: '',
};

const inputClassName = 'mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';
const textareaClassName = 'mt-1.5 min-h-28 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15';

export default function CreateIncidentForm() {
    const form = useForm<IncidentForm>(initialValues);

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.post('/incidents', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    }

    function fieldError(name: keyof IncidentForm) {
        return form.errors[name] ? <p id={`${name}-error`} role="alert" className="mt-1.5 text-sm font-medium text-rose-700">{form.errors[name]}</p> : null;
    }

    return (
        <section aria-labelledby="create-incident-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
                <p className="text-sm font-semibold text-indigo-700">Nueva incidencia</p>
                <h2 id="create-incident-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-900">Registrar una incidencia</h2>
                <p className="mt-1 text-sm text-slate-500">Completa los datos para añadirla al panel.</p>
            </div>

            <form onSubmit={submit} noValidate className="mt-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <label htmlFor="title" className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Título <span aria-hidden="true" className="text-rose-600">*</span>
                        <input id="title" name="title" required maxLength={180} value={form.data.title} onChange={(event) => form.setData('title', event.target.value)} aria-invalid={Boolean(form.errors.title)} aria-describedby={form.errors.title ? 'title-error' : undefined} className={inputClassName} placeholder="Describe el problema brevemente" />
                        {fieldError('title')}
                    </label>
                    <label htmlFor="description" className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Descripción <span aria-hidden="true" className="text-rose-600">*</span>
                        <textarea id="description" name="description" required value={form.data.description} onChange={(event) => form.setData('description', event.target.value)} aria-invalid={Boolean(form.errors.description)} aria-describedby={form.errors.description ? 'description-error' : undefined} className={textareaClassName} placeholder="Añade detalles útiles para el seguimiento" />
                        {fieldError('description')}
                    </label>
                    <label htmlFor="priority" className="text-sm font-medium text-slate-700">
                        Prioridad <span aria-hidden="true" className="text-rose-600">*</span>
                        <select id="priority" name="priority" required value={form.data.priority} onChange={(event) => form.setData('priority', event.target.value)} aria-invalid={Boolean(form.errors.priority)} aria-describedby={form.errors.priority ? 'priority-error' : undefined} className={inputClassName}>
                            <option value="baja">Baja</option>
                            <option value="media">Media</option>
                            <option value="alta">Alta</option>
                            <option value="critica">Crítica</option>
                        </select>
                        {fieldError('priority')}
                    </label>
                    <label htmlFor="requester_name" className="text-sm font-medium text-slate-700">
                        Nombre del solicitante <span aria-hidden="true" className="text-rose-600">*</span>
                        <input id="requester_name" name="requester_name" required maxLength={120} value={form.data.requester_name} onChange={(event) => form.setData('requester_name', event.target.value)} aria-invalid={Boolean(form.errors.requester_name)} aria-describedby={form.errors.requester_name ? 'requester_name-error' : undefined} className={inputClassName} placeholder="Persona que comunica la incidencia" />
                        {fieldError('requester_name')}
                    </label>
                    <label htmlFor="assigned_to" className="text-sm font-medium text-slate-700 sm:col-span-2">
                        Responsable <span className="font-normal text-slate-400">(opcional)</span>
                        <input id="assigned_to" name="assigned_to" maxLength={120} value={form.data.assigned_to} onChange={(event) => form.setData('assigned_to', event.target.value)} aria-invalid={Boolean(form.errors.assigned_to)} aria-describedby={form.errors.assigned_to ? 'assigned_to-error' : undefined} className={inputClassName} placeholder="Persona responsable, si se conoce" />
                        {fieldError('assigned_to')}
                    </label>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500"><span className="text-rose-600">*</span> Campos obligatorios. El estado inicial se asigna automáticamente.</p>
                    <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
                        {form.processing ? 'Guardando…' : 'Crear incidencia'}
                    </button>
                </div>
                {form.errors && Object.keys(form.errors).length > 0 && <p role="alert" className="text-sm text-rose-700">Revisa los campos marcados antes de continuar.</p>}
            </form>
        </section>
    );
}
