
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import "./App.css";

// Backend API URL
const API_URL = "https://taskgrid-server.onrender.com";

function App() {
  // =========================================================
  // AUTHENTICATION STATE
  // =========================================================

  const [token, setToken] = useState(
    localStorage.getItem("token") || ""
  );

  // Controls Login / Registration
  const [isRegistering, setIsRegistering] = useState(false);

  // Controls password reset screens
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);

  // Stores password reset token
  const [resetToken, setResetToken] = useState("");

  // New password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Authentication form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Controls password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Delete account
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // =========================================================
  // TASK STATE
  // =========================================================

  const [tasks, setTasks] = useState([]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [loadingTasks, setLoadingTasks] = useState(false);

  // =========================================================
  // FUNCTION: Fetch all pending tasks
  // =========================================================

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);

      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to fetch tasks.");
        return;
      }

      setTasks(data);
    } catch (error) {
      alert("Unable to fetch tasks.");
    } finally {
      setLoadingTasks(false);
    }
  };

  // =========================================================
  // FUNCTION: Fetch tasks when user logs in
  // =========================================================

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // =========================================================
  // FUNCTION: Detect password reset link
  // =========================================================

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const tokenFromUrl = params.get("resetToken");

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl);
      setIsResetPassword(true);
      setIsForgotPassword(false);
      setIsRegistering(false);
    }
  }, []);

  // =========================================================
  // FUNCTION: Create a new task
  // =========================================================

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!taskTitle.trim()) {
      alert("Please enter a task title.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to create task.");
        return;
      }

      setTasks((previousTasks) => [
        data,
        ...previousTasks
      ]);

      setTaskTitle("");
      setTaskDescription("");
    } catch (error) {
      alert("Unable to create task.");
    }
  };

  // =========================================================
  // FUNCTION: Mark task as completed
  // =========================================================

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}/done`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to complete task.");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (error) {
      alert("Unable to complete task.");
    }
  };

  // =========================================================
  // FUNCTION: Delete task
  // =========================================================

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete task.");
        return;
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (error) {
      alert("Unable to delete task.");
    }
  };

  // =========================================================
  // FUNCTION: Forgot Password
  // =========================================================

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to process password reset request."
        );
        return;
      }

      alert(
        data.message ||
        "Password reset link has been sent to your email."
      );
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  // =========================================================
  // FUNCTION: Reset Password
  // =========================================================

  const handleResetPassword = async (event) => {
    event.preventDefault();

    // Check whether passwords match
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Check minimum password length
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/reset-password`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            token: resetToken,
            newPassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Password reset failed."
        );
        return;
      }

      alert(
        "Password reset successfully. You can now login."
      );

      // Clear reset form
      setNewPassword("");
      setConfirmPassword("");
      setResetToken("");

      // Remove resetToken from URL
      window.history.replaceState(
        {},
        document.title,
        "/"
      );

      // Return to login screen
      setIsResetPassword(false);
      setIsForgotPassword(false);
      setIsRegistering(false);
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  // =========================================================
  // FUNCTION: Delete current user's account
  // =========================================================

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter your password.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account and all your tasks?"
    );

    if (!confirmed) {
      return;
    }

    try {
      // Decode JWT payload
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      const response = await fetch(
        `${API_URL}/api/auth/delete-account`,
        {
          method: "DELETE",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            userId: payload.userId,
            password: deletePassword
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Failed to delete account."
        );
        return;
      }

      // Remove login token
      localStorage.removeItem("token");

      // Clear application state
      setToken("");
      setTasks([]);
      setEmail("");
      setPassword("");
      setDeletePassword("");
      setShowDeleteAccount(false);

      alert("Account deleted successfully.");
    } catch (error) {
      alert("Unable to delete account.");
    }
  };

  // =========================================================
  // FUNCTION: Logout
  // =========================================================

  const handleLogout = () => {
    // Remove JWT token
    localStorage.removeItem("token");

    // Clear React state
    setToken("");
    setTasks([]);

    // Clear login fields
    setEmail("");
    setPassword("");

    // Hide password
    setShowPassword(false);
  };

  // =========================================================
  // FUNCTION: Login / Registration
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Choose endpoint
    const endpoint = isRegistering
      ? "/api/auth/register"
      : "/api/auth/login";

    // Prepare request body
    const body = isRegistering
      ? {
          name,
          email,
          password
        }
      : {
          email,
          password
        };

    try {
      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(body)
        }
      );

      const data = await response.json();

      // =====================================================
      // ERROR RESPONSE
      // =====================================================

      if (!response.ok) {
        if (isRegistering) {
          alert(
            data.message ||
            "Registration failed."
          );
        } else {
          alert(
            data.message ||
            "Invalid email or password."
          );
        }

        return;
      }

      // =====================================================
      // REGISTRATION SUCCESS
      // =====================================================

      if (isRegistering) {
        alert(
          data.message ||
          "Account created successfully. Please login."
        );

        // Clear registration form
        setName("");
        setEmail("");
        setPassword("");

        // Hide password
        setShowPassword(false);

        // Switch to Login
        setIsRegistering(false);

        return;
      }

      // =====================================================
      // LOGIN SUCCESS
      // =====================================================

      localStorage.setItem(
        "token",
        data.token
      );

      // Update React state
      setToken(data.token);

      // Clear password
      setPassword("");

      // Hide password
      setShowPassword(false);
    } catch (error) {
      alert("Unable to connect to the server.");
    }
  };

  // =========================================================
  // USER INTERFACE
  // =========================================================

  return (
    <div className="app">

      {!token ? (

        // =====================================================
        // AUTHENTICATION SCREEN
        // =====================================================

        <div className="auth-card">

          <h1>TaskGrid</h1>

          <p className="subtitle">
            {isResetPassword
              ? "Create a new password"
              : isForgotPassword
              ? "Reset your password"
              : isRegistering
              ? "Create your account"
              : "Manage your daily tasks"}
          </p>

          {/* =================================================
              RESET PASSWORD
              ================================================= */}

          {isResetPassword ? (

            <form onSubmit={handleResetPassword}>

              <div className="form-group">

                <label>New Password</label>

                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              <div className="form-group">

                <label>Confirm Password</label>

                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  required
                />

              </div>

              <button
                type="submit"
                className="primary-btn"
              >
                Reset Password
              </button>

            </form>

          ) : isForgotPassword ? (

            // =================================================
            // FORGOT PASSWORD
            // =================================================

            <form onSubmit={handleForgotPassword}>

              <div className="form-group">

                <label>Email</label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              <button
                type="submit"
                className="primary-btn"
              >
                Send Reset Link
              </button>

            </form>

          ) : (

            // =================================================
            // LOGIN / REGISTRATION
            // =================================================

            <form onSubmit={handleSubmit}>

              {/* Name */}
              {isRegistering && (

                <div className="form-group">

                  <label>Name</label>

                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              )}

              {/* Email */}
              <div className="form-group">

                <label>Email</label>

                <div className="input-wrapper">

                  <span className="input-icon">
                    ✉
                  </span>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    required
                  />

                </div>

              </div>

              {/* Password */}
              <div className="form-group">

                <label>Password</label>

                <div className="input-wrapper">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    required
                  />

                 <button
  type="button"
  className="password-toggle"
  onClick={() => setShowPassword(!showPassword)}
  aria-label={showPassword ? "Hide password" : "Show password"}
>
  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
</button>

                </div>

              </div>

              {/* Login / Register */}
              <button
                type="submit"
                className="primary-btn"
              >
                {isRegistering
                  ? "Create Account"
                  : "Login"}
              </button>

            </form>
          )}

          {/* =================================================
              FORGOT PASSWORD LINK
              ================================================= */}

          {!isRegistering &&
            !isForgotPassword &&
            !isResetPassword && (

              <button
                className="forgot-password-btn"
                onClick={() => {
                  setIsForgotPassword(true);
                }}
              >
                Forgot Password?
              </button>

            )}

          {/* =================================================
              BACK TO LOGIN
              ================================================= */}

          {(isForgotPassword ||
            isResetPassword) && (

            <button
              className="switch-btn"
              onClick={() => {

                setIsForgotPassword(false);
                setIsResetPassword(false);

                setNewPassword("");
                setConfirmPassword("");

                window.history.replaceState(
                  {},
                  document.title,
                  "/"
                );
              }}
            >
              Back to Login
            </button>

          )}

          {/* =================================================
              LOGIN / REGISTER SWITCH
              ================================================= */}

          {!isForgotPassword &&
            !isResetPassword && (

              <button
                className="switch-btn"
                onClick={() => {

                  setIsRegistering(
                    !isRegistering
                  );

                  setName("");
                  setEmail("");
                  setPassword("");
                }}
              >
                {isRegistering
                  ? "Already have an account? Login"
                  : "Don't have an account? Register"}
              </button>

            )}

        </div>

      ) : (

        // =====================================================
        // TaskGrid DASHBOARD
        // =====================================================

        <div className="dashboard">

          {/* Dashboard header */}
          <header className="dashboard-header">

            <div>

              <h1>TaskGrid</h1>

              <p>
                Manage your daily tasks
              </p>

            </div>

            {/* Account actions */}
            <div className="account-actions">

              <button
                className="delete-account-btn"
                onClick={() => {
                  setShowDeleteAccount(
                    !showDeleteAccount
                  );

                  setDeletePassword("");
                }}
              >
                Delete Account
              </button>

              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>

            </div>

          </header>

          {/* =================================================
              DELETE ACCOUNT PANEL
              ================================================= */}

          {showDeleteAccount && (

            <div className="delete-account-panel">

              <h3>
                Delete Account
              </h3>

              <p>
                This will permanently delete your
                account and all your tasks. This
                action cannot be undone.
              </p>

              <input
                type="password"
                placeholder="Enter your current password"
                value={deletePassword}
                onChange={(event) =>
                  setDeletePassword(
                    event.target.value
                  )
                }
              />

              <div className="delete-account-actions">

                <button
                  className="secondary-btn"
                  onClick={() => {
                    setShowDeleteAccount(false);
                    setDeletePassword("");
                  }}
                >
                  Cancel
                </button>

                <button
                  className="delete-confirm-btn"
                  onClick={handleDeleteAccount}
                >
                  Permanently Delete
                </button>

              </div>

            </div>
          )}

          {/* =================================================
              DASHBOARD CONTENT
              ================================================= */}

          <main className="dashboard-content">

            <section className="task-card">

              {/* Task heading */}
              <div className="task-card-header">

                <div>

                  <h2>
                    Today's Tasks
                  </h2>

                  <p>
                    Keep track of what needs to be done.
                  </p>

                </div>

                {/* Task count */}
                <span className="task-count">
                  {tasks.length}
                </span>

              </div>

              {/* =================================================
                  CREATE TASK
                  ================================================= */}

              <form
                className="task-form"
                onSubmit={handleCreateTask}
              >

                <input
                  type="text"
                  placeholder="What do you need to do?"
                  value={taskTitle}
                  onChange={(event) =>
                    setTaskTitle(
                      event.target.value
                    )
                  }
                />

                <input
                  type="text"
                  placeholder="Description (optional)"
                  value={taskDescription}
                  onChange={(event) =>
                    setTaskDescription(
                      event.target.value
                    )
                  }
                />

                <button
                  type="submit"
                  className="primary-btn"
                >
                  Add Task
                </button>

              </form>

              {/* =================================================
                  TASK LIST
                  ================================================= */}

              <div className="task-list">

                {loadingTasks ? (

                  <p className="empty-message">
                    Loading tasks...
                  </p>

                ) : tasks.length === 0 ? (

                  <p className="empty-message">
                    No pending tasks. You're all caught up!
                  </p>

                ) : (

                  tasks.map((task) => (

                    <div
                      className="task-item"
                      key={task._id}
                    >

                      {/* Task information */}
                      <div className="task-info">

                        <h3>
                          {task.title}
                        </h3>

                        {task.description && (

                          <p>
                            {task.description}
                          </p>

                        )}

                      </div>

                      {/* Task actions */}
                      <div className="task-actions">

                        {/* Complete */}
                        <button
                          className="done-btn"
                          onClick={() =>
                            handleCompleteTask(
                              task._id
                            )
                          }
                        >
                          Done
                        </button>

                        {/* Delete */}
                        <button
                          className="delete-btn"
                          onClick={() =>
                            handleDeleteTask(
                              task._id
                            )
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  ))

                )}

              </div>

            </section>

          </main>

        </div>

      )}

    </div>
  );
}

export default App;
