import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../routes/users/entities/user.entity';
import { Profile } from '../routes/profiles/entities/profile.entity';
import { CareType } from '../routes/care-types/entities/care-type.entity';
import { careTypesFixture } from './data/care-types.fixture';
import { usersFixture } from './data/users.fixture';

@Injectable()
export class FixturesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(FixturesService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(CareType)
    private readonly careTypeRepo: Repository<CareType>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    this.logger.log('Chargement des fixtures...');

    // --- CareTypes ---
    const careTypeMap = new Map<string, CareType>();

    for (const ct of careTypesFixture) {
      let existing = await this.careTypeRepo.findOne({ where: { label: ct.label } });
      if (!existing) {
        existing = this.careTypeRepo.create(ct);
        existing = await this.careTypeRepo.save(existing);
        this.logger.log(`+ CareType créé : ${ct.label}`);
      }
      careTypeMap.set(ct.label, existing);
    }

    // --- Users (kinés) + Profiles ---
    for (const fixture of usersFixture) {
      let user = await this.userRepo.findOne({
        where: { googleId: fixture.user.googleId },
        relations: ['careTypes'],
      });

      if (!user) {
        user = this.userRepo.create(fixture.user);
        user = await this.userRepo.save(user);

        const profile = this.profileRepo.create({
          ...fixture.profile,
          userId: user.id,
        });
        await this.profileRepo.save(profile);

        this.logger.log(
          `+ Kiné créé : ${fixture.profile.firstName} ${fixture.profile.lastName} (${fixture.user.email})`,
        );
      }

      // Associer les CareTypes
      const careTypes = fixture.careTypeLabels
        .map((label) => careTypeMap.get(label))
        .filter((ct): ct is CareType => ct !== undefined);

      user.careTypes = careTypes;
      await this.userRepo.save(user);
    }

    this.logger.log('Fixtures chargées avec succès !');
  }
}
