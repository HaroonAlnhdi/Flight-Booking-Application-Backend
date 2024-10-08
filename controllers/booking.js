const express = require("express");
const router = express.Router({ mergeParams: true });

const User = require("../models/user");
const Trip = require("../models/Trip");

router.post("/:tripId", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const tripInfo = await Trip.findById(req.params.tripId);
    if (!tripInfo) {
      throw new Error("Trip not found");
    }
    if (!user) {
      throw new Error("User not found");
    }

    const { Qty } = req.body;
    if (!Qty || Qty <= 0) {
      throw new Error("Invalid quantity");
    }

    const existingBooking = user.bookings.find(
      (booking) => booking.trip.toString() === tripInfo._id.toString()
    );

    if (existingBooking) {
      existingBooking.Qty += Qty;
    } else {
      const booking = {
        Qty,
        depTripDate: tripInfo.dep_date_time,
        arrTripDate: tripInfo.arr_date_time,
        price: tripInfo.price,
        trip: tripInfo._id,
      };
      user.bookings.push(booking);
    }

    tripInfo.tickets -= Qty;
    await user.save();
    await tripInfo.save();

    res.status(201).json(user);
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
