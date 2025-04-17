import { NextRequest, NextResponse } from 'next/server';

// Get API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'dummy-key-for-development';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// For development/demo purposes - this will be used if the API call fails
const FALLBACK_RESPONSES: Record<string, string> = {
  // Greetings and introductions
  'hi': "Hello! How can I help you with your health questions today?",
  'hello': "Hi there! I'm your health assistant. How can I help you today?",
  'hey': "Hello! I'm here to help with health information. What would you like to know?",
  'who are you': "I'm your health assistant in the TeleHealth platform. I can provide general health information and wellness tips, though I'm not a doctor and can't provide medical diagnoses. How can I help you today?",
  'what can you do': "I can provide information about common health concerns, wellness tips, and general medical information. I can answer questions about symptoms, healthy lifestyle choices, and preventive care. Remember, I'm not a substitute for professional medical advice. What would you like to know?",
  'help': "I'm here to help with health-related questions. You can ask me about symptoms, general wellness tips, nutrition, exercise, sleep, and more. What information are you looking for today?",

  // Health conditions and symptoms
  'headache': "For headaches, it's generally recommended to rest in a quiet, dark room, stay hydrated, and take over-the-counter pain relievers like acetaminophen or ibuprofen if appropriate. If headaches are severe, persistent, or accompanied by other symptoms like fever, vision changes, or neck stiffness, please consult a healthcare professional.",
  'migraine': "Migraines can be debilitating. Try resting in a dark, quiet room, applying cold compresses to your forehead, and taking prescribed medications if you have them. Stay hydrated and consider tracking triggers to prevent future episodes. For recurring migraines, please consult with a healthcare provider for proper treatment.",
  'cold': "For common colds, rest, staying hydrated, and over-the-counter medications to relieve symptoms are typically recommended. Symptoms usually resolve within 7-10 days. If symptoms worsen or persist longer, consider consulting a healthcare professional.",
  'flu': "For flu symptoms, rest, stay hydrated, and take over-the-counter fever reducers if needed. Antiviral medications may help if started early. If you experience difficulty breathing, chest pain, persistent high fever, or other severe symptoms, seek medical attention immediately.",
  'fever': "For fever, staying hydrated and taking appropriate fever reducers like acetaminophen or ibuprofen can help. If fever is high (above 103°F/39.4°C), persists for more than a few days, or is accompanied by severe symptoms, please seek medical attention.",
  'cough': "For a cough, stay hydrated, use honey (if over 1 year old), try cough drops, and use a humidifier. If your cough persists for more than 2 weeks, produces thick green/yellow mucus, or is accompanied by fever or difficulty breathing, please consult a healthcare professional.",
  'sore throat': "For a sore throat, try gargling with warm salt water, drinking warm liquids, using throat lozenges, and taking over-the-counter pain relievers if appropriate. If your sore throat is severe, lasts longer than a week, or is accompanied by difficulty swallowing or breathing, please see a healthcare provider.",
  'stomach': "For stomach issues, try eating bland foods, staying hydrated, and avoiding spicy or fatty foods. For stomach pain, a heating pad might help. If you experience severe pain, persistent vomiting, bloody stool, or symptoms that don't improve, please seek medical attention.",
  'diarrhea': "For diarrhea, stay well-hydrated with water, clear broths, and electrolyte solutions. Avoid dairy, fatty, and high-fiber foods temporarily. If diarrhea persists more than 2 days, contains blood, or is accompanied by severe pain or high fever, please consult a healthcare professional.",
  'constipation': "For constipation, increase fiber intake gradually, stay hydrated, exercise regularly, and establish a regular bathroom routine. If constipation persists, is accompanied by severe pain, or represents a change in your normal patterns, please consult with a healthcare provider.",
  'back pain': "For back pain, try gentle stretching, applying ice for the first 48-72 hours followed by heat, maintaining good posture, and taking over-the-counter pain relievers if appropriate. If pain is severe, radiates down your legs, or is accompanied by numbness or weakness, please consult a healthcare professional.",

  // Lifestyle and wellness
  'exercise': "Regular exercise is beneficial for overall health. Aim for at least 150 minutes of moderate activity or 75 minutes of vigorous activity weekly, plus muscle-strengthening activities twice weekly. Start slowly if you're new to exercise and consult with a healthcare provider before beginning a new exercise program if you have health concerns.",
  'sleep': "For better sleep, maintain a regular sleep schedule, create a restful environment, limit screen time before bed, avoid caffeine and large meals before sleeping, and manage stress. Adults typically need 7-9 hours of sleep per night. If you have persistent sleep problems, consider consulting a healthcare provider.",
  'stress': "To manage stress, try deep breathing exercises, meditation, physical activity, maintaining social connections, and getting adequate sleep. Consider limiting news consumption and practicing mindfulness. If stress becomes overwhelming or interferes with daily activities, please consider speaking with a mental health professional.",
  'nutrition': "A balanced diet typically includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Limit processed foods, added sugars, and excessive salt. Stay hydrated by drinking plenty of water. For personalized nutrition advice, consider consulting with a registered dietitian.",
  'water': "Staying hydrated is important for overall health. While individual needs vary, a general guideline is about 8 cups (64 ounces) of fluid daily for most adults. Your needs may increase with exercise, hot weather, or certain health conditions. Water is usually the best choice for hydration.",
  'vitamin': "Vitamins and minerals are essential nutrients that support various bodily functions. Most people can get adequate vitamins through a balanced diet. If you're considering supplements, it's best to consult with a healthcare provider first, as some supplements can interact with medications or have side effects.",
  'weight': "Healthy weight management typically involves a balanced diet, regular physical activity, adequate sleep, and stress management. Crash diets are generally not recommended. For personalized advice on weight management, consider consulting with a healthcare provider or registered dietitian.",

  // Default response
  'default': "I understand you have a health question. While I can provide general information, it's important to consult with a healthcare professional for personalized advice. For general wellness, remember to stay hydrated, get adequate rest, eat a balanced diet, and engage in regular physical activity as appropriate for your condition."
};

