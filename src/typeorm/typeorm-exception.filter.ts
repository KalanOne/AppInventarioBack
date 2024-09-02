import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
  MustBeEntityError,
} from 'typeorm';

@Catch(
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
  MustBeEntityError,
)
export class TypeOrmExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    if (exception instanceof QueryFailedError) {
      const errorMessageCode = getCodeErrorMessage(exception.driverError.code);
      message = '';
      message += errorMessageCode;
      message += ' - ';
      if (errorMessageCode == 'Error desconocido') {
        message += 'Database query failed: ';
        message += exception.driverError.code ?? '';
        message += ' - ';
      }
      message += JSON.stringify(
        exception.driverError.detail ??
          exception.driverError.message ??
          exception.message ??
          exception.message ??
          '',
      );
    } else if (exception instanceof EntityNotFoundError) {
      message =
        'No se encontro el registro/s solicitado con el criterio dado: ';
      message += JSON.stringify(exception.criteria);
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof CannotCreateEntityIdMapError) {
      message = 'Cannot create entity ID map';
    } else if (exception instanceof MustBeEntityError) {
      message = 'Must be entity';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}

function getCodeErrorMessage(code: string): string {
  switch (code) {
    case '23505':
      return 'La entidad ya existe con esa combinacion de valores';
    case '23514':
      return 'La entidad no existe';
    case '02000':
      return 'No se proporciono un valor para una columna requerida';
    case '08000':
    case '08003':
    case '08006':
    case '08001':
    case '08004':
    case '08007':
    case '08P01':
      return 'Error de conexion con la base de datos';
    default:
      return 'Error desconocido';
  }
}
