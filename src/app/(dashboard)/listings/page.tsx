"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useListings } from "@/hooks/use-listings";
import { useStores } from "@/hooks/use-stores";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Eye,
  Heart,
  ChevronLeft,
  ChevronRight,
  Package,
  ExternalLink,
} from "lucide-react";
import { formatCurrency, formatNumber, truncateText } from "@/lib/utils";

export default function ListingsPage() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedStore, setSelectedStore] = useState("");

  const { data: stores } = useStores();
  const { data: listingsData, isLoading } = useListings({
    storeId: selectedStore || undefined,
    state: state !== "all" ? state : undefined,
    search: search || undefined,
    sortBy: sortBy as "title" | "price" | "views" | "favorites" | "createdAt",
    sortOrder: sortOrder as "asc" | "desc",
    page,
    limit: 20,
  });

  const listings = listingsData?.data || [];
  const pagination = listingsData?.pagination;

  const getStateBadge = (listingState: string) => {
    switch (listingState) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{listingState}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Listings</h1>
        <p className="text-muted-foreground">
          Manage and optimize your Etsy listings
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            {stores && stores.length > 1 && (
              <Select
                value={selectedStore}
                onValueChange={(v) => {
                  setSelectedStore(v);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.shopName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select
              value={state}
              onValueChange={(v) => {
                setState(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="views">Views</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Desc</SelectItem>
                <SelectItem value="asc">Asc</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Listings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {pagination?.total || 0} Listings
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-32 mt-2" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No listings found</p>
              <p className="text-muted-foreground">
                {search
                  ? "Try adjusting your search filters"
                  : "Connect your Etsy store to sync listings"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Favorites</TableHead>
                  <TableHead className="text-right">Orders</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings.map((listing) => (
                  <TableRow key={listing.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                          {listing.primaryImageUrl ? (
                            <Image
                              src={listing.primaryImageUrl}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/listings/${listing.id}`}
                            className="font-medium hover:underline"
                          >
                            {truncateText(listing.title, 50)}
                          </Link>
                          {stores && stores.length > 1 && (
                            <p className="text-xs text-muted-foreground">
                              {listing.store.shopName}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStateBadge(listing.state)}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(listing.price, listing.currency)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Eye className="h-3 w-3 text-muted-foreground" />
                        {formatNumber(listing.views)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="flex items-center justify-end gap-1">
                        <Heart className="h-3 w-3 text-muted-foreground" />
                        {formatNumber(listing.favorites)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(listing._count.orderItems)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/listings/${listing.id}`}>View</Link>
                        </Button>
                        {listing.etsyUrl && (
                          <Button variant="ghost" size="icon" asChild>
                            <a
                              href={listing.etsyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
