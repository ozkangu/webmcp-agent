export interface Airport {
  code: string;
  name: string;
}

export interface CabinClass {
  value: string;
  label: string;
}

export interface Flight {
  offerId: string;
  airline: string;
  flightNo: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  currency: string;
  cabinClass: string;
  aircraft: string;
  seatsAvailable: number;
}

export interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  cabinClass: string;
  passengers: number;
}

export interface SearchResult {
  success: boolean;
  date: string;
  resultCount: number;
  flights: Flight[];
  passengers: number;
}

export interface FormState {
  origin: string;
  destination: string;
  date: string;
  cabinClass: string;
  passengers: number;
  tripType: string;
}

export interface PassengerFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tcNo: string;
  birthDate: string;
  gender: string;
}

export type ViewType = 'search' | 'results' | 'passenger' | 'checkout';

export type WebSocketMessage =
  | { type: 'connected'; tools: ToolDefinition[] }
  | { type: 'tool_call'; callId: string; toolName: string; params: Record<string, unknown> }
  | { type: 'agent_thinking' }
  | { type: 'agent_response'; message: string }
  | { type: 'agent_error'; message: string };

export interface ToolDefinition {
  name: string;
  description: string;
  params?: string[];
}

export interface ToolCallMessage {
  type: 'tool_call';
  callId: string;
  toolName: string;
  params: Record<string, unknown>;
}

export interface ToolResultMessage {
  type: 'tool_result';
  callId: string;
  result: Record<string, unknown>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'thinking' | 'tool';
  content: string;
}
