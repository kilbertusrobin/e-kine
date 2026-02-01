import { UserRole } from '../../routes/users/enums/user-role.enum';

/**
 * Fixtures pour les utilisateurs kinésithérapeutes et leurs profils.
 * careTypeLabels référence les labels définis dans care-types.fixture.ts
 */
export const usersFixture = [
  {
    user: {
      email: 'martin.dupont@gmail.com',
      googleId: 'google_fake_100000000000000001',
      googlePicture: 'https://ui-avatars.com/api/?name=Martin+Dupont',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Martin',
      lastName: 'Dupont',
      address: '12 Rue de la Santé',
      city: 'Paris',
      pc: '75013',
      phone: '06 12 34 56 78',
    },
    careTypeLabels: [
      'Kinésithérapie du sport',
      'Rééducation post-opératoire',
      'Massage thérapeutique',
    ],
  },
  {
    user: {
      email: 'sophie.laurent@gmail.com',
      googleId: 'google_fake_100000000000000002',
      googlePicture: 'https://ui-avatars.com/api/?name=Sophie+Laurent',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Sophie',
      lastName: 'Laurent',
      address: '45 Avenue Jean Jaurès',
      city: 'Lyon',
      pc: '69007',
      phone: '06 23 45 67 89',
    },
    careTypeLabels: [
      'Kinésithérapie respiratoire',
      'Kinésithérapie pédiatrique',
      'Drainage lymphatique',
    ],
  },
  {
    user: {
      email: 'thomas.bernard@gmail.com',
      googleId: 'google_fake_100000000000000003',
      googlePicture: 'https://ui-avatars.com/api/?name=Thomas+Bernard',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Thomas',
      lastName: 'Bernard',
      address: '8 Boulevard du Prado',
      city: 'Marseille',
      pc: '13008',
      phone: '06 34 56 78 90',
    },
    careTypeLabels: [
      'Kinésithérapie du sport',
      'Kinésithérapie neurologique',
      'Bilan postural',
    ],
  },
  {
    user: {
      email: 'camille.moreau@gmail.com',
      googleId: 'google_fake_100000000000000004',
      googlePicture: 'https://ui-avatars.com/api/?name=Camille+Moreau',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Camille',
      lastName: 'Moreau',
      address: '22 Rue Alsace-Lorraine',
      city: 'Toulouse',
      pc: '31000',
      phone: '06 45 67 89 01',
    },
    careTypeLabels: [
      'Rééducation périnéale',
      'Massage thérapeutique',
      'Ostéopathie',
    ],
  },
  {
    user: {
      email: 'alexandre.petit@gmail.com',
      googleId: 'google_fake_100000000000000005',
      googlePicture: 'https://ui-avatars.com/api/?name=Alexandre+Petit',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Alexandre',
      lastName: 'Petit',
      address: '3 Place des Quinconces',
      city: 'Bordeaux',
      pc: '33000',
      phone: '06 56 78 90 12',
    },
    careTypeLabels: [
      'Kinésithérapie du sport',
      'Rééducation post-opératoire',
      'Kinésithérapie neurologique',
      'Bilan postural',
    ],
  },
  {
    user: {
      email: 'julie.lefebvre@gmail.com',
      googleId: 'google_fake_100000000000000006',
      googlePicture: 'https://ui-avatars.com/api/?name=Julie+Lefebvre',
      role: UserRole.PRACTITIONER,
      isActive: true,
      emailVerified: true,
    },
    profile: {
      firstName: 'Julie',
      lastName: 'Lefebvre',
      address: '17 Rue Crébillon',
      city: 'Nantes',
      pc: '44000',
      phone: '06 67 89 01 23',
    },
    careTypeLabels: [
      'Kinésithérapie respiratoire',
      'Drainage lymphatique',
      'Kinésithérapie pédiatrique',
      'Massage thérapeutique',
    ],
  },
];
