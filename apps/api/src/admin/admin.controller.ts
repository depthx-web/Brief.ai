import { Controller, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async stats(@Headers('x-admin-token') token: string | undefined) {
    const expected = process.env.ADMIN_TOKEN;
    // Fail closed: no ADMIN_TOKEN configured means no access, not open access.
    if (!expected || token !== expected) {
      throw new UnauthorizedException('Invalid admin token.');
    }
    return this.adminService.getStats();
  }
}
