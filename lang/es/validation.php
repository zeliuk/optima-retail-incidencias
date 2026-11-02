<?php

return [
    'required' => 'El campo :attribute es obligatorio.',
    'string' => 'El campo :attribute debe ser una cadena de texto.',
    'max' => [
        'string' => 'El campo :attribute no debe superar los :max caracteres.',
    ],
    'integer' => 'El campo :attribute debe ser un número entero.',
    'exists' => 'El :attribute seleccionado no es válido.',
    'enum' => 'El :attribute seleccionado no es válido.',
    'attributes' => [
        'title' => 'título',
        'description' => 'descripción',
        'priority' => 'prioridad',
        'requester_name' => 'nombre del solicitante',
        'assigned_to' => 'responsable',
        'incident_id' => 'incidencia',
        'body' => 'comentario',
        'status' => 'estado',
        'search' => 'búsqueda',
    ],
];
