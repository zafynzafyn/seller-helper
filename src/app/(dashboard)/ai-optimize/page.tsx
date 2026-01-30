"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useListings, useListing } from "@/hooks/use-listings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Wand2,
  Check,
  X,
  RefreshCw,
  Tag,
  FileText,
  Type,
  Search,
} from "lucide-react";

type OptimizationType = "title" | "description" | "tags" | "seo";

interface OptimizationResult {
  id: string;
  type: string;
  suggestion: string;
  reasoning: string;
  metadata?: Record<string, unknown>;
}

export default function AIOptimizePage() {
  const searchParams = useSearchParams();
  const initialListingId = searchParams.get("listingId");
  const [selectedListingId, setSelectedListingId] = useState(initialListingId || "");
  const [activeTab, setActiveTab] = useState<OptimizationType>("title");
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const queryClient = useQueryClient();
  const { data: listingsData, isLoading: listingsLoading } = useListings({ limit: 100, state: "active" });
  const { data: selectedListing, isLoading: listingLoading } = useListing(selectedListingId);

  const listings = listingsData?.data || [];

  useEffect(() => {
    if (initialListingId) {
      setSelectedListingId(initialListingId);
    }
  }, [initialListingId]);

  const optimizeMutation = useMutation({
    mutationFn: async ({ listingId, type }: { listingId: string; type: OptimizationType }) => {
      const response = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, type }),
      });
      if (!response.ok) throw new Error("Failed to generate optimization");
      return response.json();
    },
    onSuccess: (data) => {
      setResult(data.optimization);
    },
  });

  const applyMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const response = await fetch(`/api/ai/optimizations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update optimization");
      return response.json();
    },
    onSuccess: (_, { status }) => {
      if (status === "approved") {
        queryClient.invalidateQueries({ queryKey: ["listings"] });
        queryClient.invalidateQueries({ queryKey: ["listings", selectedListingId] });
      }
      setResult(null);
    },
  });

  const handleGenerate = () => {
    if (selectedListingId) {
      optimizeMutation.mutate({ listingId: selectedListingId, type: activeTab });
    }
  };

  const handleApply = () => {
    if (result) {
      applyMutation.mutate({ id: result.id, status: "approved" });
    }
  };

  const handleReject = () => {
    if (result) {
      applyMutation.mutate({ id: result.id, status: "rejected" });
    }
  };

  const getTabIcon = (type: OptimizationType) => {
    switch (type) {
      case "title":
        return <Type className="h-4 w-4" />;
      case "description":
        return <FileText className="h-4 w-4" />;
      case "tags":
        return <Tag className="h-4 w-4" />;
      case "seo":
        return <Search className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          AI Listing Optimizer
        </h1>
        <p className="text-muted-foreground">
          Use AI to improve your listing titles, descriptions, and tags
        </p>
      </div>

      {/* Listing Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select a Listing</CardTitle>
          <CardDescription>
            Choose which listing you want to optimize
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listingsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedListingId} onValueChange={setSelectedListingId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a listing to optimize" />
              </SelectTrigger>
              <SelectContent>
                {listings.map((listing) => (
                  <SelectItem key={listing.id} value={listing.id}>
                    {listing.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedListingId && (
        <>
          {/* Current Listing Info */}
          {listingLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : selectedListing ? (
            <Card>
              <CardHeader>
                <CardTitle>Current Listing Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Title</p>
                  <p className="font-medium">{selectedListing.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm line-clamp-3">
                    {selectedListing.description || "No description"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedListing.tags?.length ? (
                      selectedListing.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No tags</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Optimization Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OptimizationType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="title" className="flex items-center gap-2">
                {getTabIcon("title")} Title
              </TabsTrigger>
              <TabsTrigger value="description" className="flex items-center gap-2">
                {getTabIcon("description")} Description
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                {getTabIcon("tags")} Tags
              </TabsTrigger>
              <TabsTrigger value="seo" className="flex items-center gap-2">
                {getTabIcon("seo")} SEO
              </TabsTrigger>
            </TabsList>

            {["title", "description", "tags", "seo"].map((type) => (
              <TabsContent key={type} value={type} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>
                        {type === "title" && "Title Optimization"}
                        {type === "description" && "Description Optimization"}
                        {type === "tags" && "Tag Suggestions"}
                        {type === "seo" && "SEO Analysis"}
                      </span>
                      <Button
                        onClick={handleGenerate}
                        disabled={optimizeMutation.isPending}
                      >
                        {optimizeMutation.isPending ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      {type === "title" && "Get AI-powered title suggestions optimized for Etsy search"}
                      {type === "description" && "Generate a compelling description with relevant keywords"}
                      {type === "tags" && "Get 13 optimized tags for maximum visibility"}
                      {type === "seo" && "Analyze your listing's SEO score and get recommendations"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {result && result.type === type ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            AI Suggestion
                          </p>
                          {type === "tags" && result.metadata?.tags ? (
                            <div className="flex flex-wrap gap-2">
                              {(result.metadata.tags as string[]).map((tag, i) => (
                                <Badge key={i} variant="default">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <Textarea
                              value={result.suggestion}
                              readOnly
                              className="min-h-[120px] bg-muted"
                            />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground mb-2">
                            Reasoning
                          </p>
                          <p className="text-sm">{result.reasoning}</p>
                        </div>

                        {type === "seo" && result.metadata?.score !== undefined && (
                          <div className="p-4 bg-muted rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">SEO Score</span>
                              <span className={`text-2xl font-bold ${
                                (result.metadata.score as number) >= 70
                                  ? "text-green-600"
                                  : (result.metadata.score as number) >= 50
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}>
                                {result.metadata.score as number}/100
                              </span>
                            </div>
                          </div>
                        )}

                        {type !== "seo" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={handleApply}
                              disabled={applyMutation.isPending}
                              className="flex-1"
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Apply Changes
                            </Button>
                            <Button
                              variant="outline"
                              onClick={handleReject}
                              disabled={applyMutation.isPending}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                          Click Generate to get AI-powered {type} suggestions
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </>
      )}
    </div>
  );
}
