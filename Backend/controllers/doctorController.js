const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

const getAllDoctors = async (req, res, next) => {
  try {
    const { query } = req.query; // Search by name or specialization

    // 1. Find Users who are doctors
    let userQuery = { role: "doctor" };

    if (query) {
      userQuery.name = { $regex: query, $options: "i" }; // Partial match, case insensitive
    }

    const doctors = await User.find(userQuery).select(
      "name email phone gender"
    );

    // 2. Get their profile details (specialization, fees, etc.)
    const doctorData = await Promise.all(
      doctors.map(async (doc) => {
        const profile = await DoctorProfile.findOne({ userId: doc._id });
        if (!profile) return null; // Skip if no profile set up

        return {
          _id: doc._id,
          name: doc.name,
          email: doc.email,
          specialization: profile.specialization,
          experience: profile.experience,
          fees: profile.fees,
          clinicAddress: profile.clinicAddress,
          isApproved: profile.isApproved,
          availableSlots: profile.availableSlots,
        };
      })
    );

    // Filter out nulls (doctors without profiles)
    const activeDoctors = doctorData.filter((d) => d !== null);

    res.status(200).json({
      success: true,
      count: activeDoctors.length,
      data: activeDoctors,
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user || user.role !== "doctor") {
      res.status(404);
      throw new Error("Doctor not found");
    }

    const profile = await DoctorProfile.findOne({ userId: req.params.id });

    if (!profile) {
      res.status(404);
      throw new Error("Doctor profile incomplete");
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user.id });

    if (!profile) {
      return res
        .status(200)
        .json({ success: true, data: null, message: "No profile created yet" });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      specialization,
      experience,
      qualifications,
      fees,
      clinicAddress,
      about,
      availableSlots,
    } = req.body;

    // Check if profile exists
    let profile = await DoctorProfile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing
      profile.specialization = specialization || profile.specialization;
      profile.experience = experience || profile.experience;
      profile.qualifications = qualifications || profile.qualifications;
      profile.fees = fees || profile.fees;
      profile.clinicAddress = clinicAddress || profile.clinicAddress;
      profile.about = about || profile.about;
      profile.availableSlots = availableSlots || profile.availableSlots;

      const updatedProfile = await profile.save();
      return res.status(200).json({ success: true, data: updatedProfile });
    } else {
      // Create new
      profile = await DoctorProfile.create({
        userId: req.user.id,
        specialization,
        experience,
        qualifications,
        fees,
        clinicAddress,
        about,
        availableSlots,
      });

      return res.status(201).json({ success: true, data: profile });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
};
