import { Logger, QueryRunner } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/entities/entities/user.entity';

/**
 * Custom logger implementation for TypeORM that logs queries, errors, slow queries, schema builds, and migrations.
 * It also logs user information and timestamps for each log entry.
 */
export class MyCustomLogger implements Logger {
  static instance: MyCustomLogger;
  /**
   * Creates an instance of the class.
   *
   * @param configService - The configuration service used to access environment variables and other configuration settings.
   * @param cls - The CLS (Continuation Local Storage) service used to manage context across asynchronous operations.
   */
  private constructor(
    private readonly configService: ConfigService,
    private readonly cls: ClsService,
  ) {}

  static getInstance(
    configService: ConfigService,
    cls: ClsService,
  ): MyCustomLogger {
    if (!this.instance) {
      this.instance = new MyCustomLogger(configService, cls);
    }
    return this.instance;
  }

  /**
   * Logs user information to a specified file.
   *
   * @param {Object} param - The parameter object.
   * @param {string} param.logFilePath - The path to the log file where user information will be appended.
   *
   * @remarks
   * This method retrieves the current user from the continuation-local storage (CLS) and logs their details
   * including user ID, names, worker number, and associated plant information.
   * If no user is found in the CLS, no action is taken.
   *
   * @private
   */
  private logUser({ logFilePath }: { logFilePath: string }): void {
    const user: User | undefined = this.cls.get('user');
    if (user) {
      const userInfo = `[USER] ${user.id}, ${user.first_name} ${user.last_name} ${user.email}\n`;
      fs.appendFileSync(logFilePath, userInfo, { encoding: 'utf8' });
    }
  }

  /**
   * Appends the current timestamp to the specified log file.
   *
   * @param {Object} param - The parameter object.
   * @param {string} param.logFilePath - The path to the log file where the timestamp will be appended.
   * @returns {void}
   *
   * @private
   */
  private logTime({ logFilePath }: { logFilePath: string }): void {
    fs.appendFileSync(logFilePath, `[TIME] ${new Date().toISOString()}\n`, {
      encoding: 'utf8',
    });
  }

  /**
   * Logs the final formatted SQL query to a specified log file.
   *
   * @param {Object} params - The parameters for logging the query.
   * @param {string} params.logFilePath - The path to the log file where the query will be appended.
   * @param {string} params.query - The SQL query to be logged.
   * @param {any[]} [params.parameters] - Optional array of parameters to replace placeholders in the query.
   *
   * The method replaces placeholders in the query (e.g., $1, $2) with the corresponding values from the parameters array.
   * If a parameter is a string, it will be enclosed in single quotes.
   * The formatted query is then appended to the specified log file.
   *
   * @private
   */
  private logFinalQuery({
    logFilePath,
    query,
    parameters,
  }: {
    logFilePath: string;
    query: string;
    parameters?: any[];
  }): void {
    const formattedQuery = query.replace(/\$[0-9]+/g, (match) => {
      const index = parseInt(match.replace('$', '')) - 1;
      return typeof parameters?.[index] === 'string'
        ? `'${parameters[index]}'`
        : parameters?.[index];
    });
    fs.appendFileSync(
      logFilePath,
      `[FINAL QUERY] ${formattedQuery}${query.endsWith(';') ? '' : ';'}\n`,
      { encoding: 'utf8' },
    );
  }

