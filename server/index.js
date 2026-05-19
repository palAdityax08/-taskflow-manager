import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, User, Project, Task } from './models/index.js';

import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import userRoutes from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow REST API is fully functional!' });
});

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const initializeDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    
    const userCount = await User.count();
    if (userCount === 0) {
      const salt = await bcrypt.genSalt(10);
      const adminPass = await bcrypt.hash('admin123', salt);
      const memberPass = await bcrypt.hash('member123', salt);

      const admin = await User.create({
        name: 'Alex Admin',
        email: 'admin@taskflow.com',
        password: adminPass,
        role: 'admin',
      });

      const member1 = await User.create({
        name: 'Sarah Member',
        email: 'member@taskflow.com',
        password: memberPass,
        role: 'member',
      });

      const member2 = await User.create({
        name: 'John Developer',
        email: 'john@taskflow.com',
        password: memberPass,
        role: 'member',
      });

      const project1 = await Project.create({
        name: 'TaskFlow Web Application',
        description: 'Building a beautiful glassmorphic full-stack web application with React and SQLite.',
        ownerId: admin.id,
      });

      const project2 = await Project.create({
        name: 'Enterprise Security Audit',
        description: 'Assessing system vulnerabilities, upgrading SSL configurations, and establishing role-based permissions.',
        ownerId: admin.id,
      });

      await project1.addMembers([admin.id, member1.id, member2.id]);
      await project2.addMembers([admin.id, member1.id]);

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 2);

      await Task.create({
        title: 'Design CSS Variables & Glassmorphism styles',
        description: 'Define glowing color scheme, backdrop blur settings, and layouts.',
        status: 'completed',
        priority: 'high',
        dueDate: yesterday.toISOString().split('T')[0],
        assignedId: member1.id,
        projectId: project1.id,
      });

      await Task.create({
        title: 'Establish Relational Sequelize DB Models',
        description: 'Create SQLite tables for Users, Projects, Tasks with automatic migrations.',
        status: 'completed',
        priority: 'medium',
        dueDate: today.toISOString().split('T')[0],
        assignedId: admin.id,
        projectId: project1.id,
      });

      await Task.create({
        title: 'Build Front-end Dashboard Analytics Screen',
        description: 'Implement dynamic widgets displaying task breakdowns, priority bars, and status counts.',
        status: 'in_progress',
        priority: 'high',
        dueDate: tomorrow.toISOString().split('T')[0],
        assignedId: member1.id,
        projectId: project1.id,
      });

      await Task.create({
        title: 'Integrate Project Members Assignment modal',
        description: 'Allow admins to search and add users to current workspace teams.',
        status: 'todo',
        priority: 'medium',
        dueDate: nextWeek.toISOString().split('T')[0],
        assignedId: member2.id,
        projectId: project1.id,
      });

      await Task.create({
        title: 'System Penetration Testing & Report',
        description: 'Perform black-box security scanning on external APIs.',
        status: 'in_progress',
        priority: 'high',
        dueDate: yesterday.toISOString().split('T')[0],
        assignedId: member1.id,
        projectId: project2.id,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await initializeDatabase();
});
