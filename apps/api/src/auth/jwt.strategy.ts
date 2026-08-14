import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, SafeUser } from './auth.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-only-insecure-secret',
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.authService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists.');
    return user;
  }
}
