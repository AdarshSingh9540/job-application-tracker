import Company from "../models/company.model.js";

export const addApplication = async (req, res) => {
  try {
    const { company, role, location, stipend, applicationDate, status, jd, companyProfileLink, userId } = req.body;

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
      userId,
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

export const getAllApplications = async (req, res) => {
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
};

export const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedApplication = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

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

export const fetchCompnayByName = async (req, res) => {
  try {
    const { companyName } = req.params;

    if (!companyName) {
      return res.status(400).json({ error: "Company name is required" });
    }

    const applications = await Company.find({ company: new RegExp(companyName, "i") }); 

    if (!applications.length) {
      return res.status(404).json({ error: "No applications found for this company" });
    }

    return res.status(200).json({
      message: "Applications fetched successfully",
      data: applications,
    });
  } catch (err) {
    console.error("Error fetching applications by company:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getApplicationsByDate = async (req, res) => {
  try {
    const { userId, date } = req.params;

    if (!userId || !date) {
      return res.status(400).json({ error: "userId and date are required" });
    }

    // Ensure date is in the correct format (e.g., "7/15/2025")
    const applications = await Company.find({
      userId,
      applicationDate: date,
    });

    const count = applications.length;

    return res.status(200).json({
      message: `Found ${count} application(s) on ${date}`,
      data: applications,
      count: count,
    });
  } catch (err) {
    console.error("Error fetching applications by date:", err);
    res.status(500).json({ error: "Server error" });
  }
};