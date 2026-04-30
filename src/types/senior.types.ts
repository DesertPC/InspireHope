export interface Senior {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  address: string | null;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  email: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  primaryNeeds: string[];
  languages: string[];
  iehpMember: boolean;
  iehpId: string | null;
  housingStatus: "stable" | "at_risk" | "homeless" | "temporary" | null;
  incomeLevel: "low" | "moderate" | "above_moderate" | null;
  isActive: boolean;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}
