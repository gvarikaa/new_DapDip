import { getModel } from "@/lib/ai/gemini-client";

interface GenerateMetadataParams {
  content: string;
  type: 'post' | 'profile' | 'page';
  context?: Record<string, any>;
}

interface GeneratedMetadata {
  title: string;
  description: string;
  keywords: string[];
}

/**
 * Generate AI-powered metadata for content
 * This helps improve SEO by creating optimized titles and descriptions
 * 
 * @param params Content and context for generating metadata
 * @returns Generated title, description and keywords
 */
export async function generateAIMetadata({
  content,
  type,
  context = {},
}: GenerateMetadataParams): Promise<GeneratedMetadata> {
  try {
    // Get AI model
    const model = getModel('flash'); // Use faster model for metadata generation
    
    // Prepare prompts based on content type
    let prompt = '';
    
    if (type === 'post') {
      prompt = `
        Generate SEO metadata for the following social media post:
        
        "${content.substring(0, 500)}"
        
        ${context.author ? `Author: ${context.author}` : ''}
        ${context.tags ? `Tags: ${context.tags.join(', ')}` : ''}
        
        Return a JSON object with:
        - title: An SEO-optimized title (max 60 chars)
        - description: An engaging meta description (120-155 chars)
        - keywords: An array of 5-7 relevant keywords
        
        The title and description should be compelling and accurately represent the content.
        Return ONLY valid JSON without explanations.
      `;
    } else if (type === 'profile') {
      prompt = `
        Generate SEO metadata for the following user profile:
        
        "${content.substring(0, 500)}"
        
        ${context.name ? `Name: ${context.name}` : ''}
        ${context.username ? `Username: ${context.username}` : ''}
        
        Return a JSON object with:
        - title: An SEO-optimized title (max 60 chars)
        - description: An engaging meta description (120-155 chars)
        - keywords: An array of 5-7 relevant keywords
        
        The title should include the username. The description should be compelling and accurately represent the profile.
        Return ONLY valid JSON without explanations.
      `;
    } else {
      prompt = `
        Generate SEO metadata for the following website page:
        
        "${content.substring(0, 500)}"
        
        ${context.pageName ? `Page name: ${context.pageName}` : ''}
        
        Return a JSON object with:
        - title: An SEO-optimized title (max 60 chars)
        - description: An engaging meta description (120-155 chars)
        - keywords: An array of 5-7 relevant keywords
        
        The title should be clear and descriptive. The description should be compelling and accurately represent the page content.
        Return ONLY valid JSON without explanations.
      `;
    }
    
    // Generate metadata with AI
    const response = await model.generateContent(prompt);
    const rawText = response.response.text().trim();
    
    // Parse JSON response
    try {
      const result = JSON.parse(rawText);
      
      // Validate and sanitize result
      return {
        title: typeof result.title === 'string' ? result.title.substring(0, 60) : 'DapDip',
        description: typeof result.description === 'string' ? result.description.substring(0, 155) : 'Connect with friends and share your moments on DapDip',
        keywords: Array.isArray(result.keywords) ? result.keywords.slice(0, 7) : ['social network', 'social media'],
      };
    } catch (parseError) {
      console.error('Error parsing AI metadata response:', parseError);
      // Return fallback metadata
      return getDefaultMetadata(type, context);
    }
  } catch (error) {
    console.error('Error generating AI metadata:', error);
    // Return fallback metadata
    return getDefaultMetadata(type, context);
  }
}

/**
 * Get default metadata when AI generation fails
 */
function getDefaultMetadata(
  type: 'post' | 'profile' | 'page',
  context: Record<string, any>
): GeneratedMetadata {
  if (type === 'post') {
    return {
      title: context.author ? `Post by ${context.author} on DapDip` : 'New Post on DapDip',
      description: 'Check out this post on DapDip social network. Connect with friends and share your moments.',
      keywords: ['social post', 'social media', 'dapdip', 'social network'],
    };
  } else if (type === 'profile') {
    return {
      title: context.name 
        ? `${context.name}${context.username ? ` (@${context.username})` : ''} | DapDip` 
        : 'User Profile | DapDip',
      description: `Discover ${context.name || 'this user'}'s profile on DapDip social network. Follow them to stay connected and see their updates.`,
      keywords: ['profile', 'social media', 'dapdip', 'social network', 'user profile'],
    };
  } else {
    return {
      title: context.pageName ? `${context.pageName} | DapDip` : 'DapDip Social Network',
      description: 'DapDip is a modern social network where you can connect with friends and share your moments.',
      keywords: ['social network', 'social media', 'dapdip', 'friends', 'community'],
    };
  }
}