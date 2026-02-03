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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
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

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get('available-slots')
  @ApiOperation({
    summary: 'Créneaux disponibles',
    description:
      'Récupère les créneaux disponibles pour un praticien à une date donnée',
  })
  @ApiQuery({ name: 'practitionerId', description: 'UUID du praticien' })
  @ApiQuery({ name: 'date', description: 'Date au format YYYY-MM-DD' })
  @ApiResponse({ status: 200, description: 'Liste des créneaux' })
  async getAvailableSlots(
    @Query('practitionerId') practitionerId: string,
    @Query('date') date: string,
  ): Promise<AvailableSlotsResponseDto> {
    return this.appointmentsService.getAvailableSlots(practitionerId, date);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Mes rendez-vous',
    description: "Récupère les rendez-vous de l'utilisateur connecté",
  })
  @ApiResponse({ status: 200, description: 'Liste des rendez-vous' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getMyAppointments(
    @CurrentUser() user: User,
  ): Promise<AppointmentResponseDto[]> {
    const appointments = await this.appointmentsService.findByUser(
      user.id,
      user.role,
    );
    return AppointmentResponseDto.fromEntities(appointments);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liste des rendez-vous',
    description: 'Récupère tous les rendez-vous avec filtres optionnels',
  })
  @ApiQuery({
    name: 'practitionerId',
    required: false,
    description: 'Filtrer par praticien',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filtrer par patient',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: AppointmentStatus,
    description: 'Filtrer par statut',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    description: 'Date de début (ISO 8601)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    description: 'Date de fin (ISO 8601)',
  })
  @ApiResponse({ status: 200, description: 'Liste des rendez-vous' })
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

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Détail d'un rendez-vous" })
  @ApiParam({ name: 'id', description: 'UUID du rendez-vous' })
  @ApiResponse({ status: 200, description: 'Rendez-vous trouvé' })
  @ApiResponse({ status: 404, description: 'Rendez-vous non trouvé' })
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.findById(id);
    if (!appointment) {
      throw new Error('Rendez-vous non trouvé');
    }
    return AppointmentResponseDto.fromEntity(appointment);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer un rendez-vous',
    description: "Le patient est automatiquement l'utilisateur connecté",
  })
  @ApiResponse({ status: 201, description: 'Rendez-vous créé' })
  @ApiResponse({ status: 400, description: 'Créneau invalide' })
  @ApiResponse({ status: 409, description: 'Créneau déjà réservé' })
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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier un rendez-vous' })
  @ApiParam({ name: 'id', description: 'UUID du rendez-vous' })
  @ApiResponse({ status: 200, description: 'Rendez-vous modifié' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Rendez-vous non trouvé' })
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Annuler un rendez-vous' })
  @ApiParam({ name: 'id', description: 'UUID du rendez-vous' })
  @ApiResponse({ status: 200, description: 'Rendez-vous annulé' })
  @ApiResponse({ status: 400, description: 'Rendez-vous non annulable' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<AppointmentResponseDto> {
    const appointment = await this.appointmentsService.cancel(id, user.id);
    return AppointmentResponseDto.fromEntity(appointment);
  }
}
