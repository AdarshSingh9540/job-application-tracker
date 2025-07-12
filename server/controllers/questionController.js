import InterviewQuestion from "../models/interview.question.js";

export const addQuestion = async (req, res) => {
  try {
    const { userId, company, question, isPublic } = req.body;
    if (!company || !question) {
      return res.status(400).json({ error: "Company and question are required" });
    }
    const newQuestion = new InterviewQuestion({
      userId,
      company,
      question,
      isPublic,
    });
    const savedQuestion = await newQuestion.save();
    return res.status(201).json({
      message: "Question added successfully",
      data: savedQuestion,
    });
  } catch (err) {
    console.error("Error adding question:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getAllQuestions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId param is required" });
    }
    const questions = await InterviewQuestion.find({ userId });
    return res.status(200).json({
      message: "Questions fetched successfully",
      data: questions,
    });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPrivateQuestions = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId param is required" });
    }
    const questions = await InterviewQuestion.find({ userId, isPublic: false });
    return res.status(200).json({
      message: "Private questions fetched successfully",
      data: questions,
    });
  } catch (err) {
    console.error("Error fetching private questions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getPublicQuestions = async (req, res) => {
  try {
    const questions = await InterviewQuestion.find({ isPublic: true });
    return res.status(200).json({
      message: "Public questions fetched successfully",
      data: questions,
    });
  } catch (err) {
    console.error("Error fetching public questions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await InterviewQuestion.findById(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({
      message: "Question fetched successfully",
      data: question,
    });
  } catch (err) {
    console.error("Error fetching question:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedQuestion = await InterviewQuestion.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (err) {
    console.error("Error updating question:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await InterviewQuestion.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }
    res.status(200).json({
      message: "Question deleted successfully",
      data: deletedQuestion,
    });
  } catch (err) {
    console.error("Error deleting question:", err);
    res.status(500).json({ error: "Server error" });
  }
};