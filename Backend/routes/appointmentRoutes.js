const express = require("express");
const {
  bookAppointment,
  getMyAppointments,
  updateAppointmentStatus,
  completeConsultation // Import
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorize("patient"), bookAppointment);
router.get("/my-appointments", protect, getMyAppointments);
router.put("/:id", protect, authorize("doctor", "admin"), updateAppointmentStatus);

router.put("/:id/consultation", protect, authorize("doctor"), completeConsultation);

module.exports = router;