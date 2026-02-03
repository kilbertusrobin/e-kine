# Design Patterns - E-Kine

Ce document décrit les design patterns utilisés dans le projet E-Kine.

## Vue d'ensemble

| Catégorie | Pattern | Localisation |
|-----------|---------|--------------|
| **Création** | Singleton | Services NestJS |
| **Structurel** | Decorator | Guards, Pipes, Modules |
| **Comportemental** | Strategy | Stratégies d'authentification |

---

## 1. Pattern Singleton (Création)

### Description

Le pattern Singleton garantit qu'une classe n'a qu'une seule instance et fournit un point d'accès global à cette instance.

### Implémentation dans E-Kine

Dans NestJS, tous les providers décorés avec `@Injectable()` sont des **singletons par défaut**. Une seule instance est créée et partagée dans toute l'application.

### Exemple : MailService

```typescript
// src/routes/mail/mail.service.ts

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    // Le transporter est créé une seule fois
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST'),
      port: this.configService.get<number>('MAIL_PORT'),
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    await this.transporter.sendMail({ to, subject, html });
  }
}
```

### Avantages

- **Économie de ressources** : une seule connexion SMTP pour toute l'application
- **État partagé** : la configuration est chargée une seule fois
- **Cohérence** : tous les modules utilisent la même instance

### Autres exemples dans le projet

| Service | Fichier | Ressource partagée |
|---------|---------|-------------------|
| `MailService` | `mail.service.ts` | Connexion SMTP |
| `AppointmentsService` | `appointments.service.ts` | Repository |
| `AuthService` | `auth.service.ts` | Configuration JWT |

---

## 2. Pattern Decorator (Structurel)

### Description

Le pattern Decorator permet d'ajouter dynamiquement des responsabilités à un objet sans modifier sa structure. Il offre une alternative flexible à l'héritage.

### Implémentation dans E-Kine

NestJS utilise massivement les **décorateurs TypeScript** pour enrichir les classes et méthodes.

### Exemple : Guards d'authentification

```typescript
// src/routes/auth/guards/jwt-auth.guard.ts

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    return super.canActivate(context);
  }
}

// src/routes/auth/guards/roles.guard.ts

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### Utilisation sur un contrôleur

```typescript
// src/routes/appointments/appointments.controller.ts

@Controller('appointments')
@UseGuards(JwtAuthGuard)  // Décorateur : ajoute l'authentification
export class AppointmentsController {

  @Get()
  @UseGuards(RolesGuard)           // Décorateur : ajoute la vérification des rôles
  @Roles(Role.PRACTITIONER)        // Décorateur : définit les rôles autorisés
  findAll() {
    return this.appointmentsService.findAll();
  }
}
```

### Avantages

- **Séparation des responsabilités** : l'authentification est séparée de la logique métier
- **Composabilité** : on peut combiner plusieurs décorateurs
- **Réutilisabilité** : un guard peut protéger plusieurs routes

### Décorateurs personnalisés du projet

| Décorateur | Fichier | Fonction |
|------------|---------|----------|
| `@CurrentUser()` | `current-user.decorator.ts` | Injecte l'utilisateur connecté |
| `@Roles()` | `roles.decorator.ts` | Définit les rôles autorisés |
| `@Public()` | (si implémenté) | Marque une route comme publique |

---

## 3. Pattern Strategy (Comportemental)

### Description

Le pattern Strategy définit une famille d'algorithmes, encapsule chacun d'eux et les rend interchangeables. Il permet de varier l'algorithme indépendamment des clients qui l'utilisent.

### Implémentation dans E-Kine

Les **stratégies Passport** implémentent ce pattern pour gérer différentes méthodes d'authentification.

### Exemple : Stratégies d'authentification

```typescript
// src/routes/auth/strategies/google.strategy.ts

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<any> {
    // Logique de validation Google OAuth
    return {
      googleId: profile.id,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
    };
  }
}

// src/routes/auth/strategies/jwt.strategy.ts

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    // Logique de validation JWT
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    return user;
  }
}
```

### Diagramme

```
┌─────────────────────────────────────────────────────────┐
│                    AuthModule                           │
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Google    │    │    JWT      │    │   (Future)  │ │
│  │  Strategy   │    │  Strategy   │    │  Strategy   │ │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘ │
│         │                  │                  │         │
│         └──────────────────┼──────────────────┘         │
│                            │                            │
│                    ┌───────▼───────┐                    │
│                    │ PassportModule │                    │
│                    └───────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

### Avantages

- **Extensibilité** : ajouter une nouvelle méthode d'auth (Facebook, GitHub) = créer une nouvelle stratégie
- **Isolation** : chaque stratégie est indépendante
- **Testabilité** : on peut tester chaque stratégie séparément

---

## Patterns additionnels

### Repository Pattern

Utilisé via **TypeORM** pour abstraire l'accès aux données.

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}
```

### Dependency Injection

Pattern fondamental de NestJS, géré automatiquement par le conteneur IoC.

```typescript
@Injectable()
export class AppointmentsService {
  constructor(
    private readonly mailService: MailService,        // Injecté
    private readonly usersService: UsersService,      // Injecté
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,  // Injecté
  ) {}
}
```

### Observer Pattern

Utilisé implicitement par le **SchedulerModule** pour les tâches cron.

```typescript
@Injectable()
export class SchedulerService {
  @Cron('0 18 * * *')  // Observateur déclenché tous les jours à 18h
  async handleAppointmentReminders(): Promise<void> {
    await this.appointmentsService.sendTomorrowReminders();
  }
}
```

---

## Résumé

| Pattern | Type | Problème résolu | Exemple E-Kine |
|---------|------|-----------------|----------------|
| **Singleton** | Création | Instance unique, ressources partagées | `MailService`, `AuthService` |
| **Decorator** | Structurel | Ajout de comportements sans héritage | `@UseGuards()`, `@Roles()` |
| **Strategy** | Comportemental | Algorithmes interchangeables | `JwtStrategy`, `GoogleStrategy` |
| Repository | - | Abstraction accès données | TypeORM Repositories |
| DI | - | Couplage faible | Injection NestJS |
| Observer | Comportemental | Réaction aux événements | Cron jobs |
