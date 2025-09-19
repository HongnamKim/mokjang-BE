import { Injectable } from '@nestjs/common';
import { PermissionUnitSeederService } from './permission/permission-domain/service/permission-unit-seeder.service';

@Injectable()
export class AppService {
  constructor(
    private readonly permissionUnitSeeder: PermissionUnitSeederService,
  ) {}

  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date(),
    };
  }

  // 서버 실행 시 자동 실행
  async onApplicationBootstrap() {
    await this.permissionUnitSeeder.seed();
  }
}
