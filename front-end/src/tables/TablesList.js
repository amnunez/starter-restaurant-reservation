import React from "react";
import { finishTable } from "../utils/api";
import { useHistory } from "react-router-dom";

function TablesList({ tables }) {
  const history = useHistory();

  function handleFinish({ target }) {
    const confirm = window.confirm(
      "Is this table ready to seat new guests? This cannot be undone."
    );
    if (confirm) {
      const tableId = target.value;
      const abortController = new AbortController();
      finishTable(tableId, abortController.signal).then(() => {
        history.push("/");
      });
    }
  }

  const list = tables.map((table, index) => (
    <div key={index}>
      <h3>{table.table_name}</h3>
      <div>Capacity: {table.capacity}</div>
      <div>
        {table.reservation_id ? (
          <div data-table-id-status={table.table_id}>
            Status: Occupied
            <br />
            <button
              data-table-id-finish={table.table_id}
              value={table.table_id}
              onClick={handleFinish}
            >
              Finish
            </button>
          </div>
        ) : (
          <div data-table-id-status={table.table_id}>Status: Free</div>
        )}
      </div>
    </div>
  ));
  return (
    <div>
      <h1>Tables</h1>
      <br />
      {list}
    </div>
  );
}

export default TablesList;
