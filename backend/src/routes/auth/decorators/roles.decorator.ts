import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Decorator @Roles
 * Définit les rôles autorisés pour une route
 *
 * Doit être utilisé avec RolesGuard
 *
 * Usage:
 * @Roles(UserRole.PRACTITIONER)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin')
 * adminOnly() {
 *   return 'Only for practitioners';
 * }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
