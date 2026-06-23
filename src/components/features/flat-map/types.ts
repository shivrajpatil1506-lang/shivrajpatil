// Shared TypeScript types for the Flat Map feature

export type FlatStatus = "unsold" | "booked" | "hold" | "sold";
export type FlatCategory = "new" | "redev";

export interface FlatType {
  id: string;
  site_id: string;
  name: string;
  default_carpet_area: number;
  default_loading_pct: number;
  color_tag: string | null;
  is_system_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Flat {
  id: string;
  floor_id: string;
  flat_type_id: string | null;
  no: string;
  category: FlatCategory;
  status: FlatStatus;
  carpet_area: number;
  loading_pct: number;
  sale_area: number;
  sale_area_overridden: boolean;
  facing: string | null;
  notes: string | null;
  customer_id: string | null;
  flat_type: FlatType | null;
  customer: { id: string; first_name: string; last_name: string } | null;
  created_at: Date;
  updated_at: Date;
}

export interface Floor {
  id: string;
  block_id: string;
  label: string;
  sort_index: number;
  flats: Flat[];
  created_at: Date;
  updated_at: Date;
}

export interface Block {
  id: string;
  site_id: string;
  name: string;
  default_category: FlatCategory;
  rate_new: number;
  rate_redev: number;
  sort_index: number;
  floors: Floor[];
  created_at: Date;
  updated_at: Date;
}

// Status display config
export const FLAT_STATUS_CONFIG: Record<
  FlatStatus,
  { label: string; bg: string; border: string; text: string; dot: string }
> = {
  unsold:  { label: "Unsold",  bg: "bg-slate-100",   border: "border-slate-300",   text: "text-slate-600",   dot: "bg-slate-400"   },
  booked:  { label: "Booked",  bg: "bg-blue-100",    border: "border-blue-400",    text: "text-blue-700",    dot: "bg-blue-500"    },
  hold:    { label: "Hold",    bg: "bg-amber-100",   border: "border-amber-400",   text: "text-amber-700",   dot: "bg-amber-500"   },
  sold:    { label: "Sold",    bg: "bg-emerald-100", border: "border-emerald-500", text: "text-emerald-700", dot: "bg-emerald-500" },
};

export const FLAT_CATEGORY_CONFIG: Record<FlatCategory, { label: string; border: string; badge: string }> = {
  new:   { label: "New",   border: "border-l-4 border-l-indigo-500",  badge: "bg-indigo-100 text-indigo-700"  },
  redev: { label: "Redev", border: "border-l-4 border-l-orange-400",  badge: "bg-orange-100 text-orange-700"  },
};

// Filters type
export interface FlatMapFilters {
  statuses: FlatStatus[];
  categories: FlatCategory[];
  flatTypeIds: string[];
  floorLabel: string;
  search: string;
}

export const DEFAULT_FILTERS: FlatMapFilters = {
  statuses: [],
  categories: [],
  flatTypeIds: [],
  floorLabel: "",
  search: "",
};
