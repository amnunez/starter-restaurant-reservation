import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";
import ReservationList from "../reservations/ReservationList";

function Search() {
  //   const [search, setSearch] = useState({
  //     mobile_number: "",
  //   });

  const initialFormState = {
    mobile_number: "",
  };
  const [formData, setFormData] = useState({ ...initialFormState });
  const [reservations, setReservations] = useState([]);
  const [errors, setErrors] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const abortController = new AbortController();

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(true);

    listReservations(formData, abortController.signal)
      .then(setReservations)
      .catch(setErrors);
    return () => abortController.abort();
  }

  function handleChange({ target }) {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  }

  return (
    <main>
      <h1 className="mb-3">Search</h1>
      <div>
        <form onSubmit={handleSubmit}>
          <div className="row mb-3">
            <div className="col-md-6 col-sm-10 form-group">
              <label className="form-label" htmlFor="mobile_number">
                Mobile Number
              </label>
              <input
                className="form-control"
                id="mobile_number"
                name="mobile_number"
                type="text"
                placeholder="Enter a customer's phone number"
                value={formData.mobile_number}
                onChange={handleChange}
                required={true}
              />
            </div>
          </div>
          <div>
            <ErrorAlert error={errors} />
            {submitted && reservations.length <= 0 && `No reservations found.`}
          </div>
          <div>
            <button type="submit" className="btn btn-primary mb-3">
              Find
            </button>
          </div>
        </form>
      </div>
      <br />
      <section>
        <ReservationList reservations={reservations} />
      </section>
    </main>
  );
}
export default Search;
