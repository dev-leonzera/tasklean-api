import { Router } from 'express';
import { ReportsController } from '../controllers/ReportsController';

const router = Router();
const controller = new ReportsController();

router.get('/export', (req, res, next) => controller.exportPDF(req, res, next));

export default router;

