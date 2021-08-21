import React from "react";
import { useHistory } from "react-router-dom";

function TableForm({ formData, handleChange, handleSubmit }) {
  const history = useHistory();

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="table_name">
        Table Name:
        <input
          type="text"
          name="table_name"
          id="table_name"
          value={formData.table_name}
          onChange={handleChange}
          required
        />
      </label>
      <br />
      <label htmlFor="capacity">
        Capacity:
        <input
          type="number"
          name="capacity"
          id="capacity"
          min="1"
          value={formData.capacity}
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

export default TableForm;
