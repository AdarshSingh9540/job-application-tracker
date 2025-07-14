"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Search,
  Filter,
  Users,
  MessageSquare,
  Crown,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QuestionBank = () => {
  const [companies, setCompanies] = useState({});
  const [filteredCompanies, setFilteredCompanies] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("default");
  const [isPrimeMember, setIsPrimeMember] = useState(false);

  useEffect(() => {
    const fetchPublicQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:8080/api/v1/question/fetch-all-questions-with-visibility"
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        const groupedByCompany = data.data.reduce((acc, question) => {
          acc[question.company] = acc[question.company] || [];
          acc[question.company].push(question);
          return acc;
        }, {});
        setCompanies(groupedByCompany);
        setFilteredCompanies(groupedByCompany);
      } catch (err) {
        console.error("Error fetching public questions:", err);
        setError("Failed to load question bank. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const checkPrimeMembership = async () => {
      setIsPrimeMember(true); // Replace with real check
    };

    fetchPublicQuestions();
    checkPrimeMembership();
  }, []);

  useEffect(() => {
    let updatedCompanies = { ...companies };
    if (searchTerm) {
      updatedCompanies = Object.fromEntries(
        Object.entries(companies).filter(([company]) =>
          company.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (sortOption === "count") {
      updatedCompanies = Object.fromEntries(
        Object.entries(updatedCompanies).sort(
          ([, a], [, b]) => b.length - a.length
        )
      );
    } else if (sortOption === "alphabetical") {
      updatedCompanies = Object.fromEntries(
        Object.entries(updatedCompanies).sort(([a], [b]) => a.localeCompare(b))
      );
    }
    setFilteredCompanies(updatedCompanies);
  }, [searchTerm, sortOption, companies]);

  const totalQuestions = Object.values(companies).flat().length;
  const totalPublicQuestions = Object.values(companies)
    .flat()
    .filter((q) => q.isPublic).length;
  const totalCompanies = Object.keys(companies).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading question bank...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Question Bank
          </h1>
          <p className="text-gray-600 text-lg">
            Explore interview questions from top companies
          </p>
        </div>

        {/* Stats Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white shadow-sm border-0 shadow-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalQuestions}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
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
                    {totalPublicQuestions}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-0 shadow-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCompanies}
                  </p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Search and Filter */}
        <Card className="py-1 shadow-sm border-0 mb-6">
          <CardContent className="p-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[180px] pl-10">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="count">Question Count</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.keys(filteredCompanies).length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                No Companies Found
              </h3>
              <p className="text-gray-500">Try adjusting your search terms.</p>
            </div>
          ) : (
            Object.keys(filteredCompanies).map((company) => {
              const publicCount = filteredCompanies[company].filter(
                (q) => q.isPublic
              ).length;
              const privateCount = filteredCompanies[company].filter(
                (q) => !q.isPublic
              ).length;
              const totalCount = filteredCompanies[company].length;

              return (
                <Link
                  href={`/question-bank/${encodeURIComponent(company)}`}
                  key={company}
                  className="block"
                >
                  <Card className="bg-white shadow-sm border-0 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        {privateCount > 0 && (
                          <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 truncate">
                        {company}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            Public Questions
                          </span>
                          <span className="font-medium text-green-600">
                            {publicCount}
                          </span>
                        </div>
                        {privateCount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Premium Questions
                            </span>
                            <span className="font-medium text-yellow-600">
                              {privateCount}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm font-medium pt-2 border-t">
                          <span className="text-gray-900">Total</span>
                          <span className="text-blue-600">{totalCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionBank;
