import { Router } from 'express';
import { ProjectsController } from '../controllers/ProjectsController';

const router = Router();
const controller = new ProjectsController();

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));
router.post('/:id/members', (req, res, next) => controller.addMember(req, res, next));
router.delete('/:id/members/:userId', (req, res, next) => controller.removeMember(req, res, next));

export default router;

