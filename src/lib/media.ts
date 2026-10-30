/** Real work from InkFrame Films / @aurakidzzz used across the marketing site. */
export const IF = "https://www.inkframefilms.com";

export type Clip = { title: string; kind: string; video: string; poster: string; line?: string };

export const AURA_EPISODES: Clip[] = [
  { title: "The Frozen Spoon", kind: "Aura · Episode", video: `${IF}/aura/frozen-spoon-loop.mp4`, poster: `${IF}/aura/frozen-spoon.jpg`, line: "Science said no. Aura licked it anyway." },
  { title: "The Night Shift", kind: "Aura · Episode", video: `${IF}/aura/night-shift-loop.mp4`, poster: `${IF}/aura/night-shift.jpg`, line: "Everyone's asleep. Aura has other plans." },
  { title: "The Lemon", kind: "Aura · Episode", video: `${IF}/aura/the-lemon-loop.mp4`, poster: `${IF}/aura/the-lemon.jpg`, line: "First lemon. Full commitment. Instant regret." },
  { title: "The Picnic", kind: "Aura · Episode", video: `${IF}/aura/the-picnic-loop.mp4`, poster: `${IF}/aura/the-picnic.jpg`, line: "A dalmatian who takes crumbs personally." },
];

export const FILMS: Clip[] = [
  { title: "Aura", kind: "Brand trailer", video: `${IF}/previews/aura-trailer.mp4`, poster: `${IF}/previews/aura-trailer.jpg` },
  { title: "Drools × Aura", kind: "Animated brand spot", video: `${IF}/previews/drools.mp4`, poster: `${IF}/previews/drools.jpg` },
  { title: "Alpha's Deal", kind: "Narrative short", video: `${IF}/previews/alphas-deal.mp4`, poster: `${IF}/previews/alphas-deal.jpg` },
  { title: "The Residence", kind: "Property film · Dubai", video: `${IF}/previews/the-residence.mp4`, poster: `${IF}/previews/the-residence.jpg` },
  { title: "Ferrari", kind: "Automotive concept", video: `${IF}/previews/ferrari-concept.mp4`, poster: `${IF}/previews/ferrari-concept.jpg` },
  { title: "Theft", kind: "Narrative action", video: `${IF}/previews/theft.mp4`, poster: `${IF}/previews/theft.jpg` },
];

export const REEL: Clip[] = [AURA_EPISODES[0], FILMS[1], AURA_EPISODES[1], FILMS[2], AURA_EPISODES[2], FILMS[0], AURA_EPISODES[3], FILMS[3], FILMS[4], FILMS[5]];
