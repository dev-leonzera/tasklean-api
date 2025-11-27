import { Router } from 'express';
import { TasksController } from '../controllers/TasksController';
import { TaskCommentsController } from '../controllers/TaskCommentsController';

const router = Router();
const controller = new TasksController();
const commentsController = new TaskCommentsController();

router.get('/', (req, res, next) => controller.getAll(req, res, next));
router.get('/:id', (req, res, next) => controller.getById(req, res, next));
router.post('/', (req, res, next) => controller.create(req, res, next));
router.patch('/:id', (req, res, next) => controller.update(req, res, next));
router.delete('/:id', (req, res, next) => controller.delete(req, res, next));

// Rotas de comentários
router.get('/:taskId/comments', (req, res, next) => commentsController.getByTaskId(req, res, next));
router.post('/:taskId/comments', (req, res, next) => commentsController.create(req, res, next));
router.patch('/:taskId/comments/:commentId', (req, res, next) => commentsController.update(req, res, next));
router.delete('/:taskId/comments/:commentId', (req, res, next) => commentsController.delete(req, res, next));

export default router;

