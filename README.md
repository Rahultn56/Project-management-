# Project Task Manager with MongoDB Integration

A full-stack Project/Task Management application built with **Node.js**, **Express**, **MongoDB (Mongoose)** backend, and a **React + Vite** frontend.

---

## 🚀 Features

- **MongoDB Database Integration**: All tasks are stored in MongoDB using Mongoose.
- **Automatic Fallback**: If MongoDB is offline, the server automatically uses an in-memory MongoDB instance so the app always works out of the box.
- **Full CRUD Operations**:
  - ✅ **Create** tasks with title, description, and priority
  - 📋 **Read** tasks with status filtering (All / Pending / Ongoing / Completed)
  - ✏️ **Update** task status and properties
  - 🗑️ **Delete** individual tasks
- **Priority Levels**: Low, Medium, High
- **Status Tracking**: Pending → Ongoing → Completed
- **Responsive UI**: Works on mobile and desktop

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Fallback DB | mongodb-memory-server |
| Utilities | CORS, dotenv, nodemon |

---

## 🛠️ Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Rahultn56/Project-management-.git
cd Project-management-
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables (Optional)
Create a `.env` file (copy from `.env.example`):
```env
PORT=5000

# Local MongoDB:
MONGODB_URI=mongodb://127.0.0.1:27017/taskmanager

# Or MongoDB Atlas Cloud:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskmanager?retryWrites=true&w=majority
```

> If no `.env` is set, the server automatically starts an **in-memory MongoDB** instance.

### 4. Run the Application
```bash
node server.js
```
Then open **http://localhost:5000** in your browser.

---

## 🌐 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Server & DB status |
| GET | /tasks | Get all tasks |
| GET | /tasks?status=Pending | Get filtered tasks |
| POST | /tasks | Create a new task |
| PATCH | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete a task |
| DELETE | /tasks | Delete all completed tasks |

### Example POST request:
```json
{
  "title": "Design database schema",
  "description": "Plan MongoDB collections for the project",
  "priority": "High"
}
```

---

## 🗄️ MongoDB Task Schema

```javascript
{
  title: String (required),
  description: String,
  priority: "Low" | "Medium" | "High",
  status: "Pending" | "Ongoing" | "Completed",
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## ☁️ MongoDB Atlas Setup

1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier).
2. Create a free **M0 cluster**.
3. Add a database user and whitelist your IP.
4. Copy the connection string and set it as `MONGODB_URI` in your `.env` file.
