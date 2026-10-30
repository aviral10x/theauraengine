import * as z from "zod/v4";

/** Output of the scan step: Brand DNA + Story DNA + compliance + format ranking + concepts. */
export const BrandScanSchema = z.object({
  brand: z.object({
    name: z.string(),
    oneLiner: z.string().describe("What the company does in one plain sentence"),
    category: z.string(),
    audience: z.string().describe("Who buys / uses it, in one or two sentences"),
    voice: z.array(z.string()).describe("3-5 adjectives describing the brand voice"),
    palette: z.array(z.string()).describe("3-5 hex colors that fit the brand"),
    products: z.array(z.object({ name: z.string(), description: z.string(), imageUrl: z.string().nullable() })),
    proofPoints: z.array(z.string()).describe("Facts on the site that build trust (numbers, press, customers)"),
  }),
  story: z.object({
    tensions: z.array(z.string()).describe("Emotional tensions / frustrations the audience feels"),
    desires: z.array(z.string()).describe("What the audience secretly wants"),
    villains: z.array(z.string()).describe("The 'bad guy' in the story: the problem, the old way, the competitor archetype"),
    worlds: z.array(z.string()).describe("Settings where this product naturally lives"),
    characterIdeas: z.array(
      z.object({ name: z.string(), archetype: z.string(), description: z.string().describe("Look + personality, vivid") }),
    ),
    hooks: z.array(z.string()).describe("Scroll-stopping first lines / first frames for short-form video"),
  }),
  compliance: z.object({
    flags: z.array(z.string()).describe("Regulated aspects: financial, health, kids, alcohol, real estate, etc."),
    avoidClaims: z.array(z.string()).describe("Claims the videos must NOT make"),
    disclosure: z.string().describe("Suggested AI/sponsorship disclosure line for captions"),
  }),
  formatRanking: z.array(
    z.object({ formatId: z.string(), score: z.number().describe("0-100 fit score"), why: z.string() }),
  ),
  concepts: z.array(
    z.object({
      title: z.string(),
      formatId: z.string(),
      logline: z.string(),
      hook: z.string().describe("The opening 2 seconds of episode 1"),
      mainCharacter: z.string(),
      productRole: z.string().describe("How the product appears as part of the story"),
      episodeIdeas: z.array(z.string()),
      whyItWorks: z.string(),
    }),
  ),
});
export type BrandScan = z.infer<typeof BrandScanSchema>;

/** Series bible + episode outlines. */
export const SeriesSchema = z.object({
  title: z.string(),
  logline: z.string(),
  tone: z.string(),
  visualStyle: z.string().describe("A reusable style prompt appended to every image/video prompt"),
  setting: z.string(),
  productIntegration: z.string().describe("Rules for how the product appears"),
  characters: z.array(
    z.object({
      key: z.string().describe("short slug, e.g. 'aura' or 'maya'"),
      name: z.string(),
      role: z.string(),
      visualDescription: z
        .string()
        .describe("Precise, reusable visual description for image generation: age, build, face, hair, outfit, colors"),
      personality: z.string(),
    }),
  ),
  episodes: z.array(
    z.object({
      number: z.number(),
      title: z.string(),
      hook: z.string(),
      synopsis: z.string(),
      cliffhanger: z.string().describe("Ending beat / loop moment"),
    }),
  ),
});
export type SeriesBible = z.infer<typeof SeriesSchema>;

/** A fully written episode, broken into generation-ready shots. */
export const EpisodeScriptSchema = z.object({
  caption: z.string().describe("Instagram/TikTok caption, native tone, ends with the disclosure"),
  hashtags: z.array(z.string()),
  shots: z.array(
    z.object({
      duration: z.number().describe("Seconds, integer between 3 and 15"),
      shotType: z.string().describe("e.g. close-up, wide, over-the-shoulder, insert"),
      description: z.string().describe("What happens, for the human reviewer"),
      characters: z.array(z.string()).describe("Character keys visible in the shot"),
      imagePrompt: z
        .string()
        .describe("Still-frame prompt for the FIRST frame: composition, characters (by visual description), setting, lighting"),
      motionPrompt: z.string().describe("Camera + action over the shot duration, for image-to-video"),
      dialogue: z.string().nullable().describe("Spoken line(s) with speaker name, or null"),
      onScreenText: z.string().nullable(),
    }),
  ),
});
export type EpisodeScript = z.infer<typeof EpisodeScriptSchema>;

export type CharacterRef = SeriesBible["characters"][number] & {
  imageUrl?: string | null; // display
  imageInput?: string | null; // public URL for model input
  status?: "none" | "pending" | "done" | "failed" | "demo";
};
