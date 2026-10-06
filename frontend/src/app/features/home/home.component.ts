import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { STATION_OPTIONS } from '../../core/models/railway.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <div class="tag">Railway booking portal</div>
        <h1>Travel the smart way.</h1>
        <p class="lead">
          Search trains by station code, compare routes, and book your next journey with the live railway reservation gateway.
        </p>

        <div class="feature-row">
          <span>Live availability</span>
          <span>Secure booking</span>
          <span>Quick PNR status</span>
        </div>
      </div>

      <form class="search-panel" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="panel-topline">
          <div>
            <p class="eyebrow">Plan your trip</p>
            <h2>Search trains</h2>
          </div>
          <span class="panel-badge">Today</span>
        </div>

        <div class="field-grid">
          <label>
            <span>From</span>
            <select formControlName="fromStationCode">
              <option *ngFor="let option of stationOptions" [value]="option.code">{{ option.code }} · {{ option.name }}</option>
            </select>
          </label>

          <label>
            <span>To</span>
            <select formControlName="toStationCode">
              <option *ngFor="let option of stationOptions" [value]="option.code">{{ option.code }} · {{ option.name }}</option>
            </select>
          </label>

          <label class="full-width">
            <span>Journey date</span>
            <input type="date" formControlName="journeyDate" />
          </label>
        </div>

        <button type="submit" [disabled]="form.invalid">Search trains</button>

        <button type="button" class="book-direct" routerLink="/booking">
          Book a train directly
        </button>
      </form>
    </section>

    <section class="info-grid">
      <article class="info-card">
        <h3>Fast booking flow</h3>
        <p>Find trains, check availability, and confirm passengers in a few simple steps.</p>
      </article>
      <article class="info-card">
        <h3>PNR tracking</h3>
        <p>Look up reservation details and current status using the live reservation gateway.</p>
      </article>

    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .hero {
        display: grid;
        grid-template-columns: 1.25fr 0.95fr;
        gap: 2rem;
        align-items: center;
        padding: 2rem 0 1.5rem;
      }

      .hero-copy {
        background: linear-gradient(135deg, rgba(14, 116, 144, 0.06), rgba(59, 130, 246, 0.06));
        border: 1px solid rgba(14, 116, 144, 0.1);
        border-radius: 28px;
        padding: 2rem;
      }

      .tag {
        display: inline-block;
        font-size: 0.76rem;
        letter-spacing: 0.16em;
        color: #0f766e;
        font-weight: 800;
        text-transform: uppercase;
      }

      h1 {
        margin: 0.8rem 0 1rem;
        font-size: clamp(2.6rem, 4vw, 4.2rem);
        line-height: 1.02;
        color: #0f172a;
      }

      .lead {
        max-width: 620px;
        font-size: 1.08rem;
        color: #475569;
      }

      .feature-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.6rem;
        margin-top: 1.2rem;
      }

      .feature-row span {
        background: #e0f2fe;
        color: #0f172a;
        border: 1px solid #bae6fd;
        border-radius: 999px;
        padding: 0.4rem 0.8rem;
        font-weight: 700;
        font-size: 0.8rem;
      }

      .search-panel {
        background: #ffffff;
        border: 1px solid #dbeafe;
        box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
        border-radius: 26px;
        padding: 1.5rem;
      }

      .panel-topline {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .eyebrow {
        margin: 0;
        color: #0f766e;
        font-size: 0.7rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        font-weight: 800;
      }

      h2 {
        margin: 0.35rem 0 0;
      }

      .panel-badge {
        background: #dbeafe;
        color: #1d4ed8;
        border-radius: 999px;
        padding: 0.45rem 0.7rem;
        font-weight: 700;
        font-size: 0.74rem;
      }

      .field-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      label {
        display: block;
        color: #334155;
        font-size: 0.9rem;
        margin-bottom: 0.75rem;
      }

      label span {
        display: block;
        margin-bottom: 0.4rem;
      }

      select,
      input {
        width: 100%;
        padding: 0.9rem 1rem;
        border-radius: 12px;
        border: 1px solid #cbd5e1;
        font: inherit;
        box-sizing: border-box;
        background: white;
      }

      select:focus,
      input:focus {
        outline: 3px solid rgba(14, 116, 144, 0.1);
        border-color: #0f766e;
      }

      button {
        width: 100%;
        margin-top: 0.5rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(90deg, #0f172a, #1e3a8a);
        color: white;
        padding: 0.95rem 1.1rem;
        font-weight: 800;
        cursor: pointer;
      }

      .book-direct {
        background: white;
        color: #0f172a;
        border: 1px solid #cbd5e1;
      }

      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 1.2rem;
        margin-top: 1.7rem;
      }

      .info-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 20px;
        padding: 1.4rem;
        box-shadow: 0 12px 24px rgba(15, 23, 42, 0.04);
      }

      .info-card h3 {
        margin-top: 0;
      }

      @media (max-width: 700px) {
        .hero,
        .field-grid,
        .info-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class HomeComponent {
  readonly stationOptions = STATION_OPTIONS;

  readonly form = new FormGroup({
    fromStationCode: new FormControl('ALP', [Validators.required]),
    toStationCode: new FormControl('BRV', [Validators.required]),
    journeyDate: new FormControl(this.todayString(), [Validators.required]),
  });

  constructor(private readonly router: Router) {}

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fromCode = this.form.getRawValue().fromStationCode;
    const toCode = this.form.getRawValue().toStationCode;
    const journeyDate = this.form.getRawValue().journeyDate ?? this.todayString();

    const fromStation = STATION_OPTIONS.find((item) => item.code === fromCode);
    const toStation = STATION_OPTIONS.find((item) => item.code === toCode);

    if (!fromStation || !toStation || fromStation.id === toStation.id) {
      return;
    }

    this.router.navigate(['/trains/search'], {
      queryParams: {
        fromStationId: fromStation.id,
        toStationId: toStation.id,
        fromStationCode: fromStation.code,
        toStationCode: toStation.code,
        journeyDate,
      },
    });
  }

  private todayString(): string {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localDate = new Date(today.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 10);
  }
}
