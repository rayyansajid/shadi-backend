import { ForbiddenException, Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private configService: ConfigService
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
        data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        passwordHash,
        role: dto.role || 'CUSTOMER',
        },
    });

    const tokens = this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashedRefreshToken },
    });

    return tokens;
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return this.generateTokens({
        id: user.id, 
        email:user.email, 
        role: user.role
    });
  }
  async logout(userId: string) {  
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }


  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);

    if (!isValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const tokens = this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newHashedRefreshToken },
    });

    return tokens;
  }
  
  generateTokens(user: { id: string; email: string; role: string }) {
      const payload = { id: user.id, email: user.email, role: user.role };

      const accessToken = this.jwt.sign(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION')
      });
      
      const refreshToken = this.jwt.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'), 
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION')
        });

      return { accessToken, refreshToken };
  }
}
