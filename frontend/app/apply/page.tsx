"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import PipelineOutput from "@/components/PipelineOutput";
import LoadingState from "@/components/LoadingState";
import ProgressIndicator from "@/components/ProgressIndicator";
import {
  StudentProfile,
  ScholarshipInput as ScholarshipInputType,
  PipelineResult,
} from "@/types";
import { ArrowLeft, ArrowRight, FileText, List, Play } from "lucide-react";
import Link from "next/link";
import scholarships from "@/data/sample_scholarships.json";

type CombinedFormData = StudentProfile & ScholarshipInputType;

export default function ApplyPage() {
  const { isSignedIn, isLoaded, userId } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(
    null
  );
  const [scholarshipInputMethod, setScholarshipInputMethod] = useState<
    "paste" | "select"
  >("paste");

  // Redirect to home if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading while checking auth
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const {
    register,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      name: "",
      gpa: "",
      major: "",
      extracurriculars: "",
      achievements: "",
      personalBackground: "",
      writingSample: "",
      scholarshipName: "",
      description: "",
      selectedScholarshipId: "",
    },
    mode: "onChange",
  });

  // Watch form values
  const watchedValues = watch();

  // Check if Step 1 is complete
  const isStep1Complete =
    watchedValues.name && watchedValues.gpa && watchedValues.major;

  // Check if Step 2 is complete
  const isStep2Complete =
    watchedValues.extracurriculars || watchedValues.achievements;

  // Check if Step 3 is complete
  const isStep3Complete = watchedValues.personalBackground;

  // Check if Step 4 is complete
  const isStep4Complete =
    watchedValues.scholarshipName && watchedValues.description;

  // Auto-advance to next step
  useEffect(() => {
    if (currentStep === 1 && isStep1Complete && !completedSteps.includes(1)) {
      setCompletedSteps((prev) => [...prev, 1]);
      setCurrentStep(2);
    }
  }, [isStep1Complete, currentStep, completedSteps]);

  useEffect(() => {
    if (currentStep === 2 && isStep2Complete && !completedSteps.includes(2)) {
      setCompletedSteps((prev) => [...prev, 2]);
      setCurrentStep(3);
    }
  }, [isStep2Complete, currentStep, completedSteps]);

  useEffect(() => {
    if (currentStep === 3 && isStep3Complete && !completedSteps.includes(3)) {
      setCompletedSteps((prev) => [...prev, 3]);
      setCurrentStep(4);
    }
  }, [isStep3Complete, currentStep, completedSteps]);

  useEffect(() => {
    if (currentStep === 4 && isStep4Complete && !completedSteps.includes(4)) {
      setCompletedSteps((prev) => [...prev, 4]);
      setCurrentStep(5);
    }
  }, [isStep4Complete, currentStep, completedSteps]);

  const handleScholarshipSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setValue("selectedScholarshipId", selectedId);

    if (selectedId) {
      const selected = scholarships.find((s) => s.id === selectedId);
      if (selected) {
        setValue("scholarshipName", selected.name);
        setValue("description", selected.description);
      }
    }
  };

  const handleRunAnalysis = async () => {
    const studentData = {
      name: watchedValues.name,
      gpa: watchedValues.gpa,
      major: watchedValues.major,
      extracurriculars: watchedValues.extracurriculars,
      achievements: watchedValues.achievements,
      personalBackground: watchedValues.personalBackground,
      writingSample: watchedValues.writingSample,
    };

    const scholarshipData = {
      name: watchedValues.scholarshipName,
      description: watchedValues.description,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/runPipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: studentData,
          scholarship: scholarshipData,
        }),
      });

      if (!response.ok) {
        throw new Error("Pipeline failed");
      }

      const result: PipelineResult = await response.json();
      setPipelineResult(result);
      setCompletedSteps((prev) => [...prev, 5]);
    } catch (error) {
      console.error("Error running pipeline:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = async () => {
    const studentData = {
      name: watchedValues.name,
      gpa: watchedValues.gpa,
      major: watchedValues.major,
      extracurriculars: watchedValues.extracurriculars,
      achievements: watchedValues.achievements,
      personalBackground: watchedValues.personalBackground,
      writingSample: watchedValues.writingSample,
    };

    const scholarshipData = {
      name: watchedValues.scholarshipName,
      description: watchedValues.description,
    };

    setIsLoading(true);

    try {
      const response = await fetch("/api/generateEssay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student: studentData,
          scholarship: scholarshipData,
          regenerate: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Regeneration failed");
      }

      const { essay } = await response.json();
      if (pipelineResult) {
        setPipelineResult({
          ...pipelineResult,
          tailoredEssay: essay,
        });
      }
    } catch (error) {
      console.error("Error regenerating essay:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (pipelineResult && !isLoading) {
    return (
      <div
        className="min-h-screen bg-[#fafafa]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between border-b border-gray-200 pb-6 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#111]">
                Analysis Results
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Your personalized scholarship application package
              </p>
            </div>
            <button
              onClick={() => {
                setPipelineResult(null);
                setCurrentStep(1);
                setCompletedSteps([]);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Start New Application
            </button>
          </div>

          <PipelineOutput
            result={pipelineResult}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fafafa]"
      style={{
        backgroundImage:
          "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-[#111] mb-3 tracking-tight">
            New Application
          </h1>
          <p className="text-lg text-gray-500">
            Complete each step to generate your personalized scholarship
            application.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px,1fr] gap-8">
          {/* Progress Indicator */}
          <div className="hidden lg:block">
            <ProgressIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
            />
          </div>

          {/* Form Steps */}
          <div className="space-y-6">
            {/* Step 1: Student Basics */}
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  1
                </div>
                <h2 className="text-xl font-semibold text-[#111]">
                  Student Basics
                </h2>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      {...register("name", { required: "Name is required" })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.name?.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="gpa"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      GPA *
                    </label>
                    <input
                      id="gpa"
                      type="text"
                      {...register("gpa", {
                        required: "GPA is required",
                        pattern: {
                          value: /^[0-4](\.\d{1,2})?$/,
                          message: "Please enter a valid GPA (0.0-4.0)",
                        },
                      })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="3.8"
                    />
                    {errors.gpa && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.gpa?.message as string}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="major"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Major / Intended Field of Study *
                  </label>
                  <input
                    id="major"
                    type="text"
                    {...register("major", { required: "Major is required" })}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="Computer Science"
                  />
                  {errors.major && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.major?.message as string}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Experiences & Achievements */}
            {currentStep >= 2 && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-semibold text-[#111]">
                    Experiences & Achievements
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="extracurriculars"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Extracurricular Activities
                    </label>
                    <textarea
                      id="extracurriculars"
                      {...register("extracurriculars")}
                      rows={4}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                      placeholder="List your extracurricular activities, clubs, sports, volunteer work..."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="achievements"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Achievements & Awards
                    </label>
                    <textarea
                      id="achievements"
                      {...register("achievements")}
                      rows={4}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                      placeholder="List your achievements, awards, honors, recognitions..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personal Background */}
            {currentStep >= 3 && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    3
                  </div>
                  <h2 className="text-xl font-semibold text-[#111]">
                    Personal Background
                  </h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label
                      htmlFor="personalBackground"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Personal Background *
                    </label>
                    <textarea
                      id="personalBackground"
                      {...register("personalBackground", {
                        required: "Personal background is required",
                      })}
                      rows={5}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                      placeholder="Share your story: challenges, motivations, community involvement, family background..."
                    />
                    {errors.personalBackground && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.personalBackground?.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="writingSample"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Writing Sample (Optional)
                    </label>
                    <textarea
                      id="writingSample"
                      {...register("writingSample")}
                      rows={6}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                      placeholder="Paste a generic essay or personal statement (optional for comparison)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Scholarship Information */}
            {currentStep >= 4 && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    4
                  </div>
                  <h2 className="text-xl font-semibold text-[#111]">
                    Scholarship Information
                  </h2>
                </div>

                {/* Input Method Tabs */}
                <div className="flex p-1 bg-gray-100 rounded-lg mb-8 w-fit">
                  <button
                    type="button"
                    onClick={() => setScholarshipInputMethod("paste")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      scholarshipInputMethod === "paste"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Paste Description
                  </button>
                  <button
                    type="button"
                    onClick={() => setScholarshipInputMethod("select")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      scholarshipInputMethod === "select"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    Select Sample
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Sample Scholarship Selector */}
                  {scholarshipInputMethod === "select" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                      <label
                        htmlFor="sampleScholarship"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Select a Sample Scholarship
                      </label>
                      <select
                        id="sampleScholarship"
                        onChange={handleScholarshipSelect}
                        className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      >
                        <option value="">-- Choose a scholarship --</option>
                        {scholarships.map((scholarship) => (
                          <option key={scholarship.id} value={scholarship.id}>
                            {scholarship.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="scholarshipName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Scholarship Name *
                    </label>
                    <input
                      id="scholarshipName"
                      type="text"
                      {...register("scholarshipName", {
                        required: "Scholarship name is required",
                      })}
                      className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none ${
                        scholarshipInputMethod === "select"
                          ? "bg-gray-50 text-gray-500"
                          : ""
                      }`}
                      placeholder="Enter scholarship name"
                      readOnly={scholarshipInputMethod === "select"}
                    />
                    {errors.scholarshipName && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.scholarshipName?.message as string}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="scholarshipDescription"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Scholarship Description *
                    </label>
                    <textarea
                      id="scholarshipDescription"
                      {...register("description", {
                        required: "Scholarship description is required",
                      })}
                      rows={12}
                      className={`w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y ${
                        scholarshipInputMethod === "select"
                          ? "bg-gray-50 text-gray-500"
                          : ""
                      }`}
                      placeholder="Paste the full scholarship description, requirements, and criteria here..."
                      readOnly={scholarshipInputMethod === "select"}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.description?.message as string}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Generate */}
            {currentStep >= 5 && !isLoading && (
              <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-semibold text-sm">
                    5
                  </div>
                  <h2 className="text-xl font-semibold text-[#111]">
                    Generate Application
                  </h2>
                </div>

                <div className="text-center py-8">
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    You&apos;ve completed all steps! Click below to generate
                    your personalized scholarship application package.
                  </p>

                  <button
                    onClick={handleRunAnalysis}
                    className="h-14 px-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-3 mx-auto"
                  >
                    <Play className="w-5 h-5" />
                    Generate Tailored Application Package
                  </button>

                  <p className="text-xs text-gray-400 mt-4">
                    This will analyze your profile and create personalized
                    content
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && <LoadingState />}
          </div>
        </div>
      </div>
    </div>
  );
}
