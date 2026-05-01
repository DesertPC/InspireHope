"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTestimonial, updateTestimonial } from "@/actions/testimonials.actions";
import { Star } from "lucide-react";
import type { TestimonialFormData } from "@/lib/validations/testimonial.schema";

interface TestimonialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial?: any;
  onSuccess: () => void;
}

function StarInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (rating: number | null) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = (hover ?? value ?? 0) >= starValue;
        return (
          <button
            key={i}
            type="button"
            className="p-0.5 focus:outline-none"
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(starValue === value ? null : starValue)}
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

export function TestimonialForm({ open, onOpenChange, testimonial, onSuccess }: TestimonialFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(testimonial?.rating ?? null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data: TestimonialFormData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      content: formData.get("content") as string,
      status: (formData.get("status") as "pending" | "approved" | "rejected") || "pending",
      rating,
    };

    try {
      if (testimonial) {
        await updateTestimonial(testimonial.id, data);
      } else {
        await createTestimonial(data);
      }
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{testimonial ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={testimonial?.name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" defaultValue={testimonial?.email} required />
          </div>

          <div className="space-y-2">
            <Label>Rating</Label>
            <StarInput value={rating} onChange={setRating} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Testimonial *</Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={testimonial?.content}
              required
              rows={5}
              placeholder="Enter the testimonial text..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue={testimonial?.status || "pending"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : testimonial ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
