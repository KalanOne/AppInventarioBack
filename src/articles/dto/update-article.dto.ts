import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateArticleDto {
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @IsNumber()
  articleId: number;

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

  @IsNotEmpty()
  @IsNumber()
  warehouse: number;
}
