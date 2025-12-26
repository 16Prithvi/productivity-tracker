import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "GENERATE_DAILY_PLAN") {
      systemPrompt = `You are a productivity planning AI assistant. You help users plan their study and work day efficiently.
      
RULES:
- Always return ONLY valid JSON, no markdown, no explanations
- Create realistic time blocks based on the user's available hours
- Respect busy/unavailable time slots
- Balance different categories (DSA, Development, Cloud, Core)
- Each task should have clear start and end times in 24h format (HH:MM)
- Avoid overlapping tasks
- Include short breaks between long sessions
- Categories must be one of: DSA, Development, Cloud, Core, Other

Return a JSON object with this exact structure:
{
  "schedule": [
    {
      "title": "Task name",
      "start": "HH:MM",
      "end": "HH:MM",
      "category": "DSA|Development|Cloud|Core|Other",
      "priority": "low|medium|high",
      "notes": "Brief description"
    }
  ],
  "summary": "One sentence summary of the day's plan"
}`;

      const { userInput, todayDate, existingTasks, preferences, availableFrom, unavailableSlots } = payload;
      
      userPrompt = `Plan my day for ${todayDate}.

User request: ${userInput}

Available from: ${availableFrom || "09:00"}
Unavailable time slots: ${unavailableSlots ? JSON.stringify(unavailableSlots) : "None specified"}

Existing tasks today: ${existingTasks?.length > 0 ? JSON.stringify(existingTasks) : "No existing tasks"}

User preferences:
- Focus duration: ${preferences?.focusDuration || 25} minutes
- Break duration: ${preferences?.breakDuration || 5} minutes

Generate a realistic daily plan based on the user's request. Make sure to create focused study blocks with appropriate breaks.`;

    } else if (action === "DAILY_SUMMARY") {
      systemPrompt = `You are a productivity AI that generates encouraging daily summaries.

RULES:
- Return ONLY valid JSON
- Be encouraging but realistic
- Highlight achievements
- Suggest improvements subtly

Return JSON:
{
  "summary": "Brief encouraging summary of the day",
  "topicsLearned": ["topic1", "topic2"],
  "improvement": "One gentle suggestion for tomorrow",
  "streak": number
}`;

      const { completedTasks, focusSessions, skippedTasks, currentStreak } = payload;
      
      userPrompt = `Generate a daily summary for today.

Completed tasks: ${JSON.stringify(completedTasks || [])}
Focus sessions: ${focusSessions?.length || 0} sessions, total ${focusSessions?.reduce((a: number, s: any) => a + (s.duration_minutes || 0), 0) || 0} minutes
Skipped tasks: ${JSON.stringify(skippedTasks || [])}
Current streak: ${currentStreak || 0} days`;

    } else if (action === "WEEKLY_SUMMARY") {
      systemPrompt = `You are a productivity AI that generates weekly insights.

RULES:
- Return ONLY valid JSON
- Provide actionable insights
- Be encouraging

Return JSON:
{
  "totalFocusHours": number,
  "tasksPlanned": number,
  "tasksCompleted": number,
  "mostProductiveDay": "Monday|Tuesday|etc",
  "suggestion": "One actionable suggestion for next week"
}`;

      const { dailyReviews, weeklyTasks, focusSessions } = payload;
      
      userPrompt = `Generate a weekly summary.

Daily reviews: ${JSON.stringify(dailyReviews || [])}
Weekly tasks: ${JSON.stringify(weeklyTasks || [])}
Focus sessions: ${JSON.stringify(focusSessions || [])}`;

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Processing ${action} request`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response, handling potential markdown code blocks
    let parsedContent;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    console.log(`${action} completed successfully`);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("AI plan error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
