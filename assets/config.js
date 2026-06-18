/* ============================================================
   DEFAULT_CONFIG — the editable content of the workshop.
   Marc edits this in the browser (index.html) and can Export
   an updated config.json, or hand-edit this file directly.
   Each activity: { id, type, title, prompt, config }
   Supported types live in app.js:
     spectrum · tally · sort · poll · rating · shorttext ·
     reflection · wordcloud · ranking · likert · quiz ·
     dotvote · emoji
   ============================================================ */
window.DEFAULT_CONFIG = {
  meta: {
    title: "AI Literacy for Faculty",
    subtitle: "Analog Learning — interactive workshop activities",
    presenter: "Marc Watkins",
    org: "AI Institute, University of Mississippi"
  },
  activities: [
    {
      id: "where-we-stand",
      type: "spectrum",
      title: "Where We Stand",
      prompt: "Position yourself on the spectrum below. There are no wrong answers — this is a snapshot of the room.",
      config: { leftLabel: "Skeptical", rightLabel: "Experimenting", midLabel: "Curious", min: 0, max: 100, start: 50 }
    },
    {
      id: "pulse-check",
      type: "emoji",
      title: "Pulse Check",
      prompt: "How are you feeling about AI in your teaching right now?",
      config: { options: [
        { emoji: "😀", label: "Energized" },
        { emoji: "🤔", label: "Curious" },
        { emoji: "😵‍💫", label: "Overwhelmed" },
        { emoji: "😟", label: "Worried" },
        { emoji: "😴", label: "Tired of it" }
      ] }
    },
    {
      id: "one-word",
      type: "wordcloud",
      title: "One Word for AI",
      prompt: "In a word or two, how would you describe AI's role in your classroom? Add up to three.",
      config: { maxWords: 3, placeholder: "e.g. shortcut, partner, threat…" }
    },
    {
      id: "in-the-room",
      type: "tally",
      title: "What's Already in the Room",
      prompt: "Tap + for every analog teaching strategy you already use. Notice how much is already here.",
      config: { items: [
        { label: "In-class writing", count: 0 },
        { label: "Oral exams / defenses", count: 0 },
        { label: "Structured discussion", count: 0 },
        { label: "Hand-written notes", count: 0 },
        { label: "Semester portfolios", count: 0 }
      ], allowAdd: true }
    },
    {
      id: "ai-myth",
      type: "quiz",
      title: "AI Myth Check",
      prompt: "How reliable are today's “AI detector” tools at proving a student used AI?",
      config: {
        options: ["Reliable enough to grade on", "Helpful, but not reliable on their own", "Not reliable evidence of misconduct"],
        correct: 2,
        explanation: "AI-text detectors produce both false positives and false negatives — they can flag a student's own writing and miss AI-generated text. Most institutions advise against using them as sole evidence in academic-integrity cases."
      }
    },
    {
      id: "where-you-lean",
      type: "likert",
      title: "Where Do You Lean?",
      prompt: "Rate how much you agree with each statement.",
      config: {
        statements: [
          "Students should be allowed to use AI for brainstorming.",
          "AI use should be disclosed in submitted work.",
          "I feel prepared to redesign my assignments for the AI era."
        ],
        scale: 5, lowLabel: "Disagree", highLabel: "Agree"
      }
    },
    {
      id: "sort-course",
      type: "sort",
      title: "Protect · Open · Depends",
      prompt: "Drag each course component into the bucket that fits your teaching. Move freely — your call may differ by course.",
      config: {
        categories: [
          { id: "protect", label: "Protect", hint: "Keep analog", color: "#16a89a" },
          { id: "open", label: "Open", hint: "AI-appropriate", color: "#2d6fb0" },
          { id: "depends", label: "Depends", hint: "Debatable", color: "#e3a92c" }
        ],
        items: ["First-draft writing", "Brainstorming", "Literature search", "Final exam", "Peer feedback", "Coding boilerplate", "Reflection journals", "Data cleaning"]
      }
    },
    {
      id: "priorities",
      type: "ranking",
      title: "Priorities for the Term",
      prompt: "Put these in the order that matters most for your courses this term.",
      config: { options: ["Protecting core skills", "Teaching AI literacy", "Redesigning assessments", "Supporting equity & access"] }
    },
    {
      id: "invest",
      type: "dotvote",
      title: "Where Should We Invest?",
      prompt: "You have 5 dots. Spend them on what would help you most.",
      config: { options: ["Faculty development", "Clear AI policies", "New assignment designs", "Student AI literacy", "Detection tools"], dots: 5 }
    },
    {
      id: "quick-poll",
      type: "poll",
      title: "Biggest Worry About AI in Your Course",
      prompt: "Pick the one that weighs on you most right now.",
      config: { multi: false, options: ["Students skipping the thinking", "Knowing what's authentic work", "Keeping up with the tools", "Equity & access", "It changes too fast"] }
    },
    {
      id: "confidence",
      type: "rating",
      title: "Confidence Check",
      prompt: "How confident do you feel designing an AI-aware assignment today?",
      config: { scale: 5, lowLabel: "Not yet", highLabel: "Very confident", icon: "star" }
    },
    {
      id: "one-question",
      type: "shorttext",
      title: "One Question You're Holding",
      prompt: "In a sentence: what question about AI and teaching are you still sitting with?",
      config: { placeholder: "Type your question…", maxLength: 240 }
    },
    {
      id: "reflection",
      type: "reflection",
      title: "Take-Home Reflection",
      prompt: "Three commitments to carry out of the workshop.",
      config: { prompts: [
        "One part of my course I'll protect",
        "One analog practice I'll try this term",
        "One question I'm still holding"
      ] }
    }
  ]
};
