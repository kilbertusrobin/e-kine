import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  AppointmentResponseDto,
  AvailableSlotsResponseDto,
} from './dtos';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUser } from '../auth/decorators';
import { User } from '../users/entities/user.entity';

/**
 * Controller de gestion des rendez-vous
 */
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * GET /appointments/available-slots
   * Récupère les créneaux disponibles pour un praticien à une date donnée
   * Route publique (pour permettre la consultation avant connexion)
   */
  @Get('available-slots')
  async getAvailableSlots(
    @Query('practitionerId') practitionerId: string,
    @Query('date') date: string,
  ): Promise<AvailableSlotsResponseDto> {
    return this.appointmentsService.getAvailableSlots(practitionerId, date);
  }

  /**
   * GET /appointments/me
   * Récupère les rendez-vous de l'utilisateur authentifié
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyAppointments(
    @CurrentUser() user: User,
  ): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsService.findByUser(
      user.id,
      user.role,
    );
    return AppointmentResponseDto.fromEntities(appointments);
  }

  /**
   * GET /appointments
   * Récupère tous les rendez-vous (avec filtres optionnels)
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('practitionerId') practitionerId?: string,
    @Query('patientId') patientId?: string,
    @Query('status') status?: AppointmentStatus,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsService.findAll({
      practitionerId,
      patientId,
      status,
      fromDate,
      toDate,
    });
    return AppointmentResponseDto.fromEntities(appointments);
  }

  /**
   * GET /appointments/:id
   * Récupère un rendez-vous par son ID
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.findById(id);
    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }
    return AppointmentResponseDto.fromEntity(appointment);
  }

  /**
   * POST /appointments
   * Crée un nouveau rendez-vous
   * Le patient est automatiquement l'utilisateur authentifié
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser() user: User,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.create(
      createAppointmentDto,
      user.id,
    );
    // Recharger avec les relations
    const fullAppointment = await this.appointmentsService.findById(
      appointment.id,
    );
    return AppointmentResponseDto.fromEntity(fullAppointment!);
  }

  /**
   * PUT /appointments/:id
   * Met à jour un rendez-vous
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.update(
      id,
      updateAppointmentDto,
      user.id,
    );
    // Recharger avec les relations
    const fullAppointment = await this.appointmentsService.findById(
      appointment.id,
    );
    return AppointmentResponseDto.fromEntity(fullAppointment!);
  }

  /**
   * DELETE /appointments/:id
   * Annule un rendez-vous
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.cancel(id, user.id);
    return AppointmentResponseDto.fromEntity(appointment);
  }
}
