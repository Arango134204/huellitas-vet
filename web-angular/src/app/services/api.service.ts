import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  // Dueños
  getDuenos(params?: Record<string, string>): Observable<any> {
    return this.http.get(`${this.base}/duenos`, { params: this.toParams(params) });
  }

  getDueno(id: string): Observable<any> {
    return this.http.get(`${this.base}/dueno/${id}`);
  }

  saveDueno(body: any): Observable<any> {
    return this.http.post(`${this.base}/dueno/save`, body);
  }

  updateDueno(id: string, body: any): Observable<any> {
    return this.http.put(`${this.base}/dueno/${id}`, body);
  }

  deleteDueno(id: string): Observable<any> {
    return this.http.delete(`${this.base}/dueno/${id}`);
  }

  desactivarDueno(id: string): Observable<any> {
    return this.http.patch(`${this.base}/dueno/${id}/desactivar`, {});
  }

  // Mascotas
  getMascotas(params?: Record<string, string>): Observable<any> {
    return this.http.get(`${this.base}/mascotas`, { params: this.toParams(params) });
  }

  getMascota(id: string): Observable<any> {
    return this.http.get(`${this.base}/mascota/${id}`);
  }

  saveMascota(body: any): Observable<any> {
    return this.http.post(`${this.base}/mascota/save`, body);
  }

  updateMascota(id: string, body: any): Observable<any> {
    return this.http.put(`${this.base}/mascota/${id}`, body);
  }

  deleteMascota(id: string): Observable<any> {
    return this.http.delete(`${this.base}/mascota/${id}`);
  }

  uploadImagen(id: string, file: File): Observable<any> {
    const form = new FormData();
    form.append('imagen', file);
    return this.http.post(`${this.base}/mascota/upload-image/${id}`, form);
  }

  urlImagen(nombre: string | null | undefined): string | null {
    return nombre ? `${environment.uploadsUrl}/${nombre}` : null;
  }

  // Citas
  getCitas(params?: Record<string, string>): Observable<any> {
    return this.http.get(`${this.base}/citas`, { params: this.toParams(params) });
  }

  getCita(id: string): Observable<any> {
    return this.http.get(`${this.base}/cita/${id}`);
  }

  saveCita(body: any): Observable<any> {
    return this.http.post(`${this.base}/cita/save`, body);
  }

  updateCita(id: string, body: any): Observable<any> {
    return this.http.put(`${this.base}/cita/${id}`, body);
  }

  cambiarEstado(id: string, estado: string, observaciones?: string): Observable<any> {
    return this.http.patch(`${this.base}/cita/${id}/estado`, { estado, observaciones });
  }

  deleteCita(id: string): Observable<any> {
    return this.http.delete(`${this.base}/cita/${id}`);
  }

  getResumen(): Observable<any> {
    return this.http.get(`${this.base}/citas/resumen`);
  }

  private toParams(params?: Record<string, string>): HttpParams {
    let p = new HttpParams();
    if (!params) return p;
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') p = p.set(k, v);
    });
    return p;
  }
}
