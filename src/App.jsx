import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    setLoading(true);
    try {
      const url = filter !== "All" ? `${API}?status=${filter}` : API;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Could not load tasks");
      setTasks(await response.json());
      setError("");
    } catch {
      setError("❌ Cannot connect to the backend server. Please run: node server.js");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [filter]);

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), priority }),
      });
      if (!response.ok) throw new Error("Could not add task");
      const newTask = await response.json();
      setTasks((prev) => [newTask, ...prev]);
      setTitle("");
      setDescription("");
      setPriority("Medium");
      setError("");
    } catch {
      setError("❌ Failed to add task. Check your backend.");
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(`${API}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Update failed");
      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
    } catch {
      setError("❌ Failed to update task status.");
    }
  }

  async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;
    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch {
      setError("❌ Failed to delete task.");
    }
  }

  const statusColors = { Pending: "pending", Ongoing: "ongoing", Completed: "completed" };
  const priorityColors = { Low: "low", Medium: "medium", High: "high" };

  return (
    <div className="app">
      <header>
        <h1>📋 Project Task Manager</h1>
        <p>Connected to MongoDB — All tasks are stored in the database</p>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <form className="task-form" onSubmit={addTask}>
        <div className="form-row">
          <input
            type="text"
            placeholder="Task title (required)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="Low">🟢 Low Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="High">🔴 High Priority</option>
          </select>
          <button type="submit">+ Add Task</button>
        </div>
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="desc-input"
        />
      </form>

      <div className="filter-bar">
        {["All", "Pending", "Ongoing", "Completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-btn ${filter === f ? "active" : ""}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading">Loading tasks from MongoDB...</p>
      ) : tasks.length === 0 ? (
        <p className="empty">No tasks found. Add your first task above!</p>
      ) : (
        <>
          <h2>Tasks ({tasks.length})</h2>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task._id} className="task">
                <div className="task-info">
                  <strong>{task.title}</strong>
                  {task.description && <span className="desc">{task.description}</span>}
                  <div className="meta">
                    <span className={`priority ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className={`status ${statusColors[task.status]}`}>
                      {task.status}
                    </span>
                    <span className="date">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="actions">
                  <select
                    value={task.status}
                    onChange={(e) => updateStatus(task._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button className="delete" onClick={() => deleteTask(task._id)} title="Delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
