"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Search,
  Filter,
  Users,
  MessageSquare,
  Crown,
  Database,
  RefreshCw,
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
          `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/v1/question/fetch-all-questions-with-visibility`
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

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="shadow-sm">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-sm">
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <Database className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Question Bank</h1>
          </div>
          <p className="text-gray-600">
            Explore interview questions from top companies worldwide
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalQuestions}
                  </p>
                </div>
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Public Questions
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalPublicQuestions}
                  </p>
                </div>
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Companies</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalCompanies}
                  </p>
                </div>
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-sm mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="w-full sm:w-[180px] pl-10 bg-gray-50 border-gray-200 focus:bg-white">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.keys(filteredCompanies).length === 0 ? (
            <div className="col-span-full">
              <Card className="shadow-sm">
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Companies Found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search terms or filters.
                  </p>
                </CardContent>
              </Card>
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
                  <Card className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] h-full">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-primary" />
                        </div>
                        {privateCount > 0 && (
                          <Badge
                            variant="outline"
                            className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs"
                          >
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-3 truncate text-lg">
                        {company}
                      </h3>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Public</span>
                          <Badge
                            variant="outline"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            {publicCount}
                          </Badge>
                        </div>
                        {privateCount > 0 && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Premium</span>
                            <Badge
                              variant="outline"
                              className="bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              {privateCount}
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm font-medium pt-2 border-t border-gray-100">
                          <span className="text-gray-900">Total</span>
                          <Badge
                            variant="outline"
                            className="bg-blue-100 text-blue-800 border-blue-200"
                          >
                            {totalCount}
                          </Badge>
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
