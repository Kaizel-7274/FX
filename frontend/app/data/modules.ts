export type ModuleDetail = {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
};

export const moduleDetails: Record<string, ModuleDetail> = {
  Classes: {
    eyebrow: "LEARN TOGETHER",
    title: "Your next lesson starts here.",
    description: "Join structured live and recorded classes, build practical skills, and keep track of your learning progress.",
    features: ["Live and recorded sessions", "Beginner to advanced learning paths", "Class schedules and progress tracking"],
  },
  Courses: {
    eyebrow: "LEARN AT YOUR PACE",
    title: "Build your trading foundation.",
    description: "Explore a step-by-step curriculum covering market structure, risk management, trading psychology, and more.",
    features: ["Structured lessons and quizzes", "Progress saved as you learn", "Practical exercises and learning resources"],
  },
  Markets: {
    eyebrow: "MARKET WATCH",
    title: "A clearer view of the markets.",
    description: "Follow a sample watchlist and explore market information. Prices shown in this preview are illustrative, not live data.",
    features: ["Forex pairs, gold, indices, and crypto", "Watchlists and charting tools", "Market data subject to provider availability"],
  },
  "Trading journal": {
    eyebrow: "REFLECT & IMPROVE",
    title: "Make every trade a lesson.",
    description: "Keep a private record of your trading decisions and review your process over time.",
    features: ["Record entries, exits, and risk", "Add notes and strategy tags", "Review performance patterns"],
  },
  "Trading tools": {
    eyebrow: "PRACTICAL TOOLS",
    title: "Plan your practice with intention.",
    description: "Use educational calculators to explore position sizing, pip values, risk/reward, and trading sessions.",
    features: ["Lot size and position size calculators", "Pip, profit, and margin calculators", "Risk/reward planning tools"],
  },
  Bots: {
    eyebrow: "AUTOMATION LAB",
    title: "Explore automation—safely.",
    description: "A dedicated environment for learning about strategies, backtesting, and demo trading before any live-money functionality.",
    features: ["Strategy exploration and backtesting", "Demo trading before live functionality", "Clear risk controls and performance context"],
  },
  Community: {
    eyebrow: "LEARN WITH OTHERS",
    title: "Good questions move us forward.",
    description: "Connect with other learners, share educational ideas, and work through challenges as a community.",
    features: ["Educational discussions and groups", "Learning challenges and achievements", "A respectful, supportive environment"],
  },
};
