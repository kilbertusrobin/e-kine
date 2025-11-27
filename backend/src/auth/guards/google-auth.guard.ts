import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard Google OAuth - Déclenche l'authentification Google
 *
 * Usage:
 * @Get('google')
 * @UseGuards(GoogleAuthGuard)
 * googleAuth() {}
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const activate = (await super.canActivate(context)) as boolean;
    return activate;
  }
}
