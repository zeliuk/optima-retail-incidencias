type Incident = {
    id: number;
    title: string;
    status: string;
    priority: string;
};

type IncidentPageProps = {
    incidents: {
        data: Incident[];
    };
};

export default function Index({ incidents }: IncidentPageProps) {
    return (
        <main>
            <h1>Incidencias</h1>
            <ul>
                {incidents.data.map((incident) => (
                    <li key={incident.id}>
                        {incident.title} · {incident.status} · {incident.priority}
                    </li>
                ))}
            </ul>
        </main>
    );
}
