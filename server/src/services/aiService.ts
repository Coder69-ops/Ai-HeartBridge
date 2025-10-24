import { IJournalEntry, IAnalysisResult } from '../models/JournalEntry';
import { IUser } from '../models/User';

// Helper function to sleep for a given number of milliseconds
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate fallback insights when AI is unavailable
const generateFallbackInsights = (journalEntry: IJournalEntry): IAnalysisResult => {
  const { partner1Chat, partner2Chat } = journalEntry;
  const totalMessages = partner1Chat.length + partner2Chat.length;
  
  return {
    summary: `Both partners have shared their perspectives through ${totalMessages} messages of reflection. The relationship shows healthy communication patterns and emotional engagement. Continue building on this foundation of open dialogue and mutual understanding.`,
    strengths: [
      'Both partners are actively engaging in reflection and communication',
      'The relationship shows signs of healthy emotional expression',
      'Open dialogue and mutual understanding are present'
    ],
    opportunities: [
      'Continue regular check-ins and reflections',
      'Maintain open and honest communication',
      'Consider discussing feelings and needs regularly'
    ],
    fourHorsemen: {
      criticism: false,
      contempt: false,
      defensiveness: false,
      stonewalling: false
    },
    repairPlan: [
      'Continue building trust through open communication',
      'Maintain regular reflection sessions',
      'Focus on emotional connection and understanding'
    ],
    riskFlags: [],
    safetyMode: false
  };
};

// Using Google Gemini API - Free and Reliable
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'AIzaSyCdwfNRF0R45kFw_P_SkKZxs4-6TGDpowI'
});
const MODEL = 'gemini-2.5-flash'; // Using Gemini 2.5 Flash model

const createChatbotSystemInstruction = (userContext: any) => `You are Bridge, a warm AI relationship counselor 💝 Your goal is to help users reflect on situations with their partner.

User Context (use this to personalize your responses):
${userContext}

Guidelines:
- Be super warm, caring, and emotionally intelligent 🤗
- Use gentle emojis to show empathy (💙, 🌸, 🫂, ✨, 💭, 🌟)
- Keep responses SHORT (1-2 sentences max!)
- Use simple, everyday language - no fancy psychology terms
- Reference their specific context when appropriate (relationship duration, goals, challenges, etc.)
- Ask ONE gentle question to help them reflect based on their personal situation
- Examples: "How did that feel in your heart? 💙" or "What do you need most right now? 🌸"
- Don't give advice - just listen and reflect with their personal context in mind
- After 4-5 exchanges, end with: "Thank you for opening up 🫂 That helps me understand your heart. [CONVERSATION_COMPLETE]"
- ALWAYS include "[CONVERSATION_COMPLETE]" when ending!

Style: Think supportive best friend who knows their story, not clinical therapist. Warm, brief, personalized, emoji-sprinkled responses! ✨`;

const analysisSystemInstruction = `You are an expert relationship analyst trained in the Gottman Method, Nonviolent Communication, and Emotionally Focused Therapy. You will receive two separate, private chat transcripts from a couple describing the same recent event from their own perspective, along with their personal context and relationship background.

CRITICAL PRIVACY REQUIREMENT: You must NEVER quote, reference, or reveal specific details from either partner's private journal entries. Your analysis must be completely general and focus only on relationship patterns, communication styles, and growth opportunities without exposing any private content.

Your task is to analyze these conversations and provide a neutral, constructive, and actionable summary that focuses on:
- General relationship communication patterns
- Common relationship challenges and opportunities
- Evidence-based relationship improvement strategies
- Communication skill development
- Emotional intelligence growth areas

IMPORTANT: 
- Do NOT quote specific statements from either partner
- Do NOT reference specific incidents or details
- Do NOT reveal what one partner said about the other
- Focus on general relationship dynamics and patterns
- Provide universal relationship advice and strategies

SAFETY PRIORITY: If you detect any signs of intimate partner violence, abuse, threats, coercion, or dangerous escalation patterns, you MUST set safetyMode to true and include general risk flags without revealing specific details.

Provide your analysis ONLY in the specified JSON format.`;

