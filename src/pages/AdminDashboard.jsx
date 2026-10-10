import { useEffect, useState } from "react";

import DashboardCard from "../components/DashboardCard";
import DataPage from "../components/DataPage";
import RoommateMatching from "../components/RoommateMatching";

function AdminDashboard({ user, onLogout }) {

  const [activePage, setActivePage] =
    useState("dashboard");

  const [students, setStudents] =
    useState([]);

  const [hostels, setHostels] =
    useState([]);

  const [rooms, setRooms] =
    useState([]);

  const [allocations, setAllocations] =
    useState([]);

  const [preferences, setPreferences] =
    useState([]);


  // Student form

  const [studentForm, setStudentForm] =
    useState({
      name: "",
      email: "",
      password: "",
      branch: "",
      year: "",
      gender: ""
    });

  const [editingStudentId, setEditingStudentId] =
    useState(null);

  const [studentMessage, setStudentMessage] =
    useState("");

  const [showStudentForm, setShowStudentForm] =
    useState(false);


  // Room allocation

  const [selectedStudent, setSelectedStudent] =
    useState("");

  const [selectedRoom, setSelectedRoom] =
    useState("");

  const [allocationMessage, setAllocationMessage] =
    useState("");


  const API =
    "http://localhost:8080/api";


  // =====================================================
  // LOAD ALL DATA
  // =====================================================

  useEffect(() => {

    loadData();

  }, []);


  const loadData = async () => {

    try {

      const studentsResponse =
        await fetch(`${API}/students`);

      const hostelsResponse =
        await fetch(`${API}/hostels`);

      const roomsResponse =
        await fetch(`${API}/rooms`);

      const allocationsResponse =
        await fetch(`${API}/allocations`);

      const preferencesResponse =
        await fetch(`${API}/preferences`);


      if (studentsResponse.ok) {

        setStudents(
          await studentsResponse.json()
        );

      }


      if (hostelsResponse.ok) {

        setHostels(
          await hostelsResponse.json()
        );

      }


      if (roomsResponse.ok) {

        setRooms(
          await roomsResponse.json()
        );

      }


      if (allocationsResponse.ok) {

        setAllocations(
          await allocationsResponse.json()
        );

      }


      if (preferencesResponse.ok) {

        setPreferences(
          await preferencesResponse.json()
        );

      }


    } catch (error) {

      console.error(
        "Error loading admin data:",
        error
      );

    }
  };


  // =====================================================
  // STUDENT FORM
  // =====================================================

  const resetStudentForm = () => {

    setStudentForm({
      name: "",
      email: "",
      password: "",
      branch: "",
      year: "",
      gender: ""
    });

    setEditingStudentId(null);

    setStudentMessage("");

    setShowStudentForm(false);
  };


  const openAddStudentForm = () => {

    setStudentForm({
      name: "",
      email: "",
      password: "",
      branch: "",
      year: "",
      gender: ""
    });

    setEditingStudentId(null);

    setStudentMessage("");

    setShowStudentForm(true);
  };


  const openEditStudentForm = (student) => {

    setStudentForm({
      name: student.name || "",
      email: student.email || "",
      password: "",
      branch: student.branch || "",
      year: student.year
        ? String(student.year)
        : "",
      gender: student.gender || ""
    });

    setEditingStudentId(student.id);

    setStudentMessage("");

    setShowStudentForm(true);
  };


  const handleStudentFormChange =
    (event) => {

      const {
        name,
        value
      } = event.target;

      setStudentForm(
        (previous) => ({
          ...previous,
          [name]: value
        })
      );
    };


  // =====================================================
  // ADD / UPDATE STUDENT
  // =====================================================

  const saveStudent = async (event) => {

    event.preventDefault();

    setStudentMessage(
      "Saving student..."
    );


    try {

      const url =
        editingStudentId
          ? `${API}/students/${editingStudentId}`
          : `${API}/students`;


      const method =
        editingStudentId
          ? "PUT"
          : "POST";


      const body = {

        name:
          studentForm.name.trim(),

        email:
          studentForm.email.trim(),

        branch:
          studentForm.branch,

        year:
          Number(studentForm.year),

        gender:
          studentForm.gender

      };


      if (
        !editingStudentId ||
        studentForm.password.trim() !== ""
      ) {

        body.password =
          studentForm.password;

      }


      const response =
        await fetch(
          url,
          {
            method: method,

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(body)
          }
        );


      const data =
        await response.text();


      if (!response.ok) {

        setStudentMessage(
          data ||
          "Unable to save student."
        );

        return;
      }


      setStudentMessage(
        editingStudentId
          ? "Student updated successfully."
          : "Student added successfully."
      );


      await loadData();


      setTimeout(() => {

        resetStudentForm();

      }, 800);


    } catch (error) {

      console.error(error);

      setStudentMessage(
        "Unable to connect to server."
      );

    }
  };


  // =====================================================
  // DELETE STUDENT
  // =====================================================

  const deleteStudent =
    async (studentId) => {

      const student =
        students.find(
          (item) =>
            item.id === studentId
        );


      const confirmed =
        window.confirm(
          `Delete student ${
            student?.name ||
            studentId
          }?\n\nThis action cannot be undone.`
        );


      if (!confirmed) {

        return;

      }


      try {

        const response =
          await fetch(
            `${API}/students/${studentId}`,
            {
              method: "DELETE"
            }
          );


        const data =
          await response.text();


        if (!response.ok) {

          window.alert(
            data ||
            "Unable to delete student."
          );

          return;
        }


        window.alert(
          data ||
          "Student deleted successfully."
        );


        await loadData();


      } catch (error) {

        console.error(error);

        window.alert(
          "Unable to connect to server."
        );

      }
    };


  // =====================================================
  // ROOM ALLOCATION
  // =====================================================

  const allocateRoom = async () => {

    if (
      !selectedStudent ||
      !selectedRoom
    ) {

      setAllocationMessage(
        "Please select both a student and a room."
      );

      return;
    }


    try {

      setAllocationMessage(
        "Allocating room..."
      );


      const response =
        await fetch(
          `${API}/allocations/${selectedStudent}/${selectedRoom}`,
          {
            method: "POST"
          }
        );


      const data =
        await response.text();


      setAllocationMessage(data);


      if (
        data ===
        "Room allocated successfully"
      ) {

        setSelectedStudent("");

        setSelectedRoom("");

        await loadData();

      }


    } catch (error) {

      console.error(error);

      setAllocationMessage(
        "Unable to allocate room."
      );

    }
  };


  const getAvailableRooms = () => {

    return rooms.filter(
      (room) =>
        room.occupied <
        room.capacity
    );

  };


  // =====================================================
  // ADMIN DASHBOARD
  // =====================================================

  if (
    activePage ===
    "dashboard"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <div className="dashboard-content">

          <h1>
            Admin Dashboard
          </h1>


          <p className="dashboard-subtitle">

            Manage students, hostels,
            rooms and roommate matching.

          </p>


          <div className="dashboard-cards">


            <DashboardCard
              icon="👨‍🎓"
              title="Students"
              description={
                `${students.length} students registered`
              }
              onClick={() =>
                setActivePage(
                  "students"
                )
              }
            />


            <DashboardCard
              icon="🏠"
              title="Hostels"
              description={
                `${hostels.length} hostels available`
              }
              onClick={() =>
                setActivePage(
                  "hostels"
                )
              }
            />


            <DashboardCard
              icon="🚪"
              title="Rooms"
              description={
                `${rooms.length} rooms available`
              }
              onClick={() =>
                setActivePage(
                  "rooms"
                )
              }
            />


            <DashboardCard
              icon="📋"
              title="Room Allocations"
              description={
                `${allocations.length} allocations`
              }
              onClick={() =>
                setActivePage(
                  "allocations"
                )
              }
            />


            <DashboardCard
              icon="❤️"
              title="Preferences"
              description={
                `${preferences.length} preferences submitted`
              }
              onClick={() =>
                setActivePage(
                  "preferences"
                )
              }
            />


            <DashboardCard
              icon="🤝"
              title="Roommate Matching"
              description="Check compatibility"
              onClick={() =>
                setActivePage(
                  "matching"
                )
              }
            />


            <DashboardCard
              icon="🛏️"
              title="Allocate Room"
              description="Assign a room to a student"
              onClick={() =>
                setActivePage(
                  "allocate"
                )
              }
            />


          </div>

        </div>

      </div>

    );
  }


  // =====================================================
  // STUDENT MANAGEMENT
  // =====================================================

  if (
    activePage ===
    "students"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <div className="clean-data-page">


          {/* PAGE HEADER */}

          <div className="clean-page-header">


            <div>

              <button
                className="clean-back-button"
                onClick={() => {

                  resetStudentForm();

                  setActivePage(
                    "dashboard"
                  );

                }}
              >
                ← Dashboard
              </button>


              <h1>
                Student Management
              </h1>


              <p>
                Manage registered students
                and their details.
              </p>

            </div>


            <div className="student-header-right">


              <div className="student-count">

                <strong>
                  {students.length}
                </strong>

                <span>
                  Students
                </span>

              </div>


              <button
                className="clean-add-button"
                onClick={
                  openAddStudentForm
                }
              >
                + Add Student
              </button>


            </div>


          </div>


          {/* =================================================
              ADD / EDIT POPUP
          ================================================= */}

          {showStudentForm && (

            <div
              className="student-modal-overlay"

              onClick={(event) => {

                if (
                  event.target ===
                  event.currentTarget
                ) {

                  resetStudentForm();

                }

              }}
            >


              <div className="student-modal">


                <div className="student-modal-header">


                  <div>

                    <h2>

                      {editingStudentId
                        ? "Edit Student"
                        : "Add Student"}

                    </h2>


                    <p>

                      {editingStudentId
                        ? "Update student information"
                        : "Create a new student account"}

                    </p>

                  </div>


                  <button
                    className="modal-close-button"
                    onClick={
                      resetStudentForm
                    }
                  >
                    ×
                  </button>


                </div>


                <form
                  className="student-clean-form"
                  onSubmit={
                    saveStudent
                  }
                >


                  <div className="clean-form-grid">


                    {/* NAME */}

                    <div className="clean-form-group">

                      <label>
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={
                          studentForm.name
                        }
                        onChange={
                          handleStudentFormChange
                        }
                        placeholder="Enter student name"
                        required
                      />

                    </div>


                    {/* EMAIL */}

                    <div className="clean-form-group">

                      <label>
                        Email
                      </label>

                      <input
                        type="email"
                        name="email"
                        value={
                          studentForm.email
                        }
                        onChange={
                          handleStudentFormChange
                        }
                        placeholder="Enter email address"
                        required
                      />

                    </div>


                    {/* PASSWORD */}

                    <div className="clean-form-group">

                      <label>
                        Password
                      </label>

                      <input
                        type="password"
                        name="password"
                        value={
                          studentForm.password
                        }
                        onChange={
                          handleStudentFormChange
                        }
                        placeholder={
                          editingStudentId
                            ? "Leave blank to keep current password"
                            : "Create password"
                        }
                        required={
                          !editingStudentId
                        }
                      />

                    </div>


                    {/* BRANCH */}

                    <div className="clean-form-group">

                      <label>
                        Branch
                      </label>

                      <select
                        name="branch"
                        value={
                          studentForm.branch
                        }
                        onChange={
                          handleStudentFormChange
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

                    </div>


                    {/* YEAR */}

                    <div className="clean-form-group">

                      <label>
                        Year
                      </label>

                      <select
                        name="year"
                        value={
                          studentForm.year
                        }
                        onChange={
                          handleStudentFormChange
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

                    </div>


                    {/* GENDER */}

                    <div className="clean-form-group">

                      <label>
                        Gender
                      </label>

                      <select
                        name="gender"
                        value={
                          studentForm.gender
                        }
                        onChange={
                          handleStudentFormChange
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

                    </div>


                  </div>


                  {studentMessage && (

                    <div className="student-form-message">

                      {studentMessage}

                    </div>

                  )}


                  <div className="student-form-actions">


                    <button
                      type="button"
                      className="clean-cancel-button"
                      onClick={
                        resetStudentForm
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      className="clean-save-button"
                    >

                      {editingStudentId
                        ? "Save Changes"
                        : "Add Student"}

                    </button>


                  </div>


                </form>


              </div>

            </div>

          )}


          {/* =================================================
              STUDENT TABLE
          ================================================= */}

          <div className="student-table-card">


            <div className="student-table-header">

              <div>

                <h2>
                  Registered Students
                </h2>

                <p>
                  All students currently
                  registered in the system.
                </p>

              </div>

            </div>


            <div className="student-table-wrapper">


              <table className="clean-student-table">


                <thead>

                  <tr>

                    <th>
                      ID
                    </th>

                    <th>
                      Student
                    </th>

                    <th>
                      Email
                    </th>

                    <th>
                      Branch
                    </th>

                    <th>
                      Year
                    </th>

                    <th>
                      Gender
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>


                  {students.length === 0 ? (

                    <tr>

                      <td
                        colSpan="7"
                        className="empty-students"
                      >
                        No students registered yet.
                      </td>

                    </tr>

                  ) : (

                    students.map(
                      (student) => (

                        <tr
                          key={student.id}
                        >


                          <td>

                            <span className="student-id">
                              #{student.id}
                            </span>

                          </td>


                          <td>

                            <div className="student-name-cell">


                              <div className="student-avatar">

                                {student.name
                                  ?.charAt(0)
                                  ?.toUpperCase()}

                              </div>


                              <strong>
                                {student.name}
                              </strong>


                            </div>

                          </td>


                          <td>
                            {student.email}
                          </td>


                          <td>

                            <span className="branch-badge">

                              {student.branch}

                            </span>

                          </td>


                          <td>
                            Year {student.year}
                          </td>


                          <td>

                            <span
                              className={
                                student.gender ===
                                "Female"
                                  ? "gender-badge female"
                                  : "gender-badge male"
                              }
                            >

                              {student.gender}

                            </span>

                          </td>


                          <td>

                            <div className="student-actions">


                              <button
                                className="edit-student-button"
                                onClick={() =>
                                  openEditStudentForm(
                                    student
                                  )
                                }
                              >
                                Edit
                              </button>


                              <button
                                className="delete-student-button"
                                onClick={() =>
                                  deleteStudent(
                                    student.id
                                  )
                                }
                              >
                                Delete
                              </button>


                            </div>

                          </td>


                        </tr>

                      )
                    )

                  )}


                </tbody>


              </table>


            </div>

          </div>


        </div>

      </div>

    );
  }


  // =====================================================
  // HOSTELS
  // =====================================================

  if (
    activePage ===
    "hostels"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <DataPage
          title="Hostels"
          onBack={() =>
            setActivePage(
              "dashboard"
            )
          }
        >


          <table>

            <thead>

              <tr>

                <th>ID</th>
                <th>Hostel Name</th>
                <th>Location</th>

              </tr>

            </thead>


            <tbody>

              {hostels.map(
                (hostel) => (

                  <tr
                    key={hostel.id}
                  >

                    <td>
                      {hostel.id}
                    </td>

                    <td>
                      {hostel.name}
                    </td>

                    <td>
                      {hostel.location}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


        </DataPage>

      </div>

    );
  }


  // =====================================================
  // ROOMS
  // =====================================================

  if (
    activePage ===
    "rooms"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <DataPage
          title="Rooms"
          onBack={() =>
            setActivePage(
              "dashboard"
            )
          }
        >


          <table>

            <thead>

              <tr>

                <th>ID</th>
                <th>Room Number</th>
                <th>Room Type</th>
                <th>Capacity</th>
                <th>Occupied</th>
                <th>Hostel</th>

              </tr>

            </thead>


            <tbody>

              {rooms.map(
                (room) => (

                  <tr
                    key={room.id}
                  >

                    <td>
                      {room.id}
                    </td>

                    <td>
                      {room.roomNumber}
                    </td>

                    <td>
                      {room.roomType}
                    </td>

                    <td>
                      {room.capacity}
                    </td>

                    <td>
                      {room.occupied}
                    </td>

                    <td>
                      {room.hostel?.name}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


        </DataPage>

      </div>

    );
  }


  // =====================================================
  // ROOM ALLOCATIONS
  // =====================================================

  if (
    activePage ===
    "allocations"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <DataPage
          title="Room Allocations"
          onBack={() =>
            setActivePage(
              "dashboard"
            )
          }
        >


          <table>

            <thead>

              <tr>

                <th>ID</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Room</th>
                <th>Hostel</th>
                <th>Allocation Date</th>

              </tr>

            </thead>


            <tbody>

              {allocations.map(
                (allocation) => (

                  <tr
                    key={allocation.id}
                  >

                    <td>
                      {allocation.id}
                    </td>

                    <td>
                      {allocation.student?.name}
                    </td>

                    <td>
                      {allocation.student?.gender}
                    </td>

                    <td>
                      {allocation.room?.roomNumber}
                    </td>

                    <td>
                      {allocation.room?.hostel?.name}
                    </td>

                    <td>
                      {allocation.allocationDate}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


        </DataPage>

      </div>

    );
  }


  // =====================================================
  // PREFERENCES
  // =====================================================

  if (
    activePage ===
    "preferences"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <DataPage
          title="Student Preferences"
          onBack={() =>
            setActivePage(
              "dashboard"
            )
          }
        >


          <table>

            <thead>

              <tr>

                <th>
                  Student
                </th>

                <th>
                  Gender
                </th>

                <th>
                  Sleep
                </th>

                <th>
                  Study
                </th>

                <th>
                  Cleanliness
                </th>

                <th>
                  Food
                </th>

                <th>
                  Smoking
                </th>

                <th>
                  Room Type
                </th>

              </tr>

            </thead>


            <tbody>

              {preferences.map(
                (preference) => (

                  <tr
                    key={preference.id}
                  >

                    <td>
                      {preference.student?.name}
                    </td>

                    <td>
                      {preference.student?.gender}
                    </td>

                    <td>
                      {preference.sleepSchedule}
                    </td>

                    <td>
                      {preference.studyHabit}
                    </td>

                    <td>
                      {preference.cleanliness}
                    </td>

                    <td>
                      {preference.foodPreference}
                    </td>

                    <td>
                      {preference.smokingPreference}
                    </td>

                    <td>
                      {preference.roomType}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>


        </DataPage>

      </div>

    );
  }


  // =====================================================
  // ROOMMATE MATCHING
  // =====================================================

  if (
    activePage ===
    "matching"
  ) {

    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <RoommateMatching
          students={students}
          onBack={() =>
            setActivePage(
              "dashboard"
            )
          }
        />

      </div>

    );
  }


  // =====================================================
  // ALLOCATE ROOM
  // =====================================================

  if (
    activePage ===
    "allocate"
  ) {

    const availableRooms =
      getAvailableRooms();


    return (

      <div className="dashboard">

        <AdminNavbar
          user={user}
          onLogout={onLogout}
        />


        <div className="data-page">


          <button
            className="back-dashboard"
            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }
          >
            ← Back to Dashboard
          </button>


          <h1>
            Allocate Room
          </h1>


          <div className="data-content">


            <div className="preference-box">


              <h2>
                🛏️ Room Allocation
              </h2>


              <p>
                Select a student and an
                available room.
              </p>


              <div className="preference-field">

                <label>
                  Select Student
                </label>


                <select
                  value={
                    selectedStudent
                  }
                  onChange={(event) => {

                    setSelectedStudent(
                      event.target.value
                    );

                    setSelectedRoom("");

                    setAllocationMessage("");

                  }}
                >

                  <option value="">
                    Select Student
                  </option>


                  {students.map(
                    (student) => (

                      <option
                        key={student.id}
                        value={student.id}
                      >

                        {student.name}
                        {" - "}
                        {student.gender}
                        {" - ID "}
                        {student.id}

                      </option>

                    )
                  )}

                </select>

              </div>


              <div className="preference-field">

                <label>
                  Select Available Room
                </label>


                <select
                  value={
                    selectedRoom
                  }
                  onChange={(event) =>
                    setSelectedRoom(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select Room
                  </option>


                  {availableRooms.map(
                    (room) => (

                      <option
                        key={room.id}
                        value={room.id}
                      >

                        Room {room.roomNumber}
                        {" - "}
                        {room.roomType}
                        {" - "}
                        {room.occupied}
                        /
                        {room.capacity}
                        {" - "}
                        {room.hostel?.name}

                      </option>

                    )
                  )}

                </select>

              </div>


              <button
                className="match-button"
                onClick={
                  allocateRoom
                }
              >
                Allocate Room
              </button>


              {allocationMessage && (

                <div className="match-result">

                  {allocationMessage}

                </div>

              )}


            </div>

          </div>

        </div>

      </div>

    );
  }


  return null;
}


// =====================================================
// ADMIN NAVBAR
// =====================================================

function AdminNavbar({
  user,
  onLogout
}) {

  return (

    <nav className="dashboard-navbar">


      <h2>
        Smart Hostel - Admin
      </h2>


      <div className="admin-info">


        <span>
          Welcome, {user?.name}
        </span>


        <button
          onClick={onLogout}
        >
          Logout
        </button>


      </div>


    </nav>

  );
}


export default AdminDashboard;