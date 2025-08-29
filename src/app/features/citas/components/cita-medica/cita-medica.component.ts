import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cita } from '../../models/cita.models';
import { CitaService } from '../../services/cita.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-cita-medica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-medica.component.html'
})
export class CitaMedicaComponent implements OnInit {
  citas: Cita[] = [];
  totalPages = 0;
  currentPage = 0;
  size = 6;
  loading = false;

  // 👇 Nueva variable para manejar la vista
  viewMode: 'table' | 'cards' = 'table';

/*  filtros = {
    paciente: '',
    fecha: ''
  };*/
  constructor(private citaService: CitaService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas(page: number = 0): void {
    this.loading = true;
    this.citaService.getCitas(page, this.size).subscribe({
      next: (res) => {
        this.citas = res.content;
        this.totalPages = res.totalPages;
        this.currentPage = res.number;
        this.loading = false;
        this.cdr.detectChanges(); // 👈 Necesario en zoneless
      },
      error: (err) => {
        console.error('Error cargando citas', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.loadCitas(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.loadCitas(this.currentPage + 1);
    }
  }

  // 👇 Método para cambiar de vista
  toggleView(): void {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  // 🔍 Aplicar filtros
 /* applyFilters(): void {
    // Si el usuario borra el texto → se muestran todas las citas
    if (!this.filtros.paciente && !this.filtros.fecha) {
      this.resetFilters();
      return;
    }
    this.currentPage = 0;
    this.loadCitas(0);
  }*/

/*  resetFilters(): void {
    this.filtros = { paciente: '', fecha: '' };
    this.loadCitas(0);
  }*/
}
