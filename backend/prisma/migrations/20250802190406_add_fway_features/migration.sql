-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "birthDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerificationToken" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" DATETIME
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "cpf" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "country" TEXT DEFAULT 'Brasil',
    "language" TEXT DEFAULT 'pt-BR',
    "timezone" TEXT DEFAULT 'America/Sao_Paulo',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "professionals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "experience" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "consultationFee" REAL,
    "workingHours" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "professionalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" REAL NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "services_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "userCoverageId" TEXT,
    "serviceId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "price" REAL NOT NULL,
    "paymentStatus" TEXT DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reviews_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "medical_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bloodType" TEXT,
    "height" REAL,
    "weight" REAL,
    "allergies" TEXT,
    "conditions" TEXT,
    "chronicConditions" TEXT,
    "familyHistory" TEXT,
    "smokingStatus" TEXT,
    "alcoholConsumption" TEXT,
    "exerciseFrequency" TEXT,
    "dietType" TEXT,
    "currentMedications" TEXT,
    "lastBloodPressure" TEXT,
    "lastHeartRate" INTEGER,
    "lastGlucose" REAL,
    "lastCholesterol" REAL,
    "preferredLanguage" TEXT DEFAULT 'pt-BR',
    "communicationStyle" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medical_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "processingTime" INTEGER NOT NULL,
    "sessionId" TEXT,
    "context" TEXT,
    "metadata" TEXT,
    "userRating" INTEGER,
    "userFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_interactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "triage_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicalProfileId" TEXT,
    "symptoms" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "possibleConditions" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "aiAnalysis" TEXT NOT NULL,
    "patientAge" INTEGER,
    "patientGender" TEXT,
    "patientHistory" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "followUpDate" DATETIME,
    "medicalValidation" TEXT,
    "validatedBy" TEXT,
    "validatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "triage_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "triage_results_medicalProfileId_fkey" FOREIGN KEY ("medicalProfileId") REFERENCES "medical_profiles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "symptom_analyses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicalProfileId" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "symptomDuration" TEXT NOT NULL,
    "symptomProgression" TEXT,
    "analysis" TEXT NOT NULL,
    "possibleConditions" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "urgencyLevel" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "nextSteps" TEXT NOT NULL,
    "riskFactors" TEXT,
    "protectiveFactors" TEXT,
    "recommendedSpecialties" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "symptom_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "symptom_analyses_medicalProfileId_fkey" FOREIGN KEY ("medicalProfileId") REFERENCES "medical_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicalProfileId" TEXT NOT NULL,
    "factors" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "analysis" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "preventiveMeasures" TEXT NOT NULL,
    "cardiovascularRisk" REAL,
    "diabetesRisk" REAL,
    "cancerRisk" REAL,
    "mentalHealthRisk" REAL,
    "modifiableFactors" TEXT,
    "nextAssessmentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "risk_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "risk_assessments_medicalProfileId_fkey" FOREIGN KEY ("medicalProfileId") REFERENCES "medical_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ai_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "recomendationId" TEXT NOT NULL,
    "medicalProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "confidence" REAL NOT NULL,
    "basedOnSymptoms" TEXT,
    "basedOnHistory" TEXT,
    "basedOnRisk" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userFeedback" TEXT,
    "userRating" INTEGER,
    "validUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ai_recommendations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ai_recommendations_medicalProfileId_fkey" FOREIGN KEY ("medicalProfileId") REFERENCES "medical_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "intelligent_matches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "matchScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "specialtyMatch" REAL NOT NULL,
    "locationMatch" REAL NOT NULL,
    "availabilityMatch" REAL NOT NULL,
    "experienceMatch" REAL NOT NULL,
    "personalityMatch" REAL,
    "languageMatch" REAL,
    "matchReasons" TEXT NOT NULL,
    "requestContext" TEXT NOT NULL,
    "symptoms" TEXT,
    "urgencyLevel" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUGGESTED',
    "userFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "intelligent_matches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "intelligent_matches_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medical_knowledge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "symptoms" TEXT NOT NULL,
    "causes" TEXT,
    "riskFactors" TEXT,
    "treatments" TEXT,
    "medications" TEXT,
    "procedures" TEXT,
    "prognosis" TEXT,
    "complications" TEXT,
    "prevention" TEXT,
    "prevalence" REAL,
    "incidence" REAL,
    "mortality" REAL,
    "sources" TEXT,
    "lastReviewed" DATETIME,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "drug_interactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drug1" TEXT NOT NULL,
    "drug2" TEXT NOT NULL,
    "interactionType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mechanism" TEXT,
    "effects" TEXT NOT NULL,
    "recommendations" TEXT NOT NULL,
    "alternatives" TEXT,
    "monitoring" TEXT,
    "sources" TEXT,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ai_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "modelPath" TEXT,
    "parameters" TEXT NOT NULL,
    "hyperparameters" TEXT,
    "accuracy" REAL,
    "precision" REAL,
    "recall" REAL,
    "f1Score" REAL,
    "trainingDataSize" INTEGER,
    "validationDataSize" INTEGER,
    "testDataSize" INTEGER,
    "description" TEXT,
    "trainedBy" TEXT,
    "trainedAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isProduction" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_shields" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "riskScore" REAL NOT NULL DEFAULT 85.0,
    "riskFactors" TEXT,
    "shieldLevel" TEXT NOT NULL DEFAULT 'BRONZE',
    "totalPoints" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoRenewal" BOOLEAN NOT NULL DEFAULT true,
    "region" TEXT,
    "zipCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_shields_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "coverages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "baseRate" REAL NOT NULL,
    "minPremium" REAL NOT NULL,
    "maxPremium" REAL NOT NULL,
    "maxCoverage" REAL NOT NULL,
    "deductible" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPerTransaction" BOOLEAN NOT NULL DEFAULT true,
    "defaultDuration" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_coverages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "coverageId" TEXT NOT NULL,
    "userShieldId" TEXT,
    "serviceId" TEXT,
    "serviceValue" REAL NOT NULL,
    "premium" REAL NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "duration" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "riskScoreAtCreation" REAL NOT NULL,
    "epidemiologicalData" TEXT,
    "pricingFactors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "user_coverages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_coverages_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "coverages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_coverages_userShieldId_fkey" FOREIGN KEY ("userShieldId") REFERENCES "user_shields" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "claims" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userShieldId" TEXT NOT NULL,
    "coverageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "nlpAnalysis" TEXT,
    "aiConfidence" REAL,
    "autoProcessed" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "rejectedAt" DATETIME,
    "rejectedBy" TEXT,
    "rejectionReason" TEXT,
    "payoutAmount" REAL,
    "payoutDate" DATETIME,
    "payoutMethod" TEXT,
    "attachments" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "claims_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "claims_userShieldId_fkey" FOREIGN KEY ("userShieldId") REFERENCES "user_shields" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "claims_coverageId_fkey" FOREIGN KEY ("coverageId") REFERENCES "user_coverages" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "claim_messages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "claimId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "nlpAnalysis" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "claim_messages_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "claims" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "risk_score_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userShieldId" TEXT NOT NULL,
    "riskScore" REAL NOT NULL,
    "factors" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "score" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "risk_score_history_userShieldId_fkey" FOREIGN KEY ("userShieldId") REFERENCES "user_shields" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "epidemiological_data" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "region" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT,
    "zipCode" TEXT,
    "diseaseType" TEXT NOT NULL,
    "incidence" REAL NOT NULL,
    "severity" REAL NOT NULL,
    "seasonality" TEXT,
    "periodStart" DATETIME NOT NULL,
    "periodEnd" DATETIME NOT NULL,
    "source" TEXT NOT NULL,
    "reliability" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "actuarial_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "formula" TEXT NOT NULL,
    "parameters" TEXT NOT NULL,
    "weights" TEXT NOT NULL,
    "coverageTypes" TEXT NOT NULL,
    "riskFactors" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "accuracy" REAL,
    "lastTested" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "pointsCost" INTEGER NOT NULL,
    "value" REAL,
    "discount" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isRepeatable" BOOLEAN NOT NULL DEFAULT false,
    "maxRedemptions" INTEGER,
    "validFrom" DATETIME,
    "validUntil" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_rewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "userShieldId" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "pointsSpent" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "usedAt" DATETIME,
    "expiresAt" DATETIME,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_rewards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_rewards_userShieldId_fkey" FOREIGN KEY ("userShieldId") REFERENCES "user_shields" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "user_rewards_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "rewards" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dynamic_pricing_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "coverageId" TEXT NOT NULL,
    "serviceValue" REAL NOT NULL,
    "calculatedPremium" REAL NOT NULL,
    "finalPremium" REAL NOT NULL,
    "riskScore" REAL NOT NULL,
    "baseRate" REAL NOT NULL,
    "riskMultiplier" REAL NOT NULL,
    "regionalFactor" REAL NOT NULL,
    "seasonalFactor" REAL,
    "discountApplied" REAL,
    "epidemiologicalFactors" TEXT,
    "actuarialModelId" TEXT,
    "modelVersion" TEXT,
    "approved" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dynamic_pricing_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_userId_key" ON "professionals"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "professionals_license_key" ON "professionals"("license");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "medical_profiles_userId_key" ON "medical_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "medical_knowledge_code_key" ON "medical_knowledge"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_shields_userId_key" ON "user_shields"("userId");
