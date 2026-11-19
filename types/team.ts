export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  roles: string[]
  is_active: boolean
  academic?: {
    institution?: string
    degree?: string
    department?: string
    graduation_year?: number
  }
  socials?: {
    linkedin?: string
    github?: string
  }
  created_at?: string
}

export interface AllocatedSpot {
  spot_id: string
  name: string
  code: string
  type: string
}

export interface AttendancePermission {
  scan: boolean
}

export interface Volunteer {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  attendance: AttendancePermission
  allocated_spot?: AllocatedSpot | null
}

export interface Organizer {
  user_id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  roles: string[]
  created_at?: string
}

export type SpotType = "gate" | "stage" | "desk" | "hall" | "pavilion" | "lounge" | "other"

export interface Spot {
  id: string
  name: string
  code: string
  type: SpotType
  description?: string
  building: string
  floor?: string
  room?: string
  capacity?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Checkpoint {
  id: string
  spot_id: string
  spot_name: string
  name: string
  description?: string
  is_mandatory: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Venue {
  id: string
  name: string
  code: string
  description?: string
  building: string
  floor?: string
  room?: string
  capacity: number
  amenities: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type SessionType =
  | "keynote"
  | "talk"
  | "workshop"
  | "panel"
  | "fireside_chat"
  | "lightning_talk"
  | "community"
  | "other"
  | "breakout"
  | "hackathon"

export interface Session {
  id: string
  title: string
  description: string
  session_type: SessionType | string
  speaker_ids: string[]
  venue_id: string
  start_at: string
  end_at: string
  capacity: number
  topics: string[]
  is_active: boolean
  speakers?: Speaker[]
  venue?: Venue
  created_at?: string
  updated_at?: string
}

export interface SpeakerSocials {
  linkedin?: string
  github?: string
  website?: string
}

export interface Speaker {
  id: string
  full_name: string
  designation: string
  company?: string
  bio: string
  profile_picture?: string
  socials: SpeakerSocials
  topics: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface TicketCategory {
  id: string
  name: string
  code: string
  description?: string
  price_in_paise: number
  quantity: number
  quantity_sold: number
  quantity_reserved: number
  available?: number
  sales_start: string
  sales_end: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface IssuedTicket {
  id: string
  ticket_code: string
  status: string
  category_name: string
  user_name: string
  user_email: string
  issued_at?: string
}

export interface OrderItem {
  category_id: string
  quantity: number
  price_in_paise: number
}

export interface Order {
  id: string
  user_name?: string
  user_email?: string
  user_id?: string
  status: "pending" | "paid" | "failed" | "cancelled"
  payment_status?: string
  total_amount: number
  items?: OrderItem[]
  razorpay_order_id?: string
  created_at: string
}

export interface AttendanceScanResult {
  success: boolean
  message: string
  attendee_name: string
  ticket_id: string
  checkpoint_id: string
  checkpoint_name: string
  scanned_at: string
}

export interface AttendanceLogItem {
  id: string
  attendee_name: string
  attendee_email: string
  checkpoint_name: string
  scanned_by: string
  scanned_at: string
}

export interface CheckpointCount {
  checkpoint_id: string
  name: string
  spot_name: string
  count: number
}

export interface AttendanceAnalytics {
  total_scans: number
  unique_attendees: number
  total_valid_tickets: number
  attendance_rate: number
  by_checkpoint: CheckpointCount[]
  recent_scans: AttendanceLogItem[]
}

export interface RegistrationAnalytics {
  total_orders: number
  paid_orders: number
  pending_orders: number
  failed_orders: number
  cancelled_orders: number
  total_revenue_in_inr: number
  categories: {
    id: string
    name: string
    price_in_paise: number
    quantity: number
    quantity_sold: number
    quantity_reserved: number
    available: number
    is_active: boolean
  }[]
  recent_orders: {
    id: string
    user_name: string
    user_email: string
    status: string
    payment_status?: string
    total_amount: number
    created_at: string
  }[]
}
