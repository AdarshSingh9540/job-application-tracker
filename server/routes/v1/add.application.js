import express from "express"
import { addApplication,getAllApplications } from "../../controllers/applicationController.js";
// const {addApplication} = require("../../controllers/applicationController")
// const express = require("express");
const router = express.Router();

router.post("/add-application", addApplication);
router.get("/fetch-application/:userId", getAllApplications);
export default router;
