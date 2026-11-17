import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);

  carga = true;
  error = '';
  resumen: any = null;
  citasHoy: any[] = [];

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.carga = true;
    this.error = '';
    const hoy = new Date().toISOString().slice(0, 10);

    this.api.getResumen().subscribe({
      next: (r) => {
        this.resumen = r.resumen;
        this.api.getCitas({ fecha: hoy }).subscribe({
          next: (c) => {
            this.citasHoy = c.citas || [];
            this.carga = false;
          },
          error: (e) => this.fallo(e)
        });
      },
      error: (e) => this.fallo(e)
    });
  }

  private fallo(e: any): void {
    this.carga = false;
    this.error = e?.error?.message || 'No se pudo conectar con la API. Verifique que el servidor esté en el puerto 3900.';
  }
}
