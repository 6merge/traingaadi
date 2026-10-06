import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Train } from '../../core/models/railway.models';
import { TrainService } from '../../core/services/train.service';

@Component({
  selector: 'app-train-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="page-header">
      <div>
        <p class="eyebrow">Train details</p>
        <h1>{{ train?.name ?? 'Train' }}</h1>
      </div>
    </section>

    <div class="loading" *ngIf="isLoading">Loading train details...</div>
    <div class="error-box" *ngIf="errorMessage">{{ errorMessage }}</div>

    <article class="detail-card" *ngIf="train && !isLoading">
      <div class="meta-row">
        <span><strong>Train number:</strong> {{ train.trainNumber }}</span>
        <span><strong>Train ID:</strong> {{ train.id }}</span>
      </div>
      <div class="meta-row">
        <span><strong>From station:</strong> {{ fromStationId }}</span>
        <span><strong>To station:</strong> {{ toStationId }}</span>
      </div>

      <div class="actions">
        <a [routerLink]="['/booking']" [queryParams]="{ trainId: train.id, fromStationId, toStationId, coachType: 'General', quota: 'General' }">Book this train</a>
      </div>
    </article>
  `,
  styles: [
    `
      :host { display: block; }
      .page-header { margin: 1rem 0 1.2rem; }
      .eyebrow { margin: 0; font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: #0f766e; font-weight: 700; }
      h1 { margin: 0.4rem 0 0; }
      .loading, .error-box, .detail-card { background: white; border: 1px solid #e2e8f0; border-radius: 18px; padding: 1.2rem; }
      .error-box { color: #b91c1c; background: #fef2f2; border-color: #fecaca; }
      .meta-row { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.8rem; color: #334155; }
      .actions { margin-top: 1rem; }
      .actions a { display: inline-block; text-decoration: none; background: #0f172a; color: white; padding: 0.75rem 1rem; border-radius: 12px; font-weight: 700; }
    `,
  ],
})
export class TrainDetailsComponent implements OnInit {
  train: Train | null = null;
  fromStationId = 0;
  toStationId = 0;
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly trainService: TrainService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const trainId = Number(params.get('trainId') ?? 0);
      this.route.queryParamMap.subscribe((query) => {
        this.fromStationId = Number(query.get('fromStationId') ?? 0);
        this.toStationId = Number(query.get('toStationId') ?? 0);

        if (trainId) {
          this.loadTrain(trainId);
        }
      });
    });
  }

  private loadTrain(trainId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.trainService.getTrain(trainId).subscribe({
      next: (train) => {
        this.train = train;
        this.isLoading = false;
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
      },
    });
  }
}
