import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DuenosComponent } from './pages/duenos/duenos.component';
import { MascotasComponent } from './pages/mascotas/mascotas.component';
import { MascotaDetalleComponent } from './pages/mascota-detalle/mascota-detalle.component';
import { CitasComponent } from './pages/citas/citas.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'duenos', component: DuenosComponent },
  { path: 'mascotas', component: MascotasComponent },
  { path: 'mascotas/:id', component: MascotaDetalleComponent },
  { path: 'citas', component: CitasComponent },
  { path: '**', redirectTo: '' }
];
