import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { listReservations, listTables, updateStatus } from "../utils/api";
import { previous, next } from "../utils/date-time";
import ReservationList from "../reservations/ReservationList";
import TablesList from "../tables/TablesList";
import useQuery from "../utils/useQuery";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const query = useQuery();
  if (query.get("date")) {
    date = query.get("date");
  }

  const history = useHistory();

  const [reservations, setReservations] = useState([]);
  const [errors, setErrors] = useState(null);

  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setErrors(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setErrors);
    listTables(abortController.signal).then(setTables).catch(setErrors);
    return () => abortController.abort();
  }

  function handleCancel(event) {
    const confirm = window.confirm(
      "Do you want to cancel this reservation? This cannot be undone."
    );
    if (confirm) {
      const abortController = new AbortController();
      let status = "cancelled";
      const reservation_id = event.target.value;
      updateStatus(status, reservation_id, abortController.signal).then(() => {
        history.push("/");
      });
    }
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <div className="row mx-2">
        <Link
          to={`/dashboard/?date=${previous(date)}`}
          className="btn btn-dark"
        >
          Previous
        </Link>
        &nbsp;
        <Link to={`/dashboard`} className="btn btn-light">
          Today
        </Link>
        &nbsp;
        <Link to={`/dashboard/?date=${next(date)}`} className="btn btn-dark">
          Next
        </Link>
      </div>
      <br />
      <div className="row">
        <div className="col-6">
          <ReservationList
            reservations={reservations}
            handleCancel={handleCancel}
          />
        </div>
        <div>
          <TablesList tables={tables} />
        </div>
      </div>
      <ErrorAlert error={errors} />
    </main>
  );
}
//{JSON.stringify(reservations)}
export default Dashboard;