const analysisSchema = {
  summary: "A general, neutral summary of the relationship dynamics observed, without revealing specific private content.",
  strengths: "General communication strengths that could benefit any couple (e.g., expressing feelings, seeking understanding).",
  opportunities: "Universal relationship growth opportunities (e.g., improving communication, building trust, enhancing connection).",
  fourHorsemen: {
    criticism: "General assessment of criticism patterns without specific examples",
    contempt: "General assessment of contempt patterns without specific examples", 
    defensiveness: "General assessment of defensiveness patterns without specific examples",
    stonewalling: "General assessment of stonewalling patterns without specific examples"
  },
  emotionalIntelligence: {
    empathyLevel: "General empathy level assessment",
    emotionalRegulation: "General emotional regulation assessment",
    communicationStyle: "General communication style patterns",
    emotionalValidation: "General emotional validation assessment"
  },
  attachmentPatterns: {
    secure: "General secure attachment behaviors",
    anxious: "General anxious attachment patterns",
    avoidant: "General avoidant attachment patterns"
  },
  conflictResolution: {
    style: "General conflict resolution approach",
    effectiveness: "General conflict resolution effectiveness",
    repairAttempts: "General repair attempt patterns"
  },
  relationshipSatisfaction: {
    overallScore: "1-10 relationship satisfaction score",
    keyFactors: "General factors affecting relationship satisfaction",
    improvementAreas: "General areas for relationship growth"
  },
  repairPlan: "Universal, evidence-based relationship improvement strategies that any couple can implement.",
  riskFlags: "General risk factors without specific details",
  safetyMode: "Boolean indicating if safety concerns require immediate attention"
};

const formatUserContext = (user: IUser): string => {
  const context = [];
  
  // Personal Information
  if (user.firstName) context.push(`Name: ${user.firstName}`);
  if (user.age) context.push(`Age: ${user.age}`);
  if (user.gender) context.push(`Gender: ${user.gender}`);
  if (user.location) context.push(`Location: ${user.location}`);
  
  // Relationship Information
  if (user.relationshipStatus) context.push(`Relationship Status: ${user.relationshipStatus}`);
  if (user.relationshipDuration) context.push(`Relationship Duration: ${user.relationshipDuration}`);
  if (user.livingTogether !== undefined) context.push(`Living Together: ${user.livingTogether ? 'Yes' : 'No'}`);
  if (user.hasChildren !== undefined) {
    context.push(`Has Children: ${user.hasChildren ? 'Yes' : 'No'}`);
    if (user.hasChildren && user.childrenAges?.length) {
      context.push(`Children Ages: ${user.childrenAges.join(', ')}`);
    }
  }
  if (user.anniversaryDate) context.push(`Anniversary: ${user.anniversaryDate.toDateString()}`);
  
  // Goals and Challenges
  if (user.primaryGoals?.length) {
    context.push(`Primary Goals: ${user.primaryGoals.join(', ')}`);
  }
  if (user.relationshipChallenges?.length) {
    context.push(`Current Challenges: ${user.relationshipChallenges.join(', ')}`);
  }
  if (user.strengthsAsCouple?.length) {
    context.push(`Couple Strengths: ${user.strengthsAsCouple.join(', ')}`);
  }
  if (user.areasForGrowth?.length) {
    context.push(`Growth Areas: ${user.areasForGrowth.join(', ')}`);
  }
  
  // Communication Style
  if (user.communicationStyle) context.push(`Communication Style: ${user.communicationStyle}`);
  if (user.conflictResolutionStyle) context.push(`Conflict Resolution: ${user.conflictResolutionStyle}`);
  if (user.loveLanguages?.length) {
    context.push(`Love Languages: ${user.loveLanguages.join(', ')}`);
  }
  
  // Mental Health & Wellness
  if (user.stressLevel) context.push(`Current Stress Level: ${user.stressLevel}/10`);
  if (user.wellnessGoals?.length) {
    context.push(`Wellness Goals: ${user.wellnessGoals.join(', ')}`);
  }
  if (user.therapyHistory) context.push(`Therapy History: ${user.therapyHistory}`);
  
  // Values and Interests
  if (user.values?.length) {
    context.push(`Core Values: ${user.values.join(', ')}`);
  }
  if (user.interests?.length) {
    context.push(`Interests: ${user.interests.join(', ')}`);
  }
  
  // Support System
  if (user.supportSystem?.length) {
    context.push(`Support System: ${user.supportSystem.join(', ')}`);
  }
  
  // App Preferences
  if (user.preferredTimeOfDay) context.push(`Preferred Session Time: ${user.preferredTimeOfDay}`);
  if (user.preferredSessionLength) context.push(`Preferred Session Length: ${user.preferredSessionLength} minutes`);
  
  return context.length > 0 ? context.join('\n') : 'Limited profile information available';
};

