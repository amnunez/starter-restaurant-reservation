import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { editReservation, readReservation } from "../utils/api";
import ReservationForm from "./ReservationForm";
import ErrorAlert from "../layout/ErrorAlert";

function EditReservation() {
  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: "",
    status: "",
  };

  const { reservationId } = useParams();
  const [formData, setFormData] = useState({ ...initialFormState });
  const [errors, setErrors] = useState([]);
  const history = useHistory();

  useEffect(() => {
    async function loadReservation() {
      try {
        const data = await readReservation(reservationId);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          mobile_number: data.mobile_number,
          reservation_date: data.reservation_date.slice(0, 10),
          reservation_time: data.reservation_time.slice(0, 5),
          people: data.people,
          status: data.status,
        });
      } catch (error) {
        setErrors([error]);
      }
    }
    loadReservation();
  }, [reservationId]);
  /*=> {
        loadReservation();
    }, [reservationId]);*/

  //load reservaton
  /* async function loadReservation() {
        try {
            const data = await readReservation(reservationId)
            //.then((data) => 
            setFormData({
                first_name: data.first_name,
                last_name: data.last_name,
                mobile_number: data.mobile_number,
                reservation_date: data.reservation_date,
                reservation_time: data.reservation_time.slice(0, 5),
                people: data.people,
                status: data.status
            })
        } catch (error) {
            setErrors([error]);
        }
            
    };*/

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    //if (changed) {
    try {
      const updatedReservation = await editReservation(reservationId, formData);
      history.push(`/dashboard/?date=${updatedReservation.reservation_date}`);
    } catch (error) {
      if (error === !"AbortError") {
        setErrors([error]);
      }
    }
  };

  return (
    <main>
      <div>
        <h1>Edit Reservation</h1>
      </div>
      <div>{errors.length > 0 && <ErrorAlert errors={errors} />}</div>
      <ReservationForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </main>
  );
}
export default EditReservation;
