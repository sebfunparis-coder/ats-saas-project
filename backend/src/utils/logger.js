import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const isDev = process.env.NODE_ENV !== 'production';

// Clés jamais loggées en clair, quel que soit l'endroit d'où provient le log
// (meta passé à logger.info/warn/error, objets imbriqués, erreurs Mongoose…).
const SENSITIVE_KEYS = new Set([
  'password', 'currentpassword', 'newpassword', 'confirmpassword',
  'token', 'accesstoken', 'refreshtoken', 'idtoken',
  'passwordresettoken', 'emailverificationtoken',
  'secret', 'jwtsecret', 'apikey', 'authorization',
  'ssn', 'iban', 'creditcard', 'cardnumber', 'cvv',
]);

const REDACTED = '[REDACTED]';

// Masque récursivement les clés sensibles dans un objet/tableau, sans muter l'original.
const redactValue = (value, seen = new WeakSet()) => {
  if (Array.isArray(value)) return value.map((v) => redactValue(v, seen));
  if (value && typeof value === 'object') {
    if (seen.has(value)) return '[CIRCULAR]';
    seen.add(value);
    const out = {};
    for (const [key, val] of Object.entries(value)) {
      out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? REDACTED : redactValue(val, seen);
    }
    return out;
  }
  return value;
};

// Mute en place (préserve les Symbol(level)/Symbol(message) internes de winston,
// qu'un nouvel objet littéral perdrait et qui font planter colorize()/json()).
const redactSensitive = winston.format((info) => {
  const { timestamp, level, message, stack, ...meta } = info;
  Object.assign(info, redactValue(meta));
  return info;
});

const devFormat = winston.format.combine(
  redactSensitive(),
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${stack || message}${metaStr}`;
  })
);

const prodFormat = winston.format.combine(
  redactSensitive(),
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = isDev
  ? [new winston.transports.Console({ format: devFormat })]
  : [
      new winston.transports.Console({ format: prodFormat }),
      new DailyRotateFile({
        filename: 'logs/app-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '14d',
        format: prodFormat,
      }),
      new DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        maxFiles: '30d',
        level: 'error',
        format: prodFormat,
      }),
    ];

const logger = winston.createLogger({
  level: isDev ? 'debug' : 'info',
  transports,
});

// Stream pour morgan
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