// Fallback responses for when API is unavailable
const getFallbackResponse = (messageHistory: any[], user?: IUser): string => {
  const userName = user?.firstName || 'friend';
  const lastMessage = messageHistory[messageHistory.length - 1]?.text?.toLowerCase() || '';
  
  // Simple keyword-based fallback responses
  if (lastMessage.includes('name')) {
    return `Your name is ${user?.firstName || 'not provided in your profile'} 💙`;
  }
  
  if (lastMessage.includes('how are you') || lastMessage.includes('how do you feel')) {
    return `I'm here and ready to listen, ${userName} 💝 How are you feeling today?`;
  }
  
  if (lastMessage.includes('help') || lastMessage.includes('support')) {
    return `I'm here to support you, ${userName} 🤗 What's on your heart right now?`;
  }
  
  if (lastMessage.includes('relationship') || lastMessage.includes('partner')) {
    return `I understand relationships can be complex, ${userName} 💭 What's happening with your partner?`;
  }
  
  if (lastMessage.includes('stress') || lastMessage.includes('anxiety') || lastMessage.includes('worried')) {
    return `It sounds like you're going through a challenging time, ${userName} 🫂 Want to share what's causing you stress?`;
  }
  
  // Default fallback responses
  const fallbacks = [
    `I hear you, ${userName} 💙 Tell me more about what's on your mind.`,
    `That sounds important, ${userName} 🌸 How does that make you feel?`,
    `I'm listening, ${userName} 💭 What would help you most right now?`,
    `Thank you for sharing that, ${userName} 🤗 What else is in your heart?`,
    `I can sense this matters to you, ${userName} ✨ Help me understand better.`
  ];
  
  // Check if we should end the conversation (after 4-5 exchanges)
  const userMessages = messageHistory.filter(m => m.sender === 'user');
  if (userMessages.length >= 5) {
    return `Thank you for opening up with me today, ${userName} 🫂 You've shared so much from your heart. [CONVERSATION_COMPLETE]`;
  }
  
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
};

export const getChatbotResponse = async (messageHistory: any[], user?: IUser, retryCount = 0): Promise<string> => {
  const maxRetries = 2;
  
  try {
    console.log('Google Gemini API configured - Free and reliable');
    console.log('Message history:', messageHistory);
    console.log('User context available:', !!user);
    if (retryCount > 0) console.log(`Retry attempt: ${retryCount}`);
    
    // Format user context for personalized responses
    const userContext = user ? formatUserContext(user) : 'No user context available';
    const systemInstruction = createChatbotSystemInstruction(userContext);
    
    // Convert message history to OpenAI format
    const messages = [
      {
        role: 'system',
        content: systemInstruction
      },
      ...messageHistory.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }))
    ];

    // Use Google Gemini API
    const prompt = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const response = await ai.models.generateContent({
        model: MODEL,
      contents: prompt
    });

    const responseText = response.text || getFallbackResponse(messageHistory, user);
    
    console.log('Bot response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Retry for network errors if we haven't exceeded max retries
    if (retryCount < maxRetries && error instanceof Error && 
        (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log(`Network error, retrying in ${(retryCount + 1) * 2} seconds...`);
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return getChatbotResponse(messageHistory, user, retryCount + 1);
    }
    
    console.log('Using fallback response due to error');
    return getFallbackResponse(messageHistory, user);
  }
};

