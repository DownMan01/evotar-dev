-- Add wallet_address column to users table
ALTER TABLE public.users
ADD COLUMN wallet_address VARCHAR(42);

-- Create a table to store user wallet information securely
CREATE TABLE public.user_wallets (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  encrypted_private_key TEXT NOT NULL,
  mnemonic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(wallet_address)
);

-- Add blockchain-related columns to elections table
ALTER TABLE public.elections
ADD COLUMN blockchain_id VARCHAR(78),
ADD COLUMN block_hash VARCHAR(66),
ADD COLUMN transaction_hash VARCHAR(66),
ADD COLUMN results_transaction_hash VARCHAR(66);

-- Add blockchain-related columns to votes table
ALTER TABLE public.votes
ADD COLUMN block_hash VARCHAR(66),
ADD COLUMN transaction_hash VARCHAR(66);

-- Create a table to store blockchain transactions
CREATE TABLE public.blockchain_transactions (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  transaction_hash VARCHAR(66) NOT NULL,
  block_hash VARCHAR(66) NOT NULL,
  block_number BIGINT NOT NULL,
  from_address VARCHAR(42) NOT NULL,
  to_address VARCHAR(42) NOT NULL,
  value VARCHAR(78) DEFAULT '0',
  gas_used BIGINT,
  gas_price VARCHAR(78),
  input TEXT,
  event_type VARCHAR(50),
  related_entity_id UUID,
  related_entity_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(transaction_hash)
);

-- Create an index for faster lookups
CREATE INDEX idx_blockchain_transactions_related_entity ON public.blockchain_transactions(related_entity_type, related_entity_id);
