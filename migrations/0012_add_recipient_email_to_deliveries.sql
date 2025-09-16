
-- Add recipient_email column to campaign_deliveries table
ALTER TABLE campaign_deliveries 
ADD COLUMN recipient_email VARCHAR(255);

-- Create index for performance
CREATE INDEX idx_campaign_deliveries_email ON campaign_deliveries(recipient_email);
