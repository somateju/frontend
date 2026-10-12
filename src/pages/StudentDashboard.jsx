
import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import DataPage from "../components/DataPage";
import RoommateMatching from "../components/RoommateMatching";
import PaymentManagement from "../components/PaymentManagement";

const API = "http://localhost:8080/api";

function StudentDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [currentStudent, setCurrentStudent] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadStudentData();
  }, [user?.email]);

  async function loadStudentData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const responses = await Promise.all([
        fetch(`${API}/students`),
        fetch(`${API}/hostels`),
        fetch(`${API}/rooms`),
        fetch(`${API}/allocations`),
        fetch(`${API}/preferences`)
      ]);

      const failedResponse = responses.find(
        response => !response.ok
      );

      if (failedResponse) {
        throw new Error(
          `Unable to load dashboard data (HTTP ${failedResponse.status}).`
        );
      }

      const [
        studentsData,
        hostelsData,
        roomsData,
        allocationsData,
        preferencesData
      ] = await Promise.all(
        responses.map(response => response.json())
      );

      const students = Array.isArray(studentsData)
        ? studentsData
        : [];

      const email = user?.email?.trim().toLowerCase();

      const matchedStudent = students.find(
        student =>
          student.email?.trim().toLowerCase() === email
      );

      if (!matchedStudent) {
        setCurrentStudent(null);
        setErrorMessage(
          "Your student account could not be found. Please log out and log in again using your registered student email."
        );
        return;
      }

      setCurrentStudent(matchedStudent);
      setHostels(Array.isArray(hostelsData) ? hostelsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
      setAllocations(
        Array.isArray(allocationsData) ? allocationsData : []
      );
      setPreferences(
        Array.isArray(preferencesData) ? preferencesData : []
      );
    } catch (error) {
      console.error("Student dashboard error:", error);
      setErrorMessage(
        error.message ||
          "Unable to connect to the backend. Make sure the Spring Boot server is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const studentAllocations = allocations.filter(
    allocation =>
      String(allocation.student?.id) ===
      String(currentStudent?.id)
  );

  const myPreference = preferences.find(
    preference =>
      String(preference.student?.id) ===
      String(currentStudent?.id)
  );

  const availableRooms = rooms.filter(
    room => Number(room.occupied) < Number(room.capacity)
  );

  function StudentNavbar() {
    return (
      <nav className="dashboard-navbar">
        <h2>Smart Hostel - Student</h2>
        <div className="admin-info">
          <span>
            Welcome, {currentStudent?.name || user?.name}
          </span>
          <button onClick={onLogout}>Logout</button>
        </div>
      </nav>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <div className="dashboard-content">
          <h2>Loading your dashboard...</h2>
        </div>
      </div>
    );
  }

  if (!currentStudent) {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <div className="dashboard-content">
          <h1>Student Dashboard</h1>
          <div className="match-result">
            {errorMessage || "Student account not found."}
          </div>
          <button
            className="match-button"
            onClick={loadStudentData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (activePage === "dashboard") {
    return (
      <div className="dashboard">
        <StudentNavbar />

        <div className="dashboard-content">
          <h1>Student Dashboard</h1>

          <p className="dashboard-subtitle">
            Welcome, {currentStudent.name}. Find a compatible
            roommate and view your hostel information.
          </p>

          {errorMessage && (
            <div className="match-result">{errorMessage}</div>
          )}

          <div className="dashboard-cards">
            <DashboardCard
              icon="🤝"
              title="Find Roommate"
              description="Automatically find your best roommate"
              onClick={() => setActivePage("matching")}
            />

            <DashboardCard
              icon="❤️"
              title="My Preferences"
              description={
                myPreference
                  ? "View your saved roommate preferences"
                  : "No preferences submitted yet"
              }
              onClick={() => setActivePage("preferences")}
            />

            <DashboardCard
              icon="🏠"
              title="Hostels"
              description={`${hostels.length} hostels available`}
              onClick={() => setActivePage("hostels")}
            />

            <DashboardCard
              icon="🚪"
              title="Available Rooms"
              description={`${availableRooms.length} rooms have space`}
              onClick={() => setActivePage("rooms")}
            />

            <DashboardCard
              icon="📋"
              title="My Room Allocation"
              description={`${studentAllocations.length} room allocations`}
              onClick={() => setActivePage("allocations")}
            />

            <DashboardCard
              icon="💳"
              title="My Payments"
              description="View payment history and record demo payments"
              onClick={() => setActivePage("payments")}
            />
          </div>

          <div className="data-content">
            <h2>My Student Details</h2>
            <p><strong>Name:</strong> {currentStudent.name}</p>
            <p><strong>Email:</strong> {currentStudent.email}</p>
            <p><strong>Student ID:</strong> {currentStudent.id}</p>
            <p><strong>Branch:</strong> {currentStudent.branch || "—"}</p>
            <p><strong>Year:</strong> {currentStudent.year || "—"}</p>
            <p><strong>Gender:</strong> {currentStudent.gender || "—"}</p>
          </div>
        </div>
      </div>
    );
  }

  if (activePage === "matching") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <RoommateMatching
          students={[]}
          currentStudentId={currentStudent.id}
          onBack={() => setActivePage("dashboard")}
        />
      </div>
    );
  }

  if (activePage === "payments") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <PaymentManagement
          isAdmin={false}
          studentId={currentStudent.id}
          onBack={() => setActivePage("dashboard")}
        />
      </div>
    );
  }

  if (activePage === "hostels") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <DataPage
          title="Available Hostels"
          onBack={() => setActivePage("dashboard")}
        >
          {hostels.length === 0 ? (
            <p>No hostels are available right now.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Hostel Name</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map(hostel => (
                  <tr key={hostel.id}>
                    <td>{hostel.id}</td>
                    <td>{hostel.name}</td>
                    <td>{hostel.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "rooms") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <DataPage
          title="Available Rooms"
          onBack={() => setActivePage("dashboard")}
        >
          {availableRooms.length === 0 ? (
            <p>No rooms with available capacity were found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Capacity</th>
                  <th>Occupied</th>
                  <th>Hostel</th>
                </tr>
              </thead>
              <tbody>
                {availableRooms.map(room => (
                  <tr key={room.id}>
                    <td>{room.roomNumber}</td>
                    <td>{room.roomType}</td>
                    <td>{room.capacity}</td>
                    <td>{room.occupied}</td>
                    <td>{room.hostel?.name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "allocations") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <DataPage
          title="My Room Allocation"
          onBack={() => setActivePage("dashboard")}
        >
          {studentAllocations.length === 0 ? (
            <p>You do not have a room allocation yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Room Type</th>
                  <th>Hostel</th>
                  <th>Location</th>
                  <th>Allocation Date</th>
                </tr>
              </thead>
              <tbody>
                {studentAllocations.map(allocation => (
                  <tr key={allocation.id}>
                    <td>{allocation.room?.roomNumber || "—"}</td>
                    <td>{allocation.room?.roomType || "—"}</td>
                    <td>{allocation.room?.hostel?.name || "—"}</td>
                    <td>{allocation.room?.hostel?.location || "—"}</td>
                    <td>{allocation.allocationDate || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "preferences") {
    return (
      <div className="dashboard">
        <StudentNavbar />
        <DataPage
          title="My Roommate Preferences"
          onBack={() => setActivePage("dashboard")}
        >
          {!myPreference ? (
            <div className="match-result">
              No saved preferences were found for your account.
              Submit your preferences using the preference form
              already provided in your project.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Preference</th>
                  <th>Saved Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Sleep Schedule</td>
                  <td>{myPreference.sleepSchedule || "—"}</td>
                </tr>
                <tr>
                  <td>Study Habit</td>
                  <td>{myPreference.studyHabit || "—"}</td>
                </tr>
                <tr>
                  <td>Cleanliness</td>
                  <td>{myPreference.cleanliness || "—"}</td>
                </tr>
                <tr>
                  <td>Food Preference</td>
                  <td>{myPreference.foodPreference || "—"}</td>
                </tr>
                <tr>
                  <td>Smoking Preference</td>
                  <td>{myPreference.smokingPreference || "—"}</td>
                </tr>
                <tr>
                  <td>Room Type</td>
                  <td>{myPreference.roomType || "—"}</td>
                </tr>
              </tbody>
            </table>
          )}
        </DataPage>
      </div>
    );
  }

  return null;
}

export default StudentDashboard;
