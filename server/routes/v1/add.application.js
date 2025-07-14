import express from "express"
import { addApplication,getAllApplications,updateApplication, deleteApplication, fetchCompnayByName, getApplicationsByDate } from "../../controllers/applicationController.js";
// const {addApplication} = require("../../controllers/applicationController")
// const express = require("express");
import Company from "../../models/company.model.js";
const router = express.Router();

router.post("/add-application", addApplication);
router.get("/fetch-application/:userId", getAllApplications);
router.put("/update-application/:id", updateApplication);
router.delete("/delete-application/:id", deleteApplication);
router.get("/fetch-application-by-company/:companyName",fetchCompnayByName);
router.get("/fetch-application-by-date/:userId/:date", getApplicationsByDate);
export default router;
