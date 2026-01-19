import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Module d'envoi d'emails
 */
@Module({
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
