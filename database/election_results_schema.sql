-- This SQL adds a candidate_name column to the election_results table
-- to make it easier to display results without additional joins

-- First, check if the column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'election_results' 
        AND column_name = 'candidate_name'
    ) THEN
        -- Add the candidate_name column
        ALTER TABLE election_results ADD COLUMN candidate_name TEXT;
        
        -- Update existing records with candidate names
        UPDATE election_results er
        SET candidate_name = c.name
        FROM candidates c
        WHERE er.candidate_id = c.id;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'election_results' 
        AND column_name = 'block_hash'
    ) THEN
        -- Add the block_hash column
        ALTER TABLE election_results ADD COLUMN block_hash TEXT;
        
        -- Update existing records with block hashes from votes table (if available)
        UPDATE election_results er
        SET block_hash = v.block_hash
        FROM votes v
        WHERE er.election_id = v.election_id 
        AND er.candidate_id = v.candidate_id
        AND v.block_hash IS NOT NULL
        LIMIT 1;
    END IF;
END $$;

-- Create a trigger to automatically update candidate_name when a new result is inserted
CREATE OR REPLACE FUNCTION update_candidate_name()
RETURNS TRIGGER AS $$
BEGIN
    SELECT name INTO NEW.candidate_name
    FROM candidates
    WHERE id = NEW.candidate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_trigger 
        WHERE tgname = 'update_candidate_name_trigger'
    ) THEN
        CREATE TRIGGER update_candidate_name_trigger
        BEFORE INSERT OR UPDATE ON election_results
        FOR EACH ROW
        EXECUTE FUNCTION update_candidate_name();
    END IF;
END $$;
