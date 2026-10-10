import { useState } from "react";

function RoommateMatching({
  students,
  onBack,
  currentStudentId = null
}) {

  const [student1, setStudent1] = useState(
    currentStudentId
      ? currentStudentId.toString()
      : ""
  );

  const [student2, setStudent2] = useState("");
  const [result, setResult] = useState("");
  const [bestMatchResult, setBestMatchResult] = useState("");

  const selectedStudent = students.find(
    (student) =>
      student.id.toString() ===
      student1.toString()
  );

  const compatibleStudents =
    students.filter((student) => {

      if (!selectedStudent) {
        return false;
      }

      return (
        student.id !== selectedStudent.id &&
        student.gender?.toLowerCase() ===
          selectedStudent.gender?.toLowerCase()
      );
    });

  const handleStudent1Change = (event) => {

    setStudent1(event.target.value);
    setStudent2("");
    setResult("");
    setBestMatchResult("");
  };

  const checkMatch = async () => {

    if (!student1 || !student2) {

      setResult(
        "Please select both students."
      );

      return;
    }

    try {

      const response = await fetch(
        `http://localhost:8080/api/matching/${student1}/${student2}`
      );

      const data = await response.text();

      setResult(data);

    } catch (error) {

      console.error(error);

      setResult(
        "Unable to check compatibility."
      );
    }
  };

  const findBestRoommate = async () => {

    if (!student1) {

      setBestMatchResult(
        "Please select a student first."
      );

      return;
    }

    try {

      setBestMatchResult(
        "Finding your best roommate..."
      );

      const response = await fetch(
        `http://localhost:8080/api/matching/best/${student1}`
      );

      const data = await response.text();

      setBestMatchResult(data);

    } catch (error) {

      console.error(error);

      setBestMatchResult(
        "Unable to find roommate. Make sure the backend is running."
      );
    }
  };

  return (
    <div className="data-page">

      <button
        className="back-dashboard"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <h1>
        Roommate Matching
      </h1>

      <div className="data-content matching-box">

        {/* =========================
            BEST ROOMMATE
           ========================= */}

        <div className="best-match-section">

          <h2>
            🤝 Find My Best Roommate
          </h2>

          <p>
            Automatically find the most compatible
            roommate based on gender and lifestyle
            preferences.
          </p>

          <button
            className="match-button"
            onClick={findBestRoommate}
          >
            Find My Best Roommate
          </button>

          {bestMatchResult && (

            <div className="match-result">

              {bestMatchResult}

            </div>

          )}

        </div>


        {/* =========================
            MANUAL COMPATIBILITY
           ========================= */}

        <div className="manual-match-section">

          <h2>
            Check Compatibility
          </h2>

          <p>
            Select two compatible students to
            calculate their roommate compatibility.
          </p>

          <div className="matching-form">

            {/* STUDENT 1 */}

            <div>

              <label>
                Student 1
              </label>

              <select
                value={student1}
                onChange={
                  handleStudent1Change
                }
              >

                <option value="">
                  Select Student
                </option>

                {students.map((student) => (

                  <option
                    key={student.id}
                    value={student.id}
                  >
                    {student.name} -
                    {student.gender} -
                    ID {student.id}
                  </option>

                ))}

              </select>

            </div>


            {/* STUDENT 2 */}

            <div>

              <label>
                Student 2
              </label>

              <select
                value={student2}
                onChange={(event) =>
                  setStudent2(
                    event.target.value
                  )
                }
                disabled={!student1}
              >

                <option value="">
                  {student1
                    ? "Select Compatible Student"
                    : "Select Student 1 First"}
                </option>

                {compatibleStudents.map(
                  (student) => (

                    <option
                      key={student.id}
                      value={student.id}
                    >
                      {student.name} -
                      {student.gender} -
                      ID {student.id}
                    </option>

                  )
                )}

              </select>

            </div>

          </div>

          <button
            className="match-button"
            onClick={checkMatch}
          >
            Check Compatibility
          </button>

          {result && (

            <div className="match-result">
              {result}
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default RoommateMatching;