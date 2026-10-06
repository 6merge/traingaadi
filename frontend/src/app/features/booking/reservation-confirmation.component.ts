import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reservation-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="confirmation-card" *ngIf="pnrNumber; else emptyState">
      <p class="eyebrow">Reservation confirmed</p>
      <h1>Booking successful</h1>
      <p>Your PNR number is:</p>
      <div class="pnr">{{ pnrNumber }}</div>
    </section>

    <ng-template #emptyState>
      <section class="confirmation-card">
        <p class="eyebrow">Reservation status</p>
        <h1>No booking reference found.</h1>
      </section>
    </ng-template>
  `,
  styles: [
    `
      :host { display: block; }
      .confirmation-card { max-width: 620px; margin: 3rem auto; background: white; border: 1px solid #e2e8f0; border-radius: 24px; padding: 2rem; text-align: center; }
      .eyebrow { margin: 0; color: #0f766e; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 700; }
      h1 { margin: 0.7rem 0 0.8rem; }
      .pnr { margin-top: 1rem; display: inline-block; background: #ecfeff; border: 1px solid #a5f3fc; border-radius: 12px; padding: 0.9rem 1.2rem; font-size: 1.5rem; font-weight: 800; letter-spacing: 0.12em; }
    `,
  ],
})
export class ReservationConfirmationComponent implements OnInit {
  pnrNumber = '';

  constructor(private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.pnrNumber = params.get('pnr') ?? '';
    });
  }
}
