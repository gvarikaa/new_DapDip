import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { 
  generateMealPlan, 
  generateWorkoutPlan, 
  generateHealthRecommendations,
  betterMeAssistant
} from '@/lib/ai/better-me-ai';
import { 
  ActivityLevel,
  PrivacyLevel 
} from '@prisma/client';

// Validation schemas
const healthProfileSchema = z.object({
  height: z.number().min(50).max(250).optional(),
  weight: z.number().min(30).max(500).optional(),
  birthdate: z.date().optional(),
  gender: z.string().optional(),
  activityLevel: z.nativeEnum(ActivityLevel).optional(),
  primaryGoal: z.string().optional(),
  secondaryGoals: z.array(z.string()).optional(),
  targetWeight: z.number().min(30).max(500).optional(),
  targetDate: z.date().optional(),
  dietaryPreferences: z.array(z.string()).optional(),
  foodAllergies: z.array(z.string()).optional(),
  foodPreferences: z.object({
    likes: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
  }).optional(),
  healthConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  sleepGoalHours: z.number().min(4).max(12).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  privacyLevel: z.nativeEnum(PrivacyLevel).default('PRIVATE'),
  shareProgress: z.boolean().default(false),
  shareMeals: z.boolean().default(false),
  shareWorkouts: z.boolean().default(false),
  measurementSystem: z.enum(['metric', 'imperial']).default('metric'),
  notificationsEnabled: z.boolean().default(true),
});

const mealPlanOptionsSchema = z.object({
  days: z.number().min(1).max(28),
  caloriesPerDay: z.number().min(500).max(5000).optional(),
  mealsPerDay: z.number().min(1).max(6).optional(),
  includeSnacks: z.boolean().default(false),
  preferredCuisines: z.array(z.string()).optional(),
  includeGroceryList: z.boolean().default(true),
});

const workoutPlanOptionsSchema = z.object({
  weeks: z.number().min(1).max(12),
  daysPerWeek: z.number().min(1).max(7),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  focusAreas: z.array(z.string()).optional(),
  durationMinutes: z.number().min(10).max(120).optional(),
  equipment: z.array(z.string()).optional(),
});

const healthRecommendationsOptionsSchema = z.object({
  includeNutrition: z.boolean().default(true),
  includeExercise: z.boolean().default(true),
  includeSleep: z.boolean().default(true),
  includeStressManagement: z.boolean().default(true),
  includeHydration: z.boolean().default(true),
});

const healthLogSchema = z.object({
  date: z.date().default(() => new Date()),
  weight: z.number().min(30).max(500).optional(),
  bodyFatPercentage: z.number().min(1).max(50).optional(),
  waistCircumference: z.number().min(40).max(200).optional(),
  hipCircumference: z.number().min(40).max(200).optional(),
  chestCircumference: z.number().min(40).max(200).optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  moodRating: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  photoUrl: z.string().optional(),
});

const waterLogSchema = z.object({
  date: z.date().default(() => new Date()),
  amount: z.number().min(1).max(5000), // Amount in ml
});

const sleepLogSchema = z.object({
  date: z.date(),
  startTime: z.date(),
  endTime: z.date(),
  quality: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
});

/**
 * Better Me TRPC Router
 */
