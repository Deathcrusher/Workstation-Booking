import fs from 'fs';
import path from 'path';

export function log(message: string): void {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  const logDir = path.join(__dirname, '../../logs');
  const logFile = path.join(logDir, 'backend.log');

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logLine);
  } catch (err) {
    console.error('Logger error:', err);
  }
}
