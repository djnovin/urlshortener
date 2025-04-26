import { Controller, Post, Body, UsePipes, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDtoSchema,
  LoginDtoSchema,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  RefreshTokenDtoSchema,
} from './auth.dto';
import { ZodValidationPipe } from '../shared/zod.pipe';
import { JwtAuthGuard } from '../shared/jwt.guard';
import { CurrentUser } from './auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('refresh')
  @UsePipes(new ZodValidationPipe(RefreshTokenDtoSchema))
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterDtoSchema))
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginDtoSchema))
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: { sub: string }) {
    return this.authService.logout(user.sub);
  }
}
