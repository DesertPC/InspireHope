import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

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

export async function TestimonialsSection({ locale }: { locale: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(6);

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-8">
        <Quote className="h-10 w-10 text-slate-200 mx-auto mb-3" />
        <p className="text-muted-foreground">
          Be the first to share your story!
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {testimonials.map((t) => (
        <Card key={t.id} className="border-0 shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Quote className="h-8 w-8 text-orange-200" />
            <p className="text-muted-foreground leading-relaxed line-clamp-4">{t.content}</p>
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
  );
}
