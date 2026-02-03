import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../routes/users/entities/user.entity';
import { Profile } from '../routes/profiles/entities/profile.entity';
import { CareType } from '../routes/care-types/entities/care-type.entity';
import { Session } from '../routes/sessions/entities/session.entity';
import { Prescription } from '../routes/prescriptions/entities/prescription.entity';
import { Appointment } from '../routes/appointments/entities/appointment.entity';
import { careTypesFixture } from './data/care-types.fixture';
import { usersFixture } from './data/users.fixture';

config(); // Charger les variables d'environnement

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USER || 'kine_user',
  password: process.env.DATABASE_PASSWORD || 'kine_password',
  database: process.env.DATABASE_NAME || 'kine_booking',
  entities: [User, Session, Profile, Prescription, CareType, Appointment],
  synchronize: true,
  ssl:
    process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

async function seed() {
  console.log('Connexion à la base de données...');
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const profileRepo = dataSource.getRepository(Profile);
  const careTypeRepo = dataSource.getRepository(CareType);

  // --- CareTypes ---
  console.log('Insertion des types de soins...');
  const careTypeMap = new Map<string, CareType>();

  for (const ct of careTypesFixture) {
    let existing = await careTypeRepo.findOne({ where: { label: ct.label } });
    if (!existing) {
      existing = careTypeRepo.create(ct);
      existing = await careTypeRepo.save(existing);
      console.log(`  + CareType créé : ${ct.label}`);
    } else {
      console.log(`  = CareType existant : ${ct.label}`);
    }
    careTypeMap.set(ct.label, existing);
  }

  // --- Users (kinés) + Profiles + CareTypes associés ---
  console.log('Insertion des kinésithérapeutes...');

  for (const fixture of usersFixture) {
    let user = await userRepo.findOne({
      where: { googleId: fixture.user.googleId },
      relations: ['careTypes'],
    });

    if (!user) {
      user = userRepo.create(fixture.user);
      user = await userRepo.save(user);

      const profile = profileRepo.create({
        ...fixture.profile,
        userId: user.id,
      });
      await profileRepo.save(profile);

      console.log(
        `  + Kiné créé : ${fixture.profile.firstName} ${fixture.profile.lastName} (${fixture.user.email})`,
      );
    } else {
      console.log(
        `  = Kiné existant : ${fixture.profile.firstName} ${fixture.profile.lastName}`,
      );
    }

    // Associer les CareTypes
    const careTypes = fixture.careTypeLabels
      .map((label) => careTypeMap.get(label))
      .filter((ct): ct is CareType => ct !== undefined);

    user.careTypes = careTypes;
    await userRepo.save(user);
    console.log(`    -> Soins : ${fixture.careTypeLabels.join(', ')}`);
  }

  console.log('\nFixtures chargées avec succès !');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Erreur lors du chargement des fixtures :', err);
  process.exit(1);
});
