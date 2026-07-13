import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // taake baaki modules ise use kar sakein
})
export class AiModule {}