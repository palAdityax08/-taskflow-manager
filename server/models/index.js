import sequelize from '../db.js';
import User from './User.js';
import Project from './Project.js';
import Task from './Task.js';

Project.belongsTo(User, { as: 'Owner', foreignKey: 'ownerId' });
User.hasMany(Project, { as: 'OwnedProjects', foreignKey: 'ownerId' });

Project.belongsToMany(User, { 
  through: 'ProjectMembers', 
  as: 'Members', 
  foreignKey: 'projectId',
  otherKey: 'userId'
});
User.belongsToMany(Project, { 
  through: 'ProjectMembers', 
  as: 'Projects', 
  foreignKey: 'userId',
  otherKey: 'projectId'
});

Project.hasMany(Task, { 
  foreignKey: 'projectId', 
  onDelete: 'CASCADE' 
});
Task.belongsTo(Project, { 
  foreignKey: 'projectId' 
});

Task.belongsTo(User, { 
  as: 'Assignee', 
  foreignKey: 'assignedId' 
});
User.hasMany(Task, { 
  as: 'AssignedTasks', 
  foreignKey: 'assignedId' 
});

export {
  sequelize,
  User,
  Project,
  Task
};
