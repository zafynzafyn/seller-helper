"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import type { TopListing } from "@/types";

interface TopListingsProps {
  listings: TopListing[];
}

export function TopListings({ listings }: TopListingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {listings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No listings found. Connect your Etsy store to see data.
            </p>
          ) : (
            listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {listing.imageUrl ? (
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ShoppingCart className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {formatNumber(listing.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {formatNumber(listing.orders)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">
                    {formatCurrency(listing.revenue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {listing.orders} orders
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
