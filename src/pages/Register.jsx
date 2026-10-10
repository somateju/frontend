import { useState } from "react";

function Register({ onBack, onRegistered }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState("");

  const [message, setMessage] = useState("");

  const handleRegister = async (event) => {

    event.preventDefault();

    setMessage("Creating your account...");

    try {

      const response = await fetch(
        "http://localhost:8080/api/students/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            branch,
            year: Number(year),
            gender,
          }),
        }
      );

      const data = await response.text();

      if (
        response.ok &&
        data === "Registration successful"
      ) {

        // Automatically go to Login page
        onRegistered();

      } else {

        setMessage(data);
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to server."
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-box register-box">

        <h1>
          Smart Hostel
        </h1>

        <h2>
          Create Student Account
        </h2>

        <p>
          Register to find your perfect roommate
          and manage your hostel room.
        </p>

        <form onSubmit={handleRegister}>

          <input
            type="text"
            placeholder="Enter full name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            required
          />

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
            placeholder="Create password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          <select
            value={branch}
            onChange={(event) =>
              setBranch(event.target.value)
            }
            required
          >
            <option value="">
              Select Branch
            </option>

            <option value="ECE">
              ECE
            </option>

            <option value="CSE">
              CSE
            </option>

            <option value="EEE">
              EEE
            </option>

            <option value="MECH">
              MECH
            </option>

            <option value="CIVIL">
              CIVIL
            </option>

            <option value="IT">
              IT
            </option>

            <option value="AIML">
              AIML
            </option>

            <option value="DS">
              Data Science
            </option>

          </select>

          <select
            value={year}
            onChange={(event) =>
              setYear(event.target.value)
            }
            required
          >
            <option value="">
              Select Year
            </option>

            <option value="1">
              1st Year
            </option>

            <option value="2">
              2nd Year
            </option>

            <option value="3">
              3rd Year
            </option>

            <option value="4">
              4th Year
            </option>

          </select>

          <select
            value={gender}
            onChange={(event) =>
              setGender(event.target.value)
            }
            required
          >
            <option value="">
              Select Gender
            </option>

            <option value="Female">
              Female
            </option>

            <option value="Male">
              Male
            </option>

          </select>

          <button type="submit">
            Create Account
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

      </div>

    </div>
  );
}

export default Register;