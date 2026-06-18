const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface GrowthTips {
  studentTips: string[];
  teacherTips: string[];
}

export async function generateStudentGrowthTips(
  studentName: string,
  subjects: { name: string; score: number }[],
  attendanceRate: number
): Promise<GrowthTips> {
  const defaultTips: GrowthTips = {
    studentTips: [
      "Review current subject materials daily for 15-20 minutes to reinforce learning.",
      "Attend peer study groups or teacher assistance hours for challenging topics.",
      "Maintain a consistent study schedule and minimize distractions during homework."
    ],
    teacherTips: [
      "Recommend targeted practice problems on core concepts the student is struggling with.",
      "Check in with the student during class to assess understanding and offer direct guidance."
    ]
  };

  if (!GEMINI_API_KEY) {
    return defaultTips;
  }

  const prompt = `
    You are an expert academic growth coach. Analyze this student's data:
    Student: ${studentName}
    Attendance: ${attendanceRate}%
    Subjects & Grades: ${JSON.stringify(subjects)}

    Generate growth recommendations:
    1. For the student: 3 specific, actionable, encouraging study tips to help them grow and improve.
    2. For the teacher: 2 pedagogical strategies or intervention ideas to support this student's progress.

    Return the response ONLY as a JSON object with this exact structure:
    {
      "studentTips": ["tip 1", "tip 2", "tip 3"],
      "teacherTips": ["strategy 1", "strategy 2"]
    }
    Do not output any introductory text, markdown formatting, or code block delimiters. Output raw JSON only.
  `;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      console.warn("Gemini API call failed with status:", res.status);
      return defaultTips;
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    // Clean up markdown code block delimiters if the model output them
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(text);
    if (Array.isArray(parsed.studentTips) && Array.isArray(parsed.teacherTips)) {
      return {
        studentTips: parsed.studentTips,
        teacherTips: parsed.teacherTips
      };
    }
    return defaultTips;
  } catch (err) {
    console.error("Error generating growth tips via Gemini API:", err);
    return defaultTips;
  }
}

export async function generateAIChatResponse(
  message: string,
  chatHistory: { role: string; content: string }[],
  userRole: string
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "I'm sorry, the AI Assistant is currently unavailable. Please check your API key.";
  }

  // Convert history to Gemini format if needed, but for simplicity we can just format it as a text block
  const historyText = chatHistory
    .map(msg => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`)
    .join("\n");

  const prompt = `
    You are an AI Smart Coach for the ACADEX educational platform.
    You are currently talking to a user with the role of: ${userRole}.
    Be helpful, concise, and encouraging. Answer their questions related to education, their portal, or general academic advice.

    Chat History:
    ${historyText}
    
    User: ${message}
    AI:
  `;

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!res.ok) {
      console.warn("Gemini API call failed with status:", res.status);
      return "I encountered an error connecting to the server. Please try again later.";
    }

    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    
    return text.trim() || "I'm not sure how to respond to that.";
  } catch (err) {
    console.error("Error generating AI chat response:", err);
    return "An unexpected error occurred. Please try again.";
  }
}
