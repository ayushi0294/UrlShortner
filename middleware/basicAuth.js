import basicAuth from "basic-auth";
import dotenv from "dotenv";
import logger from "../utils/logger.js";

dotenv.config();

const basicAuthMiddleware = (req, res, next) => {
    const user = basicAuth(req);
    const validUsername = process.env.BASIC_AUTH_USER;
    const validPassword = process.env.BASIC_AUTH_PASS;

    if (!user) {
        logger.warn(`Unauthorized access attempt - No credentials provided`);
        res.set("WWW-Authenticate", 'Basic realm="Restricted Area"');
        return res.status(401).json({ message: "Unauthorized: No credentials provided" });
    }

    if (user.name !== validUsername || user.pass !== validPassword) {
        logger.warn(`Unauthorized access attempt - Invalid credentials from IP: ${req.ip}`);
        res.set("WWW-Authenticate", 'Basic realm="Restricted Area"');
        return res.status(401).json({ message: "Unauthorized: Invalid Credentials" });
    }

    logger.info(`Successful authentication for user: ${user.name} from IP: ${req.ip}`);
    next(); // Proceed to next middleware or route
};

export default basicAuthMiddleware;
