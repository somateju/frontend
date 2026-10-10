import { useEffect, useState } from "react";

function MyRoom({ user, onBack }) {

  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {

    const loadMyRoom = async () => {

      try {

        // Get all students
        const studentsResponse =
          await fetch(
            "http://localhost:8080/api/students"
          );

        const students =
          await studentsResponse.json();

        // Find logged-in student
        const student = students.find(
          (item) => item.email === user?.email
        );

        if (!student) {
          setMessage(
            "Student information not found."
          );
          setLoading(false);
          return;
        }

        // Get all room allocations
        const allocationsResponse =
          await fetch(
            "http://localhost:8080/api/allocations"
          );

        const allocations =
          await allocationsResponse.json();

        // Find this student's allocation
        const allocation = allocations.find(
          (item) =>
            item.student?.id === student.id
        );

        if (!allocation) {

          setMessage(
            "No room has been allocated to you yet."
          );

          setLoading(false);
          return;
        }

        setRoomData(allocation);
        setLoading(false);

      } catch (error) {

        console.error(
          "Error loading room:",
          error
        );

        setMessage(
          "Unable to load room details."
        );

        setLoading(false);
      }
    };

    loadMyRoom();

  }, [user]);


  return (

    <div className="data-page">

      {/* BACK BUTTON */}

      <button
        className="back-dashboard"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>


      <h1>
        My Room
      </h1>


      <div className="data-content">

        {loading && (
          <p>
            Loading room details...
          </p>
        )}


        {!loading && message && (
          <div className="match-result">
            {message}
          </div>
        )}


        {!loading && roomData && (

          <div className="room-details">

            <h2>
              Room Allocation Details
            </h2>

            <p>
              <strong>
                Student Name:
              </strong>{" "}
              {roomData.student?.name}
            </p>

            <p>
              <strong>
                Room Number:
              </strong>{" "}
              {roomData.room?.roomNumber}
            </p>

            <p>
              <strong>
                Room Type:
              </strong>{" "}
              {roomData.room?.roomType}
            </p>

            <p>
              <strong>
                Capacity:
              </strong>{" "}
              {roomData.room?.capacity}
            </p>

            <p>
              <strong>
                Occupied:
              </strong>{" "}
              {roomData.room?.occupied}
            </p>

            <p>
              <strong>
                Hostel:
              </strong>{" "}
              {roomData.room?.hostel?.name}
            </p>

            <p>
              <strong>
                Location:
              </strong>{" "}
              {roomData.room?.hostel?.location}
            </p>

            <p>
              <strong>
                Allocation Date:
              </strong>{" "}
              {roomData.allocationDate}
            </p>

          </div>

        )}

      </div>

    </div>

  );
}

export default MyRoom;