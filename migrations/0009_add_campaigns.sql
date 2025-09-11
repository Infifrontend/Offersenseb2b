
-- Create campaigns table
CREATE TABLE campaigns (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code VARCHAR(50) NOT NULL UNIQUE,
  campaign_name VARCHAR(200) NOT NULL,
  target JSONB NOT NULL,
  products JSONB NOT NULL,
  offer JSONB NOT NULL,
  lifecycle JSONB NOT NULL,
  comms JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT', -- DRAFT | ACTIVE | PAUSED | COMPLETED | CANCELLED
  created_by VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create campaign metrics table
CREATE TABLE campaign_metrics (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  purchased INTEGER DEFAULT 0,
  revenue_uplift DECIMAL(10, 2) DEFAULT 0,
  attach_rate DECIMAL(5, 2) DEFAULT 0,
  roi DECIMAL(5, 2) DEFAULT 0,
  breakdown JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (campaign_code) REFERENCES campaigns(campaign_code)
);

-- Create campaign deliveries table for tracking individual sends
CREATE TABLE campaign_deliveries (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_code VARCHAR(50) NOT NULL,
  booking_reference VARCHAR(50) NOT NULL,
  agent_id VARCHAR(50) NOT NULL,
  delivery_channel VARCHAR(20) NOT NULL, -- PORTAL | EMAIL | WHATSAPP | API
  delivery_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING | SENT | DELIVERED | FAILED
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  purchased_at TIMESTAMP,
  purchase_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (campaign_code) REFERENCES campaigns(campaign_code)
);

-- Create indexes for performance
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_code ON campaigns(campaign_code);
CREATE INDEX idx_campaign_metrics_code_date ON campaign_metrics(campaign_code, date);
CREATE INDEX idx_campaign_deliveries_code ON campaign_deliveries(campaign_code);
CREATE INDEX idx_campaign_deliveries_booking ON campaign_deliveries(booking_reference);
