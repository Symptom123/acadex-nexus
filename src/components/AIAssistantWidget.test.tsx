import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AIAssistantWidget from "./AIAssistantWidget";
import * as geminiService from "@/lib/gemini";

// Mock the gemini API call
vi.mock("@/lib/gemini", () => ({
  generateAIChatResponse: vi.fn(),
}));

describe("AIAssistantWidget Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the floating button initially", () => {
    render(<AIAssistantWidget role="Student" />);
    // The Bot icon button should be in the document
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("opens the chat panel when clicked and displays initial message", async () => {
    render(<AIAssistantWidget role="Teacher" />);
    
    // Open chat
    const button = screen.getByRole("button");
    fireEvent.click(button);

    // Initial greeting should contain the role
    expect(await screen.findByText(/I'm here to help you as a Teacher/i)).toBeInTheDocument();
    
    // Quick suggestions should be visible for Teacher
    expect(screen.getByText(/Strategies for struggling students/i)).toBeInTheDocument();
  });

  it("sends a message and displays AI response", async () => {
    // Mock successful AI response
    (geminiService.generateAIChatResponse as any).mockResolvedValue("This is a mocked AI response.");

    render(<AIAssistantWidget role="Student" />);
    
    // Open chat
    fireEvent.click(screen.getByRole("button"));

    // Find input and send button
    const input = await screen.findByPlaceholderText(/Ask your AI Coach/i);
    const sendButtons = screen.getAllByRole("button");
    // The last button is usually the send button in our UI layout
    const sendButton = sendButtons[sendButtons.length - 1];

    // Type and send
    fireEvent.change(input, { target: { value: "Hello AI" } });
    fireEvent.click(sendButton);

    // User message should appear
    expect(screen.getByText("Hello AI")).toBeInTheDocument();

    // Wait for AI response to appear
    await waitFor(() => {
      expect(screen.getByText("This is a mocked AI response.")).toBeInTheDocument();
    });

    // Ensure generateAIChatResponse was called with correct arguments
    expect(geminiService.generateAIChatResponse).toHaveBeenCalledWith(
      "Hello AI",
      expect.any(Array),
      "Student"
    );
  });
});
