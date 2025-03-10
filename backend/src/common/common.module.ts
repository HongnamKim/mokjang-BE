import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { ConfigModule } from '@nestjs/config';
import { MessageService } from './service/message.service';
import { CoolSMSProvider } from './provider/coolsms.provider';

@Module({
  imports: [ConfigModule],
  providers: [CommonService, MessageService, CoolSMSProvider],
  exports: [CommonService, MessageService, CoolSMSProvider],
})
export class CommonModule {}
