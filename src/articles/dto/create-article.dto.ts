import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  barcode: string;

  @IsNotEmpty()
  @IsString()
  multiple: string;

  @IsNotEmpty()
  @IsNumber()
  factor: number;
}
