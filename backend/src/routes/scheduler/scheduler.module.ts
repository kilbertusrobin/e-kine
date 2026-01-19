import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { AppointmentsModule } from '../appointments/appointments.module';

/**
 * Module de tâches planifiées (cron jobs)
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    AppointmentsModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
