export interface Schedule {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleFormData {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  scheduleId?: string;
  requiresMoreInfo?: boolean;
  missingFields?: string[];
  suggestions?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export interface MCPRequest {
  tool: string;
  arguments: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  message: string;
  data?: any;
  requiresMoreInfo?: boolean;
  missingFields?: string[];
  suggestions?: string[];
}

export interface ScheduleCreationRequest {
  title?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  isComplete: boolean;
  missingFields: string[];
}
