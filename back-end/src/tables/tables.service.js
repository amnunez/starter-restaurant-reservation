const knex = require("../db/connection");

function list() {
  return knex("tables").select("*").orderBy("table_name");
}

function create(newTable) {
  return knex("tables")
    .insert(newTable)
    .returning("*")
    .then((createdTable) => createdTable[0]);
}

function read(tableId) {
  return knex("tables").select("*").where({ table_id: tableId }).first();
}

// function update(updatedTable) {
//   const updated = knex("reservations")
//     .select("*")
//     .where({ reservation_id: updatedTable.reservation_id })
//     .update({ status: "seated" })
//     //.limit(1);
//     //.then((updated) => updated[0]);
//     .then(() => {
//       return knex("tables")
//         .where({ table_id: updatedTable.table_id })
//         .update({ reservation_id: updatedTable.reservation_id })
//         .returning("*");
//     });
//   return updated;
// }

async function update({ table_id, reservation_id }) {
  const trx = await knex.transaction();
  let updated = {};
  return trx("reservations")
    .where({ reservation_id: reservation_id })
    .update({ status: "seated" })
    .then(() =>
      trx("tables")
        .where({ table_id: table_id })
        .update({ reservation_id: reservation_id }, [
          "table_id",
          "table_name",
          "capacity",
          "status",
          "reservation_id",
        ])
        .then((result) => (updated = result[0]))
    )
    .then(trx.commit)
    .then(() => updated)
    .catch(trx.rollback);
}

// function destroy(tableToDelete) {
//   const deleted = knex("reservations")
//     .select("*")
//     .where({ reservation_id: tableToDelete.reservation_id })
//     .update({ status: "finished" })
//     //.limit(1);
//     //.then((updated) => updated[0]);
//     .then(() => {
//       return knex("tables")
//         .where({ table_id: tableToDelete.table_id })
//         .update({ reservation_id: null })
//         .returning("*");
//     });
//   return deleted;
// }

function update({ table_id, reservation_id }) {
  return knex.transaction((trx) => {
    return knex("reservations")
      .transacting(trx)
      .where({ reservation_id: reservation_id })
      .update({ status: "seated" })
      .then(() => {
        return knex("tables")
          .where({ table_id: table_id })
          .update({ reservation_id: reservation_id })
          .returning("*");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
}
function destroy(table_id, reservation_id) {
  return knex.transaction((trx) => {
    return knex("reservations")
      .transacting(trx)
      .where({ reservation_id: reservation_id })
      .update({ status: "finished" })
      .returning("*")
      .then(() => {
        return knex("tables")
          .where({ table_id: table_id })
          .update({ reservation_id: null })
          .returning("*");
      })
      .then(trx.commit)
      .catch(trx.rollback);
  });
}

module.exports = {
  create,
  read,
  update,
  list,
  delete: destroy,
};
