import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { DateTransform } from 'src/utils/decorators/transforms';

@ValidatorConstraint({ name: 'SerialValidation', async: false })
class SerialValidation implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const unit = args.object as Unit;
    if (unit.serial) {
      if (unit.quantity !== 1) {
        return false;
      }
      if (unit.factor !== 1 || unit.multiple.toLowerCase() !== 'unidad') {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `Serial debe estar vacío cuando la cantidad no es 1 o la cantidad debe ser 1 cuando el serial no está vacío. Además, si hay serial, el factor debe ser 1 y el múltiplo debe ser 'unidad'.`;
  }
}

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  emitter: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['ENTRY', 'EXIT'])
  type: 'ENTRY' | 'EXIT';

  @IsString()
  @IsNotEmpty()
  folio: string;

  @IsDate()
  @IsNotEmpty()
  @DateTransform()
  transactionDate: Date;

  @IsArray()
  @IsNotEmpty()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => Unit)
  units: Unit[];
}

export class Unit {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  multiple: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsNotEmpty()
  factor: number;

  @IsOptional()
  @IsString()
  almacen?: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsNotEmpty()
  quantity: number;

  @IsBoolean()
  afectation: boolean;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsOptional({ always: true })
  productId?: number | undefined;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsOptional()
  articleId?: number | undefined;

  @IsString()
  @IsOptional()
  @Validate(SerialValidation)
  serial?: string | undefined;
}