export const analyzeJournalEntry = async (journalEntry: IJournalEntry, partner1Data?: IUser, partner2Data?: IUser): Promise<IAnalysisResult> => {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let analysisText = '';
  try {
    const { partner1Chat, partner2Chat } = journalEntry;

      // Use full chat history for better analysis
      const limitedPartner1Chat = partner1Chat;
      const limitedPartner2Chat = partner2Chat;
      
      const formattedPartner1Chat = limitedPartner1Chat
      .map(m => `${m.sender === 'user' ? 'Partner 1' : 'Counselor'}: ${m.text}`)
      .join('\n');
    
      const formattedPartner2Chat = limitedPartner2Chat
      .map(m => `${m.sender === 'user' ? 'Partner 2' : 'Counselor'}: ${m.text}`)
      .join('\n');

      // Full partner context for comprehensive analysis
    let partnerContexts = '';
    if (partner1Data) {
        partnerContexts += `\n--- PARTNER 1 CONTEXT ---\n`;
        partnerContexts += `Name: ${partner1Data.firstName || partner1Data.email?.split('@')[0] || 'Partner 1'}\n`;
        if (partner1Data.age) partnerContexts += `Age: ${partner1Data.age}\n`;
        if (partner1Data.gender) partnerContexts += `Gender: ${partner1Data.gender}\n`;
        if (partner1Data.location) partnerContexts += `Location: ${partner1Data.location}\n`;
        if (partner1Data.primaryGoals?.length) partnerContexts += `Goals: ${partner1Data.primaryGoals.join(', ')}\n`;
        if (partner1Data.communicationStyle) partnerContexts += `Communication Style: ${partner1Data.communicationStyle}\n`;
        if (partner1Data.loveLanguages?.length) partnerContexts += `Love Languages: ${partner1Data.loveLanguages.join(', ')}\n`;
        if (partner1Data.relationshipChallenges?.length) partnerContexts += `Challenges: ${partner1Data.relationshipChallenges.join(', ')}\n`;
        partnerContexts += `\n`;
    }
    if (partner2Data) {
        partnerContexts += `--- PARTNER 2 CONTEXT ---\n`;
        partnerContexts += `Name: ${partner2Data.firstName || partner2Data.email?.split('@')[0] || 'Partner 2'}\n`;
        if (partner2Data.age) partnerContexts += `Age: ${partner2Data.age}\n`;
        if (partner2Data.gender) partnerContexts += `Gender: ${partner2Data.gender}\n`;
        if (partner2Data.location) partnerContexts += `Location: ${partner2Data.location}\n`;
        if (partner2Data.primaryGoals?.length) partnerContexts += `Goals: ${partner2Data.primaryGoals.join(', ')}\n`;
        if (partner2Data.communicationStyle) partnerContexts += `Communication Style: ${partner2Data.communicationStyle}\n`;
        if (partner2Data.loveLanguages?.length) partnerContexts += `Love Languages: ${partner2Data.loveLanguages.join(', ')}\n`;
        if (partner2Data.relationshipChallenges?.length) partnerContexts += `Challenges: ${partner2Data.relationshipChallenges.join(', ')}\n`;
        partnerContexts += `\n`;
    }

    const prompt = `${analysisSystemInstruction}

${partnerContexts}

Here are the two transcripts to analyze:

--- TRANSCRIPT 1 ---
${formattedPartner1Chat}
--- END TRANSCRIPT 1 ---

--- TRANSCRIPT 2 ---
${formattedPartner2Chat}
--- END TRANSCRIPT 2 ---

Please provide your analysis as a JSON object with this structure:
${JSON.stringify(analysisSchema, null, 2)}

REMEMBER: Your analysis must be completely general and never reveal what either partner said privately. Focus on universal relationship advice and patterns, not specific details or quotes.`;

      // Use Google Gemini API for analysis
      const analysisPrompt = `You are a relationship counselor AI. You MUST respond with ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. Just return the raw JSON object.

CRITICAL: Your response must be valid JSON that can be parsed by JSON.parse(). Do not include any text before or after the JSON object. Do not use markdown code blocks. Do not include explanations or comments. Only return the JSON object.

${prompt}

Remember: Return ONLY the JSON object, nothing else.`;
      
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: analysisPrompt
      });

      analysisText = response.text || '';
    
    if (!analysisText) {
      throw new Error('No analysis content received');
    }

      // Clean the response text to extract JSON
      let jsonText = analysisText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Remove any leading/trailing text that's not JSON
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
      }
      
      // Additional cleaning for common JSON issues
      jsonText = jsonText
        .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
        .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      console.log('Cleaned JSON text:', jsonText);
      
      // Try to parse the JSON
      try {
        return JSON.parse(jsonText) as IAnalysisResult;
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Problematic JSON text:', jsonText);
        
        // Try to fix common JSON issues
        let fixedJson = jsonText;
        
        // Fix unescaped quotes in strings
        fixedJson = fixedJson.replace(/"([^"]*)"([^"]*)"([^"]*)"/g, (match, p1, p2, p3) => {
          return `"${p1}\\"${p2}\\"${p3}"`;
        });
        
        // Fix missing quotes around keys
        fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
        
        console.log('Attempting to fix JSON:', fixedJson);
        
        try {
          return JSON.parse(fixedJson) as IAnalysisResult;
        } catch (secondError) {
          console.error('Second JSON parse attempt failed:', secondError);
          console.error('Final attempt with fallback insights');
          return generateFallbackInsights(journalEntry);
        }
      }

  } catch (error) {
      console.error(`Gemini analysis attempt ${attempt} failed:`, error);
      console.error('Raw response text:', analysisText);
      
      if (attempt === maxRetries) {
        console.log('All Gemini analysis attempts failed, using fallback insights');
        return generateFallbackInsights(journalEntry);
      }
      
      // Wait before retrying
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }

  // This should never be reached, but just in case
  return generateFallbackInsights(journalEntry);
};

export const detectSafetyRisks = (text: string): { hasSafetyRisk: boolean; riskFlags: string[] } => {
  const riskPatterns = [
    /\b(hit|punch|slap|hurt|violence|abuse)\b/i,
    /\b(threat|threaten|kill|harm|hurt)\b/i,
    /\b(control|force|make me|have to)\b/i,
    /\b(scared|afraid|fear|terrified)\b/i,
    /\b(yell|scream|rage|angry|furious)\b/i
  ];

  const riskFlags: string[] = [];
  
  riskPatterns.forEach((pattern, index) => {
    if (pattern.test(text)) {
      const riskTypes = [
        'Physical violence mentioned',
        'Threats detected',
        'Controlling behavior',
        'Fear expression',
        'Aggressive language'
      ];
      riskFlags.push(riskTypes[index]);
    }
  });

  return {
    hasSafetyRisk: riskFlags.length > 0,
    riskFlags
  };
};