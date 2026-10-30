/**
 * The Aura Format Library: the short-form formats InkFrame / AuraKidzzz have proven organically.
 * These specs are fed to Claude so every script follows a format that has actually worked,
 * and they power the format picker in the product + the landing page.
 */
export type FormatSpec = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bestFor: string[];
  episodeSeconds: [number, number];
  defaultEpisodes: number;
  aspect: "9:16" | "16:9";
  shotsPerEpisode: [number, number];
  structure: string[];
  rules: string[];
  visualStyle: string;
  proof?: { label: string; href: string };
  preview?: { video: string; poster: string };
};

const IF = "https://www.inkframefilms.com";

export const FORMATS: FormatSpec[] = [
  {
    id: "character-chaos",
    name: "Character Chaos",
    tagline: "One character. One small disaster. Fifteen seconds.",
    description:
      "The AuraKidzzz format. A lovable, consistent character causes tiny, relatable chaos in every episode. Built for daily posting and fast follower growth. Your product shows up as the prop, the snack, or the cause of the chaos.",
    bestFor: ["Consumer brands", "Baby, kids & family", "Food & pets", "Apps that need a mascot"],
    episodeSeconds: [10, 20],
    defaultEpisodes: 6,
    aspect: "9:16",
    shotsPerEpisode: [2, 3],
    structure: [
      "0–2s: visual hook. The character mid-action, already in trouble or about to be",
      "2–10s: escalation. One clear comedic beat, readable with the sound off",
      "10–15s: payoff / reaction face. End on a loopable moment",
    ],
    rules: [
      "No dialogue or a single word. Communicate through expression, physical comedy and sound design",
      "The character's look must be identical in every shot (same outfit, proportions, colors)",
      "Domestic, familiar settings: kitchen, living room, park, mall",
      "The product is a natural object in the scene, never a hard sell",
      "Every episode title is a 2–3 word noun phrase (e.g. 'The Frozen Spoon')",
    ],
    visualStyle:
      "Premium 3D animated feature-film look, soft global illumination, warm color palette, expressive oversized eyes, shallow depth of field, vertical 9:16 framing",
    proof: { label: "0 → 413K followers & 450M views in 75 days", href: `${IF}/aurakidzzz` },
    preview: { video: `${IF}/aura/frozen-spoon-loop.mp4`, poster: `${IF}/aura/frozen-spoon.jpg` },
  },
  {
    id: "micro-drama",
    name: "Micro-Drama Season",
    tagline: "Serialized cliffhangers with your product as the plot device.",
    description:
      "Vertical 60–90s episodes with a hook, a turn, and a cliffhanger. The format behind ReelShort-style bingeing, written so your brand is a character in the story, not an interruption. Ideal for micro-drama page networks and distribution campaigns.",
    bestFor: ["Fintech & crypto", "Apps & SaaS", "Fashion & beauty", "Brands that need distribution"],
    episodeSeconds: [45, 90],
    defaultEpisodes: 5,
    aspect: "9:16",
    shotsPerEpisode: [5, 8],
    structure: [
      "0–3s: cold open on the most dramatic moment (betrayal, reveal, slap, secret)",
      "3–40s: rising conflict between 2–3 recurring characters",
      "Midpoint turn: the brand/product changes the power dynamic",
      "Final 5s: cliffhanger line + freeze. The next episode resolves it in its first second",
    ],
    rules: [
      "Proven tropes: secret identity, revenge, rags-to-riches, forbidden romance, workplace power games",
      "Short punchy dialogue lines (max ~12 words per line)",
      "Same cast and wardrobe across episodes",
      "Product must be a plot device (the thing that saves, exposes or empowers), never a pitch",
      "Each episode can stand alone for someone who missed the previous one",
    ],
    visualStyle:
      "Cinematic photoreal drama, moody practical lighting, shallow depth of field, close-ups on faces, glossy vertical 9:16 streaming-drama aesthetic",
    proof: { label: "Micro-drama page networks run for Watch Fund", href: `${IF}/film/alphas-deal` },
    preview: { video: `${IF}/previews/alphas-deal.mp4`, poster: `${IF}/previews/alphas-deal.jpg` },
  },
  {
    id: "animated-spot",
    name: "Animated Brand Spot",
    tagline: "A Pixar-grade mini story that ends on your product.",
    description:
      "A single 20–40s animated story with heart. This is the format of the Drools × Aura spot: a character wants something, the product makes it happen, and the audience smiles. Great as a launch asset and paid-media hero.",
    bestFor: ["Pet & food brands", "Consumer launches", "Seasonal campaigns", "Collabs with Aura characters"],
    episodeSeconds: [20, 40],
    defaultEpisodes: 3,
    aspect: "9:16",
    shotsPerEpisode: [3, 5],
    structure: [
      "Setup: character + want, established in 3 seconds",
      "Obstacle: a playful problem",
      "Product moment: the product solves it in a charming way",
      "Button: a final gag or reaction, logo / end card",
    ],
    rules: [
      "Warm, family-safe humor",
      "Product appears accurately (shape, color, packaging) and is hero-lit in the product moment",
      "Minimal or no dialogue; a single VO line at the end is OK",
    ],
    visualStyle:
      "High-end 3D animated commercial, Pixar-inspired characters, cozy lighting, saturated but soft colors, vertical 9:16",
    proof: { label: "Drools × Aura animated brand spot", href: `${IF}/film/drools` },
    preview: { video: `${IF}/previews/drools.mp4`, poster: `${IF}/previews/drools.jpg` },
  },
  {
    id: "launch-film",
    name: "Cinematic Launch Film",
    tagline: "Premium, wordless, world-building. The InkFrame look.",
    description:
      "A 30–60s cinematic film that builds a world around the brand: light, place, faces, mood. For launches, automotive, luxury and real estate (property films). Usually the first step before handing it to the InkFrame studio.",
    bestFor: ["Real estate & property", "Luxury & automotive", "Product launches", "Fundraise / pitch films"],
    episodeSeconds: [30, 60],
    defaultEpisodes: 2,
    aspect: "16:9",
    shotsPerEpisode: [4, 7],
    structure: [
      "Opening image: a striking establishing shot that sets the mood",
      "Build: sensory details, textures, slow camera moves",
      "Reveal: the product / property / hero shot",
      "Close: a single line of on-screen text + brand mark",
    ],
    rules: [
      "Mostly wordless; on-screen text only, max 8 words per card",
      "Slow, deliberate camera: dolly, crane, orbit. No shaky cam",
      "Strong golden-hour or blue-hour lighting",
    ],
    visualStyle:
      "Anamorphic cinematic photorealism, golden hour light, rich contrast, film grain, luxury commercial grade, 16:9",
    proof: { label: "The Residence: Dubai property film", href: `${IF}/film/the-residence` },
    preview: { video: `${IF}/previews/the-residence.mp4`, poster: `${IF}/previews/the-residence.jpg` },
  },
  {
    id: "explainer-skit",
    name: "Explainer Skit",
    tagline: "Make the complicated thing obvious and funny.",
    description:
      "For SaaS, fintech, crypto and AI products: a recurring duo acts out the problem and the 'aha' in a 30–45s skit. It makes abstract products concrete without a talking-head pitch.",
    bestFor: ["SaaS & AI tools", "Crypto & web3", "Fintech", "B2B with a consumer angle"],
    episodeSeconds: [25, 45],
    defaultEpisodes: 4,
    aspect: "9:16",
    shotsPerEpisode: [3, 5],
    structure: [
      "Hook: the painful 'before' moment everyone recognises",
      "Escalation: the old way failing comically",
      "Aha: one character shows the product's core mechanic visually",
      "Payoff: the transformed 'after' + simple CTA line",
    ],
    rules: [
      "One idea per episode. Never list features",
      "Show the mechanic visually (UI on a phone/screen, a metaphor object)",
      "No financial promises or return claims; keep claims factual and compliant",
    ],
    visualStyle:
      "Bright stylized 3D or clean photoreal sitcom look, crisp lighting, readable phone screens, vertical 9:16",
  },
  {
    id: "trend-remix",
    name: "Trend Remix",
    tagline: "Ride what's working this week, in your brand's world.",
    description:
      "Takes a currently viral structure (POV, 'tell me without telling me', transformations, 'day in the life') and rebuilds it with your characters and product. Fast, cheap, and a great testing ground for hooks.",
    bestFor: ["Everyone testing hooks", "Creators", "Launch weeks"],
    episodeSeconds: [8, 20],
    defaultEpisodes: 6,
    aspect: "9:16",
    shotsPerEpisode: [1, 3],
    structure: ["Instantly recognisable trend opener", "Brand twist", "Loopable ending"],
    rules: [
      "Recreate the structure, never copy someone else's footage or audio",
      "One clear, on-screen text hook in the first frame",
    ],
    visualStyle: "Native social look matching the brand world, bold on-screen text, vertical 9:16",
  },
];

export const FORMAT_IDS = FORMATS.map((f) => f.id) as [string, ...string[]];

export function getFormat(id: string | null | undefined): FormatSpec {
  return FORMATS.find((f) => f.id === id) ?? FORMATS[0];
}

/** Compact text version of the library for prompts. */
export function formatsForPrompt(): string {
  return FORMATS.map(
    (f) =>
      `### ${f.id}: ${f.name}\n${f.description}\nBest for: ${f.bestFor.join(", ")}\nEpisode length: ${f.episodeSeconds[0]}–${f.episodeSeconds[1]}s, ${f.shotsPerEpisode[0]}–${f.shotsPerEpisode[1]} shots, aspect ${f.aspect}\nStructure:\n- ${f.structure.join("\n- ")}\nRules:\n- ${f.rules.join("\n- ")}`,
  ).join("\n\n");
}
