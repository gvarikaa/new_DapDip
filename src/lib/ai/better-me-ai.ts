import { getModel } from "./gemini-client";
import { trackTokenUsage } from "@/lib/api/trpc/routers/ai";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Types for the Better Me AI functionality
export interface HealthProfile {
  height?: number;
  weight?: number;
  age?: number;
  gender?: string;
  activityLevel?: string;
  primaryGoal?: string;
  secondaryGoals?: string[];
  targetWeight?: number;
  targetDate?: Date;
  dietaryPreferences?: string[];
  foodAllergies?: string[];
  foodPreferences?: {
    likes?: string[];
    dislikes?: string[];
  };
  healthConditions?: string[];
  medications?: string[];
  sleepGoalHours?: number;
  stressLevel?: number;
  energyLevel?: number;
}

export interface GenerateMealPlanOptions {
  days: number;
  caloriesPerDay?: number;
  mealsPerDay?: number;
  includeSnacks?: boolean;
  preferredCuisines?: string[];
  includeGroceryList?: boolean;
}

export interface MealPlanDay {
  day: number;
  date: string;
  meals: {
    type: string;
    name: string;
    recipe: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    prepTimeMinutes: number;
  }[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface GenerateMealPlanResult {
  plan: MealPlanDay[];
  groceryList?: string[];
  nutritionSummary: {
    averageCalories: number;
    averageProtein: number;
    averageCarbs: number;
    averageFat: number;
  };
  tips: string[];
}

export interface GenerateWorkoutPlanOptions {
  weeks: number;
  daysPerWeek: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  focusAreas?: string[];
  durationMinutes?: number;
  equipment?: string[];
}

export interface WorkoutExercise {
  name: string;
  sets?: number;
  reps?: number;
  duration?: number;
  restSeconds?: number;
  instructions: string;
  targetMuscles: string[];
}

export interface WorkoutDay {
  day: number;
  name: string;
  focusArea: string;
  warmup: string;
  exercises: WorkoutExercise[];
  cooldown: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface GenerateWorkoutPlanResult {
  plan: WorkoutDay[];
  weeklySchedule: string[];
  progressionStrategy: string;
  tips: string[];
}

export interface GenerateHealthRecommendationsOptions {
  includeNutrition?: boolean;
  includeExercise?: boolean;
  includeSleep?: boolean;
  includeStressManagement?: boolean;
  includeHydration?: boolean;
}

export interface HealthRecommendations {
  nutrition?: {
    recommendations: string[];
    foodsToIncrease: string[];
    foodsToDecrease: string[];
    mealTimingTips: string[];
  };
  exercise?: {
    recommendations: string[];
    suggestedActivities: string[];
    frequencyAndIntensityTips: string[];
  };
  sleep?: {
    recommendations: string[];
    bedtimeRoutineTips: string[];
    environmentalFactors: string[];
  };
  stressManagement?: {
    recommendations: string[];
    techniques: string[];
    dailyPractices: string[];
  };
  hydration?: {
    recommendations: string[];
    optimalIntake: string;
    hydrationSchedule: string[];
  };
  generalTips: string[];
}

/**
 * Generate a personalized meal plan based on health profile
 */
export async function generateMealPlan(
  prisma: PrismaClient,
  userId: string,
  profile: HealthProfile,
  options: GenerateMealPlanOptions
): Promise<GenerateMealPlanResult> {
  // Token cost calculation - based on plan complexity
  const tokenCost = 20 + (options.days * 5);
  
  // Check if user has enough tokens
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiEnabled: true, aiTokensRemaining: true },
  });
  
