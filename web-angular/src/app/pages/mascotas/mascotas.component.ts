import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-mascotas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './mascotas.component.html',
  styleUrl: './mascotas.component.css'
})
export class MascotasComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  mascotas: any[] = [];
  duenos: any[] = [];
  carga = true;
  enviando = false;
  error = '';
  ok = '';
  especie = '';
  buscar = '';
  editandoId: string | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    especie: ['perro', Validators.required],
    raza: ['Criollo'],
    peso: [null as number | null],
    fechaNacimiento: [''],
    dueno: ['', Validators.required]
  });

  ngOnInit(): void {
    this.api.getDuenos({ activo: 'true' }).subscribe({
      next: (r) => this.duenos = r.duenos || [],
      error: (e) => {
        this.error = e?.error?.message || 'No se pudieron cargar los dueños. Verifique que la API esté activa.';
      }
    });
    this.cargar();
  }

  urlImg(m: any): string | null {
    return this.api.urlImagen(m.imagen);
  }

  cargar(): void {
    this.carga = true;
    this.error = '';
    const params: Record<string, string> = {};
    if (this.especie) params['especie'] = this.especie;
    if (this.buscar.trim()) params['buscar'] = this.buscar.trim();

    this.api.getMascotas(params).subscribe({
      next: (r) => {
        this.mascotas = r.mascotas || [];
        this.carga = false;
      },
      error: (e) => {
        this.carga = false;
        this.error = e?.error?.message || 'Error al listar mascotas. Verifique la conexión con la API.';
      }
    });
  }

  editar(m: any): void {
    this.editandoId = m._id;
    this.error = '';
    this.ok = '';
    const fecha = m.fechaNacimiento
      ? new Date(m.fechaNacimiento).toISOString().slice(0, 10)
      : '';
    this.form.patchValue({
      nombre: m.nombre,
      especie: m.especie,
      raza: m.raza || 'Criollo',
      peso: m.peso ?? null,
      fechaNacimiento: fecha,
      dueno: m.dueno?._id || m.dueno || ''
    });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.form.reset({ especie: 'perro', raza: 'Criollo', peso: null, fechaNacimiento: '', dueno: '' });
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
    const body: any = {
      nombre: raw.nombre,
      especie: raw.especie,
      raza: raw.raza || 'Criollo',
      dueno: raw.dueno
    };
    if (raw.peso != null && raw.peso !== ('' as any)) body.peso = Number(raw.peso);
    if (raw.fechaNacimiento) body.fechaNacimiento = raw.fechaNacimiento;

    const pet$ = this.editandoId
      ? this.api.updateMascota(this.editandoId, body)
      : this.api.saveMascota(body);

    pet$.subscribe({
      next: () => {
        this.enviando = false;
        this.ok = this.editandoId ? 'Mascota actualizada' : 'Mascota registrada';
        this.cancelarEdicion();
        this.cargar();
      },
      error: (e) => {
        this.enviando = false;
        this.error = e?.error?.errores?.join('. ') || e?.error?.message || 'No se pudo guardar';
      }
    });
  }

  desactivar(m: any): void {
    if (!confirm(`¿Desactivar a ${m.nombre}? Se conserva el historial de citas.`)) return;
    this.api.desactivarMascota(m._id).subscribe({
      next: () => {
        this.ok = 'Mascota desactivada';
        this.cargar();
      },
      error: (e) => this.error = e?.error?.message || 'No se pudo desactivar'
    });
  }

  eliminar(m: any): void {
    if (!confirm(`¿Eliminar a ${m.nombre}? Solo es posible si no tiene historial de citas.`)) return;
    this.api.deleteMascota(m._id).subscribe({
      next: () => {
        this.ok = 'Mascota eliminada';
        this.cargar();
      },
      error: (e) => this.error = e?.error?.message || 'No se pudo eliminar'
    });
  }
}
