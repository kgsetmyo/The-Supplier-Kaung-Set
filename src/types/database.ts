export type UserRole = "user" | "admin";

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "cancelled";

export type Profile = {
  id: string;
  role: UserRole;
  phone_number?: string;
  address?: string;
  lifetime_spend?: number;
  loyalty_tier?: string;
  loyalty_tier_id?: string | null;
  created_at: string;
  email?: string;
};

export type LoyaltyTier = {
  id: string;
  tier_name: string;
  spend_threshold: number;
  discount_percentage: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductAuthenticity = "Genuine" | "OEM" | "Replica";

export const PRODUCT_AUTHENTICITY_OPTIONS: ProductAuthenticity[] = [
  "Genuine",
  "OEM",
  "Replica",
];

export type Product = {
  id: string;
  name_en: string;
  name_mm: string;
  description_en: string;
  description_mm: string;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  /** Gallery URLs for carousels (DB: products.image_urls). */
  image_urls?: string[];
  stock_quantity: number;
  category_id?: string | null;
  brand_id?: string | null;
  authenticity?: ProductAuthenticity;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  comment: string;
  status?: "pending" | "approved" | "rejected";
  reviewer_name?: string | null;
  reviewer_email?: string | null;
  created_at: string;
  updated_at?: string;
};

export type PaymentMethod =
  | "kbz_pay"
  | "kbz_banking"
  | "kbz_special"
  | "kbz_full"
  | "kbz_half"
  | "cod";

export type PaymentPlan = "full" | "half";

/** True for any manual KBZ channel (including legacy full/half method values). */
export function isKbzPaymentMethod(
  method: string | null | undefined
): boolean {
  return (
    method === "kbz_pay" ||
    method === "kbz_banking" ||
    method === "kbz_special" ||
    method === "kbz_full" ||
    method === "kbz_half"
  );
}

export function paymentMethodLabel(method: string | null | undefined): string {
  switch (method) {
    case "kbz_pay":
      return "KBZ Pay";
    case "kbz_banking":
      return "KBZ Banking";
    case "kbz_special":
      return "KBZ Special";
    case "kbz_full":
      return "KBZ Pay — Full (100%)";
    case "kbz_half":
      return "KBZ Pay — Half (50% deposit)";
    case "cod":
      return "Cash on Delivery";
    default:
      return method ?? "—";
  }
}

export function paymentPlanLabel(plan: string | null | undefined): string {
  switch (plan) {
    case "full":
      return "Full (100%)";
    case "half":
      return "Half (50% deposit)";
    default:
      return plan ?? "—";
  }
}

/** Resolve plan from dedicated column or legacy payment_method values. */
export function resolvePaymentPlan(
  method: string | null | undefined,
  plan?: string | null
): PaymentPlan | null {
  if (plan === "full" || plan === "half") return plan;
  if (method === "kbz_half") return "half";
  if (method === "kbz_full" || isKbzPaymentMethod(method)) return "full";
  return null;
}

export type PaymentStatus = "pending" | "verified" | "rejected";

export type CustomerInfo = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
};

export type OrderStatusHistory = {
  id: string;
  order_id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string | null;
  tracking_number: string;
  courier_name?: string | null;
  customer_info: CustomerInfo;
  total_amount: number;
  status: OrderStatus;
  payment_method?: PaymentMethod | null;
  payment_plan?: PaymentPlan | null;
  payment_screenshot_url?: string | null;
  payment_reference?: string | null;
  payment_status?: PaymentStatus;
  coupon_id?: string | null;
  discount_applied?: number;
  created_at: string;
  order_status_history?: OrderStatusHistory[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
};

export type DiscountType = "percentage" | "flat";

export type Coupon = {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  is_active: boolean;
  expires_at: string | null;
  usage_limit: number | null;
  times_used: number;
  /** Optional minimum merchandise subtotal (MMK). */
  min_spend?: number | null;
  created_at: string;
  updated_at?: string;
  coupon_eligibility?: CouponEligibility[];
};

export type CouponEligibility = {
  id: string;
  coupon_id: string;
  product_id: string | null;
  category_id: string | null;
};

export type Category = {
  id: string;
  name_en: string;
  name_mm: string;
  parent_id?: string | null;
  sort_order?: number;
  slug?: string | null;
  /** Required specific emoji from DB (no generic tag fallback). */
  emoji_icon: string;
  created_at?: string;
};

/** Storefront explorer card: category + representative product image. */
export type ExplorerCategory = Category & {
  image_url: string | null;
};

export type StoreSettings = {
  id: string;
  announcement_text_en: string;
  announcement_text_mm: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type TrackedOrderItem = {
  quantity: number;
  price_at_time: number;
  name_en: string;
  name_mm: string;
};

export type TrackedOrderHistory = {
  status: OrderStatus;
  note: string | null;
  created_at: string;
};

export type TrackedOrder = {
  id: string;
  tracking_number: string;
  courier_name?: string | null;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  customer_name: string | null;
  customer_city: string | null;
  items: TrackedOrderItem[];
  history?: TrackedOrderHistory[];
};

export type OrderWithItems = Order & {
  order_items?: (OrderItem & { products?: Product | null })[];
};

/** KS- + 9 random alphanumeric characters */
export function generateTrackingNumber() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 9; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `KS-${suffix}`;
}

/** Effective unit price after discount */
export function getUnitPrice(product: Pick<Product, "price" | "discount_price">) {
  return product.discount_price != null
    ? Number(product.discount_price)
    : Number(product.price);
}

export function formatMoney(amount: number, prefix = "Ks ") {
  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(amount);
  return `${prefix}${formatted}`;
}

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "in_transit",
  "delivered",
  "cancelled",
];
