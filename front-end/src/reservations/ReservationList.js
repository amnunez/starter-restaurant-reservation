import React from "react";
import { formatAsTime } from "../utils/date-time";
import { Link } from "react-router-dom";
function ReservationList({ reservations, handleCancel }) {
  if (reservations.length > 0) {
    return reservations.map((reservation, index) => (
      <div key={index}>
        <h3>
          {reservation.first_name} {reservation.last_name}
        </h3>
        <div>
          Phone: {reservation.mobile_number}
          <br />
          Time: {formatAsTime(reservation.reservation_time)}
          <br />
          Party size: {reservation.people}
          <br />
          <p data-reservation-id-status={reservation.reservation_id}>
            Status: {reservation.status}
          </p>
        </div>
        <div>
          {reservation.status === "booked" ? (
            <>
              <Link to={`/reservations/${reservation.reservation_id}/seat`}>
                <button
                  className="btn btn-primary mr-2 mb-3"
                  href={`/reservations/${reservation.reservation_id}/seat`}
                  value={`${reservation.reservation_id}`}
                >
                  Seat
                </button>
              </Link>
              <Link to={`/reservations/${reservation.reservation_id}/edit`}>
                <button
                  className="btn btn-primary mr-2 mb-3"
                  href={`/reservations/${reservation.reservation_id}/edit`}
                >
                  Edit
                </button>
              </Link>
              <button
                className="btn btn-danger mb-3"
                data-reservation-id-cancel={reservation.reservation_id}
                onClick={handleCancel}
                value={reservation.reservation_id}
              >
                Cancel
              </button>
            </>
          ) : (
            ""
          )}
        </div>
      </div>
    ));
  } else {
    return <div>No reservations currently scheduled for this date</div>;
  }
}

export default ReservationList;
