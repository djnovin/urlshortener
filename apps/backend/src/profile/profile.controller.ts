import { Controller, Body, Patch, UseGuards, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/auth.decorator';
import { JwtAuthGuard } from '../shared/jwt.guard';
import { UpdateProfileDto } from './profile.dto';
import { ProfileService } from './profile.service';

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { sub: string }) {
    return this.profileService.getProfile(user.sub);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(user.sub, dto);
  }
}
