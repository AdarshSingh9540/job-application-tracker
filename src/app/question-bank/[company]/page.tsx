"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Globe,
  Lock,
  Crown,
  ArrowLeft,
  Search,
  Filter,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const CompanyQuestions = () => {
  const { company } = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrimeMember, setIsPrimeMember] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchCompanyQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/v1/question/fetch-all-questions-with-visibility"
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        const filteredQuestions = data.data.filter(
          (q) => q.company === decodeURIComponent(company)
        );
        setQuestions(filteredQuestions);
        setFilteredQuestions(filteredQuestions);
      } catch (err) {
        console.error("Error fetching company questions:", err);
      } finally {
        setLoading(false);
      }
    };

    const checkPrimeMembership = async () => {
      setIsPrimeMember(false); // Replace with real check
    };

    fetchCompanyQuestions();
    checkPrimeMembership();
  }, [company]);

  useEffect(() => {
    let filtered = questions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType === "public") {
      filtered = filtered.filter((q) => q.isPublic);
    } else if (filterType === "premium") {
      filtered = filtered.filter((q) => !q.isPublic);
    }

    setFilteredQuestions(filtered);
  }, [searchTerm, filterType, questions]);

  const publicCount = questions.filter((q) => q.isPublic).length;
  const premiumCount = questions.filter((q) => !q.isPublic).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Question Bank
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {decodeURIComponent(company)} Questions
          </h1>
          <p className="text-gray-600 text-lg">
            Interview questions from {decodeURIComponent(company)}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0 shadow-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {questions.length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 shadow-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Public Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {publicCount}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Globe className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 shadow-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Premium Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {premiumCount}
                  </p>
                </div>
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Crown className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="bg-white shadow-sm border-0 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px] pl-10">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Questions</SelectItem>
                    <SelectItem value="public">Public Only</SelectItem>
                    <SelectItem value="premium">Premium Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {filteredQuestions.length === 0 ? (
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-12 text-center">
                <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No Questions Found
                </h3>
                <p className="text-gray-500">
                  {questions.length === 0
                    ? `No questions available for ${decodeURIComponent(
                        company
                      )}.`
                    : "Try adjusting your search or filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredQuestions.map((question, index) => (
              <Card
                key={question._id}
                className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            question.isPublic
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {question.isPublic ? (
                            <>
                              <Globe className="h-3 w-3 mr-1" />
                              Public
                            </>
                          ) : (
                            <>
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(question.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  {question.isPublic || isPrimeMember ? (
                    <p className="text-gray-700 leading-relaxed">
                      {question.question}
                    </p>
                  ) : (
                    <div
                      className="relative bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6 cursor-pointer hover:from-yellow-100 hover:to-orange-100 transition-all duration-200"
                      onClick={() => setShowUpgradeDialog(true)}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                          <Lock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="text-center">
                          <h4 className="font-bold text-gray-900 mb-1">
                            Premium Question
                          </h4>
                          <p className="text-sm text-gray-600">
                            Upgrade to Premium to unlock this question
                          </p>
                        </div>
                      </div>
                      <Badge className="absolute top-3 right-3 bg-yellow-500 text-white text-xs">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium Only
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upgrade Dialog */}
        <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
          <DialogContent className="bg-white rounded-xl max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Crown className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Unlock Premium Questions
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-gray-600">
                Get access to exclusive premium questions from top companies and
                boost your interview preparation!
              </DialogDescription>
            </DialogHeader>
            <div className="mt-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">
                  Premium Benefits:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Access to all premium questions</li>
                  <li>• Questions from top-tier companies</li>
                  <li>• Regular updates with new questions</li>
                  <li>• Priority support</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowUpgradeDialog(false)}
                  className="flex-1"
                >
                  Maybe Later
                </Button>
                <Button
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                  onClick={() => {
                    alert("Upgrade to Premium (implement payment logic here)");
                    setShowUpgradeDialog(false);
                  }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompanyQuestions;
