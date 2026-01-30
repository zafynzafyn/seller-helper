"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useListing } from "@/hooks/use-listings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Heart,
  Package,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export default function ListingPage({ params }: ListingPageProps) {
  const { id } = use(params);
  const { data: listing, isLoading } = useListing(id);

  if (isLoading) {
    return <ListingPageSkeleton />;
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">Listing not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/listings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Listings
          </Link>
        </Button>
      </div>
    );
  }

  const getStateBadge = (state: string) => {
    switch (state) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{state}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/listings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStateBadge(listing.state)}
            <span className="text-muted-foreground">
              {listing.store?.shopName}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/ai-optimize?listingId=${listing.id}`}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Optimize
            </Link>
          </Button>
          {listing.etsyUrl && (
            <Button variant="outline" asChild>
              <a href={listing.etsyUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Etsy
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Images */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {listing.primaryImageUrl && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={listing.primaryImageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              {listing.imageUrls && listing.imageUrls.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {listing.imageUrls.slice(1, 5).map((url, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden bg-muted"
                    >
                      <Image
                        src={url}
                        alt={`${listing.title} ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {formatCurrency(listing.price, listing.currency)}
                </div>
                <p className="text-sm text-muted-foreground">Price</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {formatNumber(listing.views)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {formatNumber(listing.favorites)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{listing.quantity}</div>
                <p className="text-sm text-muted-foreground">In Stock</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              <TabsTrigger value="ai">AI Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">
                    {listing.description || "No description"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags && listing.tags.length > 0 ? (
                      listing.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No tags</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {listing.materials && listing.materials.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Materials</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {listing.materials.map((material, index) => (
                        <Badge key={index} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.orderItems && listing.orderItems.length > 0 ? (
                    <div className="space-y-3">
                      {listing.orderItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div>
                            <p className="font-medium">
                              {item.order?.buyerName || "Customer"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.order?.etsyCreatedAt
                                ? formatDate(item.order.etsyCreatedAt)
                                : "Unknown date"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(item.price)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No orders yet
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Optimization History</CardTitle>
                </CardHeader>
                <CardContent>
                  {listing.aiOptimizations && listing.aiOptimizations.length > 0 ? (
                    <div className="space-y-4">
                      {listing.aiOptimizations.map((opt) => (
                        <div key={opt.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline">{opt.type}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(opt.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-medium mb-1">Suggestion:</p>
                          <p className="text-sm text-muted-foreground">
                            {opt.suggestedContent}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Sparkles className="h-8 w-8 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground mt-2">
                        No AI suggestions yet
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <Link href={`/ai-optimize?listingId=${listing.id}`}>
                          Generate Suggestions
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function ListingPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="aspect-square rounded-lg" />
        <div className="lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
