export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private level: LogLevel = 'info';

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  debug(context: string, message: string, ...data: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] [${context}] ${message}`, ...data);
    }
  }

  info(context: string, message: string, ...data: any[]) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] [${context}] ${message}`, ...data);
    }
  }

  warn(context: string, message: string, ...data: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] [${context}] ${message}`, ...data);
    }
  }

  error(context: string, message: string, ...data: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] [${context}] ${message}`, ...data);
    }
  }
}

export const logger = new Logger();
