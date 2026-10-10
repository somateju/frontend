import { useEffect, useState } from "react";

function StudentPreferences({ user, onBack }) {

  const [studentId, setStudentId] = useState(null);

  const [sleepSchedule, setSleepSchedule] = useState("");
  const [studyHabit, setStudyHabit] = useState("");
  const [cleanliness, setCleanliness] = useState("");
  const [foodPreference, setFoodPreference] = useState("");
  const [smokingPreference, setSmokingPreference] = useState("");
  const [roomType, setRoomType] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  /* =========================
     LOAD STUDENT + PREFERENCES
     ========================= */

  useEffect(() => {

    const loadData = async () => {

      try {

        // Get students
        const studentsResponse =
          await fetch(
            "http://localhost:8080/api/students"
          );

        const students =
          await studentsResponse.json();

        // Find logged-in student
        const student =
          students.find(
            (item) =>
              item.email === user?.email
          );

        if (!student) {

          setMessage(
            "Student information not found."
          );

          setLoading(false);
          return;
        }

        setStudentId(student.id);

        // Get saved preferences
        const preferencesResponse =
          await fetch(
            "http://localhost:8080/api/preferences"
          );

        const preferences =
          await preferencesResponse.json();

        // Find this student's preference
        const existingPreference =
          preferences.find(
            (item) =>
              item.student?.id === student.id
          );

        // Load saved values into form
        if (existingPreference) {

          setSleepSchedule(
            existingPreference.sleepSchedule || ""
          );

          setStudyHabit(
            existingPreference.studyHabit || ""
          );

          setCleanliness(
            existingPreference.cleanliness || ""
          );

          setFoodPreference(
            existingPreference.foodPreference || ""
          );

          setSmokingPreference(
            existingPreference.smokingPreference || ""
          );

          setRoomType(
            existingPreference.roomType || ""
          );
        }

        setLoading(false);

      } catch (error) {

        console.error(
          "Error loading preferences:",
          error
        );

        setMessage(
          "Unable to load preferences."
        );

        setLoading(false);
      }
    };

    loadData();

  }, [user]);

  /* =========================
     SAVE / UPDATE PREFERENCES
     ========================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (!studentId) {

      setMessage(
        "Student information not found."
      );

      return;
    }

    const preferenceData = {

      sleepSchedule,
      studyHabit,
      cleanliness,
      foodPreference,
      smokingPreference,
      roomType,

      student: {
        id: studentId
      }
    };

    try {

      setMessage(
        "Saving preferences..."
      );

      const response =
        await fetch(
          "http://localhost:8080/api/preferences",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(
                preferenceData
              )
          }
        );

      if (response.ok) {

        setMessage(
          "Preferences saved successfully!"
        );

      } else {

        setMessage(
          "Failed to save preferences."
        );
      }

    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to connect to server."
      );
    }
  };

  /* =========================
     LOADING
     ========================= */

  if (loading) {

    return (
      <div className="data-page">

        <button
          className="back-dashboard"
          onClick={onBack}
        >
          ← Back to Dashboard
        </button>

        <h1>
          My Preferences
        </h1>

        <div className="data-content">

          <p>
            Loading your preferences...
          </p>

        </div>

      </div>
    );
  }

  /* =========================
     PAGE
     ========================= */

  return (
    <div className="data-page">

      <button
        className="back-dashboard"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <h1>
        My Preferences
      </h1>

      <div className="data-content">

        <div className="preference-box">

          <h2>
            Roommate Preferences
          </h2>

          <p>
            Select your lifestyle preferences
            to help us find a compatible roommate.
          </p>

          <form
            className="preference-form"
            onSubmit={handleSubmit}
          >

            {/* SLEEP */}

            <div className="preference-field">

              <label>
                Sleep Schedule
              </label>

              <select
                value={sleepSchedule}
                onChange={(event) =>
                  setSleepSchedule(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="Early">
                  Early Sleeper
                </option>

                <option value="Late">
                  Late Sleeper
                </option>

              </select>

            </div>

            {/* STUDY */}

            <div className="preference-field">

              <label>
                Study Habit
              </label>

              <select
                value={studyHabit}
                onChange={(event) =>
                  setStudyHabit(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="Quiet">
                  Quiet Environment
                </option>

                <option value="Group">
                  Group Study
                </option>

              </select>

            </div>

            {/* CLEANLINESS */}

            <div className="preference-field">

              <label>
                Cleanliness
              </label>

              <select
                value={cleanliness}
                onChange={(event) =>
                  setCleanliness(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="High">
                  High
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Low">
                  Low
                </option>

              </select>

            </div>

            {/* FOOD */}

            <div className="preference-field">

              <label>
                Food Preference
              </label>

              <select
                value={foodPreference}
                onChange={(event) =>
                  setFoodPreference(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="Veg">
                  Vegetarian
                </option>

                <option value="Non-Veg">
                  Non-Vegetarian
                </option>

              </select>

            </div>

            {/* SMOKING */}

            <div className="preference-field">

              <label>
                Smoking Preference
              </label>

              <select
                value={smokingPreference}
                onChange={(event) =>
                  setSmokingPreference(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="No">
                  Non-Smoking
                </option>

                <option value="Yes">
                  Smoking
                </option>

              </select>

            </div>

            {/* ROOM TYPE */}

            <div className="preference-field">

              <label>
                Room Type
              </label>

              <select
                value={roomType}
                onChange={(event) =>
                  setRoomType(
                    event.target.value
                  )
                }
                required
              >

                <option value="">
                  Select
                </option>

                <option value="2-sharing">
                  2 Sharing
                </option>

                <option value="3-sharing">
                  3 Sharing
                </option>

                <option value="4-sharing">
                  4 Sharing
                </option>

              </select>

            </div>

            <button
              type="submit"
              className="match-button"
            >
              Save Preferences
            </button>

          </form>

          {message && (

            <div className="match-result">
              {message}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default StudentPreferences;