if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy-key-for-development') {
  console.warn('GEMINI_API_KEY is not properly defined in environment variables. Using fallback responses for development.');
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected an array of messages.' },
        { status: 400 }
      );
    }

    // Get the last user message to check for fallback responses
    const lastUserMessage = [...messages].reverse().find(msg => msg.role === 'user');
    const userQuery = lastUserMessage?.content?.toLowerCase().trim() || '';

    // Check if we should use fallback responses (API key not set or in development mode)
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'dummy-key-for-development') {
      console.log('Using fallback response for query:', userQuery);

      // Find the appropriate fallback response
      let fallbackResponse = FALLBACK_RESPONSES.default;
      let bestMatchLength = 0;

      // First, check for exact matches with greetings and simple questions
      if (FALLBACK_RESPONSES[userQuery]) {
        return NextResponse.json({ response: FALLBACK_RESPONSES[userQuery] });
      }

      // Check for phrases that contain the user's query (for multi-word queries)
      if (userQuery.split(' ').length > 1) {
        for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
          if (keyword !== 'default' && userQuery.includes(keyword) && keyword.length > bestMatchLength) {
            fallbackResponse = response;
            bestMatchLength = keyword.length;
          }
        }
      }

      // If no multi-word match found, check if any keywords from our fallback responses are in the user query
      if (bestMatchLength === 0) {
        for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
          if (keyword !== 'default' && userQuery.includes(keyword) && keyword.length > bestMatchLength) {
            fallbackResponse = response;
            bestMatchLength = keyword.length;
          }
        }
      }

      // Special case for greetings that might not be exact matches
      if (bestMatchLength === 0) {
        const greetings = ['hi', 'hello', 'hey', 'greetings'];
        for (const greeting of greetings) {
          if (userQuery.includes(greeting)) {
            return NextResponse.json({ response: FALLBACK_RESPONSES['hello'] });
          }
        }

        // Check for introduction questions
        if (userQuery.includes('who') && (userQuery.includes('you') || userQuery.includes('are'))) {
          return NextResponse.json({ response: FALLBACK_RESPONSES['who are you'] });
        }

        if (userQuery.includes('what') && userQuery.includes('do')) {
          return NextResponse.json({ response: FALLBACK_RESPONSES['what can you do'] });
        }
      }

      return NextResponse.json({ response: fallbackResponse });
    }

    // Check for simple greetings first - even with API key, we want to handle these directly
    // This ensures quick responses for common greetings
    if (userQuery === 'hi' || userQuery === 'hello' || userQuery === 'hey' || userQuery === 'yo') {
      return NextResponse.json({ response: FALLBACK_RESPONSES['hello'] });
    }

    if (userQuery === 'who are you' || (userQuery.includes('who') && userQuery.includes('you'))) {
      return NextResponse.json({ response: FALLBACK_RESPONSES['who are you'] });
    }

    if (userQuery === 'what can you do' || (userQuery.includes('what') && userQuery.includes('do'))) {
      return NextResponse.json({ response: FALLBACK_RESPONSES['what can you do'] });
    }

    // Format messages for Gemini API
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add system prompt for health context 
    const systemPrompt = {
      role: 'model',
      parts: [{
        text: `You are a helpful healthcare assistant for the TeleHealth platform.
        Provide accurate, helpful information about general health topics, but always clarify
        that you're not a doctor and your advice should not replace professional medical consultation.
        For serious health concerns, always recommend consulting with a healthcare professional.
        Focus on providing evidence-based information about health topics, symptoms, general wellness,
        and preventive care. Do not diagnose conditions or prescribe treatments.
        Keep your responses concise and to the point.`
      }]
    };

    // Prepare the request to Gemini API
    const geminiRequest = {
      contents: [systemPrompt, ...formattedMessages],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    try {
      // Make request to Gemini API
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geminiRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', errorData);
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      // Extract the response text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

      return NextResponse.json({ response: responseText });
    } catch (apiError) {
      console.error('Error calling Gemini API:', apiError);

      // Fallback to our predefined responses
      let fallbackResponse = FALLBACK_RESPONSES.default;
      let bestMatchLength = 0;

      // First, check for exact matches with greetings and simple questions
      if (FALLBACK_RESPONSES[userQuery]) {
        return NextResponse.json({ response: FALLBACK_RESPONSES[userQuery] });
      }

      // Check for phrases that contain the user's query (for multi-word queries)
      if (userQuery.split(' ').length > 1) {
        for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
          if (keyword !== 'default' && userQuery.includes(keyword) && keyword.length > bestMatchLength) {
            fallbackResponse = response;
            bestMatchLength = keyword.length;
          }
        }
      }

      // If no multi-word match found, check if any keywords from our fallback responses are in the user query
      if (bestMatchLength === 0) {
        for (const [keyword, response] of Object.entries(FALLBACK_RESPONSES)) {
          if (keyword !== 'default' && userQuery.includes(keyword) && keyword.length > bestMatchLength) {
            fallbackResponse = response;
            bestMatchLength = keyword.length;
          }
        }
      }

      // Special case for greetings that might not be exact matches
      if (bestMatchLength === 0) {
        const greetings = ['hi', 'hello', 'hey', 'greetings'];
        for (const greeting of greetings) {
          if (userQuery.includes(greeting)) {
            return NextResponse.json({ response: FALLBACK_RESPONSES['hello'] });
          }
        }

        // Check for introduction questions
        if (userQuery.includes('who') && (userQuery.includes('you') || userQuery.includes('are'))) {
          return NextResponse.json({ response: FALLBACK_RESPONSES['who are you'] });
        }

        if (userQuery.includes('what') && userQuery.includes('do')) {
          return NextResponse.json({ response: FALLBACK_RESPONSES['what can you do'] });
        }
      }

      return NextResponse.json({ response: fallbackResponse });
    }
  } catch (error) {
    console.error('Error in chat API route:', error);
    return NextResponse.json(
      { response: "I'm sorry, I encountered an error processing your request. Please try again with a different question." },
      { status: 200 } // Return 200 to handle the error gracefully on the client
    );
  }
}
