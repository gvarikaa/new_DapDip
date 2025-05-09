'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Save, User, Scale, Target, Apple, Heart, Shield } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityLevel, PrivacyLevel } from '@prisma/client';
import { api } from '@/lib/api/trpc/client';

// Form validation schema
const healthProfileSchema = z.object({
  // Biometric data
  height: z.number().min(50, "Height must be at least 50cm").max(250, "Height must be less than 250cm").optional(),
  weight: z.number().min(30, "Weight must be at least 30kg").max(500, "Weight must be less than 500kg").optional(),
  birthdate: z.date().optional(),
  gender: z.string().optional(),
  activityLevel: z.nativeEnum(ActivityLevel).optional(),
  
  // Health goals
  primaryGoal: z.string().optional(),
  secondaryGoals: z.array(z.string()).optional(),
  targetWeight: z.number().min(30, "Target weight must be at least 30kg").max(500, "Target weight must be less than 500kg").optional(),
  targetDate: z.date().optional(),
  
  // Dietary preferences
  dietaryPreferences: z.array(z.string()).optional(),
  foodAllergies: z.array(z.string()).optional(),
  foodPreferences: z.object({
    likes: z.array(z.string()).optional(),
    dislikes: z.array(z.string()).optional(),
  }).optional(),
  
  // Health conditions
  healthConditions: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  
  // Privacy settings
  privacyLevel: z.nativeEnum(PrivacyLevel).default(PrivacyLevel.PRIVATE),
  shareProgress: z.boolean().default(false),
  shareMeals: z.boolean().default(false),
  shareWorkouts: z.boolean().default(false),
  
  // Additional settings
  measurementSystem: z.enum(['metric', 'imperial']).default('metric'),
  notificationsEnabled: z.boolean().default(true),
});

// Goals options
const primaryGoals = [
  'Weight loss',
  'Muscle gain',
  'Maintain weight',
  'Improve fitness',
  'Better sleep',
  'Reduce stress',
  'Increase energy',
  'Improve overall health',
  'Other'
];

const secondaryGoals = [
  'Build muscle',
  'Lose fat',
  'Improve cardiovascular health',
  'Increase flexibility',
  'Improve balance',
  'Improve mental clarity',
  'Reduce anxiety',
  'Better digestion',
  'Healthier skin',
  'Boost immune system',
  'Improve posture',
  'Reduce pain',
  'Train for event/sport'
];

// Dietary preferences options
const dietaryPreferenceOptions = [
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Paleo',
  'Gluten-free',
  'Dairy-free',
  'Low-carb',
  'Mediterranean',
  'Halal',
  'Kosher',
  'Raw food',
  'Whole food'
];

// Health conditions options
const healthConditionOptions = [
  'None',
  'Diabetes',
  'Hypertension',
  'Heart disease',
  'Asthma',
  'Allergies',
  'Arthritis',
  'Digestive disorders',
  'Depression/Anxiety',
  'Insomnia',
  'Thyroid disorder',
  'Celiac disease',
  'Lactose intolerance',
  'Other'
];

/**
 * Better Me Profile Creation Page
 * Allows users to create or update their health profile
 */
