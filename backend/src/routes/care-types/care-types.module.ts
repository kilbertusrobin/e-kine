import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CareTypesController } from './care-types.controller';
import { CareTypesService } from './care-types.service';
import { CareType } from './entities/care-type.entity';
import { User } from '../users/entities/user.entity';

/**
 * Module de gestion des types de soins
 */
@Module({
  imports: [TypeOrmModule.forFeature([CareType, User])],
  controllers: [CareTypesController],
  providers: [CareTypesService],
  exports: [CareTypesService],
})
export class CareTypesModule {}
