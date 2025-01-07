import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class FilterArticleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsOptional()
  @IsString()
  multiple?: string;

  @IsOptional()
  @IsNumberString()
  factor?: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsNumberString()
  skip?: number;

  @IsOptional()
  @IsNumberString()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
