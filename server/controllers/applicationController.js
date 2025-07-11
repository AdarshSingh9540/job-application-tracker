
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

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params; // application id
    const updateData = req.body;

    const updatedApplication = await Company.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({
      message: "Application updated successfully",
      data: updatedApplication,
    });
  } catch (err) {
    console.error("Error updating application:", err);
    res.status(500).json({ error: "Server error" });
  }
};


export const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedApplication = await Company.findByIdAndDelete(id);

    if (!deletedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.status(200).json({
      message: "Application deleted successfully",
      data: deletedApplication,
    });
  } catch (err) {
    console.error("Error deleting application:", err);
    res.status(500).json({ error: "Server error" });
  }
};
