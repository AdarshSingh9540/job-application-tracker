"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "../ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Building2,
  MessageSquare,
  Plus,
  Globe,
  Lock,
  Search,
} from "lucide-react";

interface Question {
  _id: string;
  userId: string;
  company: string;
  question: string;
  isPublic: boolean;
  createdAt: string;
}
export const QuestionListComponent = ({
  questions,
  searchTerm,
  selectedCompany,
  setSearchTerm,
  setSelectedCompany,
  openModal,
  setOpenModal,
  fetchQuestions,
  loading,
}: {
  questions: Question[];
  searchTerm: string;
  selectedCompany: string;
  setSearchTerm: (value: string) => void;
  setSelectedCompany: (value: string) => void;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
  fetchQuestions: () => Promise<void>;
  loading: boolean;
}) => {
  const companies = Array.from(new Set(questions.map((q) => q.company)));
  const filteredQuestions = questions.filter((question) => {
    const matchesSearch =
      question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      question.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany =
      !selectedCompany || question.company === selectedCompany;
    return matchesSearch && matchesCompany;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-2">
        {[
          {
            title: "Total Questions",
            count: questions.length,
            icon: MessageSquare,
            color: "indigo",
          },
          {
            title: "Public Questions",
            count: questions.filter((q) => q.isPublic).length,
            icon: Globe,
            color: "teal",
          },
          {
            title: "Companies",
            count: companies.length,
            icon: Building2,
            color: "purple",
          },
        ].map(({ title, count, icon: Icon, color }, index) => (
          <Card
            key={index}
            className="bg-white shadow hover:shadow-md transition-all duration-200 rounded-lg border-0 overflow-hidden"
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase">
                    {title}
                  </p>
                  <p className="text-xl font-bold text-gray-900">{count}</p>
                </div>
                <div
                  className={`h-8 w-8 bg-${color}-100 rounded-full flex items-center justify-center`}
                >
                  <Icon className={`h-4 w-4 text-${color}-700`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <div className="relative flex-1 ">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search questions or companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-4 pr-8 py-5 bg-white/90 backdrop-blur-md border-gray-200 rounded focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 h-8 text-sm"
          />
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-white/90 backdrop-blur-md border border-gray-200 rounded px-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={() => setOpenModal(true)}
          className="cursor-pointer animate-pulse-once transition-all duration-200 text-sm"
        >
          <Plus className="h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Questions List */}
      <div className="space-y-3 animate-fade-in">
        {filteredQuestions.length === 0 ? (
          <Card className="bg-white shadow hover:shadow-md border-0 text-center p-4 rounded-lg">
            <CardContent>
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-gray-900 mb-1">
                No Questions Found
              </h3>
              <p className="text-gray-600 text-sm mb-1">
                {questions.length === 0
                  ? "Start by adding your first question."
                  : "No questions match your search."}
              </p>
              <Button
                onClick={() => setOpenModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
              >
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card
              key={question._id}
              className="bg-white shadow hover:shadow-md transition-all duration-200 rounded-lg border-0 hover:border-gradient-to-r from-indigo-100 to-transparent"
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-indigo-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {question.company}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {formatDate(question.createdAt)}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`px-2 py-1 ${
                      question.isPublic
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-700"
                    } text-xs`}
                  >
                    {question.isPublic ? (
                      <>
                        <Globe className="h-3 w-3 mr-0.5" />
                        Public
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3 mr-0.5" />
                        Private
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-gray-800 text-sm leading-tight">
                  {question.question}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-2 text-center">
        <Button
          onClick={fetchQuestions}
          variant="outline"
          className="px-4 py-1 bg-transparent border-gray-300 hover:bg-gray-50 rounded text-sm"
        >
          Refresh Questions
        </Button>
      </div>
    </>
  );
};
