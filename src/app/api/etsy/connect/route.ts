import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Generate state and code verifier
  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = crypto.randomBytes(32).toString("hex");

  // Generate code challenge (SHA-256 hash of verifier, base64url encoded)
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  // Store code verifier in cookie for callback
  const response = NextResponse.redirect(
    `https://www.etsy.com/oauth/connect?` +
      new URLSearchParams({
        response_type: "code",
        client_id: process.env.ETSY_API_KEY!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/etsy/callback`,
        scope: "transactions_r transactions_w listings_r listings_w shops_r shops_w",
        state,
        code_challenge: codeChallenge,
        code_challenge_method: "S256",
      }).toString()
  );

  // Set cookies for callback verification
  response.cookies.set("etsy_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
  });

  response.cookies.set("etsy_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
  });

  return response;
}
