# 🚀 TaskFlow | Premium Team Task Manager (Full-Stack)

TaskFlow is a state-of-the-art, visually stunning full-stack Team Task Manager. It is designed with a premium, responsive dark-mode **glassmorphic** UI utilizing **Vanilla CSS** for precise aesthetic control. The application features robust role-based access control (RBAC), multi-user project/team assignments, and automated task tracking.

---

## 🚀 Key Features

*   **Secure Authentication (JWT + Password Hashing)**: Secure JWT-based credentials with automatic cookie/local-storage persistence.
*   **Role-Based Access Control (RBAC)**:
    *   **Admin**: Full authority to initialize workspaces (Projects), assign and modify tasks, edit/delete resources, and search/manage team members.
    *   **Member**: View assigned workspaces, track own responsibilities, and update the status of tasks explicitly assigned to them.
*   **Command Center (Dashboard)**:
    *   **Circular Efficiency Gauge**: Real-time interactive SVG meter showing completed task ratios.
    *   **Priority Breakdown Tracker**: Relative distribution indicators for High, Medium, and Low tasks.
    *   **Critical Actions Panel**: Highlighting overdue tasks that require immediate attention.
*   **Dynamic Kanban Board**: 4-stage flow board (To Do, In Progress, Review, Completed) with quick-action status transition toggles.
*   **Structured Task List**: Traditional tabular list view with live filtering by Priority, Status, and Assignee (e.g. "Assigned to me").
*   **Self-Contained SQLite Relational DB**: Fully configured zero-installation relational schema utilizing **Sequelize ORM** with foreign keys, data constraints, and cascading deletes.

---

## ⚡ Quick Start Instructions

Follow these simple steps to run both the REST API and the React frontend locally on your machine.

### 1. Prerequisite
Ensure you have [Node.js](https://nodejs.org/) installed (v16.x or newer is recommended).

### 2. Start the Backend API Server
Open a terminal in the project directory and run:
```bash
cd server
npm install
npm start
```
*The server will spin up on **`http://localhost:5000`** and automatically sync the SQLite database. If the database is empty, it will auto-seed with fully configured demo accounts, projects, and tasks.*

### 3. Start the Frontend Client
Open a second terminal in the project directory and run:
```bash
cd client
npm install
npm run dev
```
*The React Vite development server will start on **`http://localhost:3000`**. You can open this URL in your web browser.*

---

## 🔑 Pre-Seeded Test Credentials

To facilitate immediate evaluation, the SQLite database auto-seeds with two pre-loaded roles. You can click the **⚡ Quick Demo Logins** buttons on the login card to log in instantly:

### 1. System Admin Account
*   **Email**: `admin@taskflow.com`
*   **Password**: `admin123`
*   **Capabilities**: Full workspace control. Try creating a project, assigning members to projects, or creating/editing tasks!

### 2. Team Member Account
*   **Email**: `member@taskflow.com`
*   **Password**: `member123`
*   **Capabilities**: Project overview and task tracking. Try moving task stages on tasks assigned to you, and observe that you are restricted from modifying other fields or managing teams!

---

## 🛠️ Architecture & Relational Schema

TaskFlow is organized into two distinct modules:

*   **`server/`**: Express API server with SQLite.
    *   `db.js`: Database connector.
    *   `models/`: Sequelize schemas defining User, Project, and Task relations with cascade behaviors.
    *   `routes/`: Modular endpoints (`auth.js`, `projects.js`, `tasks.js`, `users.js`).
    *   `middleware/`: Authorization filters validating tokens and enforcing role limits.
*   **`client/`**: React SPA initialized with Vite.
    *   `src/index.css`: Glassmorphic styling system using modern CSS Variables, glow borders, and custom scrollbars.
    *   `src/context/AppContext.jsx`: Context provider handling state and API communications.
    *   `src/components/`: Modular dashboard widgets, board columns, list filters, and overlay modal forms.

---

## 🛡️ Access Policy Details (RBAC Constraints)

*   **Project Actions**:
    *   `POST /api/projects` (Create), `PUT /api/projects/:id` (Edit), `DELETE /api/projects/:id` (Delete): Enforced **Admin Only**.
    *   `POST /api/projects/:id/members` (Assign Member): Enforced **Admin Only**.
*   **Task Actions**:
    *   `POST /api/tasks` (Create), `DELETE /api/tasks/:id` (Delete): Enforced **Admin Only**.
    *   `PUT /api/tasks/:id` (Edit/Update):
        *   **Admin**: Can edit all fields (Assignee, title, due date, description, status).
        *   **Member**: Can **only** modify the `status` field, and only if the task's `assignedId` matches their logged User ID.