export const betterMeRouter = createTRPCRouter({
  /**
   * Get the user's health profile
   */
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const healthProfile = await ctx.prisma.healthProfile.findUnique({
      where: { userId: ctx.session.user.id },
    });
    
    return healthProfile;
  }),
  
  /**
   * Create or update the user's health profile
   */
  updateProfile: protectedProcedure
    .input(healthProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const existingProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (existingProfile) {
        // Update existing profile
        return ctx.prisma.healthProfile.update({
          where: { userId: ctx.session.user.id },
          data: input,
        });
      } else {
        // Create new profile
        return ctx.prisma.healthProfile.create({
          data: {
            ...input,
            userId: ctx.session.user.id,
          },
        });
      }
    }),
  
  /**
   * Generate a meal plan based on the user's health profile
   */
  generateMealPlan: protectedProcedure
    .input(mealPlanOptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      // Calculate age from birthdate if available
      let age;
      if (healthProfile.birthdate) {
        const today = new Date();
        const birthDate = new Date(healthProfile.birthdate);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      // Prepare profile data for AI
      const profileData = {
        height: healthProfile.height || undefined,
        weight: healthProfile.weight || undefined,
        age: age,
        gender: healthProfile.gender || undefined,
        activityLevel: healthProfile.activityLevel || undefined,
        primaryGoal: healthProfile.primaryGoal || undefined,
        secondaryGoals: healthProfile.secondaryGoals || [],
        targetWeight: healthProfile.targetWeight || undefined,
        targetDate: healthProfile.targetDate || undefined,
        dietaryPreferences: healthProfile.dietaryPreferences || [],
        foodAllergies: healthProfile.foodAllergies || [],
        foodPreferences: healthProfile.foodPreferences ? JSON.parse(JSON.stringify(healthProfile.foodPreferences)) : undefined,
        healthConditions: healthProfile.healthConditions || [],
        medications: healthProfile.medications || [],
      };
      
      // Generate meal plan using AI
      const mealPlan = await generateMealPlan(
        ctx.prisma,
        ctx.session.user.id,
        profileData,
        input
      );
      
      // Save meal plan to database
      const createdMealPlan = await ctx.prisma.mealPlan.create({
        data: {
          profileId: healthProfile.id,
          name: `${input.days}-Day Meal Plan`,
          startDate: new Date(),
          endDate: new Date(Date.now() + input.days * 24 * 60 * 60 * 1000),
          totalCalories: mealPlan.nutritionSummary.averageCalories,
          protein: mealPlan.nutritionSummary.averageProtein,
          carbs: mealPlan.nutritionSummary.averageCarbs,
          fat: mealPlan.nutritionSummary.averageFat,
          generatedByAI: true,
          meals: {
            create: mealPlan.plan.flatMap(day => 
              day.meals.map(meal => ({
                day: day.day,
                type: meal.type,
                name: meal.name,
                recipe: meal.recipe,
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat,
                ingredients: meal.ingredients,
              }))
            )
          }
        },
      });
      
      return {
        mealPlan,
        savedPlanId: createdMealPlan.id,
      };
    }),
  
  /**
   * Generate a workout plan based on the user's health profile
   */
  generateWorkoutPlan: protectedProcedure
    .input(workoutPlanOptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      // Calculate age from birthdate if available
      let age;
      if (healthProfile.birthdate) {
        const today = new Date();
        const birthDate = new Date(healthProfile.birthdate);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      // Prepare profile data for AI
      const profileData = {
        height: healthProfile.height || undefined,
        weight: healthProfile.weight || undefined,
        age: age,
        gender: healthProfile.gender || undefined,
        activityLevel: healthProfile.activityLevel || undefined,
        primaryGoal: healthProfile.primaryGoal || undefined,
        secondaryGoals: healthProfile.secondaryGoals || [],
        healthConditions: healthProfile.healthConditions || [],
      };
      
      // Generate workout plan using AI
      const workoutPlan = await generateWorkoutPlan(
        ctx.prisma,
        ctx.session.user.id,
        profileData,
        input
      );
      
      // Save workout plan to database
      const createdWorkoutPlan = await ctx.prisma.workoutPlan.create({
        data: {
          profileId: healthProfile.id,
          name: `${input.weeks}-Week ${input.difficulty} Plan`,
          startDate: new Date(),
          endDate: new Date(Date.now() + input.weeks * 7 * 24 * 60 * 60 * 1000),
          difficulty: input.difficulty,
          focusArea: input.focusAreas || [],
          daysPerWeek: input.daysPerWeek,
          generatedByAI: true,
          workouts: {
            create: workoutPlan.plan.map(day => ({
              day: day.day,
              name: day.name,
              instructions: `Focus: ${day.focusArea}\nWarmup: ${day.warmup}\nCooldown: ${day.cooldown}`,
              durationMinutes: day.durationMinutes,
              caloriesBurned: day.caloriesBurned,
              exercises: {
                create: day.exercises.map(exercise => ({
                  name: exercise.name,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  duration: exercise.duration,
                  restSeconds: exercise.restSeconds,
                  instructions: exercise.instructions,
                }))
              }
            }))
          }
        },
      });
      
      return {
        workoutPlan,
        savedPlanId: createdWorkoutPlan.id,
      };
    }),
  
  /**
   * Generate health recommendations based on the user's health profile
   */
  generateRecommendations: protectedProcedure
    .input(healthRecommendationsOptionsSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      // Calculate age from birthdate if available
      let age;
      if (healthProfile.birthdate) {
        const today = new Date();
        const birthDate = new Date(healthProfile.birthdate);
        age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      }
      
      // Prepare profile data for AI
      const profileData = {
        height: healthProfile.height || undefined,
        weight: healthProfile.weight || undefined,
        age: age,
        gender: healthProfile.gender || undefined,
        activityLevel: healthProfile.activityLevel || undefined,
        primaryGoal: healthProfile.primaryGoal || undefined,
        secondaryGoals: healthProfile.secondaryGoals || [],
        dietaryPreferences: healthProfile.dietaryPreferences || [],
        healthConditions: healthProfile.healthConditions || [],
        sleepGoalHours: healthProfile.sleepGoalHours || undefined,
        stressLevel: healthProfile.stressLevel || undefined,
        energyLevel: healthProfile.energyLevel || undefined,
      };
      
      // Generate recommendations using AI
      return generateHealthRecommendations(
        ctx.prisma,
        ctx.session.user.id,
        profileData,
        input
      );
    }),
  
  /**
   * Chat with the Better Me AI assistant
   */
  chatWithAssistant: protectedProcedure
    .input(z.object({
      message: z.string().min(1).max(1000),
      includeProfileContext: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      let profileData = null;
      
      if (input.includeProfileContext) {
        const healthProfile = await ctx.prisma.healthProfile.findUnique({
          where: { userId: ctx.session.user.id },
        });
        
        if (healthProfile) {
          // Calculate age from birthdate if available
          let age;
          if (healthProfile.birthdate) {
            const today = new Date();
            const birthDate = new Date(healthProfile.birthdate);
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
          }
          
          // Prepare profile data for AI
          profileData = {
            height: healthProfile.height || undefined,
            weight: healthProfile.weight || undefined,
            age: age,
            gender: healthProfile.gender || undefined,
            activityLevel: healthProfile.activityLevel || undefined,
            primaryGoal: healthProfile.primaryGoal || undefined,
            secondaryGoals: healthProfile.secondaryGoals || [],
            dietaryPreferences: healthProfile.dietaryPreferences || [],
            healthConditions: healthProfile.healthConditions || [],
          };
        }
      }
      
      // Get response from AI assistant
      const response = await betterMeAssistant(
        ctx.prisma,
        ctx.session.user.id,
        profileData,
        input.message
      );
      
      return { response };
    }),
  
  /**
   * Add a health log entry
   */
  addHealthLog: protectedProcedure
    .input(healthLogSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      return ctx.prisma.healthLog.create({
        data: {
          ...input,
          profileId: healthProfile.id,
        },
      });
    }),
  
  /**
   * Get health log entries
   */
  getHealthLogs: protectedProcedure
    .input(z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        return [];
      }
      
      // Build query filters
      const where: any = {
        profileId: healthProfile.id,
      };
      
      if (input.startDate || input.endDate) {
        where.date = {};
        
        if (input.startDate) {
          where.date.gte = input.startDate;
        }
        
        if (input.endDate) {
          where.date.lte = input.endDate;
        }
      }
      
      return ctx.prisma.healthLog.findMany({
        where,
        orderBy: { date: 'desc' },
        take: input.limit,
      });
    }),
  
  /**
   * Add a water log entry
   */
  addWaterLog: protectedProcedure
    .input(waterLogSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      return ctx.prisma.waterLog.create({
        data: {
          ...input,
          profileId: healthProfile.id,
        },
      });
    }),
  
  /**
   * Get water log entries for today
   */
  getTodayWaterLogs: protectedProcedure
    .query(async ({ ctx }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        return [];
      }
      
      // Get today's start and end
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return ctx.prisma.waterLog.findMany({
        where: {
          profileId: healthProfile.id,
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        orderBy: { date: 'asc' },
      });
    }),
  
  /**
   * Add a sleep log entry
   */
  addSleepLog: protectedProcedure
    .input(sleepLogSchema)
    .mutation(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Health profile not found. Please create a profile first.",
        });
      }
      
      // Calculate sleep duration in hours
      const startTime = new Date(input.startTime);
      const endTime = new Date(input.endTime);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      
      return ctx.prisma.sleepLog.create({
        data: {
          ...input,
          profileId: healthProfile.id,
          duration: durationHours,
        },
      });
    }),
  
  /**
   * Get sleep log entries
   */
  getSleepLogs: protectedProcedure
    .input(z.object({
      days: z.number().min(1).max(90).default(7),
    }))
    .query(async ({ ctx, input }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        return [];
      }
      
      // Calculate date range
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      startDate.setHours(0, 0, 0, 0);
      
      return ctx.prisma.sleepLog.findMany({
        where: {
          profileId: healthProfile.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: 'desc' },
      });
    }),
  
  /**
   * Get active meal plan
   */
  getActiveMealPlan: protectedProcedure
    .query(async ({ ctx }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        return null;
      }
      
      // Get the most recent meal plan that includes today
      const today = new Date();
      
      return ctx.prisma.mealPlan.findFirst({
        where: {
          profileId: healthProfile.id,
          startDate: { lte: today },
          endDate: { gte: today },
        },
        include: {
          meals: {
            orderBy: [
              { day: 'asc' },
              { type: 'asc' },
            ],
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
  
  /**
   * Get active workout plan
   */
  getActiveWorkoutPlan: protectedProcedure
    .query(async ({ ctx }) => {
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile) {
        return null;
      }
      
      // Get the most recent workout plan that includes today
      const today = new Date();
      
      return ctx.prisma.workoutPlan.findFirst({
        where: {
          profileId: healthProfile.id,
          startDate: { lte: today },
          endDate: { gte: today },
        },
        include: {
          workouts: {
            include: {
              exercises: true,
            },
            orderBy: {
              day: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
  
  /**
   * Mark workout as completed
   */
  completeWorkout: protectedProcedure
    .input(z.object({
      workoutId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const workout = await ctx.prisma.workout.findUnique({
        where: { id: input.workoutId },
        include: {
          workoutPlan: {
            select: {
              profileId: true,
            },
          },
        },
      });
      
      if (!workout) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workout not found",
        });
      }
      
      // Verify user owns the workout
      const healthProfile = await ctx.prisma.healthProfile.findUnique({
        where: { userId: ctx.session.user.id },
      });
      
      if (!healthProfile || workout.workoutPlan.profileId !== healthProfile.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this workout",
        });
      }
      
      return ctx.prisma.workout.update({
        where: { id: input.workoutId },
        data: {
          completed: true,
          completedDate: new Date(),
        },
      });
    }),
});

// Export the router
export default betterMeRouter;