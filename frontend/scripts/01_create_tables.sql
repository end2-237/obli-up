-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'found', 'claimed')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create images table
CREATE TABLE IF NOT EXISTS item_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_type_idx ON items(type);
CREATE INDEX IF NOT EXISTS items_category_idx ON items(category);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);
CREATE INDEX IF NOT EXISTS item_images_item_id_idx ON item_images(item_id);
CREATE INDEX IF NOT EXISTS messages_item_id_idx ON messages(item_id);
CREATE INDEX IF NOT EXISTS messages_receiver_id_idx ON messages(receiver_id);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;


-- Ajouter les champs de vérification
ALTER TABLE items ADD COLUMN proof_data JSONB;
ALTER TABLE items ADD COLUMN proof_fields_config JSONB;
ALTER TABLE items ADD COLUMN verification_required BOOLEAN DEFAULT true;

-- Table pour stocker les tentatives de vérification
CREATE TABLE verification_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id),
  user_id UUID REFERENCES auth.users(id),
  answers JSONB NOT NULL,
  score INTEGER,
  success BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table pour les paiements validés
CREATE TABLE verified_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id),
  user_id UUID REFERENCES auth.users(id),
  verification_score INTEGER,
  payment_status TEXT,
  payment_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
