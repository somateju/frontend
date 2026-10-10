import { useState } from "react";
import "./App.css";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";

function App() {

  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (loginData) => {

    setUser(loginData);

    if (loginData.role === "ADMIN") {

      setPage("admin");

    } else {

      setPage("student");
    }
  };

  const handleLogout = () => {

    setUser(null);
    setPage("home");
  };

  if (page === "home") {

    return (
      <Home
        onLogin={() =>
          setPage("login")
        }
        onRegister={() =>
          setPage("register")
        }
      />
    );
  }

  if (page === "login") {

    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onBack={() =>
          setPage("home")
        }
        onRegister={() =>
          setPage("register")
        }
      />
    );
  }

  if (page === "register") {

    return (
      <Register
        onBack={() =>
          setPage("home")
        }
        onRegistered={() =>
          setPage("login")
        }
      />
    );
  }

  if (page === "admin") {

    return (
      <AdminDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  if (page === "student") {

    return (
      <StudentDashboard
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  return null;
}

export default App;