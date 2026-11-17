import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-duenos',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './duenos.component.html',
  styleUrl: './duenos.component.css'
})
export class DuenosComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  duenos: any[] = [];
  carga = true;
  enviando = false;
  error = '';
  ok = '';
  buscar = '';
  editandoId: string | null = null;

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
    documento: ['', [Validators.required]],
    telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,10}$/)]],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['']
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.carga = true;
    this.error = '';
    const params: Record<string, string> = {};
    if (this.buscar.trim()) params['buscar'] = this.buscar.trim();

    this.api.getDuenos(params).subscribe({
      next: (r) => {
        this.duenos = r.duenos || [];
        this.carga = false;
      },
      error: (e) => {
        this.carga = false;
        this.error = e?.error?.message || 'Error al listar dueños';
      }
    });
  }

  editar(d: any): void {
    this.editandoId = d._id;
    this.form.patchValue(d);
    this.ok = '';
    this.error = '';
  }

  cancelar(): void {
    this.editandoId = null;
    this.form.reset();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando = true;
    this.error = '';
    this.ok = '';
    const body = this.form.getRawValue();
    const pet = this.editandoId
      ? this.api.updateDueno(this.editandoId, body)
      : this.api.saveDueno(body);

    pet.subscribe({
      next: () => {
        this.enviando = false;
        this.ok = this.editandoId ? 'Dueño actualizado' : 'Dueño registrado';
        this.cancelar();
        this.cargar();
      },
      error: (e) => {
        this.enviando = false;
        this.error = this.msg(e);
      }
    });
  }

  eliminar(d: any): void {
    if (!confirm(`¿Eliminar a ${d.nombre}?`)) return;
    this.api.deleteDueno(d._id).subscribe({
      next: () => {
        this.ok = 'Dueño eliminado';
        this.cargar();
      },
      error: (e) => this.error = this.msg(e)
    });
  }

  desactivar(d: any): void {
    this.api.desactivarDueno(d._id).subscribe({
      next: () => {
        this.ok = 'Dueño desactivado';
        this.cargar();
      },
      error: (e) => this.error = this.msg(e)
    });
  }

  private msg(e: any): string {
    if (e?.error?.errores?.length) return e.error.errores.join('. ');
    return e?.error?.message || 'Operación fallida';
  }
}
