
import { useEffect, useState } from "react";

const API = "http://localhost:8080/api/matching";

function RoommateMatching({
  students = [],
  onBack,
  currentStudentId = null
}) {
  const isStudentView =
    currentStudentId !== null &&
    currentStudentId !== undefined &&
    String(currentStudentId).trim() !== "";

  const [bestMatch, setBestMatch] = useState(null);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isStudentView) {
      loadStudentMatches(currentStudentId);
    } else {
      loadAdminMatches();
    }
  }, [currentStudentId, isStudentView, students]);

  async function readResponse(response) {
    const text = await response.text();

    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  function normalizeMatch(data) {
    if (!data || typeof data !== "object") return null;

    const student =
      data.student ||
      data.matchedStudent ||
      data.match ||
      data;

    const id =
      data.studentId ??
      data.matchedStudentId ??
      student.studentId ??
      student.id;

    if (id == null) return null;

    return {
      studentId: id,
      name: data.name ?? student.name ?? "Student",
      branch: data.branch ?? student.branch ?? "",
      year: data.year ?? student.year ?? "",
      compatibility:
        data.compatibility ??
        data.compatibilityScore ??
        data.score ??
        0
    };
  }

  async function getBestMatch(studentId) {
    const response = await fetch(`${API}/best/${studentId}`);
    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        typeof data === "string"
          ? data
          : data?.message || `Could not find a match for student ${studentId}.`
      );
    }

    return normalizeMatch(
      data?.bestMatch ??
      data?.match ??
      data?.data ??
      data
    );
  }

  async function loadStudentMatches(studentId) {
    setLoading(true);
    setMessage("");
    setBestMatch(null);
    setAllMatches([]);

    try {
      const [bestResponse, allResponse] = await Promise.all([
        fetch(`${API}/best/${studentId}`),
        fetch(`${API}/all/${studentId}`)
      ]);

      const [bestData, allData] = await Promise.all([
        readResponse(bestResponse),
        readResponse(allResponse)
      ]);

      if (!bestResponse.ok && !allResponse.ok) {
        throw new Error(
          "Unable to load matches. Please check your saved preferences."
        );
      }

      const list = Array.isArray(allData)
        ? allData
        : allData?.matches ?? allData?.data ?? [];

      const matches = Array.isArray(list)
        ? list.map(normalizeMatch).filter(Boolean)
        : [];

      setAllMatches(matches);

      const best = bestResponse.ok
        ? normalizeMatch(
            bestData?.bestMatch ??
            bestData?.match ??
            bestData?.data ??
            bestData
          )
        : null;

      if (best) {
        setBestMatch(best);
      } else if (matches.length > 0) {
        setBestMatch(matches[0]);
      } else {
        setMessage(
          "No eligible roommate found. Check that other students have saved their preferences and meet the matching rules."
        );
      }
    } catch (error) {
      console.error("Student matching error:", error);
      setMessage(error.message || "Unable to load roommate matches.");
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminMatches() {
    setLoading(true);
    setMessage("");
    setAllMatches([]);

    try {
      if (!Array.isArray(students) || students.length === 0) {
        setMessage("No students are available to match yet.");
        return;
      }

      // Automatically find the best roommate for every student.
      const results = await Promise.all(
        students.map(async student => {
          try {
            const match = await getBestMatch(student.id);

            if (!match) return null;

            // Exclude invalid self-matches.
            if (String(match.studentId) === String(student.id)) {
              return null;
            }

            // Confirm that the matched student exists in the student list.
            const matchedStudent = students.find(
              item => String(item.id) === String(match.studentId)
            );

            if (!matchedStudent) return null;

            // Apply a gender eligibility check in the UI too.
            if (
              student.gender &&
              matchedStudent.gender &&
              student.gender.toLowerCase() !==
                matchedStudent.gender.toLowerCase()
            ) {
              return null;
            }

            return {
              studentId: student.id,
              studentName: student.name,
              gender: student.gender || "Not set",
              roommateId: match.studentId,
              roommateName: matchedStudent.name || match.name,
              compatibility: match.compatibility,
              branch: matchedStudent.branch || match.branch || "",
              year: matchedStudent.year ?? match.year ?? ""
            };
          } catch (error) {
            console.warn(
              `Matching unavailable for student ${student.id}:`,
              error.message
            );
            return null;
          }
        })
      );

      const validMatches = results
        .filter(Boolean)
        .sort(
          (a, b) =>
            Number(b.compatibility) - Number(a.compatibility)
        );

      setAllMatches(validMatches);

      if (validMatches.length === 0) {
        setMessage(
          "No automatic matches were found. Make sure students have saved complete preferences and that the backend matching API is working."
        );
      }
    } catch (error) {
      console.error("Admin matching error:", error);
      setMessage("Unable to load automatic roommate matches.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="data-page">
      <button className="back-dashboard" onClick={onBack}>
        ← Back to Dashboard
      </button>

      <h1>Automatic Roommate Matching</h1>

      <div className="data-content matching-box">
        {isStudentView ? (
          <>
            <h2>Your Best Roommate</h2>
            <p>
              Your best eligible roommate is found automatically from
              your saved preferences.
            </p>

            <button
              className="match-button"
              onClick={() => loadStudentMatches(currentStudentId)}
              disabled={loading}
            >
              {loading ? "Finding Matches..." : "Refresh Matches"}
            </button>

            {loading && <p>Comparing preferences...</p>}

            {message && (
              <div className="match-result" role="status">
                {message}
              </div>
            )}

            {bestMatch && (
              <div className="match-result">
                <h3>🏆 {bestMatch.name}</h3>
                <p>
                  <strong>Student ID:</strong> {bestMatch.studentId}
                </p>
                {bestMatch.branch && (
                  <p><strong>Branch:</strong> {bestMatch.branch}</p>
                )}
                {bestMatch.year !== "" && bestMatch.year != null && (
                  <p><strong>Year:</strong> {bestMatch.year}</p>
                )}
                <p>
                  <strong>Compatibility:</strong>{" "}
                  {bestMatch.compatibility}%
                </p>
              </div>
            )}

            <h2>All Eligible Roommates</h2>

            {allMatches.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Name</th>
                      <th>Student ID</th>
                      <th>Compatibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMatches
                      .slice()
                      .sort(
                        (a, b) =>
                          Number(b.compatibility) -
                          Number(a.compatibility)
                      )
                      .map((match, index) => (
                        <tr key={match.studentId}>
                          <td>{index + 1}</td>
                          <td>{match.name}</td>
                          <td>{match.studentId}</td>
                          <td>{match.compatibility}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <>
            <h2>Admin: Automatic Matching Results</h2>
            <p>
              The system finds the best eligible roommate for each
              student automatically. No student selection is required.
            </p>

            <button
              className="match-button"
              onClick={loadAdminMatches}
              disabled={loading}
            >
              {loading ? "Calculating Matches..." : "Refresh All Matches"}
            </button>

            {loading && <p>Finding the best matches for all students...</p>}

            {message && (
              <div className="match-result" role="status">
                {message}
              </div>
            )}

            {allMatches.length > 0 && (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Student</th>
                      <th>Gender</th>
                      <th>Best Roommate</th>
                      <th>Roommate ID</th>
                      <th>Compatibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMatches.map((match, index) => (
                      <tr
                        key={`${match.studentId}-${match.roommateId}`}
                      >
                        <td>{index + 1}</td>
                        <td>{match.studentName}</td>
                        <td>{match.gender}</td>
                        <td>{match.roommateName}</td>
                        <td>{match.roommateId}</td>
                        <td>{match.compatibility}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default RoommateMatching;
