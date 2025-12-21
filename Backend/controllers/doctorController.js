const DoctorProfile = require("../models/DoctorProfile");
const User = require("../models/User");

const getAllDoctors = async (req, res, next) => {
  try {
    const { query } = req.query;

    let userQuery = { role: "doctor" };
    if (query) {
      userQuery.name = { $regex: query, $options: "i" };
    }

    const doctors = await User.find(userQuery).select("name email phone gender");

    const doctorData = await Promise.all(
      doctors.map(async (doc) => {
        const profile = await DoctorProfile.findOne({ userId: doc._id });
        if (!profile) return null; 

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
          languages: profile.languages,
          awards: profile.awards,
        };
      })
    );

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
      data: { user, profile },
    });
  } catch (error) {
    next(error);
  }
};

const getDoctorProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(200).json({ success: true, data: null, message: "No profile created yet" });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const updateDoctorProfile = async (req, res, next) => {
  try {
    const {
      specialization, experience, qualifications, fees,
      clinicAddress, about, availableSlots,
      languages, awards, socialLinks
    } = req.body;

    let profile = await DoctorProfile.findOne({ userId: req.user.id });

    if (profile) {
      // Update existing
      if(specialization) profile.specialization = specialization;
      if(experience) profile.experience = experience;
      if(qualifications) profile.qualifications = qualifications;
      if(fees) profile.fees = fees;
      if(clinicAddress) profile.clinicAddress = clinicAddress;
      if(about) profile.about = about;
      if(availableSlots) profile.availableSlots = availableSlots;
      
      // Update New Fields
      if(languages) profile.languages = languages;
      if(awards) profile.awards = awards;
      if(socialLinks) profile.socialLinks = socialLinks;

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
        languages,
        awards,
        socialLinks
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