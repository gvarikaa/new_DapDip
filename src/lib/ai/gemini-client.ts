import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize the Gemini API client
const API_KEY = process.env.GEMINI_API_KEY || "";

if (!API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

// Create Gemini client with safety settings
export const geminiClient = new GoogleGenerativeAI(API_KEY);

// Safety settings to prevent harmful content
const safetySetting = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Available model configurations
export const models = {
  pro: "gemini-1.5-pro", // Best for complex tasks
  flash: "gemini-1.5-flash", // Fastest response times
  vision: "gemini-1.5-pro-vision", // Image understanding
};

/**
 * Get a configured Gemini model instance
 * 
 * @param modelName Which model to use (from models object)
 * @returns Configured model instance
 */
export function getModel(modelName: keyof typeof models = "pro") {
  return geminiClient.getGenerativeModel({
    model: models[modelName],
    safetySettings: safetySetting,
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 2048,
    },
  });
}

/**
 * Analyze sentiment of text content
 * 
 * @param text Content to analyze
 * @returns Sentiment score from -1 (negative) to 1 (positive)
 */
export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const model = getModel("flash");
    
    const prompt = `
      Analyze the sentiment of the following text on a scale from -1 (very negative) to 1 (very positive).
      Return only a single number with 1 decimal point precision.
      
      Text: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    // Parse the response to a number
    const sentiment = parseFloat(response);
    
    // Validate the result
    if (isNaN(sentiment) || sentiment < -1 || sentiment > 1) {
      console.warn("Invalid sentiment response:", response);
      return 0; // Default to neutral
    }
    
    return sentiment;
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return 0; // Default to neutral
  }
}

/**
 * Extract topics and themes from content
 * 
 * @param text Content to analyze
 * @returns Array of topics and themes
 */
export async function extractTopics(text: string): Promise<string[]> {
  try {
    const model = getModel();
    
    const prompt = `
      Extract the main topics and themes from the following text.
      Return only a JSON array of strings with up to 5 topics.
      
      Text: "${text}"
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    // Parse the JSON response
    try {
      const topics = JSON.parse(response);
      if (Array.isArray(topics)) {
        return topics.slice(0, 5);
      }
    } catch (e) {
      console.warn("Failed to parse topics JSON:", response);
    }
    
    return [];
  } catch (error) {
    console.error("Topic extraction error:", error);
    return [];
  }
}

/**
 * Full analysis of post content
 * 
 * @param text Post content to analyze
 * @returns Comprehensive analysis with multiple metrics
 */
export async function analyzePostContent(text: string): Promise<{
  sentiment: number;
  topics: string[];
  analysis: Record<string, any>;
}> {
  try {
    const model = getModel();
    
    const prompt = `
      Perform a comprehensive analysis of the following social media post and provide results in JSON format:
      
      Post: "${text}"
      
      Analyze and return a JSON object with these fields:
      - sentiment: A number from -1 (very negative) to 1 (very positive) representing overall sentiment
      - topics: Array of main topics (max 5)
      - tone: Overall tone (formal, casual, excited, etc.)
      - emotions: Array of detected emotions
      - keyThemes: Array of key themes or ideas
      - engagement: Predicted level of engagement (low, medium, high) with brief reason
      - suggestions: Brief suggestions to improve engagement (max 150 chars)
      
      Return ONLY valid JSON without code blocks or explanations.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    try {
      const analysisResult = JSON.parse(response);
      
      // Extract and validate individual properties
      const sentiment = typeof analysisResult.sentiment === "number" 
        ? analysisResult.sentiment 
        : 0;
        
      const topics = Array.isArray(analysisResult.topics) 
        ? analysisResult.topics.slice(0, 5) 
        : [];
      
      return {
        sentiment,
        topics,
        analysis: analysisResult,
      };
    } catch (e) {
      console.error("Failed to parse analysis JSON:", e);
      throw new Error("Failed to parse analysis results");
    }
  } catch (error) {
    console.error("Content analysis error:", error);
    throw new Error("Content analysis failed");
  }
}

/**
 * Generate content suggestions based on a topic
 * 
 * @param topic Topic to generate suggestions for
 * @returns Array of post suggestions
 */
export async function generateContentSuggestions(topic: string): Promise<any[]> {
  try {
    const model = getModel();
    
    const prompt = `
      Generate 3 engaging social media post ideas about "${topic}".
      
      For each post idea, provide:
      1. A catchy title
      2. Post content (2-3 sentences)
      3. 2-3 relevant hashtags
      
      Return as JSON array with objects containing title, content, and hashtags fields.
      Return ONLY valid JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    try {
      const suggestions = JSON.parse(response);
      if (Array.isArray(suggestions)) {
        return suggestions.slice(0, 3);
      }
      return [];
    } catch (e) {
      console.error("Failed to parse suggestions JSON:", e);
      return [];
    }
  } catch (error) {
    console.error("Content suggestion error:", error);
    return [];
  }
}

/**
 * Check content for policy violations or inappropriate content
 * 
 * @param text Content to moderate
 * @returns Moderation result with safety scores
 */
export async function moderateContent(text: string): Promise<{
  isSafe: boolean;
  issues: string[];
  categories: Record<string, number>;
}> {
  try {
    const model = getModel();
    
    const prompt = `
      Moderate the following content for a social media platform. Check for:
      - Hate speech
      - Harassment
      - Violence
      - Sexual content
      - Illegal activities
      - Personal information
      - Spam or misleading content
      
      Content: "${text}"
      
      Return a JSON object with:
      - isSafe: boolean
      - issues: array of specific issues found (empty if safe)
      - categories: object with category names and scores from 0-1
      
      Return ONLY valid JSON.
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();
    
    try {
      const moderation = JSON.parse(response);
      return {
        isSafe: !!moderation.isSafe,
        issues: Array.isArray(moderation.issues) ? moderation.issues : [],
        categories: typeof moderation.categories === "object" ? moderation.categories : {},
      };
    } catch (e) {
      console.error("Failed to parse moderation JSON:", e);
      return {
        isSafe: false,
        issues: ["Error processing content moderation"],
        categories: {},
      };
    }
  } catch (error) {
    console.error("Content moderation error:", error);
    return {
      isSafe: false,
      issues: ["Service unavailable"],
      categories: {},
    };
  }
}