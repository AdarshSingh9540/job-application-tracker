"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, HelpCircle } from "lucide-react";
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
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Interview Questions
        </h1>
      </div>
      <p className="text-gray-600">
        Build and manage your interview question bank
      </p>
    </div>
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
              <Plus className="h-4 w-4 text-primary" />
            </div>
            Add New Question
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="company"
                className="text-sm font-medium text-gray-700"
              >
                Company <span className="text-red-500">*</span>
              </Label>
              <Input
                id="company"
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                placeholder="e.g., Google, Microsoft, Apple"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label
                htmlFor="question"
                className="text-sm font-medium text-gray-700"
              >
                Question <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => handleInputChange("question", e.target.value)}
                placeholder="Enter the interview question..."
                className="mt-1 min-h-[100px] resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <Label
                  htmlFor="isPublic"
                  className="text-sm font-medium text-gray-700"
                >
                  Make Public
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Allow others to see this question
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  handleInputChange("isPublic", checked)
                }
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Question
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
