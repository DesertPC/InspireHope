"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseClient } from "@/lib/supabase/client";
import { Star, Quote, Send } from "lucide-react";

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hover ?? value) >= starValue;
        return (
          <button
            key={i}
            type="button"
            className="p-0.5 focus:outline-none"
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(starValue)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                isFilled ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const supabase = useSupabaseClient();

  const loadTestimonials = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setTestimonials(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from("testimonials").insert({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        content: formData.get("content") as string,
        rating: rating || null,
        status: "pending",
      });

      if (error) throw error;

      setSuccess(true);
      (e.target as HTMLFormElement).reset();
      setRating(5);
      loadTestimonials();
    } catch (err: any) {
      setError(err.message || "Failed to submit testimonial");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.3),transparent_50%)]" />
        </div>
        <div className="relative container mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30 text-sm px-4 py-1">
              Share Your Story
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Testimonials
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Hear from the seniors and families we have served, and share your own experience
              with InspireHope Senior Center.
            </p>
          </div>
        </div>
      </section>

      {/* SUBMIT FORM */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-orange-500" />
                  Submit Your Testimonial
                </CardTitle>
              </CardHeader>
              <CardContent>
                {success && (
                  <Alert className="mb-6 bg-green-50 border-green-200">
                    <AlertDescription className="text-green-800">
                      Thank you! Your testimonial has been submitted for review.
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input id="name" name="name" required placeholder="Your full name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" name="email" type="email" required placeholder="your@email.com" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <StarInput value={rating} onChange={setRating} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Your Testimonial *</Label>
                    <Textarea
                      id="content"
                      name="content"
                      required
                      rows={5}
                      placeholder="Share your experience with InspireHope Senior Center..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Testimonial"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS GRID */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">What People Are Saying</h2>
            <p className="text-muted-foreground text-lg">
              Real stories from seniors and families in the Coachella Valley.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading testimonials...</p>
          ) : testimonials.length === 0 ? (
            <div className="text-center py-12">
              <Quote className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No testimonials yet. Be the first to share your story!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {testimonials.map((t) => (
                <Card key={t.id} className="border-0 shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <Quote className="h-8 w-8 text-orange-200" />
                    <p className="text-muted-foreground leading-relaxed">{t.content}</p>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <StarDisplay rating={t.rating} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
