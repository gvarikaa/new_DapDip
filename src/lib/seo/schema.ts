/**
 * Schema.org structured data utilities
 * Helps improve search engine understanding of content and enables rich results
 */

export type WebsiteSchemaProps = {
  name: string;
  url: string;
  description: string;
  language?: string;
};

export type OrganizationSchemaProps = {
  name: string;
  url: string;
  logo?: string;
  description?: string;
};

export type ProfileSchemaProps = {
  username: string;
  name: string;
  url: string;
  image?: string;
  description?: string;
  followersCount?: number;
};

export type PostSchemaProps = {
  headline: string;
  description?: string;
  authorName: string;
  authorUrl: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
  url: string;
};

/**
 * Generate Schema.org WebSite JSON-LD
 */
export function generateWebsiteSchema(props: WebsiteSchemaProps): Record<string, any> {
  const { name, url, description, language = "en-US" } = props;
  
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    inLanguage: language,
    potentialAction: {
      "@type": "SearchAction",
      target: `${url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

/**
 * Generate Schema.org Organization JSON-LD
 */
export function generateOrganizationSchema(props: OrganizationSchemaProps): Record<string, any> {
  const { name, url, logo, description } = props;
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    ...(description && { description }),
    sameAs: [
      "https://www.facebook.com/dapdip",
      "https://twitter.com/dapdip",
      "https://www.instagram.com/dapdip",
      "https://www.linkedin.com/company/dapdip"
    ]
  };
}

/**
 * Generate Schema.org Person JSON-LD for user profiles
 */
export function generateProfileSchema(props: ProfileSchemaProps): Record<string, any> {
  const { username, name, url, image, description, followersCount } = props;
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    alternateName: username,
    url,
    ...(image && { image }),
    ...(description && { description }),
    ...(followersCount !== undefined && { 
      interactionStatistic: {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/FollowAction",
        userInteractionCount: followersCount
      }
    })
  };
}

/**
 * Generate Schema.org SocialMediaPosting JSON-LD for posts
 */
export function generatePostSchema(props: PostSchemaProps): Record<string, any> {
  const { 
    headline, 
    description, 
    authorName, 
    authorUrl, 
    datePublished, 
    dateModified, 
    image, 
    url 
  } = props;
  
  return {
    "@context": "https://schema.org",
    "@type": "SocialMediaPosting",
    headline,
    ...(description && { description }),
    author: {
      "@type": "Person",
      name: authorName,
      url: authorUrl
    },
    datePublished,
    ...(dateModified && { dateModified }),
    ...(image && { image }),
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  };
}

/**
 * Generate complete website JSON-LD data for the home page
 */
export function generateHomePageSchema(): Record<string, any>[] {
  const websiteSchema = generateWebsiteSchema({
    name: "DapDip",
    url: "https://www.dapdip.com",
    description: "Connect with friends and share your moments with DapDip social network",
  });
  
  const organizationSchema = generateOrganizationSchema({
    name: "DapDip",
    url: "https://www.dapdip.com",
    logo: "https://www.dapdip.com/logo.png",
    description: "A modern social network to connect with friends and share your moments"
  });
  
  return [websiteSchema, organizationSchema];
}