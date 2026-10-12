
import { useEffect, useState } from "react";
import DataPage from "./DataPage";

const API = "http://localhost:8080/api";

function PaymentManagement({ isAdmin = false, studentId, onBack }) {
  const [payments, setPayments] = useState([]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState("");

  async function loadPayments() {
    setLoading(true);

    try {
      if (!isAdmin && !studentId) {
        throw new Error("Student account could not be identified.");
      }

      const endpoint = isAdmin
        ? `${API}/payments`
        : `${API}/payments/student/${studentId}`;

      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error("Unable to load payment history.");
      }

      const data = await response.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPayments();
  }, [isAdmin, studentId]);

  async function makePayment(event) {
    event.preventDefault();
    setMessage("");

    const paymentAmount = Number(amount);

    if (!studentId) {
      setMessage("Student account could not be identified.");
      return;
    }

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setMessage("Enter an amount greater than zero.");
      return;
    }

    setPaying(true);

    try {
      const response = await fetch(
        `${API}/payments/${studentId}?amount=${encodeURIComponent(paymentAmount)}`,
        { method: "POST" }
      );

      const result = await response.text();

      if (!response.ok || !result.startsWith("Payment successful")) {
        throw new Error(result || "Unable to record payment.");
      }

      setMessage(result);
      setAmount("");
      await loadPayments();
    } catch (error) {
      setMessage(error.message || "Unable to connect to the backend.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <DataPage
      title={isAdmin ? "Manage Student Payments" : "My Payments"}
      onBack={onBack}
    >
      {!isAdmin && (
        <form onSubmit={makePayment} className="preference-box">
          <h2>Record Demo Payment</h2>

          <p>
            This is a demonstration only. It does not transfer money
            or connect to a bank.
          </p>

          <div className="preference-field">
            <label htmlFor="paymentAmount">Amount (₹)</label>
            <input
              id="paymentAmount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
            />
          </div>

          <button
            className="match-button"
            type="submit"
            disabled={paying}
          >
            {paying ? "Processing..." : "Record Demo Payment"}
          </button>
        </form>
      )}

      {message && (
        <p className="match-result" role="status">
          {message}
        </p>
      )}

      <div style={{ marginTop: "20px" }}>
        <h2>{isAdmin ? "All Payments" : "Payment History"}</h2>

        <button
          className="match-button"
          type="button"
          onClick={loadPayments}
          disabled={loading}
        >
          Refresh Payments
        </button>

        {loading ? (
          <p>Loading payments...</p>
        ) : payments.length === 0 ? (
          <p>No payment records found.</p>
        ) : (
          <div style={{ overflowX: "auto", marginTop: "15px" }}>
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  {isAdmin && <th>Student</th>}
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.transactionId || "—"}</td>

                    {isAdmin && (
                      <td>
                        {payment.student?.name || "Unknown"}
                        {" (ID: "}
                        {payment.student?.id ?? "—"}
                        {")"}
                      </td>
                    )}

                    <td>₹{Number(payment.amount || 0).toFixed(2)}</td>
                    <td>{payment.paymentDate || "—"}</td>
                    <td>{payment.status || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DataPage>
  );
}

export default PaymentManagement;
