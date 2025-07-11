
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


export const getAllApplications  = async(req,res)=>{
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId param is required" });
    }

    const applications = await Company.find({ userId });

    return res.status(200).json({
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ error: "Server error" });
  }
}