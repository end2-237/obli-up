// frontend/src/services/formService.js
import { supabase } from "../lib/supabase";

export const formService = {
  // Envoyer un message de contact
  async sendContactMessage(formData) {
    const { data, error } = await supabase
      .from("contact_messages")
      .insert([
        {
          name: formData.fullName,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          status: "new",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Créer une commande QR
  async createQROrder(orderData) {
    const { data, error } = await supabase
      .from("qr_orders")
      .insert([
        {
          user_id: orderData.userId,
          package_id: orderData.packageId,
          package_name: orderData.packageName,
          quantity: orderData.quantity,
          price: orderData.price,
          delivery_fee: orderData.deliveryFee,
          total_price: orderData.totalPrice,
          
          // Informations personnelles
          full_name: orderData.personalInfo.fullName,
          email: orderData.personalInfo.email,
          phone: orderData.personalInfo.phone,
          secondary_phone: orderData.personalInfo.secondaryPhone,
          
          // Adresse de livraison
          address: orderData.personalInfo.address,
          city: orderData.personalInfo.city,
          postal_code: orderData.personalInfo.postalCode,
          
          // Configuration QR
          object_types: orderData.qrConfig.objectTypes,
          custom_message: orderData.qrConfig.customMessage,
          notification_preference: orderData.qrConfig.notificationPreference,
          
          status: "pending",
          payment_status: "pending",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Envoyer un message depuis ItemDetail
  async sendItemMessage(messageData) {
    const { data, error } = await supabase
      .from("item_messages")
      .insert([
        {
          item_id: messageData.itemId,
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          sender_name: messageData.senderName,
          sender_email: messageData.senderEmail,
          message: messageData.message,
          status: "new",
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les messages d'un item
  async getItemMessages(itemId) {
    const { data, error } = await supabase
      .from("item_messages")
      .select("*")
      .eq("item_id", itemId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Récupérer les commandes d'un utilisateur
  async getUserOrders(userId) {
    const { data, error } = await supabase
      .from("qr_orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};

/*
TABLES SQL À CRÉER DANS SUPABASE :

-- Table pour les messages de contact
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les commandes QR
CREATE TABLE qr_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  package_id INTEGER NOT NULL,
  package_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  delivery_fee INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  secondary_phone TEXT,
  
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT,
  
  object_types JSONB,
  custom_message TEXT,
  notification_preference TEXT DEFAULT 'both',
  
  status TEXT DEFAULT 'pending',
  payment_status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les messages des items
CREATE TABLE item_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  receiver_id UUID REFERENCES auth.users(id),
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_contact_messages_status ON contact_messages(status);
CREATE INDEX idx_qr_orders_user ON qr_orders(user_id);
CREATE INDEX idx_qr_orders_status ON qr_orders(status);
CREATE INDEX idx_item_messages_item ON item_messages(item_id);
CREATE INDEX idx_item_messages_receiver ON item_messages(receiver_id);

-- RLS Policies
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own orders" ON qr_orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON qr_orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view messages for their items" ON item_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON item_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
*/