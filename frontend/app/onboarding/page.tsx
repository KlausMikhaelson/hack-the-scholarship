"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { OnboardingFormData } from "@/types";
import { Check, ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [validatedSteps, setValidatedSteps] = useState<number[]>([]);

  const {
    register,
    watch,
    formState: { errors },
    handleSubmit,
    trigger,
  } = useForm<OnboardingFormData>({
    defaultValues: {
      name: "",
      email: "",
      gpa: "",
      major: "",
      extracurriculars: "",
      achievements: "",
      personalBackground: "",
      writingSample: "",
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Check step completion
  const isStep1Complete =
    watchedValues.name &&
    watchedValues.email &&
    watchedValues.gpa &&
    watchedValues.major;
  const isStep2Complete =
    watchedValues.extracurriculars && watchedValues.achievements;
  const isStep3Complete = watchedValues.personalBackground;

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let isValid = true;

    // Validate current step
    if (currentStep === 1) {
      isValid = await trigger(["name", "email", "gpa", "major"]);
    } else if (currentStep === 2) {
      isValid = await trigger(["extracurriculars", "achievements"]);
    } else if (currentStep === 3) {
      isValid = await trigger(["personalBackground"]);
    }

    if (isValid) {
      setValidatedSteps((prev) => [...new Set([...prev, currentStep])]);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const response = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      localStorage.setItem("onboardingCompleted", "true");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert("Failed to save profile. Please try again.");
    }
  };

  const completedSteps = [
    isStep1Complete ? 1 : null,
    isStep2Complete ? 2 : null,
    isStep3Complete ? 3 : null,
  ].filter(Boolean) as number[];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header with Back Button */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#111] mb-3">
            Welcome to Scholarly!
          </h1>
          <p className="text-gray-500">
            Get started by setting up your profile.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 px-4">
          <div className="relative">
            {/* Background line - only between circles */}
            <div
              className="absolute top-4 h-0.5 bg-gray-200"
              style={{ left: "12.5%", right: "12.5%" }}
            />

            {/* Active progress line */}
            <div
              className="absolute top-4 h-0.5 bg-blue-600 transition-all duration-300"
              style={{
                left: "12.5%",
                width: `${(validatedSteps.length / 3) * 75}%`,
              }}
            />

            {/* Steps */}
            <div className="grid grid-cols-4 relative">
              {[
                { num: 1, label: "Basics" },
                { num: 2, label: "Activities" },
                { num: 3, label: "Background" },
                { num: 4, label: "Writing" },
              ].map((step) => (
                <div key={step.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold relative ${
                      completedSteps.includes(step.num)
                        ? "bg-blue-600 text-white"
                        : currentStep === step.num
                        ? "bg-blue-50 border-2 border-blue-600 text-blue-600"
                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {completedSteps.includes(step.num) ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <span className="text-xs text-gray-500 mt-3 whitespace-nowrap">
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#111] mb-6">
                Basic Information
              </h2>

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
                      {...register("name", {
                        required: "Name is required",
                      })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: "Invalid email",
                        },
                      })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
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
                          message: "Enter valid GPA (0.0-4.0)",
                        },
                      })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="3.8"
                    />
                    {errors.gpa && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.gpa.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="major"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Major *
                    </label>
                    <input
                      id="major"
                      type="text"
                      {...register("major", {
                        required: "Major is required",
                      })}
                      className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="Computer Science"
                    />
                    {errors.major && (
                      <p className="text-red-500 text-xs mt-1.5">
                        {errors.major.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation - Inside Card */}
              {isStep1Complete && (
                <div className="flex items-center justify-end mt-8">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Activities */}
          {currentStep === 2 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#111] mb-6">
                Activities & Achievements
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="extracurriculars"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Extracurricular Activities *
                  </label>
                  <textarea
                    id="extracurriculars"
                    {...register("extracurriculars", {
                      required: "Required",
                    })}
                    rows={6}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                    placeholder="List your clubs, sports, volunteer work..."
                  />
                  {errors.extracurriculars && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.extracurriculars.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="achievements"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Achievements & Awards *
                  </label>
                  <textarea
                    id="achievements"
                    {...register("achievements", {
                      required: "Required",
                    })}
                    rows={6}
                    className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                    placeholder="List your awards, honors, recognitions..."
                  />
                  {errors.achievements && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.achievements.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Navigation - Inside Card */}
              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {isStep2Complete && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Background */}
          {currentStep === 3 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#111] mb-6">
                Personal Background
              </h2>

              <div>
                <label
                  htmlFor="personalBackground"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Story *
                </label>
                <textarea
                  id="personalBackground"
                  {...register("personalBackground", {
                    required: "Required",
                  })}
                  rows={12}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Share your story, challenges overcome, motivations, community involvement..."
                />
                {errors.personalBackground && (
                  <p className="text-red-500 text-xs mt-1.5">
                    {errors.personalBackground.message}
                  </p>
                )}
              </div>

              {/* Navigation - Inside Card */}
              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                {isStep3Complete && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Writing Sample */}
          {currentStep === 4 && (
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-[#111] mb-6">
                Writing Sample (Optional)
              </h2>

              <div>
                <label
                  htmlFor="writingSample"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sample Essay or Personal Statement
                </label>
                <textarea
                  id="writingSample"
                  {...register("writingSample")}
                  rows={10}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-y"
                  placeholder="Optional: paste a generic essay for tone matching..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  You can skip this and add it later in your profile
                </p>
              </div>

              {/* Navigation - Inside Card */}
              <div className="flex items-center justify-between mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow"
                >
                  Complete Profile
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="text-center mt-6 text-sm text-gray-400">
            Step {currentStep} of 4
          </div>
        </form>
      </div>
    </div>
  );
}
