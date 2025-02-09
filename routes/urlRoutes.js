import { Router } from 'express';
const router = Router();
import { createShortUrl, redirectUrl, getAnalytics, exportAnalytics } from '../controllers/urlController.js';
import basicAuthMiddleware from '../middleware/basicAuth.js';


router.post('/shorten', basicAuthMiddleware,createShortUrl);
router.get('/:shortUrl',basicAuthMiddleware, redirectUrl);
router.get('/analytics/:shortUrl',basicAuthMiddleware, getAnalytics);
router.get('/export/:shortUrl',basicAuthMiddleware, exportAnalytics);


export default router;
