"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useStores, useSyncStore } from "@/hooks/use-stores";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Store,
  Plus,
  RefreshCw,
  ExternalLink,
  Settings2,
  User,
} from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { data: stores, isLoading: storesLoading } = useStores();
  const syncMutation = useSyncStore();

  const user = session?.user;
  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleSync = (storeId: string) => {
    syncMutation.mutate({ storeId, syncType: "all" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and connected stores
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{user?.name || "User"}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Stores */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Connected Stores
              </CardTitle>
              <CardDescription>
                Manage your Etsy store connections
              </CardDescription>
            </div>
            <Button variant="etsy" asChild>
              <Link href="/api/etsy/connect">
                <Plus className="mr-2 h-4 w-4" />
                Connect Store
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {storesLoading ? (
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48 mt-2" />
                  </div>
                  <Skeleton className="h-10 w-24" />
                </div>
              ))}
            </div>
          ) : stores && stores.length > 0 ? (
            <div className="space-y-4">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="h-12 w-12 rounded-lg bg-etsy/10 flex items-center justify-center">
                    <Store className="h-6 w-6 text-etsy" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{store.shopName}</p>
                      <Badge variant={store.isActive ? "success" : "secondary"}>
                        {store.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>
                        Last synced:{" "}
                        {store.lastSyncAt
                          ? formatRelativeTime(store.lastSyncAt)
                          : "Never"}
                      </span>
                      <span>
                        Connected: {formatDate(store.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(store.id)}
                      disabled={syncMutation.isPending}
                    >
                      <RefreshCw
                        className={`mr-2 h-4 w-4 ${
                          syncMutation.isPending ? "animate-spin" : ""
                        }`}
                      />
                      Sync
                    </Button>
                    {store.shopUrl && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={store.shopUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Store className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium">No stores connected</p>
              <p className="text-muted-foreground">
                Connect your Etsy store to start syncing data
              </p>
              <Button variant="etsy" className="mt-4" asChild>
                <Link href="/api/etsy/connect">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Etsy Store
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* App Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Version</p>
                <p className="text-sm text-muted-foreground">
                  Seller Helper v0.1.0
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Documentation</p>
                <p className="text-sm text-muted-foreground">
                  Learn how to use Seller Helper
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Docs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
