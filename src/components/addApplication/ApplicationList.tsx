"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Building2, MapPin } from "lucide-react";
import { toast } from "sonner";

interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
}

interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  stipend: string;
  applicationDate: string;
  status: string;
  jd: string;
  companyProfileLink: string;
  interviewQuestions: InterviewQuestion[];
}

const statusOptions = [
  { value: "applied", label: "Applied", color: "bg-blue-500" },
  {
    value: "resume-screening",
    label: "Resume Screening",
    color: "bg-yellow-500",
  },
  {
    value: "interview-process",
    label: "Interview Process",
    color: "bg-purple-500",
  },
  {
    value: "waiting-result",
    label: "Waiting for Result",
    color: "bg-orange-500",
  },
  { value: "selected", label: "Selected", color: "bg-green-500" },
  { value: "rejected", label: "Rejected", color: "bg-red-500" },
];

interface ApplicationListProps {
  applications: JobApplication[];
  onEdit: (application: JobApplication) => void;
  onDelete: (id: string) => void;
}

export default function ApplicationList({
  applications,
  onEdit,
  onDelete,
}: ApplicationListProps) {
  const deleteApplication = (id: string) => {
    onDelete(id);
    toast.success("Application Deleted", {
      description: "Job application has been removed from your tracker.",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find((opt) => opt.value === status);
    return (
      <Badge className={`${statusOption?.color} text-white`}>
        {statusOption?.label}
      </Badge>
    );
  };

  if (applications.length === 0) {
    return (
      <Card className="my-6">
        <CardHeader>
          <CardTitle>Your Applications (0)</CardTitle>
          <CardDescription>
            Track and manage all your job applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-40 text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications yet. Click "Add Application" to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Applications ({applications.length})</CardTitle>
        <CardDescription>
          Track and manage all your job applications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {applications.map((app) => (
            <div key={app.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{app.role}</h3>
                  <p className="text-gray-600">{app.company}</p>
                  {app.location && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {app.location}
                    </p>
                  )}
                  {app.companyProfileLink && (
                    <a
                      href={app.companyProfileLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-500 hover:text-blue-700 underline"
                    >
                      Company Profile
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(app.status)}
                  <Button variant="ghost" size="sm" onClick={() => onEdit(app)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteApplication(app.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {app.stipend && (
                <p className="text-sm text-green-600 font-medium">
                  {app.stipend}
                </p>
              )}

              {app.applicationDate && (
                <p className="text-xs text-gray-500">
                  Applied: {new Date(app.applicationDate).toLocaleDateString()}
                </p>
              )}

              {app.interviewQuestions.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">
                    Interview Questions ({app.interviewQuestions.length})
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.interviewQuestions.slice(0, 3).map((question) => (
                      <Badge
                        key={question.id}
                        variant="secondary"
                        className="text-xs"
                      >
                        {question.category}
                      </Badge>
                    ))}
                    {app.interviewQuestions.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{app.interviewQuestions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
