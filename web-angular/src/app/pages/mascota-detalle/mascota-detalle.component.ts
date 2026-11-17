import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mascota-detalle',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './mascota-detalle.component.html',
  styleUrl: './mascota-detalle.component.css'
})
export class MascotaDetalleComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  mascota: any = null;
  historial: any[] = [];
  carga = true;
  error = '';
  ok = '';
  subiendo = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cargar(id);
  }

  urlImg(): string | null {
    return this.api.urlImagen(this.mascota?.imagen);
  }

  cargar(id: string): void {
    this.carga = true;
    this.api.getMascota(id).subscribe({
      next: (r) => {
        this.mascota = r.mascota;
        this.historial = r.historial || [];
        this.carga = false;
      },
      error: (e) => {
        this.carga = false;
        this.error = e?.error?.message || 'No se encontró la mascota';
      }
    });
  }

  onFile(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.mascota) return;

    this.subiendo = true;
    this.error = '';
    this.ok = '';
    this.api.uploadImagen(this.mascota._id, file).subscribe({
      next: (r) => {
        this.mascota = r.mascota;
        this.subiendo = false;
        this.ok = 'Imagen actualizada';
        input.value = '';
      },
      error: (e) => {
        this.subiendo = false;
        this.error = e?.error?.message || 'Error al subir la imagen';
        input.value = '';
      }
    });
  }
}
