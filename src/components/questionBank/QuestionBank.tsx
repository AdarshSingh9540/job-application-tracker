"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import Link from "next/link";

const QuestionBank = () => {
  const [companies, setCompanies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicQuestions = async () => {
      try {
        const response = await fetch(
          "http://localhost:8080/api/v1/question/fetch-public-questions"
        );
        const data = await response.json();
        const groupedByCompany = data.data.reduce((acc, question) => {
          acc[question.company] = acc[question.company] || [];
          acc[question.company].push(question);
          return acc;
        }, {});
        setCompanies(groupedByCompany);
      } catch (err) {
        console.error("Error fetching public questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicQuestions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-2">
        <div className="text-center" aria-live="polite" role="status">
          <div className="animate-pulse rounded-full h-12 w-12 border-t-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-800 text-sm">Loading question bank...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-2">
      <div className="max-w-7xl mx-auto">
        <header className="mb-2 p-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg shadow">
          <h1 className="text-3xl font-bold">Question Bank</h1>
          <p className="text-base">Explore public questions by company</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.keys(companies).map((company) => (
            <Link
              href={`/question-bank/${encodeURIComponent(company)}`}
              key={company}
            >
              <Card className="bg-white shadow hover:shadow-md transition-all duration-200 rounded-lg border-0 hover:border-gradient-to-r from-indigo-100 to-transparent cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {company}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {companies[company].length} questions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