export default function BetterMeProfilePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  
  // Get existing profile if it exists
  const { data: existingProfile, isLoading: isLoadingProfile } = api.betterMe.getProfile.useQuery();
  
  // Mutation for updating profile
  const updateProfileMutation = api.betterMe.updateProfile.useMutation({
    onSuccess: () => {
      toast.success('Profile saved successfully!');
      router.push('/better-me/dashboard');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save profile');
    },
  });
  
  // Form definition
  const form = useForm<z.infer<typeof healthProfileSchema>>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      height: undefined,
      weight: undefined,
      birthdate: undefined,
      gender: undefined,
      activityLevel: undefined,
      primaryGoal: undefined,
      secondaryGoals: [],
      targetWeight: undefined,
      targetDate: undefined,
      dietaryPreferences: [],
      foodAllergies: [],
      foodPreferences: {
        likes: [],
        dislikes: [],
      },
      healthConditions: [],
      medications: [],
      privacyLevel: PrivacyLevel.PRIVATE,
      shareProgress: false,
      shareMeals: false,
      shareWorkouts: false,
      measurementSystem: 'metric',
      notificationsEnabled: true,
    },
  });
  
  // Set form values from existing profile if available
  React.useEffect(() => {
    if (existingProfile && !isLoadingProfile) {
      // Map the existing profile data to form values
      const formValues: any = {
        height: existingProfile.height,
        weight: existingProfile.weight,
        birthdate: existingProfile.birthdate ? new Date(existingProfile.birthdate) : undefined,
        gender: existingProfile.gender,
        activityLevel: existingProfile.activityLevel,
        primaryGoal: existingProfile.primaryGoal,
        secondaryGoals: existingProfile.secondaryGoals,
        targetWeight: existingProfile.targetWeight,
        targetDate: existingProfile.targetDate ? new Date(existingProfile.targetDate) : undefined,
        dietaryPreferences: existingProfile.dietaryPreferences,
        foodAllergies: existingProfile.foodAllergies,
        foodPreferences: existingProfile.foodPreferences ? 
          JSON.parse(JSON.stringify(existingProfile.foodPreferences)) : 
          { likes: [], dislikes: [] },
        healthConditions: existingProfile.healthConditions,
        medications: existingProfile.medications,
        privacyLevel: existingProfile.privacyLevel,
        shareProgress: existingProfile.shareProgress,
        shareMeals: existingProfile.shareMeals,
        shareWorkouts: existingProfile.shareWorkouts,
        measurementSystem: existingProfile.measurementSystem,
        notificationsEnabled: existingProfile.notificationsEnabled,
      };
      
      // Reset form with existing values
      form.reset(formValues);
    }
  }, [existingProfile, isLoadingProfile, form]);
  
  // Form submission handler
  const onSubmit = (data: z.infer<typeof healthProfileSchema>) => {
    updateProfileMutation.mutate(data);
  };
  
  // Steps for the form wizard
  const steps = [
    { 
      title: "Basic Information", 
      icon: <User className="h-5 w-5" />,
      description: "Tell us about yourself" 
    },
    { 
      title: "Health Goals", 
      icon: <Target className="h-5 w-5" />,
      description: "Set your health and fitness goals" 
    },
    { 
      title: "Nutrition", 
      icon: <Apple className="h-5 w-5" />,
      description: "Dietary preferences and restrictions" 
    },
    { 
      title: "Health Conditions", 
      icon: <Heart className="h-5 w-5" />,
      description: "Help us understand your health background" 
    },
    { 
      title: "Privacy", 
      icon: <Shield className="h-5 w-5" />,
      description: "Control what you share" 
    },
  ];
  
  // Navigation functions
  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };
  
  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };
  
  return (
    <MainLayout>
      <div className="container max-w-4xl py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">
            {existingProfile ? 'Update Your Health Profile' : 'Create Your Health Profile'}
          </h1>
          <p className="text-muted-foreground mb-8">
            Let's personalize your Better Me experience with some information about you.
          </p>
        </motion.div>
        
        {/* Steps progress */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={`flex flex-col items-center ${index > activeStep ? 'text-muted-foreground' : ''}`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 
                    ${index === activeStep ? 'bg-primary text-primary-foreground' : 
                      index < activeStep ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  {step.icon}
                </div>
                <span className="text-xs font-medium hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute h-1 bg-muted w-full rounded-full" />
            <div 
              className="absolute h-1 bg-primary rounded-full transition-all" 
              style={{ width: `${(activeStep / (steps.length - 1)) * 100}%` }}
            />
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {steps[activeStep].icon}
                  {steps[activeStep].title}
                </CardTitle>
                <CardDescription>
                  {steps[activeStep].description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Step 1: Basic Information */}
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height (cm)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 175" 
                                {...field}
                                onChange={event => field.onChange(parseFloat(event.target.value) || undefined)}
                                value={field.value === undefined ? '' : field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Your height in centimeters
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight (kg)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="e.g., 70" 
                                {...field}
                                onChange={event => field.onChange(parseFloat(event.target.value) || undefined)}
                                value={field.value === undefined ? '' : field.value}
                              />
                            </FormControl>
                            <FormDescription>
                              Your current weight in kilograms
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="birthdate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field}
                                value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ''}
                                onChange={event => field.onChange(event.target.value ? new Date(event.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Used to calculate your age for recommendations
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your gender" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="non-binary">Non-binary</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Used for personalized recommendations
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              value={field.value}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="SEDENTARY" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Sedentary (little or no exercise)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="LIGHT" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Light (light exercise 1-3 days/week)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="MODERATE" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Moderate (moderate exercise 3-5 days/week)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="ACTIVE" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Active (hard exercise 6-7 days/week)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="VERY_ACTIVE" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Very Active (very hard exercise & physical job)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            Your typical level of daily physical activity
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="measurementSystem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Measurement System</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex space-x-4"
                              value={field.value}
                            >
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="metric" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Metric (kg, cm)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="imperial" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Imperial (lb, ft/in)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                
                {/* Step 2: Health Goals */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="primaryGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Health Goal</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your main goal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {primaryGoals.map(goal => (
                                <SelectItem key={goal} value={goal}>{goal}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your main health or fitness objective
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Goals (Optional)</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {secondaryGoals.map((goal) => (
                              <FormItem 
                                key={goal} 
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(goal)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, goal]
                                        : current.filter((value) => value !== goal);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {goal}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormDescription>
                            Select any additional health goals you'd like to work on
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {form.watch('primaryGoal') === 'Weight loss' || 
                     form.watch('primaryGoal') === 'Weight gain' || 
                     form.watch('primaryGoal') === 'Muscle gain' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="targetWeight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Weight (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="e.g., 65" 
                                  {...field}
                                  onChange={event => field.onChange(parseFloat(event.target.value) || undefined)}
                                  value={field.value === undefined ? '' : field.value}
                                />
                              </FormControl>
                              <FormDescription>
                                Your target weight in kilograms
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="targetDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Date (Optional)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date" 
                                  {...field}
                                  value={field.value instanceof Date ? field.value.toISOString().slice(0, 10) : ''}
                                  onChange={event => field.onChange(event.target.value ? new Date(event.target.value) : undefined)}
                                />
                              </FormControl>
                              <FormDescription>
                                When you aim to reach your target weight
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    ) : null}
                    
                    <div className="space-y-3">
                      <FormLabel>Why is this goal important to you? (Optional)</FormLabel>
                      <Textarea 
                        placeholder="I want to achieve this goal because..." 
                        className="min-h-[100px]" 
                      />
                      <FormDescription>
                        Understanding your motivation can help with personalized recommendations
                      </FormDescription>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Nutrition */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="dietaryPreferences"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Preferences</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {dietaryPreferenceOptions.map((preference) => (
                              <FormItem 
                                key={preference} 
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(preference)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, preference]
                                        : current.filter((value) => value !== preference);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {preference}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormDescription>
                            Select all dietary preferences that apply to you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="foodAllergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Allergies</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter any food allergies (e.g., peanuts, shellfish, dairy), separated by commas" 
                              value={field.value?.join(', ') || ''}
                              onChange={e => {
                                const allergies = e.target.value
                                  .split(',')
                                  .map(item => item.trim())
                                  .filter(item => item !== '');
                                field.onChange(allergies);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            List foods that cause allergic reactions for you
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormLabel>Food Preferences</FormLabel>
                      
                      <Tabs defaultValue="likes" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="likes">Foods You Like</TabsTrigger>
                          <TabsTrigger value="dislikes">Foods You Dislike</TabsTrigger>
                        </TabsList>
                        <TabsContent value="likes" className="pt-4">
                          <FormField
                            control={form.control}
                            name="foodPreferences.likes"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter foods you enjoy, separated by commas" 
                                    value={field.value?.join(', ') || ''}
                                    onChange={e => {
                                      const likes = e.target.value
                                        .split(',')
                                        .map(item => item.trim())
                                        .filter(item => item !== '');
                                      field.onChange(likes);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This helps us suggest meals you'll enjoy
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                        <TabsContent value="dislikes" className="pt-4">
                          <FormField
                            control={form.control}
                            name="foodPreferences.dislikes"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter foods you dislike, separated by commas" 
                                    value={field.value?.join(', ') || ''}
                                    onChange={e => {
                                      const dislikes = e.target.value
                                        .split(',')
                                        .map(item => item.trim())
                                        .filter(item => item !== '');
                                      field.onChange(dislikes);
                                    }}
                                  />
                                </FormControl>
                                <FormDescription>
                                  We'll avoid including these in your meal plans
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                )}
                
                {/* Step 4: Health Conditions */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="healthConditions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Health Conditions</FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {healthConditionOptions.map((condition) => (
                              <FormItem 
                                key={condition} 
                                className="flex items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(condition)}
                                    onCheckedChange={(checked) => {
                                      let current = field.value || [];
                                      let updated;
                                      
                                      if (condition === 'None') {
                                        updated = checked ? ['None'] : [];
                                      } else {
                                        // Remove 'None' if any other condition is selected
                                        current = current.filter(c => c !== 'None');
                                        updated = checked
                                          ? [...current, condition]
                                          : current.filter((value) => value !== condition);
                                      }
                                      
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {condition}
                                </FormLabel>
                              </FormItem>
                            ))}
                          </div>
                          <FormDescription>
                            Select any health conditions you have that might affect your diet or exercise
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medications (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter medications you're taking that might affect your nutrition or exercise, separated by commas" 
                              value={field.value?.join(', ') || ''}
                              onChange={e => {
                                const medications = e.target.value
                                  .split(',')
                                  .map(item => item.trim())
                                  .filter(item => item !== '');
                                field.onChange(medications);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            This helps us tailor recommendations for your situation
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-sm text-yellow-800">
                      <h4 className="font-medium mb-1">Health Disclaimer</h4>
                      <p>
                        Better Me provides general wellness recommendations and should not replace professional medical advice.
                        Always consult your healthcare provider before starting any new diet or exercise program,
                        especially if you have existing health conditions.
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Step 5: Privacy Settings */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="privacyLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profile Privacy</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                              value={field.value}
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="PRIVATE" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Private (Only you can see your health profile)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="FRIENDS" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Friends (Only your connections can see your profile)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="PUBLIC" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Public (Anyone can see your health profile)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            Control who can see your health profile
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="space-y-4">
                      <FormLabel>Sharing Preferences</FormLabel>
                      
                      <FormField
                        control={form.control}
                        name="shareProgress"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-normal cursor-pointer">
                                Share Progress Updates
                              </FormLabel>
                              <FormDescription>
                                Allow friends to see your health milestones and achievements
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shareMeals"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-normal cursor-pointer">
                                Share Meal Plans
                              </FormLabel>
                              <FormDescription>
                                Allow friends to see your meal plans and recipes
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="shareWorkouts"
                        render={({ field }) => (
                          <FormItem className="flex items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1">
                              <FormLabel className="font-normal cursor-pointer">
                                Share Workout Plans
                              </FormLabel>
                              <FormDescription>
                                Allow friends to see your workout routines
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="notificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="font-normal cursor-pointer">
                              Health Notifications
                            </FormLabel>
                            <FormDescription>
                              Receive reminders, tips, and progress updates
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={activeStep === 0}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                
                {activeStep < steps.length - 1 ? (
                  <Button type="button" onClick={nextStep}>
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'} <Save className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </MainLayout>
  );
}