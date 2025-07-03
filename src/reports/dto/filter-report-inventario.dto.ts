import { IsOptional, IsBoolean } from 'class-validator';
import { BooleanTransform } from 'src/utils/decorators/transforms';

export class FilterReportInventarioDto {
  @IsOptional()
  @BooleanTransform()
  @IsBoolean()
  includeNonAfectation: boolean = true;
}
