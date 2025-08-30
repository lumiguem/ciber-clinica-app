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
  editMessage: string | null = null;

  editingCita: any | null = null; // cita que se está editando

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

  cargarPacientes() {
    this.pacienteService.getPacientes(0, 1000).subscribe(resp => {
      this.pacientes = resp.content ?? [];
      console.log('Pacientes cargados:', this.pacientes); // Debug
      this.cdr.detectChanges();
    });
  }

  cargarMedicos() {
    this.medicoService.getMedicos(0, 1000).subscribe(resp => {
      this.medicos = resp.content ?? [];
      console.log('Médicos cargados:', this.medicos); // Debug
      this.cdr.detectChanges();
    });
  }

  loadCitas(page: number = 0): void {
    this.loading = true;
    this.citaService.getCitas(page, this.size).subscribe({
      next: (res) => {
        this.citas = res.content;
        console.log('Citas cargadas:', this.citas); // Debug
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

  prevPage(): void {
    if (this.currentPage > 0) this.loadCitas(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) this.loadCitas(this.currentPage + 1);
  }

  toggleView(): void {
    this.viewMode = this.viewMode === 'table' ? 'cards' : 'table';
  }

  // ========== NUEVA CITA ==========
  abrirFormularioCita() {
    this.cita = { pacienteId: null, medicoId: null, fecha: '', hora: '', motivo: '' };
    this.mostrarFormulario = true;
    this.editingCita = null; // Cerrar edición si está abierta
  }

  cerrarFormularioCita() {
    this.mostrarFormulario = false;
  }

  guardarCita() {
    const nuevaCita = {
      fecha: this.cita.fecha,
      hora: this.cita.hora + ':00',
      motivo: this.cita.motivo,
      estado: 'PENDIENTE',
      paciente: { id: this.cita.pacienteId },
      medico: { id: this.cita.medicoId }
    };

    this.citaService.crearCita(nuevaCita).subscribe({
      next: () => {
        this.successMessage = '¡Cita registrada con éxito! 🎉';
        setTimeout(() => this.successMessage = null, 4000);
        this.cerrarFormularioCita();
        this.loadCitas(this.currentPage);
      },
      error: (err) => {
        console.error('Error al crear cita:', err);
      }
    });
  }

  // ========== EDITAR CITA ==========
  abrirEdicion(cita: any) {
    console.log('Cita a editar:', cita); // Debug

    const horaFormateada = cita.hora ? cita.hora.substring(0, 5) : '';
    const pacienteId = cita.idPaciente;
    const medicoId = cita.idMedico;

    this.editingCita = {
      ...cita,
      idPaciente: pacienteId,
      idMedico: medicoId,
      hora: horaFormateada
    };

    this.mostrarFormulario = false; // Cerrar formulario nuevo si está abierto
  }

  guardarEdicion() {
    if (!this.editingCita) return;

    const citaActualizada = {
      fecha: this.editingCita.fecha,
      hora: this.editingCita.hora + ':00',
      motivo: this.editingCita.motivo,
      estado: this.editingCita.estado,
      paciente: { id: this.editingCita.idPaciente },
      medico: { id: this.editingCita.idMedico }
    };

    this.citaService.actualizarCita(this.editingCita.id, citaActualizada).subscribe({
      next: () => {
        this.editMessage = '✅ Cita actualizada con éxito';
        setTimeout(() => this.editMessage = null, 4000);
        this.editingCita = null;
        this.loadCitas(this.currentPage);
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
