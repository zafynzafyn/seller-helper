"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCustomer, useAddCustomerNote, useUpdateCustomerTags, useToggleNoteComplete } from "@/hooks/use-customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Users,
  Mail,
  ShoppingCart,
  DollarSign,
  Calendar,
  Plus,
  Tag,
  X,
  Package,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate, formatRelativeTime } from "@/lib/utils";

interface CustomerPageProps {
  params: Promise<{ id: string }>;
}

export default function CustomerPage({ params }: CustomerPageProps) {
  const { id } = use(params);
  const { data: customer, isLoading } = useCustomer(id);
  const [newNote, setNewNote] = useState("");
  const [newTag, setNewTag] = useState("");

  const addNoteMutation = useAddCustomerNote();
  const updateTagsMutation = useUpdateCustomerTags();
  const toggleNoteMutation = useToggleNoteComplete();

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNoteMutation.mutate({
        customerId: id,
        content: newNote,
        type: "note",
      });
      setNewNote("");
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && customer) {
      const tags = [...(customer.tags || []), newTag.trim()];
      updateTagsMutation.mutate({ id, tags });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (customer) {
      const tags = (customer.tags || []).filter((t) => t !== tagToRemove);
      updateTagsMutation.mutate({ id, tags });
    }
  };

  const handleToggleNote = (noteId: string, isCompleted: boolean) => {
    toggleNoteMutation.mutate({ customerId: id, noteId, isCompleted });
  };

  if (isLoading) {
    return <CustomerPageSkeleton />;
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Users className="h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-lg font-medium">Customer not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Customers
          </Link>
        </Button>
      </div>
    );
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg">{getInitials(customer.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{customer.name || "Unknown Customer"}</h1>
          {customer.email && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {customer.email}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingCart className="h-4 w-4" />
                  Total Orders
                </div>
                <span className="font-semibold">
                  {formatNumber(customer.totalOrders)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Total Spent
                </div>
                <span className="font-semibold">
                  {formatCurrency(customer.totalSpent)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Average Order
                </div>
                <span className="font-semibold">
                  {formatCurrency(customer.averageOrder)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  First Order
                </div>
                <span className="text-sm">
                  {customer.firstOrderAt
                    ? formatDate(customer.firstOrderAt)
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  Last Order
                </div>
                <span className="text-sm">
                  {customer.lastOrderAt
                    ? formatRelativeTime(customer.lastOrderAt)
                    : "N/A"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {customer.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(!customer.tags || customer.tags.length === 0) && (
                  <p className="text-sm text-muted-foreground">No tags</p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                />
                <Button
                  size="sm"
                  onClick={handleAddTag}
                  disabled={!newTag.trim() || updateTagsMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {customer.orders && customer.orders.length > 0 ? (
                    <div className="space-y-4">
                      {customer.orders.map((order) => (
                        <div
                          key={order.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                Order #{order.etsyReceiptId}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {order.etsyCreatedAt
                                  ? formatDate(order.etsyCreatedAt)
                                  : "Unknown date"}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {formatCurrency(order.orderTotal)}
                              </p>
                              <Badge variant={
                                order.status === "completed" ? "success" :
                                order.status === "shipped" ? "default" :
                                "secondary"
                              }>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          {order.items && order.items.length > 0 && (
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 text-sm"
                                >
                                  <div className="relative h-10 w-10 rounded overflow-hidden bg-muted flex-shrink-0">
                                    {item.listing?.primaryImageUrl ? (
                                      <Image
                                        src={item.listing.primaryImageUrl}
                                        alt={item.title}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate">{item.title}</p>
                                    <p className="text-muted-foreground">
                                      Qty: {item.quantity}
                                    </p>
                                  </div>
                                  <p className="font-medium">
                                    {formatCurrency(item.price)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
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

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notes & Follow-ups</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={2}
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim() || addNoteMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {customer.notes && customer.notes.length > 0 ? (
                      customer.notes.map((note) => (
                        <div
                          key={note.id}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            note.isCompleted ? "bg-muted/50" : "bg-muted"
                          }`}
                        >
                          <Checkbox
                            checked={note.isCompleted}
                            onCheckedChange={(checked) =>
                              handleToggleNote(note.id, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <p
                              className={`text-sm ${
                                note.isCompleted
                                  ? "line-through text-muted-foreground"
                                  : ""
                              }`}
                            >
                              {note.content}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(note.createdAt)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {note.type}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No notes yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function CustomerPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-96 rounded-lg lg:col-span-2" />
      </div>
    </div>
  );
}
