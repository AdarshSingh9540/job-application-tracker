"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Building2,
  MessageSquare,
  Plus,
  Globe,
  Lock,
  Search,
  RefreshCw,
  Filter,
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

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            title: "Total Questions",
            count: questions.length,
            icon: MessageSquare,
            color: "blue",
          },
          {
            title: "Public Questions",
            count: questions.filter((q) => q.isPublic).length,
            icon: Globe,
            color: "green",
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
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{title}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    color === "blue"
                      ? "bg-blue-100"
                      : color === "green"
                      ? "bg-green-100"
                      : "bg-purple-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      color === "blue"
                        ? "text-blue-600"
                        : color === "green"
                        ? "text-green-600"
                        : "text-purple-600"
                    }`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Bar */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search questions or companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
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
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Question
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Questions Found
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {questions.length === 0
                  ? "Start building your question bank by adding your first interview question."
                  : "No questions match your current search criteria. Try adjusting your filters."}
              </p>
              <Button
                onClick={() => setOpenModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Question
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card
              key={question._id}
              className="shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {question.company}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`${
                            question.isPublic
                              ? "bg-green-100 text-green-800 border-green-200"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          } text-xs`}
                        >
                          {question.isPublic ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(question.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed">
                        {question.question}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={fetchQuestions}
          variant="outline"
          className="flex items-center gap-2 bg-transparent"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Questions
        </Button>
      </div>
    </>
  );
};
