<?php

namespace App\Enums;

enum IncidentPriority: string
{
    case Low = 'baja';
    case Medium = 'media';
    case High = 'alta';
    case Critical = 'critica';
}
