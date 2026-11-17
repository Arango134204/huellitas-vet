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
      next: (r) => this.duenos = r.duenos || []
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
        this.error = e?.error?.message || 'Error al listar mascotas';
      }
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
    const body: any = {
      nombre: raw.nombre,
      especie: raw.especie,
      raza: raw.raza || 'Criollo',
      dueno: raw.dueno
    };
    if (raw.peso) body.peso = Number(raw.peso);
    if (raw.fechaNacimiento) body.fechaNacimiento = raw.fechaNacimiento;

    this.api.saveMascota(body).subscribe({
      next: () => {
        this.enviando = false;
        this.ok = 'Mascota registrada';
        this.form.reset({ especie: 'perro', raza: 'Criollo' });
        this.cargar();
      },
      error: (e) => {
        this.enviando = false;
        this.error = e?.error?.errores?.join('. ') || e?.error?.message || 'No se pudo guardar';
      }
    });
  }

  eliminar(m: any): void {
    if (!confirm(`¿Eliminar a ${m.nombre}?`)) return;
    this.api.deleteMascota(m._id).subscribe({
      next: () => {
        this.ok = 'Mascota eliminada';
        this.cargar();
      },
      error: (e) => this.error = e?.error?.message || 'No se pudo eliminar'
    });
  }
}
