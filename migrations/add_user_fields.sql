-- Add new columns to users table if they don't exist
DO $$
BEGIN
    -- Add year_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'year_level') THEN
        ALTER TABLE users ADD COLUMN year_level VARCHAR(20);
    END IF;

    -- Add user_img column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'user_img') THEN
        ALTER TABLE users ADD COLUMN user_img TEXT;
    END IF;

    -- Add user_mnemonic column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'user_mnemonic') THEN
        ALTER TABLE users ADD COLUMN user_mnemonic VARCHAR(255);
    END IF;

    -- Ensure user_wallets table exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                   WHERE table_name = 'user_wallets') THEN
        CREATE TABLE user_wallets (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES users(id) ON DELETE CASCADE,
            wallet_address VARCHAR(255) NOT NULL,
            encrypted_private_key TEXT NOT NULL,
            mnemonic_phrase TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;

    -- Add mnemonic_phrase column to user_wallets if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_wallets' AND column_name = 'mnemonic_phrase') THEN
        ALTER TABLE user_wallets ADD COLUMN mnemonic_phrase TEXT;
    END IF;
END
$$;
