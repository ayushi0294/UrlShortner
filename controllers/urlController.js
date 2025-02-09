import URL from '../models/urlModel.js';
import { generate } from 'shortid';
import redisClient from '../config/redis.js';
import { Parser } from 'json2csv';
import logger from '../utils/Logger.js';
import { isSpamUrl } from '../utils/urlValidator.js';

// ✅ 1. Shorten URL
export async function createShortUrl(req, res) {
    try{
        const { originalUrl, expirationDate } = req.body;
        if (!originalUrl) return res.status(400).json({ message: "URL is required!" });
        if (isSpamUrl(originalUrl)) {
            logger.warn(`Blocked Spam URL: ${originalUrl}`);
            return res.status(400).json({ message: "This URL is flagged as spam." });
        }
    
        const shortUrl = generate();
        const newUrl = await URL.create({ originalUrl, shortUrl, expirationDate });
        logger.info(`Short URL created: ${shortUrl} -> ${originalUrl}`);
        return res.json({ shortUrl: `${process.env.BASE_URL}/${shortUrl}` });
    }
    catch(err){
        logger.error(`Error in createShortUrl: ${err.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
    }
   

// ✅ 2. Redirect Short URL
// export async function redirectUrl(req, res) {
//     try {
//         const { shortUrl } = req.params;
//         const cachedUrl = await redisClient.get(shortUrl);
//         if (cachedUrl) {
//             await URL.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
//             logger.info(`Cache hit: Redirecting ${shortUrl} to ${cachedUrl}`);
//             return res.send(cachedUrl);
//         }

//         const urlEntry = await URL.findOne({ shortUrl });
//         if (!urlEntry) {
//             logger.warn(`Redirect failed: ${shortUrl} not found`);
//             return res.status(404).json({ message: "URL not found" });
//         }

//         if (urlEntry.expirationDate && new Date() > urlEntry.expirationDate) {
//             logger.warn(`Redirect failed: ${shortUrl} expired`);
//             return res.status(410).json({ message: "URL expired" });
//         }

//         await URL.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
//         await redisClient.set(shortUrl, urlEntry.originalUrl, "EX", 3600);

//         logger.info(`Redirecting ${shortUrl} to ${urlEntry.originalUrl}`);
//         return res.send(urlEntry.originalUrl);
//     } catch (err) {
//         logger.error(`Error in redirectUrl: ${err.message}`);
//         return res.status(500).json({ message: "Internal Server Error" });
//     }
// }
// ✅ 2. Redirect Short URL with Expiration Check
export async function redirectUrl(req, res) {
    try {
        const { shortUrl } = req.params;

        // Check Redis Cache First
        const cachedUrl = await redisClient.get(shortUrl);
        if (cachedUrl) {
            await URL.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
            return res.send(cachedUrl);
        }

        // Fetch from Database
        const urlEntry = await URL.findOne({ shortUrl });
        if (!urlEntry) return res.status(404).json({ message: "URL not found" });

        // Check Expiration
        if (urlEntry.expirationDate && new Date() > urlEntry.expirationDate) {
            logger.warn(`Expired URL access attempt: ${shortUrl}`);
            return res.status(410).json({ message: "URL expired" });
        }

        // Update Click Count & Cache Result
        await URL.updateOne({ shortUrl }, { $inc: { clicks: 1 } });
        await redisClient.set(shortUrl, urlEntry.originalUrl, 'EX', 3600); // Cache for 1 hour

        logger.info(`Redirecting to: ${urlEntry.originalUrl}`);
        return res.send(urlEntry.originalUrl);
    } catch (err) {
        logger.error(`Error redirecting URL: ${err.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}



// ✅ 3. Analytics
export async function getAnalytics(req, res) {
    try {
        const { shortUrl } = req.params;
        const urlEntry = await URL.findOne({ shortUrl });

        if (!urlEntry) {
            logger.warn(`Analytics request failed: ${shortUrl} not found`);
            return res.status(404).json({ message: "URL not found" });
        }

        logger.info(`Analytics fetched for ${shortUrl}`);
        return res.json({
            originalUrl: urlEntry.originalUrl,
            clicks: urlEntry.clicks,
            createdAt: urlEntry.createdAt,
            expirationDate: urlEntry.expirationDate,
        });
    } catch (err) {
        logger.error(`Error in getAnalytics: ${err.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}

   

// ✅ 4. Export Analytics as CSV
export async function exportAnalytics(req, res) {
    try {
        const { shortUrl } = req.params;
        const urlEntry = await URL.findOne({ shortUrl });

        if (!urlEntry) {
            logger.warn(`CSV export failed: ${shortUrl} not found`);
            return res.status(404).json({ message: "URL not found" });
        }

        const data = [
            {
                Original_URL: urlEntry.originalUrl,
                Clicks: urlEntry.clicks,
                Created_At: urlEntry.createdAt,
                Expiration_Date: urlEntry.expirationDate,
            },
        ];

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        logger.info(`CSV exported for ${shortUrl}`);
        res.setHeader("Content-Disposition", `attachment; filename=analytics_${shortUrl}.csv`);
        res.set("Content-Type", "text/csv");
        res.send(csv);
    } catch (err) {
        logger.error(`Error in exportAnalytics: ${err.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
