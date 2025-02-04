const router = require("express").Router({ mergeParams: true });
const controller = require("./reservations.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
/**
 * Defines the router for reservation resources.
 *
 * @type {Router}
 */

router
  .route("/:reservationId/status")
  .get(controller.read)
  .put(controller.updateStatus);

router.route("/:reservationId/edit").put(controller.update);

router
  .route("/:reservationId")
  .get(controller.read)
  .put(controller.update)
  .all(methodNotAllowed);

router
  .route("/")
  .get(controller.list)
  .post(controller.create)
  .all(methodNotAllowed);

module.exports = router;
