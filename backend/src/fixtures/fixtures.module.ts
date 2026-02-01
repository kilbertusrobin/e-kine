import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../routes/users/entities/user.entity';
import { Profile } from '../routes/profiles/entities/profile.entity';
import { CareType } from '../routes/care-types/entities/care-type.entity';
import { FixturesService } from './fixtures.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, CareType])],
  providers: [FixturesService],
})
export class FixturesModule {}
