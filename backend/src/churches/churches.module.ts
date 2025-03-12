import { Module } from '@nestjs/common';
import { ChurchesService } from './churches.service';
import { ChurchesController } from './churches.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChurchModel } from './entity/church.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([ChurchModel]), JwtModule.register({})],
  controllers: [ChurchesController],
  providers: [ChurchesService],
  exports: [ChurchesService],
})
export class ChurchesModule {}
