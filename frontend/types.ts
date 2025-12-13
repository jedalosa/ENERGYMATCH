// Domain entities for the Energy Platform

export type UserRole = 'client' | 'provider' | 'admin';
export type ClientType = 'company' | 'home';

export enum PropertyType {
  COMMERCIAL = 'Comercial',
  INDUSTRIAL = 'Industrial',
  RESIDENTIAL_OFFICE = 'Oficina Residencial',
  RESIDENTIAL_HOME = 'Casa/Residencia'
}

export interface UserProfile {
  clientType: ClientType;
  name: string;
  email: string;
  
  // Consumption Analysis
  monthlyConsumptionKWh: number;
  monthlyCostCOP: number;
  energyRate?: number; // Tarifa por kWh
  hasPeakConsumption?: boolean;
  operatingHours: number; // 1-24
  operatingDays: number; // 1-7

  // Property Characteristics
  propertyType: PropertyType;
  location: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
  neighborhood: string; // Barrio
  roofAreaM2: number; // Calculado internamente por el mapa, no preguntado

  // Resources & Goals
  budgetCOP: string; // Range string for simplicity in UI selection
}

export interface Recommendation {
  id: string;
  providerName: string; // New: Provider associated with this offer
  technology: 'Solar PV' | 'Eólica' | 'Híbrida';
  capacityKW: number;
  pricePerKW: number; // New: Base price per KW for ranking
  estimatedGenerationMonthly: number; // kWh
  roiYears: number;
  upfrontCost: number;
  savingsMonthly: number;
  co2Offset: number;
  confidenceScore: number;
  hash: string; // Web3 transparency hash
}

export interface Provider {
  id: string;
  name: string;
  rating: number; // 0-5
  verified: boolean;
  specialties: string[];
  certifications: string[];
  zone: string;
  
  // New Detailed Profile Fields
  energyTypes: string[]; // e.g. ["Solar", "Eólica"]
  adminPhone: string;
  adminEmail: string;
  contactPhone: string;
  contactEmail: string;
  website: string;
  pricePerKW: number;
  yearsExperience: number;
  serviceLocations: string[]; // e.g. ["Cartagena", "Toda Colombia"]
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}