  if (!userSettings?.aiEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "AI features are disabled for this account",
    });
  }
  
  if ((userSettings.aiTokensRemaining || 0) < tokenCost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient tokens for meal plan generation",
    });
  }
  
  try {
    const model = getModel();
    
    // Create a detailed prompt for the AI
    const prompt = `
      Generate a personalized ${options.days}-day meal plan based on the following health profile:
      
      HEALTH PROFILE:
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Age: ${profile.age || 'Not specified'} years
      - Gender: ${profile.gender || 'Not specified'}
      - Activity level: ${profile.activityLevel || 'Moderate'}
      - Primary goal: ${profile.primaryGoal || 'Balanced nutrition'}
      - Secondary goals: ${profile.secondaryGoals?.join(', ') || 'None'}
      ${profile.targetWeight ? `- Target weight: ${profile.targetWeight} kg` : ''}
      
      DIETARY PREFERENCES:
      - Preferences: ${profile.dietaryPreferences?.join(', ') || 'No specific preferences'}
      - Allergies: ${profile.foodAllergies?.join(', ') || 'None'}
      - Liked foods: ${profile.foodPreferences?.likes?.join(', ') || 'Not specified'}
      - Disliked foods: ${profile.foodPreferences?.dislikes?.join(', ') || 'Not specified'}
      - Health conditions: ${profile.healthConditions?.join(', ') || 'None'}
      
      MEAL PLAN REQUIREMENTS:
      - Calories per day: ${options.caloriesPerDay || 'Calculate appropriate amount based on profile'}
      - Meals per day: ${options.mealsPerDay || 3}
      - Include snacks: ${options.includeSnacks ? 'Yes' : 'No'}
      - Preferred cuisines: ${options.preferredCuisines?.join(', ') || 'Varied'}
      - Include grocery list: ${options.includeGroceryList ? 'Yes' : 'No'}
      
      For each day, provide:
      1. Date (starting from today)
      2. For each meal:
         - Type (breakfast, lunch, dinner, snack)
         - Name of the dish
         - Recipe with ingredients and brief instructions
         - Nutritional information (calories, protein, carbs, fat)
         - Preparation time
      3. Daily nutritional totals
      
      Also include:
      - A consolidated grocery list (if requested)
      - Nutrition summary for the entire plan
      - 3-5 practical tips for following this meal plan
      
      Format the response as a JSON object that exactly matches this structure (with realistic values for all fields):
      ${JSON.stringify({
        plan: [{
          day: 1,
          date: "2023-01-01",
          meals: [{
            type: "breakfast",
            name: "Example Meal",
            recipe: "Instructions here",
            calories: 500,
            protein: 20,
            carbs: 40,
            fat: 15,
            ingredients: ["ingredient1", "ingredient2"],
            prepTimeMinutes: 15
          }],
          totalCalories: 2000,
          totalProtein: 120,
          totalCarbs: 200,
          totalFat: 65
        }],
        groceryList: ["item1", "item2"],
        nutritionSummary: {
          averageCalories: 2000,
          averageProtein: 120,
          averageCarbs: 200,
          averageFat: 65
        },
        tips: ["tip1", "tip2", "tip3"]
      }, null, 2)}
      
      Return ONLY the JSON with no additional text before or after.
    `;
    
    // Generate the meal plan with AI
    const response = await model.generateContent(prompt);
    const result = response.response.text();
    
    // Track token usage
    await trackTokenUsage(
      prisma,
      userId,
      tokenCost,
      "better_me_meal_plan",
      "gemini-1.5-pro"
    );
    
    // Parse the result
    try {
      const mealPlan = JSON.parse(result) as GenerateMealPlanResult;
      return mealPlan;
    } catch (e) {
      console.error("Failed to parse meal plan JSON:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate meal plan",
      });
    }
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error generating meal plan",
    });
  }
}

/**
 * Generate a personalized workout plan based on health profile
 */
