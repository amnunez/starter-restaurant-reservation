import React from "react";
import { useHistory } from "react-router-dom";

function ReservationForm({ formData, handleChange, handleSubmit }) {
  const history = useHistory();

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="first_name">
        First Name:
        <input
          type="text"
          name="first_name"
          id="first_name"
          value={formData.first_name}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="last_name">
        Last Name:
        <input
          type="text"
          name="last_name"
          id="last_name"
          value={formData.last_name}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="mobile_number">
        Phone Number:
        <input
          type="tel"
          name="mobile_number"
          id="mobile_number"
          value={formData.mobile_number}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="reservation_date">
        Date:
        <input
          type="date"
          placeholder="YYYY-MM-DD"
          pattern="\d{4}-\d{2}-\d{2}"
          name="reservation_date"
          id="reservation_date"
          value={formData.reservation_date}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="reservation_time">
        Time:
        <input
          type="time"
          placeholder="HH:MM"
          pattern="[0-9]{2}:[0-9]{2}"
          name="reservation_time"
          id="reservation_time"
          value={formData.reservation_time}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="people">
        Party Size:
        <input
          type="number"
          name="people"
          id="people"
          min="1"
          value={formData.people}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <button onClick={() => history.goBack()}>Cancel</button>
      <button type="submit" onClick={(event) => handleSubmit(event)}>
        Submit
      </button>
    </form>
  );
}

export default ReservationForm;
