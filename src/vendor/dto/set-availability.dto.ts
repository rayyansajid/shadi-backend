import { IsArray, IsBoolean, IsDateString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AvailabilityItem {
  @IsDateString()
  date: string; // ISO (e.g., 2025-08-20)
  @IsBoolean()
  isAvailable: boolean;
}

export class SetAvailabilityDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailabilityItem)
  items: AvailabilityItem[];
}

export class UpdateAvailabilityDto {
  @IsBoolean()
  isAvailable: boolean;
}

export class RangeAvailabilityDto {
  @IsDateString()
  from: string; // inclusive
  @IsDateString()
  to: string;   // inclusive
  @IsOptional() @IsBoolean()
  isAvailable?: boolean; // default true
}