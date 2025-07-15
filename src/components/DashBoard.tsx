"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Mic,
  Sun,
  Bell,
  MessageSquare,
  Plus,
  Briefcase,
  CheckCircle,
  FileQuestionIcon as QuestionIcon,
  Globe,
  Building2,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

// Define interfaces for data
interface JobApplication {
  id: string;
  status: string;
}

interface Question {
  _id: string;
  company: string;
  isPublic: boolean;
}

const applicationStatusConfig = {
  applied: { title: "Applied", chartColor: "#3b82f6" },
  "resume-screening": { title: "Resume Screening", chartColor: "#eab308" },
  "interview-process": { title: "Interview Process", chartColor: "#a855f7" },
  "waiting-result": { title: "Waiting for Result", chartColor: "#f97316" },
  selected: { title: "Selected", chartColor: "#22c55e" },
  rejected: { title: "Rejected", chartColor: "#ef4444" },
};

export default function Dashboard() {
  const userId = "68703dbdb65b9f8c39febb6e"; // Consistent user ID from previous components

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Applications
      const appResponse = await axios.get(
        `http://localhost:8081/api/v1/applications/fetch-application/${userId}`
      );
      const mappedApplications = appResponse.data.data.map((app: any) => ({
        id: app._id,
        status: app.status.toLowerCase().replace(/\s+/g, "-"),
      }));
      setApplications(mappedApplications);

      // Fetch Questions
      const questionResponse = await axios.get(
        "http://localhost:8081/api/v1/question/fetch-all-questions-with-visibility"
      );
      const mappedQuestions = questionResponse.data.data.map((q: any) => ({
        _id: q._id,
        company: q.company,
        isPublic: q.isPublic,
      }));
      setQuestions(mappedQuestions);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  // --- Application Stats ---
  const totalApplications = applications.length;
  const groupedApplications = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const selectedApplications = groupedApplications.selected || 0;
  const waitingResultApplications = groupedApplications["waiting-result"] || 0;
  const successRate =
    totalApplications > 0
      ? Math.round((selectedApplications / totalApplications) * 100)
      : 0;

  const applicationChartData = Object.entries(applicationStatusConfig)
    .map(([key, config]) => ({
      name: config.title,
      value: groupedApplications[key] || 0,
      color: config.chartColor,
    }))
    .filter((item) => item.value > 0);

  // --- Question Bank Stats ---
  const totalQuestions = questions.length;
  const publicQuestions = questions.filter((q) => q.isPublic).length;
  const uniqueCompanies = Array.from(
    new Set(questions.map((q) => q.company))
  ).length;

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-4">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 p-6 bg-gray-50">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-10 w-full max-w-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </header>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-sm">
          <CardContent className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 p-6 bg-gray-50">

      {/* Dashboard Content */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/add-application" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Application
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/add-questions" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Question
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column: Application Stats & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Total Applications
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-2"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gray-900">
                  {totalApplications}
                </p>
                <p className="text-sm text-gray-600">Applications tracked</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Success Rate
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-2"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gray-900">
                  {successRate}%
                </p>
                <p className="text-sm text-gray-600">Applications selected</p>
              </CardContent>
            </Card>
          </div>

          {/* Application Status Distribution Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-6">
              <div className="lg:w-2/3">
                {applicationChartData.length > 0 ? (
                  <ChartContainer config={{}} className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {applicationChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <div className="h-[240px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No application data to display</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 space-y-3">
                {applicationChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-white">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links / Other Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                  Waiting for Results
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-2"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-gray-900">
                  {waitingResultApplications}
                </p>
                <p className="text-sm text-gray-600">
                  Applications awaiting feedback
                </p>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">
                  View All Applications
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-2"
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ArrowUpRight className="h-4 w-4 text-gray-500" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="h-[80px] flex items-center justify-center">
                <Link href="/application-status">
                  <Button variant="outline" className="w-full bg-transparent">
                    Go to Applications
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Question Bank Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Question Bank Summary Cards */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <QuestionIcon className="h-5 w-5 text-primary" />
                Total Questions
              </CardTitle>
              <Link href="/question-bank" className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">
                {totalQuestions}
              </p>
              <p className="text-sm text-gray-600">Questions in your bank</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Public Questions
              </CardTitle>
              <Link href="/question-bank" className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">
                {publicQuestions}
              </p>
              <p className="text-sm text-gray-600">
                Publicly available questions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Companies Tracked
              </CardTitle>
              <Link href="/question-bank" className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900">
                {uniqueCompanies}
              </p>
              <p className="text-sm text-gray-600">
                Companies in question bank
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                View Question Bank
              </CardTitle>
              <Link href="/question-bank" className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="h-[80px] flex items-center justify-center">
              <Link href="/question-bank">
                <Button variant="outline" className="w-full bg-transparent">
                  Go to Question Bank
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
