<?php

namespace Tests\Unit;

use App\Enums\IncidentStatus;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class IncidentStatusTest extends TestCase
{
    public static function allowedTransitions(): array
    {
        return [
            'abierta a en revisión' => [IncidentStatus::Open, IncidentStatus::InReview],
            'en revisión a bloqueada' => [IncidentStatus::InReview, IncidentStatus::Blocked],
            'en revisión a resuelta' => [IncidentStatus::InReview, IncidentStatus::Resolved],
            'bloqueada a en revisión' => [IncidentStatus::Blocked, IncidentStatus::InReview],
        ];
    }

    #[DataProvider('allowedTransitions')]
    public function test_it_allows_only_agreed_transitions(IncidentStatus $from, IncidentStatus $to): void
    {
        $this->assertTrue($from->canTransitionTo($to));
    }

    public function test_it_rejects_every_other_transition_including_reopening_resolved_incidents(): void
    {
        foreach (IncidentStatus::cases() as $from) {
            foreach (IncidentStatus::cases() as $to) {
                $allowed = in_array([$from, $to], [
                    [IncidentStatus::Open, IncidentStatus::InReview],
                    [IncidentStatus::InReview, IncidentStatus::Blocked],
                    [IncidentStatus::InReview, IncidentStatus::Resolved],
                    [IncidentStatus::Blocked, IncidentStatus::InReview],
                ], true);

                $this->assertSame($allowed, $from->canTransitionTo($to), "Unexpected result for {$from->value} → {$to->value}");
            }
        }
    }
}
