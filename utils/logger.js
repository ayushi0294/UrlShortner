import { createLogger, format, transports } from "winston";

const logger = createLogger({
    level: "info", // Default log level
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: "logs/app.log", level: "info" }), // Logs info and above
        new transports.File({ filename: "logs/error.log", level: "error" }) // Logs only errors
    ],
    exceptionHandlers: [
        new transports.File({ filename: "logs/exceptions.log" }) // Log uncaught exceptions
    ],
    rejectionHandlers: [
        new transports.File({ filename: "logs/rejections.log" }) // Log unhandled promise rejections
    ]
});

export default logger;
