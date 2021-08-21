const service = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const hasRequiredProperties = hasProperties(
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people"
);

const VALID_PROPERTIES = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
  "reservation_id",
  "created_at",
  "updated_at",
  "status",
];

//MIDDLEWARE

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

// Validates that people is a number
function peopleIsValid(req, res, next) {
  const { people } = req.body.data;
  if (!Number.isInteger(people)) {
    return next({
      status: 400,
      message: `Number of people entered must be a number`,
    });
  }
  next();
}

//Validates date and time
function dateIsValid(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;

  //Validates date format: YYYY-MM-DD
  let validDate = /^\d{4}\-\d{1,2}\-\d{1,2}$/;
  if (validDate.test(reservation_date) == false) {
    return next({
      status: 400,
      message: `reservation_date is invalid.`,
    });
  }

  //Makes sure reservation is set for a future date
  let today = new Date();
  let formattedReservation = new Date(
    `${reservation_date} ${reservation_time}`
  );

  if (formattedReservation < today) {
    return next({
      status: 400,
      message: `Reservation must be made for a future date.`,
    });
  }

  //Makes sure reservation can't be made on Tuesday when restaurant is closed
  if (formattedReservation.getDay() == 2) {
    return next({
      status: 400,
      message: `The restaurant is closed on Tuesdays.`,
    });
  }

  next();
}

function timeIsValid(req, res, next) {
  const { reservation_time } = req.body.data;
  let validTime = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/;
  if (validTime.test(reservation_time) == false) {
    return next({
      status: 400,
      message: `reservation_time is invalid.`,
    });
  }

  //Checks that reservation can only be made for future time between 10:30AM and 9:30PM.
  let timeNow = Date.now();
  if (
    reservation_time < timeNow ||
    reservation_time < "10:30" ||
    reservation_time > "21:30"
  ) {
    return next({
      status: 400,
      message: `Reservation must be between 10:30AM and 9:30PM.`,
    });
  }
  next();
}

//Validates is reservation exists
async function reservationExists(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);

  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `Reservation ${reservationId} was not found.`,
  });
}

//Reservation status for Creation
async function statusIsValid(req, res, next) {
  const { status } = req.body.data;
  if (status) {
    if (status !== "booked") {
      return next({
        status: 400,
        message: `Cannot seat a reservation with a status of ${status}.`,
      });
    } else if (status === "booked") {
      return next();
    }
  }
  next();
}

//Unknown or finished status
async function unknownOrFinished(req, res, next) {
  const { reservationId } = req.params;
  const reservation = await service.read(reservationId);
  const { status } = req.body.data;

  if (status === "unknown" || reservation.status === "finished") {
    return next({
      status: 400,
      message: `Cannot seat or update a reservation with a finished or unknown status.`,
    });
  }
  next();
}

// CRUDL functions

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date, mobile_number } = req.query;
  let data;
  if (date) {
    data = await service.listByDate(date);
  } else if (mobile_number) {
    data = await service.search(mobile_number);
  } else {
    data = await service.list();
  }
  res.json({ data });
}

async function create(req, res) {
  const newReservation = await service.create(req.body.data);
  res.status(201).json({
    data: newReservation,
  });
}

async function read(req, res) {
  const data = res.locals.reservation;
  res.json({ data });
}

async function update(req, res) {
  const updatedReservation = {
    ...req.body.data,
    reservation_id: req.params.reservationId,
  };
  const data = await service.update(updatedReservation);
  res.json({ data });
}

async function updateStatus(req, res) {
  const { reservationId } = req.params;
  const { status } = req.body.data;
  const data = await service.updateStatus(reservationId, status);
  res.json({ data });
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasOnlyValidProperties,
    hasRequiredProperties,
    peopleIsValid,
    timeIsValid,
    dateIsValid,
    asyncErrorBoundary(statusIsValid),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(reservationExists), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(reservationExists),
    hasOnlyValidProperties,
    hasRequiredProperties,
    peopleIsValid,
    timeIsValid,
    dateIsValid,
    asyncErrorBoundary(statusIsValid),
    asyncErrorBoundary(unknownOrFinished),
    update,
  ],
  updateStatus: [
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(unknownOrFinished),
    asyncErrorBoundary(updateStatus),
  ],
};
