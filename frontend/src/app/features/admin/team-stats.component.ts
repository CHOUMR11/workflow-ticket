import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '../../core/services/stats.service';
import { AdminOverview, WorkloadEntry } from '../../core/models/stats.model';

@Component({
  selector: 'app-team-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './team-stats.component.html',
  styleUrls: ['./team-stats.component.css']
})
export class TeamStatsComponent implements OnInit {
  overview?: AdminOverview;
  workload: WorkloadEntry[] = [];
  loading = true;

  constructor(private statsService: StatsService) {}

  ngOnInit(): void {
    this.statsService.getOverview().subscribe((o) => (this.overview = o));
    this.statsService.getWorkload().subscribe((w) => {
      this.workload = w;
      this.loading = false;
    });
  }

  maxLoad(): number {
    return Math.max(1, ...this.workload.map((w) => w.openCount));
  }

  statusCount(list: { _id: string; count: number }[] | undefined, status: string): number {
    return list?.find((s) => s._id === status)?.count || 0;
  }
}
