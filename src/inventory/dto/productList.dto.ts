import { IsNumber, IsOptional, IsString } from 'class-validator';
import { NumberTransform } from 'src/utils/decorators/transforms';

export class FilterProductDto {
  @IsOptional()
  @IsNumber()
  @NumberTransform()
  id?: number;

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
  @IsNumber()
  @NumberTransform()
  factor?: number;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsNumber()
  @NumberTransform()
  skip?: number;

  @IsOptional()
  @IsNumber()
  @NumberTransform()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
