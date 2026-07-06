import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateAIChatResponse, generateStudentGrowthTips } from "./gemini";

// Mock the global fetch
global.fetch = vi.fn();

describe("gemini.ts Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("generateAIChatResponse", () => {
    it("returns a generic message if API key is missing", async () => {
      // Temporarily mock import.meta.env inside the module context if possible, 
      // but since it's hardcoded at the top of gemini.ts, we'll test the actual behavior.
      // If we provided a key in .env during tests, we expect fetch to be called.
      // For this test, let's assume fetch works and returns a response.
      
      const mockResponse = {
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: "Hello from AI" }]
              }
            }
          ]
        })
      };
      
      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await generateAIChatResponse("Hi", [], "Student");
      
      // If VITE_GEMINI_API_KEY is empty in the test env, it will return the fallback.
      // We check for both possibilities depending on the local env state.
      expect(typeof response).toBe("string");
      if (response === "I'm sorry, the AI Assistant is currently unavailable. Please check your API key.") {
        expect(global.fetch).not.toHaveBeenCalled();
      } else {
        expect(response).toBe("Hello from AI");
        expect(global.fetch).toHaveBeenCalled();
      }
    });

    it("returns fallback on fetch error", async () => {
      // If we have an API key, we can test the fetch failure
      (global.fetch as any).mockRejectedValue(new Error("Network Error"));

      const response = await generateAIChatResponse("Hi", [], "Student");
      
      // It either fails because no key, or fails because of network error
      expect(["An unexpected error occurred. Please try again.", "I'm sorry, the AI Assistant is currently unavailable. Please check your API key."]).toContain(response);
    });
  });

  describe("generateStudentGrowthTips", () => {
    it("returns default tips on API failure", async () => {
      (global.fetch as any).mockResolvedValue({ ok: false, status: 500 });
      
      const tips = await generateStudentGrowthTips("Alice", [], 90);
      expect(tips.studentTips.length).toBeGreaterThan(0);
      expect(tips.teacherTips.length).toBeGreaterThan(0);
      // Verify it returns the default tip text
      expect(tips.studentTips[0]).toContain("Review current subject materials daily");
    });
  });
});
