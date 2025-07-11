import express from "express"
import { addApplication } from "../../controllers/applicationController.js";
// const {addApplication} = require("../../controllers/applicationController")
// const express = require("express");
const router = express.Router();

router.post("/add-application", addApplication);

export default router;
