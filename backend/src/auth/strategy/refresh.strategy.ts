import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from 'src/users/entities/user.entity';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.jwtRefreshToken,
      ignoreExpiration: false,
    });
  }

  validate(payload: { sub: number; role: Role }) {
    return { userId: payload.sub, role: payload.role };
  }
}
