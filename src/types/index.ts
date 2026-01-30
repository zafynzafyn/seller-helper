import type {
  User,
  Store,
  Listing,
  Order,
  OrderItem,
  Customer,
  CustomerNote,
  AnalyticsSnapshot,
  AIOptimization
} from "@prisma/client";

// Re-export Prisma types
export type {
  User,
  Store,
  Listing,
  Order,
  OrderItem,
  Customer,
  CustomerNote,
  AnalyticsSnapshot,
  AIOptimization
};

// Extended types with relations
export type StoreWithRelations = Store & {
  listings?: Listing[];
  orders?: Order[];
  customers?: Customer[];
};

export type OrderItemWithOrder = OrderItem & {
  order?: {
    etsyCreatedAt: Date | null;
    buyerName: string | null;
  } | null;
};

export type ListingWithRelations = Listing & {
  store?: Store & { userId: string };
  orderItems?: OrderItemWithOrder[];
  aiOptimizations?: AIOptimization[];
};

export type OrderWithRelations = Order & {
  store?: Store;
  customer?: Customer;
  items?: OrderItem[];
};

export type OrderItemWithListing = OrderItem & {
  listing?: {
    title: string;
    primaryImageUrl: string | null;
  } | null;
};

export type OrderWithItems = Order & {
  items?: OrderItemWithListing[];
};

export type CustomerWithRelations = Customer & {
  store?: Store & { userId: string };
  orders?: OrderWithItems[];
  notes?: CustomerNote[];
};

// Dashboard types
export type DashboardStats = {
  totalRevenue: number;
  totalOrders: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
  totalFees: number;
  netRevenue: number;
  revenueChange: number;
  ordersChange: number;
};

export type ChartDataPoint = {
  date: string;
  revenue: number;
  orders: number;
  views?: number;
};

export type TopListing = {
  id: string;
  title: string;
  revenue: number;
  orders: number;
  views: number;
  imageUrl?: string;
};

// Etsy API types
export type EtsyShop = {
  shop_id: number;
  shop_name: string;
  title: string;
  currency_code: string;
  url: string;
  icon_url_fullxfull?: string;
  listing_active_count: number;
  review_count: number;
  review_average: number;
};

export type EtsyListing = {
  listing_id: number;
  title: string;
  description: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  quantity: number;
  state: string;
  views: number;
  num_favorers: number;
  tags: string[];
  materials: string[];
  images?: EtsyListingImage[];
  url: string;
  created_timestamp: number;
  updated_timestamp: number;
  shipping_profile?: {
    min_processing_days: number;
    max_processing_days: number;
  };
};

export type EtsyListingImage = {
  listing_image_id: number;
  url_fullxfull: string;
  url_570xN: string;
  rank: number;
};

export type EtsyReceipt = {
  receipt_id: number;
  receipt_type: number;
  seller_user_id: number;
  buyer_user_id: number;
  buyer_email: string;
  name: string;
  status: string;
  is_paid: boolean;
  is_shipped: boolean;
  grandtotal: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  subtotal: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_shipping_cost: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  total_tax_cost: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  discount_amt: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  transactions: EtsyTransaction[];
  formatted_address: string;
  buyer_adjusted_grandtotal: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  create_timestamp: number;
  update_timestamp: number;
};

export type EtsyTransaction = {
  transaction_id: number;
  listing_id: number;
  title: string;
  quantity: number;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  shipping_cost: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  variations: Array<{
    property_id: number;
    value_id: number;
    formatted_name: string;
    formatted_value: string;
  }>;
};

// AI Optimization types
export type AIOptimizationType = "title" | "description" | "tags" | "seo";

export type AIOptimizationRequest = {
  listingId: string;
  type: AIOptimizationType;
  currentContent: string;
  context?: {
    category?: string;
    tags?: string[];
    price?: number;
  };
};

export type AIOptimizationResponse = {
  suggestion: string;
  reasoning: string;
  seoScore?: number;
  keywords?: string[];
};

// Filter and pagination types
export type ListingFilters = {
  state?: string;
  search?: string;
  sortBy?: "title" | "price" | "views" | "favorites" | "createdAt";
  sortOrder?: "asc" | "desc";
};

export type OrderFilters = {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
};

export type CustomerFilters = {
  search?: string;
  tags?: string[];
  minOrders?: number;
  sortBy?: "totalSpent" | "totalOrders" | "lastOrderAt";
  sortOrder?: "asc" | "desc";
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// API Response types
export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
