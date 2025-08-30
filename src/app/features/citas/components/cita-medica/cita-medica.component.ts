import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cita } from '../../models/cita.models';
import { CitaService } from '../../services/cita.service';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { MedicoService } from '../../../medicos/services/medico.service';

@Component({
  selector: 'app-cita-medica',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cita-medica.component.html'
})
export class CitaMedicaComponent implements OnInit {
  mostrarFormulario = false;

  citas: Cita[] = [];
  pacientes: any[] = [];
  medicos: any[] = [];
  totalPages = 0;
  currentPage = 0;
  size = 6;
  loading = false;
  successMessage: string | null = null;

  editingCita: Cita | null = null; // cita que se está editando
  editMessage: string | null = null; // mensaje de éxito al editar



  cita = {
    pacienteId: null,
    medicoId: null,
    fecha: '',
    hora: '',
    motivo: '',
  };

  viewMode: 'table' | 'cards' = 'table';

  constructor(
    private citaService: CitaService,
    private cdr: ChangeDetectorRef,
    private pacienteService: PacienteService,
    private medicoService: MedicoService
  ) {}

  ngOnInit(): void {
    this.loadCitas();
    this.cargarPacientes();
    this.cargarMedicos();
  }

  // 🔹 Obtener todos los pacientes
  cargarPacientes() {
    this.pacienteService.getPacientes(0, 1000).subscribe(resp => {
      // si tu backend devuelve { content: [...], totalPages, number }
      this.pacientes = resp.content ?? [];
      this.cdr.detectChanges();
    });
  }

  // 🔹 Obtener todos los médicos
  cargarMedicos() {
    this.medicoService.getMedicos(0, 1000).subscribe(resp => {
      this.medicos = resp.content ?? [];
      this.cdr.detectChanges();
    });
  }

  loadCitas(page: number = 0): void {
    this.loading = true;
    this.citaService.getCitas(page, this.size).subscribe({
      next: (res) => {
        this.citas = res.content;
        this.totalPages = res.totalPages;
        this.currentPage = res.number;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando citas', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  prevPage(): void { if (this.currentPage > 0) this.loadCitas(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) this.loadCitas(this.currentPage + 1); }
  toggleView(): void { this.viewMode = this.viewMode === 'table' ? 'cards' : 'table'; }

  abrirFormularioCita() {
    // reset del formulario
    this.cita = { pacienteId: null, medicoId: null, fecha: '', hora: '', motivo: '' };
    this.mostrarFormulario = true;
  }

  cerrarFormularioCita() { this.mostrarFormulario = false; }

  guardarCita() {
    // Construir JSON que espera el backend
    const nuevaCita = {
      fecha: this.cita.fecha,
      hora: this.cita.hora + ':00', // si tu backend espera formato HH:mm:ss
      motivo: this.cita.motivo,
      estado: 'PENDIENTE',
      paciente: { id: this.cita.pacienteId },
      medico: { id: this.cita.medicoId }
    };

    console.log('JSON a enviar:', nuevaCita); // 🔹 Ver en consola

    this.citaService.crearCita(nuevaCita).subscribe({
      next: () => {
        this.successMessage = '¡Cita registrada con éxito! 🎉';

        // Ocultar mensaje después de 4 segundos
        setTimeout(() => this.successMessage = null, 4000);

        this.cerrarFormularioCita();
        this.loadCitas(this.currentPage); // recargar tabla
      },
      error: (err) => {
        console.error('Error al crear cita:', err);
      }
    });
  }

  abrirEdicion(cita: Cita) {
    this.editingCita = { ...cita }; // clonar datos para editar
  }

  guardarEdicion() {
    if (!this.editingCita) return;

    const citaActualizada = {
      fecha: this.editingCita.fecha,       // formato: YYYY-MM-DD
      hora: this.editingCita.hora + ':00', // formato: HH:mm:ss
      paciente: { id: this.editingCita.idPaciente },
      medico: { id: this.editingCita.idMedico },
      motivo: this.editingCita.motivo,
      estado: this.editingCita.estado
    };

    console.log('JSON enviado para actualizar:', citaActualizada);

    this.citaService.actualizarCita(this.editingCita.id, citaActualizada).subscribe({
      next: () => {
        this.editMessage = '✅ Cita actualizada con éxito';
        setTimeout(() => this.editMessage = null, 4000);
        this.editingCita = null;
        this.loadCitas(this.currentPage); // recargar tabla
      },
      error: (err) => {
        console.error('❌ Error al actualizar cita:', err);
      }
    });
  }


  cancelarEdicion() {
    this.editingCita = null;
  }

}
