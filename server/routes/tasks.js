import express from 'express';
import { Task, Project, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { projectId } = req.query;
    const whereClause = {};
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const tasks = await Task.findAll({
      where: whereClause,
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['dueDate', 'ASC'], ['createdAt', 'DESC']]
    });

    if (req.user.role !== 'admin') {
      const userProjects = await req.user.getProjects({ attributes: ['id'] });
      const userProjectIds = userProjects.map(p => p.id);
      
      const filteredTasks = tasks.filter(task => userProjectIds.includes(task.projectId));
      return res.json(filteredTasks);
    }

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { title, description, status, priority, dueDate, assignedId, projectId } = req.body;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Associated project not found.' });
    }

    if (assignedId) {
      const user = await User.findByPk(assignedId);
      if (!user) {
        return res.status(404).json({ error: 'Assigned user not found.' });
      }
      const isMember = await project.hasMember(assignedId);
      if (!isMember) {
        await project.addMember(assignedId);
      }
    }

    const task = await Task.create({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate || null,
      assignedId: assignedId || null,
      projectId
    });

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.status(201).json(fullTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (req.user.role === 'admin') {
      const { title, description, status, priority, dueDate, assignedId } = req.body;

      task.title = title !== undefined ? title : task.title;
      task.description = description !== undefined ? description : task.description;
      task.status = status !== undefined ? status : task.status;
      task.priority = priority !== undefined ? priority : task.priority;
      task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
      
      if (assignedId !== undefined) {
        task.assignedId = assignedId;
        if (assignedId) {
          const project = await Project.findByPk(task.projectId);
          const isMember = await project.hasMember(assignedId);
          if (!isMember) {
            await project.addMember(assignedId);
          }
        }
      }

      await task.save();
    } else {
      if (task.assignedId !== req.user.id) {
        return res.status(403).json({ error: 'Access forbidden. You can only update status on tasks assigned to you.' });
      }

      const { status } = req.body;
      if (status === undefined) {
        return res.status(400).json({ error: 'Members can only update task status.' });
      }

      const bodyKeys = Object.keys(req.body);
      const invalidKeys = bodyKeys.filter(k => k !== 'status');
      if (invalidKeys.length > 0) {
        return res.status(403).json({ error: 'Access forbidden. Members can only update the task status.' });
      }

      task.status = status;
      await task.save();
    }

    const fullTask = await Task.findByPk(task.id, {
      include: [
        { model: Project, attributes: ['id', 'name'] },
        { model: User, as: 'Assignee', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.json(fullTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const { id } = req.params;
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await task.destroy();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
