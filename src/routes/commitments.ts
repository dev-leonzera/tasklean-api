import { Router } from 'express';
import { CommitmentsController } from '../controllers/CommitmentsController';

const router = Router();
const controller = new CommitmentsController();

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
router.post('/:id/participants', (req, res, next) => controller.addParticipant(req, res, next));
router.delete('/:id/participants/:userId', (req, res, next) => controller.removeParticipant(req, res, next));

export default router;

