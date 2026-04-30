"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Heart, HandHeart, Home, Car, Apple, HeartPulse, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const presetAmounts = [25, 50, 100, 250, 500, 1000];

const donationTypes = [
  { value: "general", label: "General Fund", icon: Heart, desc: "Support our overall mission" },
  { value: "transportation", label: "Transportation", icon: Car, desc: "Help seniors get to appointments" },
  { value: "housing", label: "Housing Assistance", icon: Home, desc: "Prevent eviction & homelessness" },
  { value: "wellness", label: "Wellness Programs", icon: HeartPulse, desc: "Health & wellness activities" },
  { value: "food_program", label: "Food Program", icon: Apple, desc: "Meals & nutrition support" },
  { value: "funeral_support", label: "Funeral Support", icon: HandHeart, desc: "Dignity in final arrangements" },
];

export default function DonatePage() {
  const [amount, setAmount] = useState<number | "custom">(100);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("general");
  const [isRecurring, setIsRecurring] = useState(false);
  const [coverFees, setCoverFees] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const finalAmount =
    amount === "custom" ? Number(customAmount) || 0 : amount;

  const feeAmount = coverFees ? Math.round((finalAmount * 0.022 + 0.30) * 100) / 100 : 0;
  const totalAmount = finalAmount + feeAmount;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="container mx-auto px-6 py-24 max-w-lg">
        <Card>
          <CardContent className="pt-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your donation of <strong>${totalAmount.toFixed(2)}</strong> to support{" "}
              <strong>{donationTypes.find((d) => d.value === donationType)?.label}</strong> has been
              recorded.
            </p>
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 text-sm">
                Online payment processing via Stripe will be enabled in the final version.
                For now, please contact us at <strong>care@isccv.com</strong> to complete your donation.
              </AlertDescription>
            </Alert>
            <Button variant="outline" onClick={() => setSubmitted(false)}>
              Make Another Donation
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12 max-w-3xl">
      <div className="text-center space-y-4 mb-10">
        <h1 className="text-4xl font-bold">Make a Donation</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Your generosity helps us provide essential services to seniors in the Coachella Valley.
          InspireHope is a 501(c)(3) nonprofit — all donations are tax-deductible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Amount Selection */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Select Amount</Label>
          <div className="grid grid-cols-3 gap-3">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={amount === preset ? "default" : "outline"}
                onClick={() => setAmount(preset)}
                className="h-14 text-lg"
              >
                ${preset}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={amount === "custom" ? "default" : "outline"}
              onClick={() => setAmount("custom")}
              className="h-14 px-6"
            >
              Custom
            </Button>
            {amount === "custom" && (
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="h-14 pl-7 text-lg"
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* Donation Type */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Designation</Label>
          <RadioGroup value={donationType} onValueChange={setDonationType} className="grid grid-cols-2 gap-3">
            {donationTypes.map((type) => (
              <div key={type.value}>
                <RadioGroupItem value={type.value} id={type.value} className="peer sr-only" />
                <Label
                  htmlFor={type.value}
                  className="flex items-start gap-3 p-4 border rounded-lg cursor-pointer hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                >
                  <type.icon className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.desc}</div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={isRecurring}
              onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
            />
            <Label htmlFor="recurring">Make this a monthly recurring donation</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="coverFees"
              checked={coverFees}
              onCheckedChange={(checked) => setCoverFees(checked as boolean)}
            />
            <Label htmlFor="coverFees">
              Cover processing fees (${feeAmount.toFixed(2)}) — 100% of your donation goes to our programs
            </Label>
          </div>
        </div>

        {/* Summary */}
        <Card className="bg-muted">
          <CardContent className="pt-6 space-y-2">
            <div className="flex justify-between">
              <span>Donation</span>
              <span>${finalAmount.toFixed(2)}</span>
            </div>
            {coverFees && (
              <div className="flex justify-between text-muted-foreground">
                <span>Processing fees</span>
                <span>${feeAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>${totalAmount.toFixed(2)}</span>
            </div>
            {isRecurring && (
              <p className="text-sm text-muted-foreground">{totalAmount.toFixed(2)} / month</p>
            )}
          </CardContent>
        </Card>

        {/* Donor Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Your Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="donorName">Full Name *</Label>
              <Input id="donorName" name="donorName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="donorEmail">Email *</Label>
              <Input id="donorEmail" name="donorEmail" type="email" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="donorPhone">Phone</Label>
            <Input id="donorPhone" name="donorPhone" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message (optional)</Label>
            <Textarea id="message" name="message" placeholder="Dedication, memory, or words of encouragement..." />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="anonymous" name="anonymous" />
            <Label htmlFor="anonymous">Make this donation anonymous</Label>
          </div>
        </div>

        <Button type="submit" className="w-full h-14 text-lg" disabled={finalAmount <= 0}>
          <Heart className="h-5 w-5 mr-2" />
          Donate ${totalAmount.toFixed(2)}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Secure donation. Tax receipt will be emailed. EIN: 85-1234567
        </p>
      </form>
    </div>
  );
}
