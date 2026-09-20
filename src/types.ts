export type PriceLevel = "$" | "$$" | "$$$" | "$$$$";

export type SourceType =
  | "website"
  | "menu"
  | "editorial"
  | "listing"
  | "review_consensus";

export type Source = {
  id: string;
  type: SourceType;
  publisher: string;
  url?: string;
};

export type Dish = {
  name: string;
  confidence: number;
  sourceIds: string[];
};

export type Consensus = {
  theme: string;
  positive: number;
  sourceIds: string[];
};

export type Media = {
  url: string;
  credit: string;
  kind: "hero" | "food" | "room";
};

export type Restaurant = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  cuisine: string[];
  price: PriceLevel;
  rating: number;
  reviewCountLabel: string;
  tags: string[];
  atmosphere: string[];
  occasions: string[];
  signatureDishes: Dish[];
  dietary: {
    vegetarian: boolean | "unknown";
    vegan: boolean | "unknown";
    glutenFree: boolean | "unknown";
  };
  noise: string;
  reservation: boolean | "recommended" | "unknown";
  openNote: string;
  website?: string;
  hero: Media;
  gallery: Media[];
  blurb: string;
  matchSignals: string[];
  consensus: Consensus[];
  polarizing: string[];
  sources: Source[];
  emerging?: boolean;
  classic?: boolean;
  trending?: boolean;
  lastVerified: string;
};

export type Intent = {
  raw: string;
  cuisine: string[];
  dishes: string[];
  neighborhoods: string[];
  near: "mit" | "fenway" | "back-bay" | "north-end" | null;
  budget: PriceLevel | null;
  budgetMax: number | null;
  occasion: string | null;
  atmosphere: string[];
  dietary: string[];
  lateNight: boolean;
  group: boolean;
  family: boolean;
  student: boolean;
  walkable: boolean;
  classic: boolean;
  notTouristy: boolean;
  notExperimental: boolean;
  notTastingMenu: boolean;
};

export type MatchBreakdown = {
  intent: number;
  food: number;
  atmosphere: number;
  location: number;
  budget: number;
};

export type RankedRestaurant = {
  restaurant: Restaurant;
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  evidence: { claim: string; sourceIds: string[] }[];
};

export type TrailStop = {
  time: string;
  restaurantId: string;
  course: string;
  note: string;
  cost: number;
};

export type Trail = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  total: string;
  start: string;
  stops: TrailStop[];
};