export async function generateWorkoutPlan(
  prisma: PrismaClient,
  userId: string,
  profile: HealthProfile,
  options: GenerateWorkoutPlanOptions
): Promise<GenerateWorkoutPlanResult> {
  // Token cost calculation - based on plan complexity
  const tokenCost = 15 + (options.weeks * options.daysPerWeek * 2);
  
  // Check if user has enough tokens
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiEnabled: true, aiTokensRemaining: true },
  });
  
  if (!userSettings?.aiEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "AI features are disabled for this account",
    });
  }
  
  if ((userSettings.aiTokensRemaining || 0) < tokenCost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient tokens for workout plan generation",
    });
  }
  
  try {
    const model = getModel();
    
    // Create a detailed prompt for the AI
    const prompt = `
      Generate a personalized ${options.weeks}-week workout plan based on the following health profile:
      
      HEALTH PROFILE:
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Age: ${profile.age || 'Not specified'} years
      - Gender: ${profile.gender || 'Not specified'}
      - Activity level: ${profile.activityLevel || 'Moderate'}
      - Primary goal: ${profile.primaryGoal || 'General fitness'}
      - Secondary goals: ${profile.secondaryGoals?.join(', ') || 'None'}
      - Health conditions: ${profile.healthConditions?.join(', ') || 'None'}
      
      WORKOUT REQUIREMENTS:
      - Weeks: ${options.weeks}
      - Days per week: ${options.daysPerWeek}
      - Difficulty level: ${options.difficulty}
      - Focus areas: ${options.focusAreas?.join(', ') || 'Full body'}
      - Workout duration: ${options.durationMinutes || 45} minutes
      - Available equipment: ${options.equipment?.join(', ') || 'Minimal equipment'}
      
      For each workout day, provide:
      1. Day number
      2. Workout name
      3. Focus area
      4. Warmup routine
      5. List of exercises with:
         - Name
         - Sets and reps or duration
         - Rest periods
         - Instructions
         - Target muscles
      6. Cooldown routine
      7. Estimated duration and calories burned
      
      Also include:
      - A weekly schedule
      - Progression strategy as fitness improves
      - 3-5 tips for workout success
      
      Format the response as a JSON object that exactly matches this structure (with realistic values for all fields):
      ${JSON.stringify({
        plan: [{
          day: 1,
          name: "Example Workout",
          focusArea: "Full Body",
          warmup: "5 minute light cardio followed by dynamic stretches",
          exercises: [{
            name: "Pushups",
            sets: 3,
            reps: 10,
            restSeconds: 60,
            instructions: "Instructions here",
            targetMuscles: ["chest", "triceps", "shoulders"]
          }],
          cooldown: "5 minute static stretching",
          durationMinutes: 45,
          caloriesBurned: 300
        }],
        weeklySchedule: ["Day 1: Full Body", "Day 2: Rest", "Day 3: Cardio"],
        progressionStrategy: "Increase reps by 1 each week",
        tips: ["tip1", "tip2", "tip3"]
      }, null, 2)}
      
      Return ONLY the JSON with no additional text before or after.
    `;
    
    // Generate the workout plan with AI
    const response = await model.generateContent(prompt);
    const result = response.response.text();
    
    // Track token usage
    await trackTokenUsage(
      prisma,
      userId,
      tokenCost,
      "better_me_workout_plan",
      "gemini-1.5-pro"
    );
    
    // Parse the result
    try {
      const workoutPlan = JSON.parse(result) as GenerateWorkoutPlanResult;
      return workoutPlan;
    } catch (e) {
      console.error("Failed to parse workout plan JSON:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate workout plan",
      });
    }
  } catch (error) {
    console.error("Error generating workout plan:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error generating workout plan",
    });
  }
}

/**
 * Generate personalized health recommendations
 */
export async function generateHealthRecommendations(
  prisma: PrismaClient,
  userId: string,
  profile: HealthProfile,
  options: GenerateHealthRecommendationsOptions
): Promise<HealthRecommendations> {
  // Token cost calculation
  const tokenCost = 10 + 
    (options.includeNutrition ? 3 : 0) +
    (options.includeExercise ? 3 : 0) +
    (options.includeSleep ? 2 : 0) + 
    (options.includeStressManagement ? 2 : 0) +
    (options.includeHydration ? 2 : 0);
  
  // Check if user has enough tokens
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiEnabled: true, aiTokensRemaining: true },
  });
  
  if (!userSettings?.aiEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "AI features are disabled for this account",
    });
  }
  
  if ((userSettings.aiTokensRemaining || 0) < tokenCost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient tokens for health recommendations",
    });
  }
  
  try {
    const model = getModel();
    
    // Create a detailed prompt for the AI
    const prompt = `
      Generate personalized health recommendations based on the following health profile:
      
      HEALTH PROFILE:
      - Height: ${profile.height || 'Not specified'} cm
      - Weight: ${profile.weight || 'Not specified'} kg
      - Age: ${profile.age || 'Not specified'} years
      - Gender: ${profile.gender || 'Not specified'}
      - Activity level: ${profile.activityLevel || 'Moderate'}
      - Primary goal: ${profile.primaryGoal || 'Overall wellness'}
      - Secondary goals: ${profile.secondaryGoals?.join(', ') || 'None'}
      - Dietary preferences: ${profile.dietaryPreferences?.join(', ') || 'No specific preferences'}
      - Health conditions: ${profile.healthConditions?.join(', ') || 'None'}
      ${profile.stressLevel ? `- Current stress level: ${profile.stressLevel}/10` : ''}
      ${profile.energyLevel ? `- Current energy level: ${profile.energyLevel}/10` : ''}
      ${profile.sleepGoalHours ? `- Sleep goal: ${profile.sleepGoalHours} hours` : ''}
      
      RECOMMENDATION CATEGORIES:
      ${options.includeNutrition ? '- Include nutrition recommendations' : ''}
      ${options.includeExercise ? '- Include exercise recommendations' : ''}
      ${options.includeSleep ? '- Include sleep recommendations' : ''}
      ${options.includeStressManagement ? '- Include stress management recommendations' : ''}
      ${options.includeHydration ? '- Include hydration recommendations' : ''}
      
      Provide detailed, personalized recommendations in each requested category.
      Make the recommendations specific to this individual's profile and goals.
      Include actionable advice that can be realistically implemented.
      
      Format the response as a JSON object that exactly matches this structure (with appropriate values for the requested categories):
      ${JSON.stringify({
        nutrition: {
          recommendations: ["recommendation1", "recommendation2"],
          foodsToIncrease: ["food1", "food2"],
          foodsToDecrease: ["food1", "food2"],
          mealTimingTips: ["tip1", "tip2"]
        },
        exercise: {
          recommendations: ["recommendation1", "recommendation2"],
          suggestedActivities: ["activity1", "activity2"],
          frequencyAndIntensityTips: ["tip1", "tip2"]
        },
        sleep: {
          recommendations: ["recommendation1", "recommendation2"],
          bedtimeRoutineTips: ["tip1", "tip2"],
          environmentalFactors: ["factor1", "factor2"]
        },
        stressManagement: {
          recommendations: ["recommendation1", "recommendation2"],
          techniques: ["technique1", "technique2"],
          dailyPractices: ["practice1", "practice2"]
        },
        hydration: {
          recommendations: ["recommendation1", "recommendation2"],
          optimalIntake: "X liters per day",
          hydrationSchedule: ["time1: amount1", "time2: amount2"]
        },
        generalTips: ["tip1", "tip2", "tip3"]
      }, null, 2)}
      
      Only include the categories that were requested. For example, if sleep recommendations weren't requested, don't include the "sleep" property in the JSON.
      
      Return ONLY the JSON with no additional text before or after.
    `;
    
    // Generate recommendations with AI
    const response = await model.generateContent(prompt);
    const result = response.response.text();
    
    // Track token usage
    await trackTokenUsage(
      prisma,
      userId,
      tokenCost,
      "better_me_recommendations",
      "gemini-1.5-pro"
    );
    
    // Parse the result
    try {
      const recommendations = JSON.parse(result) as HealthRecommendations;
      return recommendations;
    } catch (e) {
      console.error("Failed to parse recommendations JSON:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate health recommendations",
      });
    }
  } catch (error) {
    console.error("Error generating health recommendations:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error generating health recommendations",
    });
  }
}

