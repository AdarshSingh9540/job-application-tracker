
import Company from "../models/company.model.js";

export const addApplication = async (req, res) => {
  try {
    const {

      company,
      role,
      location,
      stipend,
      applicationDate,
      status,
      jd,
      companyProfileLink,
      userId
    } = req.body;

    if (!company || !role) {
      return res.status(400).json({ error: "Company and role are required" });
    }

    const newApplication = new Company({
      company,
      role,
      location,
      stipend,
      applicationDate,
      status,
      jd,
      companyProfileLink,
      userId
    });

    const savedApplication = await newApplication.save();

    return res.status(201).json({
      message: "Application added successfully",
      data: savedApplication,
    });
  } catch (err) {
    console.error("Error adding application:", err);
    res.status(500).json({ error: "Server error" });
  }
};
