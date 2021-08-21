import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";

function NewReservation() {
  //const { reservation_id } = useParams();
  const history = useHistory();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "10:30",
    people: "1",
    status: "booked",
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [errors, setErrors] = useState(null);

  //Change handler
  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  }

  //Sumbit handler
  async function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    createReservation(formData, abortController.signal)
      .then(() => {
        history.push(`/dashboard/?date=${formData.reservation_date}`);
      })
      .catch(setErrors);
    return () => abortController.abort();
  }

  return (
    <div>
      <h1>New Reservation</h1>
      <div>
        <ReservationForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
        <ErrorAlert error={errors} />
      </div>
    </div>
  );
}

export default NewReservation;
