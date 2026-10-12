
import { useEffect, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import DataPage from "../components/DataPage";
import RoommateMatching from "../components/RoommateMatching";
import PaymentManagement from "../components/PaymentManagement";

const API = "http://localhost:8080/api";

const emptyStudent = {
  name: "",
  email: "",
  password: "",
  branch: "",
  year: "",
  gender: ""
};

function AdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [preferences, setPreferences] = useState([]);

  const [studentForm, setStudentForm] = useState(emptyStudent);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [studentMessage, setStudentMessage] = useState("");

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [allocationMessage, setAllocationMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function getList(endpoint) {
    const response = await fetch(`${API}/${endpoint}`);

    if (!response.ok) {
      throw new Error(`Could not load ${endpoint}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  }

  async function loadData() {
    setLoading(true);
    setErrorMessage("");

    try {
      const [
        studentData,
        hostelData,
        roomData,
        allocationData,
        preferenceData
      ] = await Promise.all([
        getList("students"),
        getList("hostels"),
        getList("rooms"),
        getList("allocations"),
        getList("preferences")
      ]);

      setStudents(studentData);
      setHostels(hostelData);
      setRooms(roomData);
      setAllocations(allocationData);
      setPreferences(preferenceData);
    } catch (error) {
      console.error("Error loading admin data:", error);
      setErrorMessage(
        "Unable to load dashboard data. Check that the backend is running on port 8080."
      );
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setActivePage("dashboard");
    setStudentMessage("");
    setAllocationMessage("");
  }

  function resetStudentForm() {
    setStudentForm({ ...emptyStudent });
    setEditingStudentId(null);
    setShowStudentForm(false);
    setStudentMessage("");
  }

  function editStudent(student) {
    setStudentForm({
      name: student.name || "",
      email: student.email || "",
      password: "",
      branch: student.branch || "",
      year: student.year ? String(student.year) : "",
      gender: student.gender || ""
    });

    setEditingStudentId(student.id);
    setShowStudentForm(true);
    setStudentMessage("");
  }

  function handleStudentChange(event) {
    const { name, value } = event.target;

    setStudentForm(previous => ({
      ...previous,
      [name]: value
    }));
  }

  async function saveStudent(event) {
    event.preventDefault();
    setStudentMessage("Saving student...");

    const body = {
      name: studentForm.name.trim(),
      email: studentForm.email.trim(),
      branch: studentForm.branch,
      year: Number(studentForm.year),
      gender: studentForm.gender
    };

    if (studentForm.password) {
      body.password = studentForm.password;
    }

    try {
      const url = editingStudentId
        ? `${API}/students/${editingStudentId}`
        : `${API}/students`;

      const response = await fetch(url, {
        method: editingStudentId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const message = await response.text();

      if (!response.ok) {
        setStudentMessage(message || "Unable to save student.");
        return;
      }

      setStudentMessage(
        editingStudentId
          ? "Student updated successfully."
          : "Student added successfully."
      );

      await loadData();
      resetStudentForm();
    } catch (error) {
      console.error(error);
      setStudentMessage("Unable to connect to the backend.");
    }
  }

  async function deleteStudent(studentId) {
    const student = students.find(item => item.id === studentId);

    if (!window.confirm(`Delete ${student?.name || "this student"}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/students/${studentId}`,
        { method: "DELETE" }
      );

      const message = await response.text();

      if (!response.ok) {
        window.alert(message || "Unable to delete student.");
        return;
      }

      window.alert(message || "Student deleted successfully.");
      await loadData();
    } catch (error) {
      console.error(error);
      window.alert("Unable to connect to the backend.");
    }
  }

  async function allocateRoom() {
    if (!selectedStudent || !selectedRoom) {
      setAllocationMessage("Select both a student and a room.");
      return;
    }

    setAllocationMessage("Allocating room...");

    try {
      const response = await fetch(
        `${API}/allocations/${selectedStudent}/${selectedRoom}`,
        { method: "POST" }
      );

      const message = await response.text();

      setAllocationMessage(
        message ||
          (response.ok ? "Allocation completed." : "Allocation failed.")
      );

      if (response.ok) {
        setSelectedStudent("");
        setSelectedRoom("");
        await loadData();
      }
    } catch (error) {
      console.error(error);
      setAllocationMessage("Unable to connect to the backend.");
    }
  }

  const availableRooms = rooms.filter(
    room => Number(room.occupied || 0) < Number(room.capacity || 0)
  );

  function renderTable(headers, rows, emptyMessage) {
    return (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows : (
              <tr>
                <td colSpan={headers.length}>{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard">
        <p style={{ padding: "30px" }}>Loading admin dashboard...</p>
      </div>
    );
  }

  if (activePage === "dashboard") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />

        <main className="dashboard-content">
          <h1>Admin Dashboard</h1>

          <p className="dashboard-subtitle">
            Manage students, hostels, rooms, preferences and automatic roommate matching.
          </p>

          {errorMessage && (
            <p role="alert" style={{ color: "crimson" }}>
              {errorMessage}
              <button
                onClick={loadData}
                style={{ marginLeft: "12px" }}
              >
                Retry
              </button>
            </p>
          )}

          <div className="dashboard-cards">
            <DashboardCard
              icon="👨‍🎓"
              title="Students"
              description={`${students.length} registered`}
              onClick={() => setActivePage("students")}
            />

            <DashboardCard
              icon="🏠"
              title="Hostels"
              description={`${hostels.length} hostels`}
              onClick={() => setActivePage("hostels")}
            />

            <DashboardCard
              icon="🚪"
              title="Rooms"
              description={`${rooms.length} rooms`}
              onClick={() => setActivePage("rooms")}
            />

            <DashboardCard
              icon="📋"
              title="Room Allocations"
              description={`${allocations.length} allocations`}
              onClick={() => setActivePage("allocations")}
            />

            <DashboardCard
              icon="❤️"
              title="Preferences"
              description={`${preferences.length} submitted`}
              onClick={() => setActivePage("preferences")}
            />

            <DashboardCard
              icon="🤝"
              title="Roommate Matching"
              description="Automatically rank compatible roommates"
              onClick={() => setActivePage("matching")}
            />

            <DashboardCard
              icon="🛏️"
              title="Allocate Room"
              description="Assign an available room"
              onClick={() => setActivePage("allocate")}
            />

            <DashboardCard
              icon="💳"
              title="Manage Payments"
              description="View all student payment records"
              onClick={() => setActivePage("payments")}
            />
          </div>

          <button
            className="match-button"
            onClick={loadData}
            style={{ marginTop: "20px" }}
          >
            Refresh Dashboard
          </button>
        </main>
      </div>
    );
  }

  if (activePage === "matching") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <RoommateMatching
          students={students}
          onBack={goBack}
        />
      </div>
    );
  }

  if (activePage === "payments") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <PaymentManagement
          isAdmin={true}
          onBack={goBack}
        />
      </div>
    );
  }

  if (activePage === "students") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />

        <DataPage title="Students" onBack={goBack}>
          <button
            className="match-button"
            onClick={() => {
              resetStudentForm();
              setShowStudentForm(true);
            }}
          >
            + Add Student
          </button>

          {showStudentForm && (
            <div className="preference-box" style={{ marginTop: "20px" }}>
              <h2>{editingStudentId ? "Edit Student" : "Add Student"}</h2>

              <form onSubmit={saveStudent}>
                <div className="preference-field">
                  <label>Name</label>
                  <input
                    name="name"
                    value={studentForm.name}
                    onChange={handleStudentChange}
                    required
                  />
                </div>

                <div className="preference-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={studentForm.email}
                    onChange={handleStudentChange}
                    required
                  />
                </div>

                <div className="preference-field">
                  <label>
                    Password {editingStudentId ? "(leave blank to keep current password)" : ""}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={studentForm.password}
                    onChange={handleStudentChange}
                    required={!editingStudentId}
                  />
                </div>

                <div className="preference-field">
                  <label>Branch</label>
                  <select
                    name="branch"
                    value={studentForm.branch}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select branch</option>
                    {["ECE", "CSE", "EEE", "MECH", "CIVIL", "IT", "AIML", "DS"].map(branch => (
                      <option key={branch} value={branch}>{branch}</option>
                    ))}
                  </select>
                </div>

                <div className="preference-field">
                  <label>Year</label>
                  <select
                    name="year"
                    value={studentForm.year}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="preference-field">
                  <label>Gender</label>
                  <select
                    name="gender"
                    value={studentForm.gender}
                    onChange={handleStudentChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <button className="match-button" type="submit">
                  {editingStudentId ? "Update Student" : "Save Student"}
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={resetStudentForm}
                >
                  Cancel
                </button>
              </form>

              {studentMessage && (
                <p className="match-result">{studentMessage}</p>
              )}
            </div>
          )}

          {renderTable(
            ["ID", "Name", "Email", "Branch", "Year", "Gender", "Actions"],
            students.map(student => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.branch || "—"}</td>
                <td>{student.year || "—"}</td>
                <td>{student.gender || "—"}</td>
                <td>
                  <button onClick={() => editStudent(student)}>Edit</button>
                  <button onClick={() => deleteStudent(student.id)}>Delete</button>
                </td>
              </tr>
            )),
            "No students found."
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "hostels") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <DataPage title="Hostels" onBack={goBack}>
          {renderTable(
            ["ID", "Hostel Name", "Location"],
            hostels.map(hostel => (
              <tr key={hostel.id}>
                <td>{hostel.id}</td>
                <td>{hostel.name}</td>
                <td>{hostel.location}</td>
              </tr>
            )),
            "No hostels found."
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "rooms") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <DataPage title="Rooms" onBack={goBack}>
          {renderTable(
            ["ID", "Room Number", "Room Type", "Capacity", "Occupied", "Hostel"],
            rooms.map(room => (
              <tr key={room.id}>
                <td>{room.id}</td>
                <td>{room.roomNumber}</td>
                <td>{room.roomType}</td>
                <td>{room.capacity}</td>
                <td>{room.occupied}</td>
                <td>{room.hostel?.name || "—"}</td>
              </tr>
            )),
            "No rooms found."
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "allocations") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <DataPage title="Room Allocations" onBack={goBack}>
          {renderTable(
            ["ID", "Student", "Room", "Hostel", "Date"],
            allocations.map(allocation => (
              <tr key={allocation.id}>
                <td>{allocation.id}</td>
                <td>{allocation.student?.name || "—"}</td>
                <td>{allocation.room?.roomNumber || "—"}</td>
                <td>{allocation.room?.hostel?.name || "—"}</td>
                <td>{allocation.allocationDate || "—"}</td>
              </tr>
            )),
            "No room allocations found."
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "preferences") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <DataPage title="Student Preferences" onBack={goBack}>
          {renderTable(
            ["Student", "Sleep Schedule", "Study Habit", "Cleanliness", "Food", "Smoking", "Room Type"],
            preferences.map(preference => (
              <tr key={preference.id}>
                <td>{preference.student?.name || "—"}</td>
                <td>{preference.sleepSchedule || "—"}</td>
                <td>{preference.studyHabit || "—"}</td>
                <td>{preference.cleanliness || "—"}</td>
                <td>{preference.foodPreference || "—"}</td>
                <td>{preference.smokingPreference || "—"}</td>
                <td>{preference.roomType || "—"}</td>
              </tr>
            )),
            "No preferences submitted."
          )}
        </DataPage>
      </div>
    );
  }

  if (activePage === "allocate") {
    return (
      <div className="dashboard">
        <AdminNavbar user={user} onLogout={onLogout} />
        <DataPage title="Allocate Room" onBack={goBack}>
          <div className="preference-box">
            <h2>Room Allocation</h2>
            <p>Choose a student and an available room to create an allocation.</p>

            <div className="preference-field">
              <label>Student</label>
              <select
                value={selectedStudent}
                onChange={event => setSelectedStudent(event.target.value)}
              >
                <option value="">Select student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} — {student.gender} — ID {student.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="preference-field">
              <label>Available Room</label>
              <select
                value={selectedRoom}
                onChange={event => setSelectedRoom(event.target.value)}
              >
                <option value="">Select room</option>
                {availableRooms.map(room => (
                  <option key={room.id} value={room.id}>
                    Room {room.roomNumber} — {room.roomType} — {room.occupied}/{room.capacity} — {room.hostel?.name || "Hostel"}
                  </option>
                ))}
              </select>
            </div>

            <button className="match-button" onClick={allocateRoom}>
              Allocate Room
            </button>

            {allocationMessage && (
              <p className="match-result">{allocationMessage}</p>
            )}

            {!availableRooms.length && (
              <p>No available rooms at the moment.</p>
            )}
          </div>
        </DataPage>
      </div>
    );
  }

  return null;
}

function AdminNavbar({ user, onLogout }) {
  return (
    <nav className="dashboard-navbar">
      <h2>Smart Hostel - Admin</h2>
      <div className="admin-info">
        <span>Welcome, {user?.name || "Admin"}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  );
}

export default AdminDashboard;
