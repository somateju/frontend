import { useEffect, useState } from "react";

import StudentPreferences from "../components/StudentPreferences";
import MyRoom from "../components/MyRoom";
import RoommateMatching from "../components/RoommateMatching";
import MyPayments from "../components/MyPayments";

function StudentDashboard({ user, onLogout }) {

  const [activePage, setActivePage] =
    useState("dashboard");

  const [students, setStudents] =
    useState([]);

  const [currentStudent, setCurrentStudent] =
    useState(null);

  useEffect(() => {

    const loadStudents = async () => {

      try {

        const response =
          await fetch(
            "http://localhost:8080/api/students"
          );

        const data =
          await response.json();

        setStudents(data);

        const student =
          data.find(
            (item) =>
              item.email === user?.email
          );

        if (student) {
          setCurrentStudent(student);
        }

      } catch (error) {

        console.error(
          "Error loading students:",
          error
        );

      }
    };

    loadStudents();

  }, [user]);


  // =========================
  // STUDENT DASHBOARD
  // =========================

  if (activePage === "dashboard") {

    return (
      <div className="dashboard">

        <nav className="dashboard-navbar">

          <h2>
            Smart Hostel - Student
          </h2>

          <div className="admin-info">

            <span>
              Welcome, {user?.name}
            </span>

            <button onClick={onLogout}>
              Logout
            </button>

          </div>

        </nav>


        <div className="student-welcome">

          <h1>
            Student Dashboard
          </h1>

          <p>
            Manage your profile, preferences,
            roommate matching, room details
            and hostel payments.
          </p>


          <div className="student-cards">


            {/* =====================
                MY PROFILE
            ====================== */}

            <div className="dashboard-card">

              <div className="card-icon">
                👤
              </div>

              <h3>
                My Profile
              </h3>

              <p>
                View your complete student
                profile information.
              </p>

              <button
                onClick={() =>
                  setActivePage("profile")
                }
              >
                View Profile
              </button>

            </div>


            {/* =====================
                MY PREFERENCES
            ====================== */}

            <div className="dashboard-card">

              <div className="card-icon">
                ❤️
              </div>

              <h3>
                My Preferences
              </h3>

              <p>
                Submit your lifestyle and
                roommate preferences.
              </p>

              <button
                onClick={() =>
                  setActivePage("preferences")
                }
              >
                Manage Preferences
              </button>

            </div>


            {/* =====================
                FIND ROOMMATE
            ====================== */}

            <div className="dashboard-card">

              <div className="card-icon">
                🤝
              </div>

              <h3>
                Find Roommate
              </h3>

              <p>
                Find your most compatible
                roommate automatically.
              </p>

              <button
                onClick={() =>
                  setActivePage("matching")
                }
              >
                Find Roommate
              </button>

            </div>


            {/* =====================
                MY ROOM
            ====================== */}

            <div className="dashboard-card">

              <div className="card-icon">
                🏠
              </div>

              <h3>
                My Room
              </h3>

              <p>
                View your allocated hostel
                room details.
              </p>

              <button
                onClick={() =>
                  setActivePage("room")
                }
              >
                View My Room
              </button>

            </div>


            {/* =====================
                MY PAYMENTS
            ====================== */}

            <div className="dashboard-card">

              <div className="card-icon">
                💳
              </div>

              <h3>
                My Payments
              </h3>

              <p>
                Pay your hostel fee and
                view payment history.
              </p>

              <button
                onClick={() =>
                  setActivePage("payments")
                }
              >
                View Payments
              </button>

            </div>


          </div>

        </div>

      </div>
    );
  }


  // =========================
  // MY PROFILE
  // =========================

  if (activePage === "profile") {

    return (
      <div className="dashboard">

        <StudentNavbar
          user={user}
          onLogout={onLogout}
        />


        <div className="data-page">

          <button
            className="back-dashboard"
            onClick={() =>
              setActivePage("dashboard")
            }
          >
            ← Back to Dashboard
          </button>


          <h1>
            My Profile
          </h1>


          <div className="data-content">

            <div className="student-profile">

              <h2>
                Student Information
              </h2>


              {currentStudent ? (

                <>

                  <p>
                    <strong>
                      Student ID:
                    </strong>{" "}
                    {currentStudent.id}
                  </p>


                  <p>
                    <strong>
                      Name:
                    </strong>{" "}
                    {currentStudent.name}
                  </p>


                  <p>
                    <strong>
                      Email:
                    </strong>{" "}
                    {currentStudent.email}
                  </p>


                  <p>
                    <strong>
                      Branch:
                    </strong>{" "}
                    {currentStudent.branch}
                  </p>


                  <p>
                    <strong>
                      Year:
                    </strong>{" "}
                    {currentStudent.year}
                  </p>


                  <p>
                    <strong>
                      Gender:
                    </strong>{" "}
                    {currentStudent.gender}
                  </p>


                  <p>
                    <strong>
                      Role:
                    </strong>{" "}
                    Student
                  </p>

                </>

              ) : (

                <p>
                  Loading student information...
                </p>

              )}

            </div>

          </div>

        </div>

      </div>
    );
  }


  // =========================
  // MY PREFERENCES
  // =========================

  if (activePage === "preferences") {

    return (
      <div className="dashboard">

        <StudentNavbar
          user={user}
          onLogout={onLogout}
        />


        <StudentPreferences
          user={user}
          onBack={() =>
            setActivePage("dashboard")
          }
        />

      </div>
    );
  }


  // =========================
  // ROOMMATE MATCHING
  // =========================

  if (activePage === "matching") {

    return (
      <div className="dashboard">

        <StudentNavbar
          user={user}
          onLogout={onLogout}
        />


        <RoommateMatching
          students={students}
          currentStudentId={
            currentStudent?.id
          }
          onBack={() =>
            setActivePage("dashboard")
          }
        />

      </div>
    );
  }


  // =========================
  // MY ROOM
  // =========================

  if (activePage === "room") {

    return (
      <div className="dashboard">

        <StudentNavbar
          user={user}
          onLogout={onLogout}
        />


        <MyRoom
          user={user}
          onBack={() =>
            setActivePage("dashboard")
          }
        />

      </div>
    );
  }


  // =========================
  // MY PAYMENTS
  // =========================

  if (activePage === "payments") {

    return (
      <div className="dashboard">

        <StudentNavbar
          user={user}
          onLogout={onLogout}
        />


        <MyPayments
          user={user}
          onBack={() =>
            setActivePage("dashboard")
          }
        />

      </div>
    );
  }


  return null;
}


// =================================
// STUDENT NAVBAR
// =================================

function StudentNavbar({
  user,
  onLogout
}) {

  return (
    <nav className="dashboard-navbar">

      <h2>
        Smart Hostel - Student
      </h2>


      <div className="admin-info">

        <span>
          Welcome, {user?.name}
        </span>


        <button onClick={onLogout}>
          Logout
        </button>

      </div>

    </nav>
  );
}


export default StudentDashboard;