/** Public pricing (shared by the landing page and Stripe checkout). */
export type Plan = {
  id: "creator" | "brand";
  name: string;
  priceMonthly: number;
  credits: number;
  blurb: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "creator",
    name: "Creator",
    priceMonthly: 39,
    credits: 400,
    blurb: "For creators and founders building a character or a series.",
    features: ["400 credits / month (≈ 3–4 short episodes)", "All formats", "Character lock + storyboards", "Kling 3.0 Turbo & Standard renders", "Commercial use"],
  },
  {
    id: "brand",
    name: "Brand",
    priceMonthly: 199,
    credits: 2200,
    blurb: "For brands running a season of content every month.",
    features: ["2,200 credits / month", "Micro-drama seasons up to 12 episodes", "Pro renders", "Priority queue", "Aura Network distribution requests", "One-click handoff to InkFrame studio"],
  },
];

export const TOPUPS = [
  { id: "topup-300", credits: 300, price: 35 },
  { id: "topup-1200", credits: 1200, price: 119 },
];
