"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { HeaderComponent } from "./QuestionHero";
import { QuestionListComponent } from "./QuestionList";
import { QuestionModal } from "./QuestionHero";
import { useSession } from "next-auth/react";
interface Question {
  _id: string;
  userId: string;
  company: string;
  question: string;
  isPublic: boolean;
  createdAt: string;
}

interface QuestionFormData {
  company: string;
  question: string;
  isPublic: boolean;
}

export default function QuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [openModal, setOpenModal] = useState(false);
  //   const userId = "68703dbdb65b9f8c39febb6e";
  console.log("sessssion    >>>>>>>", session);
  const userId = session?.user?.id;

  const [formData, setFormData] = useState<QuestionFormData>({
    company: "",
    question: "",
    isPublic: false,
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/question/fetch-questions/${userId}`
      );
      setQuestions(response.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
      toast.error("Unable to load questions.", { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.question.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        userId,
        company: formData.company.trim(),
        question: formData.question.trim(),
        isPublic: formData.isPublic,
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/question/add-question`,
        payload
      );
      toast.success("Question added successfully!");
      setFormData({ company: "", question: "", isPublic: false });
      setOpenModal(false);
      fetchQuestions();
    } catch (err) {
      toast.error("Failed to add question. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof QuestionFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    fetchQuestions();
  }, [userId]);

  if (loading && questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center" aria-live="polite" role="status">
          <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-800 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <Toaster />
      <div className="max-w-7xl mx-auto">
        <HeaderComponent />
        <QuestionListComponent
          questions={questions}
          searchTerm={searchTerm}
          selectedCompany={selectedCompany}
          setSearchTerm={setSearchTerm}
          setSelectedCompany={setSelectedCompany}
          openModal={openModal}
          setOpenModal={setOpenModal}
          fetchQuestions={fetchQuestions}
          loading={loading}
        />
        <QuestionModal
          open={openModal}
          onOpenChange={setOpenModal}
          formData={formData}
          submitting={submitting}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
