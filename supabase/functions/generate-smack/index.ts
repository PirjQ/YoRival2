import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface RequestPayload {
  topic: string;
  userSide: string;
  opposingSide: string;
  username: string;
}

// Function to analyze topic and determine the appropriate tone/style
function analyzeTopicVibe(topic: string): {
  category: string;
  tone: string;
  style: string;
  examples: string[];
} {
  const topicLower = topic.toLowerCase();
  
  // Political topics
  if (topicLower.includes('trump') || topicLower.includes('biden') || topicLower.includes('election') || 
      topicLower.includes('democrat') || topicLower.includes('republican') || topicLower.includes('politics') ||
      topicLower.includes('government') || topicLower.includes('vote') || topicLower.includes('president')) {
    return {
      category: "political",
      tone: "sharp but respectful",
      style: "witty political commentary",
      examples: [
        "At least my side doesn't need a fact-checker on speed dial.",
        "Your side's logic is more twisted than a campaign promise.",
        "My side actually reads the fine print before voting."
      ]
    };
  }
  
  // Food debates
  if (topicLower.includes('food') || topicLower.includes('pizza') || topicLower.includes('hotdog') || 
      topicLower.includes('sandwich') || topicLower.includes('pineapple') || topicLower.includes('cooking') ||
      topicLower.includes('restaurant') || topicLower.includes('eat') || topicLower.includes('taste')) {
    return {
      category: "food",
      tone: "playful and foodie",
      style: "culinary sass",
      examples: [
        "Your taste buds clearly need a GPS because they're lost.",
        "My side has actual flavor - yours is as bland as unsalted crackers.",
        "At least my choice doesn't make Gordon Ramsay cry."
      ]
    };
  }
  
  // Technology/Gaming
  if (topicLower.includes('iphone') || topicLower.includes('android') || topicLower.includes('apple') ||
      topicLower.includes('samsung') || topicLower.includes('gaming') || topicLower.includes('console') ||
      topicLower.includes('pc') || topicLower.includes('tech') || topicLower.includes('app') ||
      topicLower.includes('social media') || topicLower.includes('tiktok') || topicLower.includes('instagram')) {
    return {
      category: "tech",
      tone: "nerdy and clever",
      style: "tech-savvy roasting",
      examples: [
        "Your choice is more outdated than Internet Explorer.",
        "My side actually gets software updates this decade.",
        "At least my team doesn't need a manual to figure it out."
      ]
    };
  }
  
  // Sports
  if (topicLower.includes('sport') || topicLower.includes('football') || topicLower.includes('basketball') ||
      topicLower.includes('soccer') || topicLower.includes('baseball') || topicLower.includes('team') ||
      topicLower.includes('player') || topicLower.includes('game') || topicLower.includes('championship')) {
    return {
      category: "sports",
      tone: "competitive and energetic",
      style: "sports trash talk",
      examples: [
        "Your team's strategy is weaker than their defense.",
        "My side actually shows up when it matters.",
        "At least my choice doesn't choke in the playoffs."
      ]
    };
  }
  
  // Entertainment/Pop Culture
  if (topicLower.includes('movie') || topicLower.includes('music') || topicLower.includes('celebrity') ||
      topicLower.includes('netflix') || topicLower.includes('disney') || topicLower.includes('marvel') ||
      topicLower.includes('star wars') || topicLower.includes('tv show') || topicLower.includes('series')) {
    return {
      category: "entertainment",
      tone: "pop culture savvy",
      style: "entertainment industry shade",
      examples: [
        "Your choice has more plot holes than a Michael Bay movie.",
        "My side actually has character development.",
        "At least my pick doesn't need a reboot every five years."
      ]
    };
  }
  
  // Relationship/Dating
  if (topicLower.includes('dating') || topicLower.includes('relationship') || topicLower.includes('love') ||
      topicLower.includes('marriage') || topicLower.includes('boyfriend') || topicLower.includes('girlfriend') ||
      topicLower.includes('tinder') || topicLower.includes('romance')) {
    return {
      category: "relationships",
      tone: "cheeky and relatable",
      style: "dating app wisdom",
      examples: [
        "Your choice is a bigger red flag than lying about your age.",
        "My side actually knows how to commit.",
        "At least my pick doesn't ghost you after three dates."
      ]
    };
  }
  
  // Work/Office
  if (topicLower.includes('work') || topicLower.includes('office') || topicLower.includes('job') ||
      topicLower.includes('boss') || topicLower.includes('meeting') || topicLower.includes('remote') ||
      topicLower.includes('zoom') || topicLower.includes('email') || topicLower.includes('corporate')) {
    return {
      category: "workplace",
      tone: "office humor",
      style: "corporate comedy",
      examples: [
        "Your side is like a Monday morning meeting - nobody wants it.",
        "My choice actually increases productivity instead of killing it.",
        "At least my team doesn't need three meetings to decide on lunch."
      ]
    };
  }
  
  // Lifestyle/Fashion
  if (topicLower.includes('fashion') || topicLower.includes('style') || topicLower.includes('clothes') ||
      topicLower.includes('brand') || topicLower.includes('shopping') || topicLower.includes('trend') ||
      topicLower.includes('outfit') || topicLower.includes('shoes')) {
    return {
      category: "lifestyle",
      tone: "fashionably fierce",
      style: "style guru shade",
      examples: [
        "Your choice went out of style faster than low-rise jeans.",
        "My side actually understands what looks good.",
        "At least my pick doesn't scream 'I shop at gas stations.'"
      ]
    };
  }
  
  // Silly/Random topics
  if (topicLower.includes('weird') || topicLower.includes('random') || topicLower.includes('silly') ||
      topicLower.includes('funny') || topicLower.includes('strange') || topicLower.includes('toilet paper') ||
      topicLower.includes('cereal') || topicLower.includes('socks')) {
    return {
      category: "silly",
      tone: "absurdly hilarious",
      style: "random chaos energy",
      examples: [
        "Your choice makes about as much sense as pineapple on pizza.",
        "My side has the chaotic energy this world needs.",
        "At least my pick doesn't make people question reality."
      ]
    };
  }
  
  // Default for general topics
  return {
    category: "general",
    tone: "cleverly sarcastic",
    style: "witty observation",
    examples: [
      "Your side's logic is more questionable than a 3 AM text.",
      "My choice actually makes sense to people with functioning brain cells.",
      "At least my team doesn't need a GPS to find common sense."
    ]
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  let requestBody: RequestPayload;

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse the request body ONCE and store it
    requestBody = await req.json();

    // Validate required fields
    const { topic, userSide, opposingSide, username } = requestBody;
    if (!topic || !userSide || !opposingSide || !username) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get the API key from environment variables
    const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_GEMINI_API_KEY not found in environment variables");
      throw new Error("API configuration error");
    }

    // Analyze the topic to determine the appropriate vibe and style
    const topicAnalysis = analyzeTopicVibe(topic);

    // Initialize the Google Generative AI client with Gemini 2.0 Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Construct a sophisticated, context-aware prompt
    const prompt = `You are a master of witty comebacks and zingers, specializing in ${topicAnalysis.category} debates. Your job is to create the perfect zinger that will make people laugh, think, and want to share it.

CONTEXT ANALYSIS:
- Topic: "${topic}"
- Category: ${topicAnalysis.category}
- Appropriate Tone: ${topicAnalysis.tone}
- Style: ${topicAnalysis.style}
- My Position: "${userSide}"
- Opposing Position: "${opposingSide}"
- My Username: @${username}

ZINGER REQUIREMENTS:
1. Match the ${topicAnalysis.tone} tone perfectly
2. Use ${topicAnalysis.style} approach
3. Be clever, not mean-spirited
4. Maximum 25 words
5. Make people want to share it
6. Support "${userSide}" while playfully challenging "${opposingSide}"
7. Use modern, relatable language
8. Include subtle humor that elevates dopamine
9. Be memorable and quotable

STYLE EXAMPLES FOR ${topicAnalysis.category.toUpperCase()} TOPICS:
${topicAnalysis.examples.map(ex => `- "${ex}"`).join('\n')}

EMOTIONAL GOALS:
- Surprise the reader with unexpected wit
- Create a "mic drop" moment
- Make the reader feel clever for choosing ${userSide}
- Generate that satisfying "burn" feeling
- Encourage sharing and engagement

AVOID:
- Generic templates
- Offensive content
- Overly complex language
- Boring predictable responses
- Being too serious or too silly (unless topic calls for it)

Now generate ONE perfect zinger that captures the essence of this ${topicAnalysis.category} debate with ${topicAnalysis.tone} energy. Make it so good that people will screenshot it and share it everywhere.

Return ONLY the zinger text, no quotes, no explanation:`;

    // Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text().trim();

    // Clean up the response (remove quotes if present)
    const cleanedText = generatedText.replace(/^["']|["']$/g, '').trim();

    // Validate the response length
    if (cleanedText.length > 200) {
      // Use category-specific fallback
      const fallbackText = topicAnalysis.examples[Math.floor(Math.random() * topicAnalysis.examples.length)]
        .replace(/Your side|My side|Your choice|My choice|Your team|My team/g, (match) => {
          if (match.includes('Your')) return opposingSide;
          return userSide;
        });
      
      return new Response(
        JSON.stringify({ 
          zinger: fallbackText,
          source: "fallback",
          category: topicAnalysis.category
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Return the generated zinger
    return new Response(
      JSON.stringify({ 
        zinger: cleanedText,
        source: "ai",
        category: topicAnalysis.category,
        tone: topicAnalysis.tone
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error generating zinger:", error);
    
    // Enhanced fallback with topic analysis using the stored request body
    try {
      if (requestBody && requestBody.userSide && requestBody.opposingSide && requestBody.topic) {
        const topicAnalysis = analyzeTopicVibe(requestBody.topic);
        const fallbackText = topicAnalysis.examples[Math.floor(Math.random() * topicAnalysis.examples.length)]
          .replace(/Your side|My side|Your choice|My choice|Your team|My team/g, (match) => {
            if (match.includes('Your')) return requestBody.opposingSide;
            return requestBody.userSide;
          });
        
        return new Response(
          JSON.stringify({ 
            zinger: fallbackText,
            source: "fallback",
            category: topicAnalysis.category
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
    }

    return new Response(
      JSON.stringify({ error: "Failed to generate zinger" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});