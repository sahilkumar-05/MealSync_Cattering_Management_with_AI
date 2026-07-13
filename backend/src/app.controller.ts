import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('protected-test')
  @UseGuards(JwtAuthGuard)
  testProtected(@Req() req) {
    return {
      message: 'Token valid hai!',
      user: req.user,
    };
  }
}