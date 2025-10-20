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

// Using Hugging Face Inference API - Free and Reliable
const HF_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
const MODEL = 'microsoft/DialoGPT-large'; // Free conversational AI model

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

Your task is to analyze these conversations and provide a neutral, constructive, and actionable summary. Use the provided user context to:
- Understand their relationship history, duration, and dynamics
- Consider their stated goals and known challenges
- Reference their communication styles and preferences
- Account for their life circumstances (children, living situation, etc.)
- Consider their values, interests, and support systems
- Tailor repair strategies to their specific situation

Do not take sides. Focus on identifying patterns, underlying needs, and opportunities for connection that are specific to this couple's unique circumstances.

SAFETY PRIORITY: If you detect any signs of intimate partner violence, abuse, threats, coercion, or dangerous escalation patterns, you MUST set safetyMode to true and include specific risk flags. Look for patterns like:
- Threats of violence or harm
- Controlling or coercive language
- Extreme jealousy or possessiveness
- Verbal abuse or degradation
- Descriptions of physical violence
- Intimidation tactics

Provide your analysis ONLY in the specified JSON format.`;

const analysisSchema = {
  summary: "A neutral, 1-2 paragraph summary of the core issue from both perspectives.",
  strengths: "A list of 2-3 specific communication strengths observed (e.g., using 'I' statements, expressing vulnerability).",
  opportunities: "A list of 2-3 specific opportunities for growth (e.g., areas where defensiveness occurred, chances for validation).",
  fourHorsemen: {
    criticism: "Is there criticism (attacking character) vs. complaining (specific issue)?",
    contempt: "Is there contempt (sarcasm, name-calling, eye-rolling, disrespect)?",
    defensiveness: "Is there defensiveness (victimizing self, not taking responsibility)?",
    stonewalling: "Is there stonewalling (shutting down, refusing to engage)?"
  },
  emotionalIntelligence: {
    empathyLevel: "High/Medium/Low empathy demonstrated by both partners",
    emotionalRegulation: "How well emotions were managed during the conversation",
    communicationStyle: "Assertive/Passive/Aggressive patterns observed",
    emotionalValidation: "How well partners validated each other's emotions"
  },
  attachmentPatterns: {
    secure: "Secure attachment behaviors observed (e.g., seeking comfort, providing support)",
    anxious: "Anxious attachment patterns (e.g., seeking reassurance, fear of abandonment)",
    avoidant: "Avoidant attachment patterns (e.g., emotional distance, self-reliance)"
  },
  conflictResolution: {
    style: "Collaborative/Competitive/Avoidant/Accommodating approach to conflict",
    effectiveness: "How well conflicts were resolved or managed",
    repairAttempts: "Successful repair attempts and connection bids identified"
  },
  relationshipSatisfaction: {
    overallScore: "1-10 relationship satisfaction based on the conversation",
    keyFactors: "Main factors affecting relationship satisfaction",
    improvementAreas: "Specific areas for relationship growth and improvement"
  },
  repairPlan: "A concrete, 3-step actionable repair plan for the couple to reconnect on this issue.",
  riskFlags: "List any specific safety concerns or abuse patterns detected. Leave empty if none found.",
  safetyMode: "Set to true if any intimate partner violence, abuse, or serious safety concerns are detected."
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
    console.log('Hugging Face API configured - Free conversational AI');
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

    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'AI HeartBridge',
        'X-Description': 'AI relationship counseling app'
      },
      body: JSON.stringify({
        inputs: {
          past_user_inputs: messages.filter(m => m.role === 'user').slice(-5).map(m => m.content),
          generated_responses: messages.filter(m => m.role === 'assistant').slice(-5).map(m => m.content),
          text: messages[messages.length - 1]?.content || "Hello, I need relationship advice."
        },
        parameters: {
          max_length: 100,
          temperature: 0.8,
          do_sample: true
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Hugging Face API error:', errorData);
      
      // Check for rate limiting specifically
      if (response.status === 429 || errorData.includes('rate-limited')) {
        console.log('Rate limit detected');
        
        // Retry for rate limits if we haven't exceeded max retries
        if (retryCount < maxRetries) {
          console.log(`Retrying in ${(retryCount + 1) * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
          return getChatbotResponse(messageHistory, user, retryCount + 1);
        }
        
        console.log('Max retries exceeded, using fallback response');
        return getFallbackResponse(messageHistory, user);
      }
      
      // For other API errors, also use fallback
      console.log('API error detected, using fallback response');
      return getFallbackResponse(messageHistory, user);
    }

    const data: any = await response.json();
    const responseText = data.generated_text || getFallbackResponse(messageHistory, user);
    
    console.log('Bot response:', responseText);
    return responseText;
  } catch (error) {
    console.error('Chatbot error:', error);
    
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
    try {
      const { partner1Chat, partner2Chat } = journalEntry;

      // Limit chat length to prevent token overflow
      const maxMessagesPerPartner = 10;
      const limitedPartner1Chat = partner1Chat.slice(-maxMessagesPerPartner);
      const limitedPartner2Chat = partner2Chat.slice(-maxMessagesPerPartner);
      
      const formattedPartner1Chat = limitedPartner1Chat
        .map(m => `${m.sender === 'user' ? 'Partner 1' : 'Counselor'}: ${m.text}`)
        .join('\n');
      
      const formattedPartner2Chat = limitedPartner2Chat
        .map(m => `${m.sender === 'user' ? 'Partner 2' : 'Counselor'}: ${m.text}`)
        .join('\n');

      // Add minimal partner context to reduce token usage
      let partnerContexts = '';
      if (partner1Data) {
        partnerContexts += `\n--- PARTNER 1 CONTEXT ---\n`;
        partnerContexts += `Name: ${partner1Data.firstName || partner1Data.email?.split('@')[0] || 'Partner 1'}\n`;
        partnerContexts += `\n`;
      }
      if (partner2Data) {
        partnerContexts += `--- PARTNER 2 CONTEXT ---\n`;
        partnerContexts += `Name: ${partner2Data.firstName || partner2Data.email?.split('@')[0] || 'Partner 2'}\n`;
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
${JSON.stringify(analysisSchema, null, 2)}`;

      const response = await fetch(HF_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-HeartBridge/1.0'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 800,
            temperature: 0.3,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded, wait and retry
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`Rate limit hit, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
          await sleep(delay);
          continue;
        }
        const errorText = await response.text();
        console.error(`Hugging Face API error: ${response.status} - ${errorText}`);
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }

      const data: any = await response.json();
      const analysisText = data[0]?.generated_text;
      
      if (!analysisText) {
        throw new Error('No analysis content received');
      }

      const jsonText = analysisText.trim();
      return JSON.parse(jsonText) as IAnalysisResult;

    } catch (error) {
      console.error(`Analysis attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        console.log('All AI analysis attempts failed, using fallback insights');
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