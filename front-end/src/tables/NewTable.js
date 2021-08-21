import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import TableForm from "./TableForm";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const initialFormState = {
    table_name: "",
    capacity: "",
  };

  const [formData, setFormData] = useState({ ...initialFormState });
  const [errors, setErrors] = useState(null);

  const history = useHistory();

  const handleChange = ({ target }) => {
    setFormData({
      ...formData,
      [target.name]: target.value,
    });
  };

  //Sumbit handler
  async function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();
    createTable(formData, abortController.signal)
      .then(() => {
        history.push("/dashboard");
      })
      .catch(setErrors);
    return () => abortController.abort();
  }

  return (
    <div>
      <h1>New Table</h1>
      <TableForm
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
      <ErrorAlert error={errors} />
    </div>
  );
}

export default NewTable;
