import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // secretOrKey: process.env.JWT_SECRET || 'supersecret', // use env in prod
      secretOrKey: configService.get<string>("JWT_ACCESS_SECRET"), // use env in prod
    } as StrategyOptionsWithRequest);
  }

  async validate(payload: any) {
    return { userId: payload.id, email: payload.email, role: payload.role };
  }
}
