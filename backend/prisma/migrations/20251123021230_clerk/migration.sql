/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('IN_COURSE', 'GRADUATING', 'GRADUATE', 'UNDERGRADUATE', 'ENTERING');

-- CreateEnum
CREATE TYPE "StudentType" AS ENUM ('DOMESTIC', 'INTERNATIONAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'SUBMITTED', 'ARCHIVED');

-- DropTable
DROP TABLE "Example";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gpa" DOUBLE PRECISION NOT NULL,
    "gpaString" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "fieldsOfStudy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "faculty" TEXT,
    "studentStatus" "StudentStatus" NOT NULL DEFAULT 'IN_COURSE',
    "studentType" "StudentType" NOT NULL DEFAULT 'DOMESTIC',
    "year" INTEGER,
    "gender" "Gender",
    "citizenship" TEXT,
    "residency" TEXT,
    "financialNeed" BOOLEAN NOT NULL DEFAULT false,
    "extracurriculars" TEXT NOT NULL,
    "achievements" TEXT NOT NULL,
    "personalBackground" TEXT NOT NULL,
    "writingSample" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "sourceUrl" TEXT,
    "isPreloaded" BOOLEAN NOT NULL DEFAULT false,
    "studentStatus" "StudentStatus"[] DEFAULT ARRAY[]::"StudentStatus"[],
    "studentType" "StudentType"[] DEFAULT ARRAY[]::"StudentType"[],
    "faculty" TEXT,
    "fieldsOfStudy" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gender" "Gender",
    "financialNeed" BOOLEAN NOT NULL DEFAULT false,
    "academicMerit" BOOLEAN NOT NULL DEFAULT false,
    "minimumGPA" DOUBLE PRECISION,
    "citizenship" TEXT,
    "residency" TEXT,
    "enrollmentStatus" TEXT,
    "otherRequirements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amount" TEXT,
    "amountMin" DOUBLE PRECISION,
    "amountMax" DOUBLE PRECISION,
    "amountCurrency" TEXT NOT NULL DEFAULT 'CAD',
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "parsedId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scholarshipId" TEXT NOT NULL,
    "generatedEssay" TEXT NOT NULL,
    "editedEssay" TEXT,
    "explainabilityMatrix" JSONB NOT NULL,
    "adaptiveWeights" JSONB NOT NULL,
    "scholarshipPersonality" JSONB NOT NULL,
    "strengthMapping" JSONB NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");

-- CreateIndex
CREATE INDEX "Scholarship_faculty_idx" ON "Scholarship"("faculty");

-- CreateIndex
CREATE INDEX "Scholarship_financialNeed_idx" ON "Scholarship"("financialNeed");

-- CreateIndex
CREATE INDEX "Scholarship_academicMerit_idx" ON "Scholarship"("academicMerit");

-- CreateIndex
CREATE INDEX "Scholarship_minimumGPA_idx" ON "Scholarship"("minimumGPA");

-- CreateIndex
CREATE INDEX "Scholarship_source_idx" ON "Scholarship"("source");

-- CreateIndex
CREATE INDEX "Scholarship_parsedId_idx" ON "Scholarship"("parsedId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_userId_scholarshipId_key" ON "Application"("userId", "scholarshipId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_scholarshipId_fkey" FOREIGN KEY ("scholarshipId") REFERENCES "Scholarship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
