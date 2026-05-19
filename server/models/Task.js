import { DataTypes } from 'sequelize';
import sequelize from '../db.js';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 150],
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'todo',
    validate: {
      isIn: [['todo', 'in_progress', 'review', 'completed']],
    },
  },
  priority: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'medium',
    validate: {
      isIn: [['low', 'medium', 'high']],
    },
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

export default Task;
