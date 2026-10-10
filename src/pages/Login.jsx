import { useState } from "react";

function Login({
  onLoginSuccess,
  onBack,
  onRegister,
}) {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (event) => {

    event.preventDefault();

    setMessage("Logging in...");

    try {

      const response = await fetch(
        "http://localhost:8080/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (data.message === "Login successful") {

        setMessage("");

        onLoginSuccess({
          name: data.name,
          role: data.role,
          email: data.email,
        });

      } else {

        setMessage(
          data.message ||
          "Invalid email or password"
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to server"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-box">

        <h1>
          Smart Hostel
        </h1>

        <h2>
          Login
        </h2>

        <p>
          Login as Student or Admin
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <button type="submit">
            Login
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <div className="register-link">

          <p>
            Don't have an account?
          </p>

          <button
            type="button"
            className="register-login-button"
            onClick={onRegister}
          >
            Create Student Account
          </button>

        </div>

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to Home
        </button>

      </div>

    </div>
  );
}

export default Login;