import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from 'generated/prisma';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  passwordHash: string;

  @IsString()
  role: Role;

  @IsString()
  phone? : string
}