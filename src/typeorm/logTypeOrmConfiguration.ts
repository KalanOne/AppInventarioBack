import { Logger, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';

/**
 * Custom logger implementation for TypeORM.
 * This logger writes query, error, slow query, schema build, migration, and log messages to a log file.
 * The log file is created in the specified log directory, with a filename formatted as 'log-YYYY-MM-DD.log'.
 *
 * @remarks
 * The log file path is obtained from the environment variable LOG_DIR, or defaults to 'logs' directory in the current working directory.
 *
 * @example
 * ```typescript
 * const logger = new MyCustomLogger(configService, cls);
 * logger.logQuery('SELECT * FROM users');
 * logger.logQueryError(new Error('Query failed'), 'SELECT * FROM users');
 * logger.logQuerySlow(1000, 'SELECT * FROM users');
 * logger.logSchemaBuild('Schema build completed');
 * logger.logMigration('Migration applied');
 * logger.log('info', 'Log message');
 * ```
 */
export class MyCustomLogger implements Logger {
  constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the query to the log file
    fs.appendFileSync(logFilePath, `[QUERY] ${query}\n`, { encoding: 'utf8' });
    // Write the parameters to the log file
    fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
      encoding: 'utf8',
    });
    // Write the final query to the log file, replacing the parameters with their values
    fs.appendFileSync(
      logFilePath,
      `[FINAL QUERY] ${query.replace(/\$[0-9]+/g, (match) => {
        const index = parseInt(match.replace('$', '')) - 1;
        return typeof parameters[index] === 'string'
          ? `'${parameters[index]}'`
          : parameters[index];
      })}${query.endsWith(';') ? '' : ';'}\n`,
      { encoding: 'utf8' },
    );
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the error message to the log file
    fs.appendFileSync(logFilePath, `[ERROR] ${error}\n`, { encoding: 'utf8' });
    //  Write the query to the log file
    fs.appendFileSync(logFilePath, `[QUERY] ${query}\n`, { encoding: 'utf8' });
    // Write the parameters to the log file
    fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
      encoding: 'utf8',
    });
    // Write the final query to the log file, replacing the parameters with their values
    fs.appendFileSync(
      logFilePath,
      `[FINAL QUERY] ${query.replace(/\$[0-9]+/g, (match) => {
        const index = parseInt(match.replace('$', '')) - 1;
        return typeof parameters[index] === 'string'
          ? `'${parameters[index]}'`
          : parameters[index];
      })}${query.endsWith(';') ? '' : ';'}\n`,
      { encoding: 'utf8' },
    );
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    queryRunner?: QueryRunner,
  ) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the query execution time to the log file
    fs.appendFileSync(logFilePath, `[SLOW QUERY] Execution time: ${time}\n`, {
      encoding: 'utf8',
    });

    // Write the query to the log file
    fs.appendFileSync(logFilePath, `[QUERY] ${query}\n`, { encoding: 'utf8' });
    // Write the parameters to the log file
    fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
      encoding: 'utf8',
    });
    // Write the final query to the log file, replacing the parameters with their values
    fs.appendFileSync(
      logFilePath,
      `[FINAL QUERY] ${query.replace(/\$[0-9]+/g, (match) => {
        const index = parseInt(match.replace('$', '')) - 1;
        return typeof parameters[index] === 'string'
          ? `'${parameters[index]}'`
          : parameters[index];
      })}${query.endsWith(';') ? '' : ';'}\n`,
      { encoding: 'utf8' },
    );
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  logSchemaBuild(message: string, queryRunner?: QueryRunner) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the schema build message to the log file
    fs.appendFileSync(logFilePath, `[SCHEMA BUILD] ${message}\n`, {
      encoding: 'utf8',
    });
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  logMigration(message: string, queryRunner?: QueryRunner) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the migration message to the log file
    fs.appendFileSync(logFilePath, `[MIGRATION] ${message}\n`, {
      encoding: 'utf8',
    });
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {
    // Call the createLogFile function to get the path of the log file
    const logFilePath = this.createLogFile();
    // Write the log message to the log file
    fs.appendFileSync(logFilePath, `[${level.toUpperCase()}] ${message}\n`, {
      encoding: 'utf8',
    });
    // Write a new line to the log file
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  // function for creating the log file and return the path
  createLogFile(): string {
    // Obtener la fecha actual y formatearla como YYYY-MM-DD
    const date = new Date();
    const formattedDate = date.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    // Obtener la ruta del directorio de logs desde el archivo .env
    const logDir = path.join(
      process.cwd(),
      this.configService.get('LOG_DIR') || 'logs',
    );

    // Si la carpeta 'logs' no existe, crearla
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    // Nombre del archivo de log
    const logFileName = `log-${formattedDate}.log`;

    // Ruta completa al archivo de log dentro del directorio de logs
    const logFilePath = path.join(logDir, logFileName);

    return logFilePath;
  }
}
