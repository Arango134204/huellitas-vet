import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './citas.component.html',
  styleUrl: './citas.component.css'
})
export class CitasComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  citas: any[] = [];
  mascotas: any[] = [];
  carga = true;
  enviando = false;
  cambiandoEstadoId: string | null = null;
  error = '';
  ok = '';
  filtroEstado = '';
  filtroFecha = '';
  editandoId: string | null = null;

  form = this.fb.group({
    mascota: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['10:00', Validators.required],
    motivo: ['', [Validators.required, Validators.maxLength(200)]],
    veterinario: ['Dra. Salazar', Validators.required],
    observaciones: ['']
  });

  ngOnInit(): void {
    this.api.getMascotas().subscribe({
      next: (r) => this.mascotas = r.mascotas || [],
      error: (e) => {
        this.error = e?.error?.message || 'No se pudieron cargar las mascotas disponibles. Verifique que la API esté activa.';
      }
    });
    this.cargar();
  }

  cargar(): void {
    this.carga = true;
    this.error = '';
    const params: Record<string, string> = {};
    if (this.filtroEstado) params['estado'] = this.filtroEstado;
    if (this.filtroFecha) params['fecha'] = this.filtroFecha;

    this.api.getCitas(params).subscribe({
      next: (r) => {
        this.citas = r.citas || [];
        this.carga = false;
      },
      error: (e) => {
        this.carga = false;
        this.error = e?.error?.message || 'Error al listar citas. Verifique la conexión con la API.';
      }
    });
  }

  editar(c: any): void {
    if (c.estado !== 'pendiente') return;
    this.editandoId = c._id;
    this.error = '';
    this.ok = '';
    const d = new Date(c.fecha);
    const fecha = d.toISOString().slice(0, 10);
    const hora = d.toTimeString().slice(0, 5);
    this.form.patchValue({
      mascota: c.mascota?._id || c.mascota || '',
      fecha,
      hora,
      motivo: c.motivo,
      veterinario: c.veterinario,
      observaciones: c.observaciones || ''
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.form.patchValue({
      mascota: '',
      fecha: '',
      hora: '10:00',
      motivo: '',
      veterinario: 'Dra. Salazar',
      observaciones: ''
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando = true;
    this.error = '';
    this.ok = '';
    const raw = this.form.getRawValue();
    const body = {
      mascota: raw.mascota,
      fecha: `${raw.fecha}T${raw.hora}:00`,
      motivo: raw.motivo,
      veterinario: raw.veterinario,
      observaciones: raw.observaciones || undefined,
      origen: 'web'
    };

    const req$ = this.editandoId
      ? this.api.updateCita(this.editandoId, body)
      : this.api.saveCita(body);

    req$.subscribe({
      next: () => {
        this.enviando = false;
        this.ok = this.editandoId ? 'Cita actualizada' : 'Cita agendada';
        this.cancelarEdicion();
        this.cargar();
      },
      error: (e) => {
        this.enviando = false;
        this.error = e?.error?.errores?.join('. ') || e?.error?.message || 'No se pudo guardar la cita';
      }
    });
  }

  cambiarEstado(c: any, estado: string): void {
    if (this.cambiandoEstadoId) return;
    const obs = estado === 'atendida'
      ? prompt('Observaciones de la atención (opcional):', c.observaciones || '') ?? undefined
      : undefined;

    this.cambiandoEstadoId = c._id;
    this.error = '';
    this.api.cambiarEstado(c._id, estado, obs || undefined).subscribe({
      next: () => {
        this.cambiandoEstadoId = null;
        this.ok = `Cita marcada como ${estado}`;
        this.cargar();
      },
      error: (e) => {
        this.cambiandoEstadoId = null;
        this.error = e?.error?.message || 'No se pudo cambiar el estado';
      }
    });
  }

  eliminar(c: any): void {
    if (!confirm('¿Eliminar esta cita?')) return;
    this.api.deleteCita(c._id).subscribe({
      next: () => {
        this.ok = 'Cita eliminada';
        this.cargar();
      },
      error: (e) => this.error = e?.error?.message || 'No se pudo eliminar'
    });
  }
}
