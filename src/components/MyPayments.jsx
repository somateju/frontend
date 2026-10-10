import { useEffect, useState } from "react";

function MyPayments({ user, onBack }) {

  const [studentId, setStudentId] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const HOSTEL_FEE = 25000;

  useEffect(() => {

    const loadPayments = async () => {

      try {

        // Find logged-in student
        const studentsResponse =
          await fetch(
            "http://localhost:8080/api/students"
          );

        const students =
          await studentsResponse.json();

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

        // Load student's payments
        const paymentsResponse =
          await fetch(
            `http://localhost:8080/api/payments/student/${student.id}`
          );

        const paymentData =
          await paymentsResponse.json();

        setPayments(paymentData);
        setLoading(false);

      } catch (error) {

        console.error(error);

        setMessage(
          "Unable to load payment details."
        );

        setLoading(false);
      }
    };

    loadPayments();

  }, [user]);

  const makePayment = async () => {

    if (!studentId) {

      setMessage(
        "Student information not found."
      );

      return;
    }

    try {

      setMessage(
        "Processing payment..."
      );

      const response =
        await fetch(
          `http://localhost:8080/api/payments/${studentId}?amount=${HOSTEL_FEE}`,
          {
            method: "POST"
          }
        );

      const data =
        await response.text();

      setMessage(data);

      // Reload payment history
      const paymentsResponse =
        await fetch(
          `http://localhost:8080/api/payments/student/${studentId}`
        );

      const paymentData =
        await paymentsResponse.json();

      setPayments(paymentData);

    } catch (error) {

      console.error(error);

      setMessage(
        "Payment failed. Please try again."
      );
    }
  };

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
          My Payments
        </h1>

        <div className="data-content">

          <p>
            Loading payment details...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="data-page">

      <button
        className="back-dashboard"
        onClick={onBack}
      >
        ← Back to Dashboard
      </button>

      <h1>
        My Payments
      </h1>

      <div className="data-content">

        <div className="preference-box">

          <h2>
            💳 Hostel Fee Payment
          </h2>

          <p>
            Your hostel fee for the current
            academic period.
          </p>

          <div className="payment-amount">

            <span>
              Hostel Fee
            </span>

            <strong>
              ₹{HOSTEL_FEE.toLocaleString("en-IN")}
            </strong>

          </div>

          <button
            className="match-button"
            onClick={makePayment}
          >
            💳 Pay ₹{HOSTEL_FEE.toLocaleString("en-IN")}
          </button>

          {message && (

            <div className="match-result">
              {message}
            </div>

          )}

        </div>

        <div className="payment-history">

          <h2>
            Payment History
          </h2>

          {payments.length === 0 ? (

            <p>
              No payments made yet.
            </p>

          ) : (

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Transaction ID</th>
                  <th>Date</th>
                </tr>

              </thead>

              <tbody>

                {payments.map(
                  (payment) => (

                    <tr key={payment.id}>

                      <td>
                        {payment.id}
                      </td>

                      <td>
                        ₹
                        {payment.amount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td>
                        {payment.status}
                      </td>

                      <td>
                        {payment.transactionId}
                      </td>

                      <td>
                        {payment.paymentDate}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default MyPayments;