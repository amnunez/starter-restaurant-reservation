const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasRequiredProperties = hasProperties("table_name", "capacity");

//MIDDLEWARE

const VALID_PROPERTIES = ["table_name", "capacity", "reservation_id"];

function hasOnlyValidProperties(req, res, next) {
  const { data = {} } = req.body;

  const invalidFields = Object.keys(data).filter(
    (field) => !VALID_PROPERTIES.includes(field)
  );

  if (invalidFields.length) {
    return next({
      status: 400,
      message: `Invalid field(s): ${invalidFields.join(", ")}`,
    });
  }
  next();
}

// Capacity must be a number
function capacitytIsValid(req, res, next) {
  const { capacity } = req.body.data;
  if (!Number.isInteger(capacity)) {
    return next({
      status: 400,
      message: `Capacity must be a number.`,
    });
  }
  next();
}

//Table name must be more than 1 letter
function tableNameIsValid(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    return next({
      status: 400,
      message: `Table name: ${table_name} must greater than one letter.`,
    });
  }
  next();
}

//Ensure table exists
async function tableExists(req, res, next) {
  const table = await service.read(req.params.tableId);
  if (table) {
    res.locals.table = table;
    return next();
  }
  next({
    status: 404,
    message: `Table ${req.params.tableId} cannot be found.`,
  });
}

//Ensure reservation exists
async function reservationExists(req, res, next) {
  if (req.body.data && req.body.data.reservation_id) {
    let { reservation_id } = req.body.data;

    const reservation = await reservationService.read(reservation_id);
    if (reservation) {
      res.locals.reservation = reservation;
      return next();
    }
    next({
      status: 404,
      message: `Reservation ${reservation_id} not found.`,
    });
  } else {
    return next({
      status: 400,
      message: "Request body has no data or is missing a reservation_id.",
    });
  }
}

//Ensure the table capacity is not less than the number of people in reservation
async function hasCapacity(req, res, next) {
  const table = res.locals.table;
  const { reservation_id } = req.body.data;
  const reservation = await reservationService.read(reservation_id);
  if (table.capacity >= reservation.people) {
    return next();
  }
  next({
    status: 400,
    message: `This table does not have capacity for a party size of ${reservation.people}. Please select a reservation with a party size of ${table.capacity} or less.`,
  });
}

//Ensure the table is not already occupied
async function tableIsNotOccupied(req, res, next) {
  const table = res.locals.table;
  if (!table.reservation_id) {
    return next();
  }
  next({
    status: 400,
    message: `Table ${table.table_name} is occupied. Please select a different table.`,
  });
}

//Checks that table is occupied
async function tableIsOccupied(req, res, next) {
  const tableId = req.params.tableId;
  const table = await service.read(tableId);
  if (table.reservation_id) {
    return next();
  } else {
    next({
      status: 400,
      message: `Table ${table.table_id} is not occupied`,
    });
  }
}

//Checks reservation seated status
async function reservationNotSeated(req, res, next) {
  const tableId = req.params.tableId;
  const table = await service.read(tableId);
  const { reservation_id } = req.body.data;
  const reservation = await reservationService.read(reservation_id);
  if (reservation.status === "seated") {
    return next({
      status: 400,
      message: `Reservation ${reservation_id} is already seated.`,
    });
  }
  next();
}

//CRUDL functions

async function list(req, res) {
  const data = await service.list();
  res.json({ data });
}

async function read(req, res) {
  const data = res.locals.table;
  res.json({ data });
}

async function create(req, res) {
  const newTable = await service.create(req.body.data);
  res.status(201).json({
    data: newTable,
  });
}

async function update(req, res) {
  const updatedTable = {
    ...req.body.data,
    table_id: req.params.tableId,
  };
  const data = await service.update(updatedTable);
  updatedTable.status = "Occupied";
  res.status(200).json({ data });
}

async function destroy(req, res) {
  const { tableId } = req.params;
  const { reservation_id } = res.locals.table;
  const data = await service.delete(tableId, reservation_id);

  res.status(200).json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasRequiredProperties,
    capacitytIsValid,
    tableNameIsValid,
    asyncErrorBoundary(create),
  ],
  read,
  update: [
    tableExists,
    reservationExists,
    asyncErrorBoundary(hasCapacity),
    asyncErrorBoundary(tableIsNotOccupied),
    asyncErrorBoundary(reservationNotSeated),
    asyncErrorBoundary(update),
  ],
  delete: [
    tableExists,
    asyncErrorBoundary(tableIsOccupied),
    asyncErrorBoundary(destroy),
  ],
};
