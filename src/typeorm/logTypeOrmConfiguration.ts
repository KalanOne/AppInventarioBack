import { Logger, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

export class MyCustomLogger implements Logger {
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
    const logDir = path.join(process.cwd(), process.env.LOG_DIR || 'logs');

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
