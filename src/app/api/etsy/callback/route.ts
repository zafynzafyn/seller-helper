import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ETSY_API_BASE = "https://openapi.etsy.com/v3";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/stores?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  // Verify state
  const storedState = request.cookies.get("etsy_state")?.value;
  const codeVerifier = request.cookies.get("etsy_code_verifier")?.value;

  if (!state || state !== storedState || !codeVerifier) {
    return NextResponse.redirect(
      new URL("/settings/stores?error=invalid_state", request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/settings/stores?error=no_code", request.url)
    );
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch(`${ETSY_API_BASE}/public/oauth/token`, {
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

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/settings/stores?error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Get user's shops
    const shopsResponse = await fetch(
      `${ETSY_API_BASE}/application/users/me/shops`,
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "x-api-key": process.env.ETSY_API_KEY!,
        },
      }
    );

    if (!shopsResponse.ok) {
      return NextResponse.redirect(
        new URL("/settings/stores?error=shops_fetch_failed", request.url)
      );
    }

    const shopsData = await shopsResponse.json();
    const shops = shopsData.results || [];

    if (shops.length === 0) {
      return NextResponse.redirect(
        new URL("/settings/stores?error=no_shops", request.url)
      );
    }

    // Connect the first shop (or allow user to choose in future)
    const shop = shops[0];

    await prisma.store.upsert({
      where: { etsyShopId: shop.shop_id.toString() },
      create: {
        userId: session.user.id,
        etsyShopId: shop.shop_id.toString(),
        shopName: shop.shop_name,
        shopUrl: shop.url,
        currency: shop.currency_code,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: expiresAt,
      },
    });

    // Clear cookies
    const response = NextResponse.redirect(
      new URL("/settings/stores?success=true", request.url)
    );
    response.cookies.delete("etsy_state");
    response.cookies.delete("etsy_code_verifier");

    return response;
  } catch (err) {
    console.error("Etsy callback error:", err);
    return NextResponse.redirect(
      new URL("/settings/stores?error=connection_failed", request.url)
    );
  }
}
