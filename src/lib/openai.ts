import OpenAI from "openai";

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export type OptimizationType = "title" | "description" | "tags" | "seo";

interface OptimizationContext {
  currentTitle?: string;
  currentDescription?: string;
  currentTags?: string[];
  price?: number;
  category?: string;
}

export async function generateTitleSuggestions(
  currentTitle: string,
  context: OptimizationContext
): Promise<{ suggestions: string[]; reasoning: string }> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an Etsy SEO expert. Generate optimized listing titles that:
- Are 140 characters or less
- Include relevant keywords that buyers search for
- Front-load the most important keywords
- Are clear and descriptive
- Avoid keyword stuffing
- Follow Etsy's guidelines`,
      },
      {
        role: "user",
        content: `Current title: "${currentTitle}"
${context.currentTags ? `Tags: ${context.currentTags.join(", ")}` : ""}
${context.price ? `Price: $${context.price}` : ""}

Generate 3 optimized title suggestions and explain your reasoning. Format your response as JSON:
{
  "suggestions": ["title1", "title2", "title3"],
  "reasoning": "explanation of changes and keywords used"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"suggestions": [], "reasoning": ""}');
}

export async function generateDescriptionSuggestion(
  currentDescription: string,
  context: OptimizationContext
): Promise<{ suggestion: string; reasoning: string; keywords: string[] }> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an Etsy listing expert. Write compelling product descriptions that:
- Start with key features and benefits
- Use natural language with relevant keywords
- Include sizing/dimensions if applicable
- Address buyer concerns and questions
- Have clear paragraph breaks for readability
- Create urgency without being pushy
- Are between 200-500 words`,
      },
      {
        role: "user",
        content: `Current title: "${context.currentTitle}"
Current description: "${currentDescription}"
${context.currentTags ? `Tags: ${context.currentTags.join(", ")}` : ""}

Generate an optimized description and extract the main keywords. Format your response as JSON:
{
  "suggestion": "the optimized description",
  "reasoning": "explanation of improvements",
  "keywords": ["keyword1", "keyword2", ...]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"suggestion": "", "reasoning": "", "keywords": []}');
}

export async function generateTagSuggestions(
  context: OptimizationContext
): Promise<{ suggestions: string[]; reasoning: string }> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an Etsy SEO expert. Generate optimized tags that:
- Are relevant to the product
- Include a mix of broad and specific terms
- Use phrases buyers actually search for
- Avoid redundancy with the title
- Are 20 characters or less each
- Total up to 13 tags (Etsy's limit)`,
      },
      {
        role: "user",
        content: `Title: "${context.currentTitle}"
Description: "${context.currentDescription}"
Current tags: ${context.currentTags?.join(", ") || "None"}

Generate 13 optimized tag suggestions. Format your response as JSON:
{
  "suggestions": ["tag1", "tag2", ...],
  "reasoning": "explanation of tag strategy"
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"suggestions": [], "reasoning": ""}');
}

export async function analyzeSEO(
  context: OptimizationContext
): Promise<{
  score: number;
  issues: Array<{ type: string; severity: "low" | "medium" | "high"; message: string }>;
  recommendations: string[];
}> {
  const response = await getOpenAIClient().chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are an Etsy SEO analyst. Analyze listings for:
- Title optimization (keywords, length, structure)
- Description quality (keywords, readability, length)
- Tag optimization (relevance, variety, coverage)
- Overall search visibility potential

Provide a score from 0-100 and specific issues with recommendations.`,
      },
      {
        role: "user",
        content: `Title: "${context.currentTitle}"
Description: "${context.currentDescription}"
Tags: ${context.currentTags?.join(", ") || "None"}

Analyze this listing's SEO. Format your response as JSON:
{
  "score": 75,
  "issues": [
    {"type": "title", "severity": "medium", "message": "issue description"}
  ],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content || '{"score": 0, "issues": [], "recommendations": []}');
}

export async function generateOptimization(
  type: OptimizationType,
  context: OptimizationContext
): Promise<{
  suggestion: string;
  reasoning: string;
  metadata?: Record<string, unknown>;
}> {
  switch (type) {
    case "title": {
      const result = await generateTitleSuggestions(
        context.currentTitle || "",
        context
      );
      return {
        suggestion: result.suggestions[0] || "",
        reasoning: result.reasoning,
        metadata: { allSuggestions: result.suggestions },
      };
    }
    case "description": {
      const result = await generateDescriptionSuggestion(
        context.currentDescription || "",
        context
      );
      return {
        suggestion: result.suggestion,
        reasoning: result.reasoning,
        metadata: { keywords: result.keywords },
      };
    }
    case "tags": {
      const result = await generateTagSuggestions(context);
      return {
        suggestion: result.suggestions.join(", "),
        reasoning: result.reasoning,
        metadata: { tags: result.suggestions },
      };
    }
    case "seo": {
      const result = await analyzeSEO(context);
      return {
        suggestion: `SEO Score: ${result.score}/100\n\nIssues:\n${result.issues.map(i => `- [${i.severity}] ${i.message}`).join("\n")}\n\nRecommendations:\n${result.recommendations.map(r => `- ${r}`).join("\n")}`,
        reasoning: "Comprehensive SEO analysis of your listing",
        metadata: { score: result.score, issues: result.issues, recommendations: result.recommendations },
      };
    }
    default:
      throw new Error(`Unknown optimization type: ${type}`);
  }
}
