import express from 'express';
import { Project, User, Task } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    let projects;
    
    if (req.user.role === 'admin') {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'role'] },
          { model: User, as: 'Members', attributes: ['id', 'name', 'email', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      projects = await Project.findAll({
        include: [
          { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'role'] },
          { 
            model: User, 
            as: 'Members', 
            attributes: ['id', 'name', 'email', 'role'],
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      projects = projects.filter(p => 
        p.ownerId === req.user.id || 
        p.Members.some(m => m.id === req.user.id)
      );
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'Members', attributes: ['id', 'name', 'email', 'role'] },
        { 
          model: Task,
          include: [{ model: User, as: 'Assignee', attributes: ['id', 'name', 'email', 'role'] }]
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const isMember = project.Members.some(m => m.id === req.user.id);
    if (req.user.role !== 'admin' && project.ownerId !== req.user.id && !isMember) {
      return res.status(403).json({ error: 'Access denied to this project.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description,
      ownerId: req.user.id
    });

    await project.addMember(req.user.id);

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'Members', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.status(201).json(fullProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    project.name = name || project.name;
    project.description = description !== undefined ? description : project.description;
    await project.save();

    const fullProject = await Project.findByPk(project.id, {
      include: [
        { model: User, as: 'Owner', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'Members', attributes: ['id', 'name', 'email', 'role'] }
      ]
    });

    res.json(fullProject);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    await project.destroy();
    res.json({ message: 'Project and all related tasks deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/members', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    await project.addMember(userId);

    const members = await project.getMembers({ attributes: ['id', 'name', 'email', 'role'] });
    res.json({ message: 'Member added successfully.', members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id/members/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id, userId } = req.params;

    const project = await Project.findByPk(id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    if (project.ownerId === parseInt(userId)) {
      return res.status(400).json({ error: 'Cannot remove the project owner from the team.' });
    }

    await project.removeMember(userId);

    const members = await project.getMembers({ attributes: ['id', 'name', 'email', 'role'] });
    res.json({ message: 'Member removed successfully.', members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
