"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Globe, Lock } from "lucide-react";
import { useParams } from "next/navigation";

const CompanyQuestions = () => {
  const { company } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyQuestions = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/v1/question/fetch-public-questions`
        );
        const data = await response.json();
        const filteredQuestions = data.data.filter(
          (q) => q.company === decodeURIComponent(company)
        );
        setQuestions(filteredQuestions);
      } catch (err) {
        console.error("Error fetching company questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyQuestions();
  }, [company]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-2">
        <div className="text-center" aria-live="polite" role="status">
          <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-800 text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-2">
      <div className="max-w-7xl mx-auto">
        <header className="mb-2 p-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg shadow">
          <h1 className="text-3xl font-bold">
            {decodeURIComponent(company)} Questions
          </h1>
          <p className="text-base">
            All public questions for {decodeURIComponent(company)}
          </p>
        </header>

        <div className="space-y-3">
          {questions.length === 0 ? (
            <Card className="bg-white shadow hover:shadow-md border-0 text-center p-3 rounded-lg">
              <CardContent>
                <p className="text-gray-600 text-sm">
                  No questions found for {decodeURIComponent(company)}.
                </p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card
                key={question._id}
                className="bg-white shadow hover:shadow-md transition-all duration-200 rounded-lg border-0"
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-gray-800 text-sm leading-tight">
                        {question.question}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`px-2 py-1 ${
                        question.isPublic
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-700"
                      } text-xs`}
                    >
                      <Globe className="h-3 w-3 mr-0.5" />
                      Public
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    {new Date(question.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyQuestions;
