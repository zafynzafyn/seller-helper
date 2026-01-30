import prisma from "./prisma";
import type { EtsyShop, EtsyListing, EtsyReceipt } from "@/types";

const ETSY_API_BASE = "https://openapi.etsy.com/v3";

interface EtsyTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export class EtsyClient {
  private accessToken: string;
  private refreshToken: string | null;
  private expiresAt: number;
  private storeId: string;

  constructor(
    accessToken: string,
    refreshToken: string | null = null,
    expiresAt: number = 0,
    storeId: string = ""
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.expiresAt = expiresAt;
    this.storeId = storeId;
  }

  static async fromStore(storeId: string): Promise<EtsyClient | null> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store || !store.accessToken) {
      return null;
    }

    const client = new EtsyClient(
      store.accessToken,
      store.refreshToken,
      store.tokenExpiresAt?.getTime() || 0,
      store.id
    );

    // Check if token needs refresh
    if (client.isTokenExpired() && store.refreshToken) {
      await client.refreshAccessToken();
    }

    return client;
  }

  private isTokenExpired(): boolean {
    return Date.now() >= this.expiresAt - 60000; // 1 minute buffer
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: process.env.ETSY_API_KEY!,
        refresh_token: this.refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.refreshToken = data.refresh_token;
    this.expiresAt = Date.now() + data.expires_in * 1000;

    // Update store with new tokens
    if (this.storeId) {
      await prisma.store.update({
        where: { id: this.storeId },
        data: {
          accessToken: this.accessToken,
          refreshToken: this.refreshToken,
          tokenExpiresAt: new Date(this.expiresAt),
        },
      });
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.isTokenExpired() && this.refreshToken) {
      await this.refreshAccessToken();
    }

    const response = await fetch(`${ETSY_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "x-api-key": process.env.ETSY_API_KEY!,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Etsy API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  // Shop endpoints
  async getShop(shopId: string): Promise<EtsyShop> {
    return this.request<EtsyShop>(`/application/shops/${shopId}`);
  }

  async getMyShops(): Promise<{ results: EtsyShop[] }> {
    return this.request<{ results: EtsyShop[] }>("/application/users/me/shops");
  }

  // Listing endpoints
  async getListings(
    shopId: string,
    params: {
      state?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ results: EtsyListing[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params.state) searchParams.set("state", params.state);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());

    return this.request<{ results: EtsyListing[]; count: number }>(
      `/application/shops/${shopId}/listings?${searchParams.toString()}`
    );
  }

  async getListing(listingId: string): Promise<EtsyListing> {
    return this.request<EtsyListing>(
      `/application/listings/${listingId}?includes=images`
    );
  }

  async getListingImages(
    listingId: string
  ): Promise<{ results: Array<{ url_fullxfull: string; url_570xN: string; rank: number }> }> {
    return this.request(`/application/listings/${listingId}/images`);
  }

  async updateListing(
    shopId: string,
    listingId: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      quantity: number;
      tags: string[];
      state: string;
    }>
  ): Promise<EtsyListing> {
    return this.request<EtsyListing>(
      `/application/shops/${shopId}/listings/${listingId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  // Receipt/Order endpoints
  async getReceipts(
    shopId: string,
    params: {
      min_created?: number;
      max_created?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ results: EtsyReceipt[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params.min_created)
      searchParams.set("min_created", params.min_created.toString());
    if (params.max_created)
      searchParams.set("max_created", params.max_created.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());

    return this.request<{ results: EtsyReceipt[]; count: number }>(
      `/application/shops/${shopId}/receipts?${searchParams.toString()}`
    );
  }

  async getReceipt(receiptId: string): Promise<EtsyReceipt> {
    return this.request<EtsyReceipt>(`/application/receipts/${receiptId}`);
  }

  // Sync methods
  async syncListings(storeId: string): Promise<number> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) throw new Error("Store not found");

    let offset = 0;
    const limit = 100;
    let totalSynced = 0;

    while (true) {
      const { results, count } = await this.getListings(store.etsyShopId, {
        limit,
        offset,
      });

      if (results.length === 0) break;

      for (const listing of results) {
        const images = await this.getListingImages(listing.listing_id.toString());
        const imageUrls = images.results
          .sort((a, b) => a.rank - b.rank)
          .map((img) => img.url_fullxfull);

        await prisma.listing.upsert({
          where: {
            storeId_etsyListingId: {
              storeId,
              etsyListingId: listing.listing_id.toString(),
            },
          },
          create: {
            storeId,
            etsyListingId: listing.listing_id.toString(),
            title: listing.title,
            description: listing.description,
            price: listing.price.amount / listing.price.divisor,
            currency: listing.price.currency_code,
            quantity: listing.quantity,
            state: listing.state,
            views: listing.views,
            favorites: listing.num_favorers,
            tags: listing.tags,
            materials: listing.materials,
            imageUrls,
            primaryImageUrl: imageUrls[0] || null,
            etsyUrl: listing.url,
            processingMin: listing.shipping_profile?.min_processing_days,
            processingMax: listing.shipping_profile?.max_processing_days,
            etsyCreatedAt: new Date(listing.created_timestamp * 1000),
            etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          },
          update: {
            title: listing.title,
            description: listing.description,
            price: listing.price.amount / listing.price.divisor,
            quantity: listing.quantity,
            state: listing.state,
            views: listing.views,
            favorites: listing.num_favorers,
            tags: listing.tags,
            materials: listing.materials,
            imageUrls,
            primaryImageUrl: imageUrls[0] || null,
            processingMin: listing.shipping_profile?.min_processing_days,
            processingMax: listing.shipping_profile?.max_processing_days,
            etsyUpdatedAt: new Date(listing.updated_timestamp * 1000),
          },
        });

        totalSynced++;
      }

      if (offset + limit >= count) break;
      offset += limit;
    }

    await prisma.store.update({
      where: { id: storeId },
      data: { lastSyncAt: new Date() },
    });

    return totalSynced;
  }

  async syncOrders(storeId: string, daysBack: number = 30): Promise<number> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) throw new Error("Store not found");

    const minCreated = Math.floor(
      (Date.now() - daysBack * 24 * 60 * 60 * 1000) / 1000
    );

    let offset = 0;
    const limit = 100;
    let totalSynced = 0;

    while (true) {
      const { results, count } = await this.getReceipts(store.etsyShopId, {
        min_created: minCreated,
        limit,
        offset,
      });

      if (results.length === 0) break;

      for (const receipt of results) {
        // Find or create customer
        let customerId: string | null = null;
        if (receipt.buyer_email) {
          const customer = await prisma.customer.upsert({
            where: {
              storeId_email: {
                storeId,
                email: receipt.buyer_email,
              },
            },
            create: {
              storeId,
              email: receipt.buyer_email,
              name: receipt.name,
              etsyUserId: receipt.buyer_user_id.toString(),
            },
            update: {
              name: receipt.name,
            },
          });
          customerId = customer.id;
        }

        const orderTotal =
          receipt.grandtotal.amount / receipt.grandtotal.divisor;
        const subtotal = receipt.subtotal.amount / receipt.subtotal.divisor;
        const shippingCost =
          receipt.total_shipping_cost.amount /
          receipt.total_shipping_cost.divisor;
        const taxCost =
          receipt.total_tax_cost.amount / receipt.total_tax_cost.divisor;
        const discountAmount =
          receipt.discount_amt.amount / receipt.discount_amt.divisor;

        // Calculate fees (Etsy typically charges ~6.5% + $0.20 listing + payment processing)
        const transactionFee = subtotal * 0.065;
        const listingFee = receipt.transactions.length * 0.2;
        const processingFee = orderTotal * 0.03 + 0.25;
        const etsyFees = transactionFee + listingFee;

        const order = await prisma.order.upsert({
          where: {
            storeId_etsyReceiptId: {
              storeId,
              etsyReceiptId: receipt.receipt_id.toString(),
            },
          },
          create: {
            storeId,
            customerId,
            etsyReceiptId: receipt.receipt_id.toString(),
            orderTotal,
            subtotal,
            shippingCost,
            taxCost,
            discountAmount,
            etsyFees,
            processingFees: processingFee,
            netRevenue: orderTotal - etsyFees - processingFee,
            currency: receipt.grandtotal.currency_code,
            status: receipt.is_shipped ? "shipped" : receipt.is_paid ? "paid" : "pending",
            buyerEmail: receipt.buyer_email,
            buyerName: receipt.name,
            shippingAddress: { formatted: receipt.formatted_address },
            isPaid: receipt.is_paid,
            isShipped: receipt.is_shipped,
            etsyCreatedAt: new Date(receipt.create_timestamp * 1000),
          },
          update: {
            status: receipt.is_shipped ? "shipped" : receipt.is_paid ? "paid" : "pending",
            isPaid: receipt.is_paid,
            isShipped: receipt.is_shipped,
          },
        });

        // Create order items
        for (const transaction of receipt.transactions) {
          const listing = await prisma.listing.findUnique({
            where: {
              storeId_etsyListingId: {
                storeId,
                etsyListingId: transaction.listing_id.toString(),
              },
            },
          });

          await prisma.orderItem.upsert({
            where: {
              id: `${order.id}-${transaction.transaction_id}`,
            },
            create: {
              id: `${order.id}-${transaction.transaction_id}`,
              orderId: order.id,
              listingId: listing?.id,
              etsyTransactionId: transaction.transaction_id.toString(),
              title: transaction.title,
              quantity: transaction.quantity,
              price: transaction.price.amount / transaction.price.divisor,
              shippingCost:
                transaction.shipping_cost.amount /
                transaction.shipping_cost.divisor,
              variations: transaction.variations,
            },
            update: {},
          });
        }

        // Update customer stats
        if (customerId) {
          const customerOrders = await prisma.order.findMany({
            where: { customerId },
            orderBy: { etsyCreatedAt: "desc" },
          });

          await prisma.customer.update({
            where: { id: customerId },
            data: {
              totalOrders: customerOrders.length,
              totalSpent: customerOrders.reduce((sum, o) => sum + o.orderTotal, 0),
              averageOrder:
                customerOrders.reduce((sum, o) => sum + o.orderTotal, 0) /
                customerOrders.length,
              firstOrderAt: customerOrders[customerOrders.length - 1]?.etsyCreatedAt,
              lastOrderAt: customerOrders[0]?.etsyCreatedAt,
            },
          });
        }

        totalSynced++;
      }

      if (offset + limit >= count) break;
      offset += limit;
    }

    return totalSynced;
  }
}

// OAuth helpers
export function getEtsyAuthUrl(state: string): string {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.ETSY_API_KEY!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/etsy/callback`,
    scope: "transactions_r transactions_w listings_r listings_w shops_r shops_w",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  // Store code verifier for later use
  // In production, store this in session or database
  return `https://www.etsy.com/oauth/connect?${params.toString()}`;
}

export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
): Promise<EtsyTokens> {
  const response = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: process.env.ETSY_API_KEY!,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/etsy/callback`,
      code,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

function generateCodeChallenge(verifier: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  // In production, use proper SHA-256 hashing
  // This is a simplified version
  return Buffer.from(data).toString("base64url");
}
