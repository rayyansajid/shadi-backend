import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Min, MaxLength } from 'class-validator';
import { ListingCategory } from 'generated/prisma'; 

export class CreateListingDto {
  @IsString() @MaxLength(120)
  title: string;

  @IsInt() @Min(0)
  price: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  thumbnailUrl?: string;

  @IsEnum(ListingCategory)
  category: ListingCategory;

  @IsString() @MaxLength(120)
  location: string;

  @IsOptional() @IsInt() @IsPositive()
  maxGuests?: number;
}
