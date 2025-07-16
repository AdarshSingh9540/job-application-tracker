"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Building2,
  RefreshCw,
  BarChart3,
  ArrowUpRight,
  TrendingUp,
  Clock,
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
import { LuAlarmClock } from "react-icons/lu";
import { MdEditDocument } from "react-icons/md";
import { FaRegClock } from "react-icons/fa";
import { IoDocument } from "react-icons/io5";
import { useSession } from "next-auth/react";

// Define interfaces for data
interface JobApplication {
  id: string;
  status: string;
  company: string;
  role: string;
  applicationDate: string;
}

interface Question {
  _id: string;
  company: string;
  question: string;
  isPublic: boolean;
  createdAt: string;
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
  const { data: session } = useSession();
  const userId = session?.user?.id;

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
        company: app.company,
        role: app.role,
        applicationDate: app.applicationDate,
      }));
      setApplications(mappedApplications);

      // Fetch Questions
      const questionResponse = await axios.get(
        "http://localhost:8081/api/v1/question/fetch-all-questions-with-visibility"
      );
      const mappedQuestions = questionResponse.data.data.map((q: any) => ({
        _id: q._id,
        company: q.company,
        question: q.question,
        isPublic: q.isPublic,
        createdAt: q.createdAt,
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

  const recentApplications = applications
    .sort(
      (a, b) =>
        new Date(b.applicationDate).getTime() -
        new Date(a.applicationDate).getTime()
    )
    .slice(0, 3);

  // --- Follow-up Reminder Logic ---
  const followUpApplications = applications
    .filter((app) => {
      const appDate = new Date(app.applicationDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - appDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return (
        diffDays > 2 && app.status !== "selected" && app.status !== "rejected"
      );
    })
    .slice(0, 3); // Limit to 3 for display

  // --- Question Bank Stats ---
  const totalQuestions = questions.length;
  const uniqueCompanies = Array.from(
    new Set(questions.map((q) => q.company))
  ).length;

  const recentQuestions = questions
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysAgo = (dateString: string) => {
    const appDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - appDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0
      ? "today"
      : `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="shadow-sm">
            <CardContent className="p-3">
              <Skeleton className="h-56 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="shadow-sm">
                <CardContent className="p-3">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 space-y-4">
          {[...Array(2)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-3">
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col flex-1 p-4 bg-gray-50">
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-8 w-full max-w-sm" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
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
    <div className="flex flex-col flex-1 p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link href="/add-application" className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Add Application
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/add-questions" className="flex items-center gap-2">
              <Plus className="h-3 w-3" />
              Add Question
            </Link>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Column: Application Stats & Chart */}
        <div className="lg:col-span-2 space-y-4">
          {/* Top Row Cards: Total Applications, Success Rate, Waiting for Results */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Total Applications */}
            <div className="border border-gray-200 rounded-md shadow-sm p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center border-b pb-1">
                <span className="text-md font-medium flex items-center gap-1">
                  <IoDocument className="h-5 w-5 text-primary mx-1" />
                  Total Applications
                </span>
                <Link href="/application-status">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Link>
              </div>
              <div className="items-center text-center py-2">
                <p className="text-3xl font-bold">{totalApplications}</p>
                <p className="text-[13px] text-gray-800 py-2">
                  Applications tracked
                </p>
              </div>
            </div>

            {/* Application Success */}
            <div className="border border-gray-200 rounded-md shadow-sm p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center border-b mb-1">
                <span className="text-md font-medium flex items-center gap-1">
                  <CheckCircle className="h-5 w-5 mx-1 text-green-600" />
                  Application Success
                </span>
                <Link href="/application-status">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Link>
              </div>
              <div className="bg-gradient-to-r from-indigo-700 to-blue-500 text-white rounded p-2">
                <div className="flex justify-between items-center ">
                  <span className="text-lg font-bold">{successRate}%</span>
                  <span className="text-[10px] flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {selectedApplications} Selected
                  </span>
                </div>
                <p className="text-[10px]">Overall Success Rate</p>
                <Progress
                  value={successRate}
                  className="h-1 bg-purple-400 [&>*]:bg-green-400"
                />
                <div className="flex justify-between ">
                  <span>Applied</span>
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Waiting for Results */}
            <div className="border border-gray-200 rounded-md shadow-sm p-2 flex flex-col gap-1">
              <div className="flex justify-between items-center border-b mb-1">
                <span className="text-md font-medium flex items-center gap-1">
                  <FaRegClock className="h-5 w-5 text-primary mx-1" />
                  Waiting for Results
                </span>
                <Link href="/application-status">
                  <ArrowUpRight className="h-4 w-4 text-gray-500" />
                </Link>
              </div>
              <div className="items-center text-center py-2">
                <p className="text-3xl font-bold">
                  {waitingResultApplications}
                </p>
                <p className="text-[13px] lg:mt-2 text-gray-800">
                  Applications awaiting feedback
                </p>
              </div>
            </div>
          </div>

          {/* Application Status Distribution Chart */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Application Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col lg:flex-row gap-4 p-3">
              <div className="lg:w-2/3">
                {applicationChartData.length > 0 ? (
                  <ChartContainer config={{}} className="h-[180px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={applicationChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
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
                  <div className="h-[180px] flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 className="w-10 h-10 mx-auto mb-1 opacity-50" />
                      <p className="text-sm">No application data to display</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="lg:w-1/3 space-y-2">
                {applicationChartData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="bg-white text-xs">
                      {item.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Applications & Follow-up Reminders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recent Applications Card */}
            {/* <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-sm font-semibold">
                  Recent Applications
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-1"
                >
                  <Button
                    variant="link"
                    className="text-xs text-gray-600 p-0 h-auto"
                  >
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {recentApplications.length > 0 ? (
                  recentApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {app.role}
                        </p>
                        <p className="text-xs text-gray-600">
                          {app.company} - {formatDate(app.applicationDate)}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          applicationStatusConfig[
                            app.status as keyof typeof applicationStatusConfig
                          ]?.chartColor
                            ? `bg-[${
                                applicationStatusConfig[
                                  app.status as keyof typeof applicationStatusConfig
                                ]?.chartColor
                              }/10] text-[${
                                applicationStatusConfig[
                                  app.status as keyof typeof applicationStatusConfig
                                ]?.chartColor
                              }] border-[${
                                applicationStatusConfig[
                                  app.status as keyof typeof applicationStatusConfig
                                ]?.chartColor
                              }/20]`
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        } text-xs`}
                      >
                        {applicationStatusConfig[
                          app.status as keyof typeof applicationStatusConfig
                        ]?.title || app.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400">
                    <Briefcase className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No recent applications</p>
                  </div>
                )}
              </CardContent>
            </Card> */}

            {/* Follow-up Reminder Card */}
            {/* <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1">
                <CardTitle className="text-sm font-semibold flex items-center gap-1">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Follow-up Reminders
                </CardTitle>
                <Link
                  href="/application-status"
                  className="flex items-center gap-1"
                >
                  <Button
                    variant="link"
                    className="text-xs text-gray-600 p-0 h-auto"
                  >
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {followUpApplications.length > 0 ? (
                  followUpApplications.map((app) => (
                    <div
                      key={app.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.company}
                        </p>
                        <p className="text-gray-600">{app.role}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-orange-50 text-orange-700 border-orange-200"
                      >
                        {getDaysAgo(app.applicationDate)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400">
                    <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No follow-ups needed</p>
                  </div>
                )}
              </CardContent>
            </Card> */}

            {/* Companies Tracked Card */}
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-1">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  Companies Tracked
                </CardTitle>
                <Link href="/question-bank" className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ArrowUpRight className="h-3 w-3 text-gray-500" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-3xl font-bold text-gray-900">
                  {uniqueCompanies}
                </p>
                <p className="text-xs text-gray-600">
                  Companies in question bank
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-1 border-b">
                <CardTitle className="text-sm font-semibold">
                  Recent Questions
                </CardTitle>
                <Link href="/question-bank" className="flex items-center gap-1">
                  <Button
                    variant="link"
                    className="text-xs text-gray-600 p-0 h-auto"
                  >
                    View all
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {recentQuestions.length > 0 ? (
                  recentQuestions.map((q) => (
                    <div
                      key={q._id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {q.company}
                        </p>
                        <p className="text-xs text-gray-600 truncate max-w-[140px]">
                          {q.question}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          q.isPublic
                            ? "bg-green-100 text-green-800 border-green-200"
                            : "bg-yellow-100 text-yellow-800 border-yellow-200"
                        } text-xs`}
                      >
                        {q.isPublic ? "Public" : "Premium"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-gray-400">
                    <QuestionIcon className="w-6 h-6 mx-auto mb-1 opacity-50" />
                    <p className="text-xs">No recent questions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Question Bank Stats & Recent Questions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Total Questions Card */}
          {/* <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-1">
                <QuestionIcon className="h-4 w-4 text-primary" />
                Total Questions
              </CardTitle>
              <Link href="/question-bank" className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowUpRight className="h-3 w-3 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-3xl font-bold text-gray-900">
                {totalQuestions}
              </p>
              <p className="text-xs text-gray-600">Questions in your bank</p>
            </CardContent>
          </Card> */}

          {/* Follow-up Reminder Card */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-1 border-b ">
              <CardTitle className="text-md font-semibold flex items-center gap-1  ">
                <LuAlarmClock className="h-6 w-6 text-orange-500 mr-2" />
                Follow-up Reminders
              </CardTitle>
              <Link
                href="/application-status"
                className="flex items-center gap-1"
              >
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowUpRight className="h-5 w-5 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              {followUpApplications.length > 0 ? (
                followUpApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div>
                      <p className="font-medium text-md  text-gray-900">
                        {app.company}
                      </p>
                      <p className="text-gray-600 text-xs">{app.role}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {getDaysAgo(app.applicationDate)}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400">
                  <Clock className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No follow-ups needed</p>
                </div>
              )}
            </CardContent>
            <div className="mx-2 px-2">
              <Link
                href="/application-status"
                className="flex items-center gap-1"
              >
                <Button variant="default" className="w-full ">
                  View all
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb- border-b">
              <CardTitle className="text-md font-semibold flex items-center gap-1  ">
                <MdEditDocument className="h-5 w-5 text-pink-500 mr-2" />
                Recent Applications
              </CardTitle>
              <Link
                href="/application-status"
                className="flex items-center gap-1"
              >
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ArrowUpRight className="h-5 w-5 text-gray-500" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-2">
              {recentApplications.length > 0 ? (
                recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-md text-gray-900">
                        {app.role}
                      </p>
                      <p className="text-xs text-gray-600">
                        {app.company} - {formatDate(app.applicationDate)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        applicationStatusConfig[
                          app.status as keyof typeof applicationStatusConfig
                        ]?.chartColor
                          ? `bg-[${
                              applicationStatusConfig[
                                app.status as keyof typeof applicationStatusConfig
                              ]?.chartColor
                            }/10] text-[${
                              applicationStatusConfig[
                                app.status as keyof typeof applicationStatusConfig
                              ]?.chartColor
                            }] border-[${
                              applicationStatusConfig[
                                app.status as keyof typeof applicationStatusConfig
                              ]?.chartColor
                            }/20]`
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      } text-xs`}
                    >
                      {applicationStatusConfig[
                        app.status as keyof typeof applicationStatusConfig
                      ]?.title || app.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-gray-400">
                  <Briefcase className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No recent applications</p>
                </div>
              )}
            </CardContent>
            <div className="mx-2 px-2">
              <Link
                href="/application-status"
                className="flex items-center gap-1"
              >
                <Button variant="default" className="w-full">
                  View all
                </Button>
              </Link>
            </div>
          </Card>

          {/* Recent Questions */}
        </div>
      </div>
    </div>
  );
}