/**
 * ChatGPT-style assistant for health questions
 */
export async function betterMeAssistant(
  prisma: PrismaClient,
  userId: string,
  profile: HealthProfile | null,
  query: string
): Promise<string> {
  // Fixed token cost for chat
  const tokenCost = 5;
  
  // Check if user has enough tokens
  const userSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiEnabled: true, aiTokensRemaining: true },
  });
  
  if (!userSettings?.aiEnabled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "AI features are disabled for this account",
    });
  }
  
  if ((userSettings.aiTokensRemaining || 0) < tokenCost) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Insufficient tokens for assistant chat",
    });
  }
  
  try {
    const model = getModel();
    
    // Create a detailed prompt for the AI
    let prompt = `
      You are Better Me, a friendly health and wellness AI assistant integrated into the DapDip social network.
      Your purpose is to provide helpful, accurate health advice and answer questions related to nutrition, fitness, wellness, stress management, and sleep.
      
      Keep these guidelines in mind:
      - Be conversational and encouraging but stay focused on health topics
      - Base advice on established medical consensus when possible
      - For specific medical concerns, recommend consulting a healthcare professional
      - Avoid diagnosing medical conditions
      - Prioritize evidence-based information over anecdotal claims
      - If you don't know something, simply acknowledge that
      - Keep responses concise but informative
      
      USER QUERY: ${query}
    `;
    
    // Add context from user profile if available
    if (profile) {
      prompt += `
        
        USER PROFILE CONTEXT (use this to personalize your response):
        - Height: ${profile.height || 'Not specified'} cm
        - Weight: ${profile.weight || 'Not specified'} kg
        - Age: ${profile.age || 'Not specified'} years
        - Gender: ${profile.gender || 'Not specified'}
        - Activity level: ${profile.activityLevel || 'Not specified'}
        - Primary goal: ${profile.primaryGoal || 'Not specified'}
        - Dietary preferences: ${profile.dietaryPreferences?.join(', ') || 'Not specified'}
        - Health conditions: ${profile.healthConditions?.join(', ') || 'None'}
      `;
    }
    
    // Generate response with AI
    const response = await model.generateContent(prompt);
    const result = response.response.text();
    
    // Track token usage
    await trackTokenUsage(
      prisma,
      userId,
      tokenCost,
      "better_me_assistant",
      "gemini-1.5-pro"
    );
    
    return result;
  } catch (error) {
    console.error("Error with Better Me assistant:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Error generating assistant response",
    });
  }
}