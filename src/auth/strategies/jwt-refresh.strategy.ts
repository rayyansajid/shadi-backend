import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          // From cookies
          if (req.cookies?.refresh_token) {
            return req.cookies.refresh_token;
          }
          // Or from body
          if (req.body?.refreshToken) {
            return req.body.refreshToken;
          }
          return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        },
      ]),
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"), // or process.env.REFRESH_TOKEN_SECRET
      passReqToCallback: true, // ✅ Allowed because we're using StrategyOptionsWithRequest
    } as StrategyOptionsWithRequest);
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.refresh_token || 
                         req.body?.refreshToken || 
                         req.headers?.authorization?.replace('Bearer ', '');
    
    console.log('Extracted refresh token:', refreshToken);

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // You could verify token is still stored in DB here
    return { ...payload, refreshToken };
  }
}
