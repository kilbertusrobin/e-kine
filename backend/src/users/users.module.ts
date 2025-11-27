import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

/**
 * Module Users
 * Gère l'authentification et les profils utilisateurs (patients et praticiens)
 */
@Module({
  imports: [
    // Enregistre l'entité User dans TypeORM
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class UsersModule {}
