"use client";

import type React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  Building2,
  MessageSquare,
  Plus,
  Globe,
  Lock,
  Search,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface Question {
  _id: string;
  userId: string;
  company: string;
  question: string;
  isPublic: boolean;
  createdAt: string;
}

interface QuestionFormData {
  company: string;
  question: string;
  isPublic: boolean;
}

// Header Component
export const HeaderComponent = () => {
  return (
    <header className="mb-2 p-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-lg shadow">
      <h1 className="text-3xl font-bold">Interview Questions</h1>
      <p className="text-base">Manage and track your interview questions</p>
    </header>
  );
};

// Question Modal Component
export const QuestionModal = ({
  open,
  onOpenChange,
  formData,
  submitting,
  handleInputChange,
  handleSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: QuestionFormData;
  submitting: boolean;
  handleInputChange: (
    field: keyof QuestionFormData,
    value: string | boolean
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-lg shadow-md p-3 max-w-sm animate-slide-up">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Add New Question
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6 text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-3"
          aria-label="Add new question form"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div>
              <Label
                htmlFor="company"
                className="text-xs font-semibold text-gray-700"
              >
                Company <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="e.g., Google"
                className="mt-1 border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 h-8 text-sm"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="isPublic"
                className="text-xs font-semibold text-gray-700"
              >
                Make Public
              </Label>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
                className="ml-1"
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor="question"
              className="text-xs font-semibold text-gray-700"
            >
              Question <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              placeholder="Enter the question..."
              className="mt-1 border-gray-300 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px] text-sm"
              required
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className=" cursor-pointer transition-all duration-200 text-sm"
            >
              {submitting ? "Adding..." : "Add Question"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-300 hover:bg-gray-50 px-3 py-1 rounded text-sm"
            >
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
