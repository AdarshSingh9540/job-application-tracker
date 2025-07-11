import express from "express"
import { addApplication,getAllApplications,updateApplication, deleteApplication } from "../../controllers/applicationController.js";
// const {addApplication} = require("../../controllers/applicationController")
// const express = require("express");
const router = express.Router();

router.post("/add-application", addApplication);
router.get("/fetch-application/:userId", getAllApplications);
router.put("/update-application/:id", updateApplication);
router.delete("/delete-application/:id", deleteApplication);

export default router;
