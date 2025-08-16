import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role, VendorCategory  } from 'generated/prisma';

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  businessName?: string;

  @IsOptional()
  @IsEnum(VendorCategory)
  vendorCategory?: VendorCategory;

  @IsOptional()
  city?: string;

  @IsOptional()
  area?: string;

  @IsOptional()
  address?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  logoUrl?: string;
}
