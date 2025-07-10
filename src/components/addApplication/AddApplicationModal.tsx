"use client";

import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  User,
  FileText,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

const questionCategories = [
  "Technical",
  "Behavioral",
  "Company Culture",
  "Problem Solving",
  "Experience",
  "Other",
];

interface AddApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (application: JobApplication) => void;
  editingApplication?: JobApplication | null;
}

export default function AddApplicationModal({
  isOpen,
  onClose,
  onSave,
  editingApplication,
}: AddApplicationModalProps) {
  const [currentApplication, setCurrentApplication] = useState<
    Partial<JobApplication>
  >({
    company: "",
    role: "",
    location: "",
    stipend: "",
    applicationDate: "",
    status: "applied",
    jd: "",
    companyProfileLink: "",
    interviewQuestions: [],
  });
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Technical",
  });

  // Update form when editing application changes
  useEffect(() => {
    if (editingApplication) {
      setCurrentApplication(editingApplication);
    } else {
      resetForm();
    }
  }, [editingApplication, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setCurrentApplication((prev) => ({ ...prev, [field]: value }));
  };

  const addInterviewQuestion = () => {
    if (!newQuestion.question.trim()) return;

    const question: InterviewQuestion = {
      id: Date.now().toString(),
      question: newQuestion.question,
      category: newQuestion.category,
    };

    setCurrentApplication((prev) => ({
      ...prev,
      interviewQuestions: [...(prev.interviewQuestions || []), question],
    }));

    setNewQuestion({ question: "", category: "Technical" });
  };

  const removeInterviewQuestion = (questionId: string) => {
    setCurrentApplication((prev) => ({
      ...prev,
      interviewQuestions:
        prev.interviewQuestions?.filter((q) => q.id !== questionId) || [],
    }));
  };

  const saveApplication = () => {
    if (!currentApplication.company || !currentApplication.role) {
      toast.error("Missing Information", {
        description: "Please fill in company name and role.",
      });
      return;
    }

    const application: JobApplication = {
      id: editingApplication ? editingApplication.id : Date.now().toString(),
      company: currentApplication.company!,
      role: currentApplication.role!,
      location: currentApplication.location || "",
      stipend: currentApplication.stipend || "",
      applicationDate:
        currentApplication.applicationDate ||
        new Date().toISOString().split("T")[0],
      status: currentApplication.status || "applied",
      jd: currentApplication.jd || "",
      companyProfileLink: currentApplication.companyProfileLink || "",
      interviewQuestions: currentApplication.interviewQuestions || [],
    };

    onSave(application);
    resetForm();
    onClose();

    toast.success(
      editingApplication ? "Application Updated" : "Application Added",
      {
        description: editingApplication
          ? "Job application has been updated successfully."
          : "New job application has been added to your tracker.",
      }
    );
  };

  const resetForm = () => {
    setCurrentApplication({
      company: "",
      role: "",
      location: "",
      stipend: "",
      applicationDate: "",
      status: "applied",
      jd: "",
      companyProfileLink: "",
      interviewQuestions: [],
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingApplication ? "Edit Application" : "Add New Application"}
          </DialogTitle>
          <DialogDescription>
            {editingApplication
              ? "Update your job application details"
              : "Add a new job application to your tracker"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Company Name *
              </Label>
              <Input
                id="company"
                placeholder="e.g., Google, Microsoft"
                value={currentApplication.company || ""}
                onChange={(e) => handleInputChange("company", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Role *
              </Label>
              <Input
                id="role"
                placeholder="e.g., Software Engineer"
                value={currentApplication.role || ""}
                onChange={(e) => handleInputChange("role", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={currentApplication.location || ""}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stipend" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Stipend
              </Label>
              <Input
                id="stipend"
                placeholder="e.g., $80k - $120k"
                value={currentApplication.stipend || ""}
                onChange={(e) => handleInputChange("stipend", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Application Date
              </Label>
              <Input
                id="date"
                type="date"
                value={currentApplication.applicationDate || ""}
                onChange={(e) =>
                  handleInputChange("applicationDate", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Application Status</Label>
              <Select
                value={currentApplication.status || "applied"}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="w-full"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="companyProfileLink"
              className="flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Company Profile Link
            </Label>
            <Input
              id="companyProfileLink"
              placeholder="e.g., https://company.com/careers"
              value={currentApplication.companyProfileLink || ""}
              onChange={(e) =>
                handleInputChange("companyProfileLink", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jd" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Job Description
            </Label>
            <Textarea
              id="jd"
              placeholder="Add job description, requirements, or personal notes..."
              rows={4}
              value={currentApplication.jd || ""}
              onChange={(e) => handleInputChange("jd", e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-1/2 cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={saveApplication} className="w-1/2 cursor-pointer">
              {editingApplication ? "Update Application" : "Add Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