  /**
   * Logs a SQL query to a file.
   *
   * @param query - The SQL query string to be logged.
   * @param parameters - Optional array of parameters for the SQL query.
   * @param _queryRunner - Optional QueryRunner instance (not used in this implementation).
   *
   * This method performs the following steps:
   * 1. Creates a log file and retrieves its path.
   * 2. Logs the current time to the log file.
   * 3. Logs the current user to the log file.
   * 4. Appends the SQL query to the log file.
   * 5. If parameters are provided, appends them to the log file.
   * 6. Logs the final query details to the log file.
   * 7. Adds a newline to the log file for separation.
   */
  logQuery(
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(logFilePath, `[QUERY] ${query}\n`, { encoding: 'utf8' });
    if (parameters?.length) {
      fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
        encoding: 'utf8',
      });
    }
    this.logFinalQuery({ logFilePath, query, parameters });
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  /**
   * Logs a query error to a file.
   *
   * @param error - The error message or Error object.
   * @param query - The SQL query that caused the error.
   * @param parameters - Optional parameters used in the query.
   * @param _queryRunner - Optional QueryRunner instance (not used in this method).
   */
  logQueryError(
    error: string | Error,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(logFilePath, `[ERROR] ${error}\n[QUERY] ${query}\n`, {
      encoding: 'utf8',
    });
    if (parameters?.length) {
      fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
        encoding: 'utf8',
      });
    }
    this.logFinalQuery({ logFilePath, query, parameters });
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  /**
   * Logs slow queries to a file.
   *
   * @param time - The execution time of the query in milliseconds.
   * @param query - The SQL query string.
   * @param parameters - Optional array of parameters used in the query.
   * @param _queryRunner - Optional QueryRunner instance (not used in this function).
   *
   * This function creates a log file and appends information about slow queries,
   * including the execution time, query string, and parameters if provided.
   * It also logs additional information such as the log time and user.
   */
  logQuerySlow(
    time: number,
    query: string,
    parameters?: any[],
    _queryRunner?: QueryRunner,
  ): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(
      logFilePath,
      `[SLOW QUERY] Execution time: ${time}\n[QUERY] ${query}\n`,
      { encoding: 'utf8' },
    );
    if (parameters?.length) {
      fs.appendFileSync(logFilePath, `[PARAMETERS] ${parameters}\n`, {
        encoding: 'utf8',
      });
    }
    this.logFinalQuery({ logFilePath, query, parameters });
    fs.appendFileSync(logFilePath, '\n', { encoding: 'utf8' });
  }

  /**
   * Logs a schema build message to a log file.
   *
   * This method creates a log file, logs the current time and user,
   * and appends the schema build message to the log file.
   *
   * @param message - The schema build message to log.
   * @param _queryRunner - Optional QueryRunner instance (not used in this method).
   * @returns void
   */
  logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(logFilePath, `[SCHEMA BUILD] ${message}\n\n`, {
      encoding: 'utf8',
    });
  }

  /**
   * Logs a migration message to a file.
   *
   * @param message - The migration message to log.
   * @param _queryRunner - Optional. The query runner instance (not used in this implementation).
   */
  logMigration(message: string, _queryRunner?: QueryRunner): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(logFilePath, `[MIGRATION] ${message}\n\n`, {
      encoding: 'utf8',
    });
  }

  /**
   * Logs a message with a specified level to a log file.
   *
   * @param level - The level of the log message. Can be 'log', 'info', or 'warn'.
   * @param message - The message to be logged.
   * @param _queryRunner - Optional. The query runner instance (not used in this implementation).
   *
   * This method creates a log file if it doesn't exist, logs the current time and user,
   * and appends the log message to the file.
   */
  log(
    level: 'log' | 'info' | 'warn',
    message: any,
    _queryRunner?: QueryRunner,
  ): void {
    const logFilePath = this.createLogFile();
    this.logTime({ logFilePath });
    this.logUser({ logFilePath });
    fs.appendFileSync(logFilePath, `[${level.toUpperCase()}] ${message}\n\n`, {
      encoding: 'utf8',
    });
  }

  /**
   * Creates a log file with a name based on the current date.
   *
   * This method generates a log file name in the format `log-YYYY-MM-DD.log`
   * and ensures that the log directory exists. If the directory does not exist,
   * it will be created recursively.
   *
   * @returns {string} The full path to the created log file.
   */
  private createLogFile(): string {
    const date = new Date().toISOString().split('T')[0];
    const logDir = path.join(
      process.cwd(),
      this.configService.get('LOG_DIR') || 'logs',
    );
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    return path.join(logDir, `log-${date}.log`);
  }
}
