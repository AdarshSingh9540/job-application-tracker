import express from "express";
import {
  addQuestion,
  getAllQuestions,
  getPrivateQuestions,
  getPublicQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getAllQuestionsWithVisibility,
} from "../../controllers/questionController.js";

const router = express.Router();

router.post("/add-question", addQuestion);
router.get("/fetch-questions/:userId", getAllQuestions);
router.get("/fetch-private-questions/:userId", getPrivateQuestions);
router.get("/fetch-public-questions", getPublicQuestions);
router.get("/fetch-question/:id", getQuestionById);
router.put("/update-question/:id", updateQuestion);
router.delete("/delete-question/:id", deleteQuestion);
router.get("/fetch-all-questions-with-visibility", getAllQuestionsWithVisibility);
export default router;