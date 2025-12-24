-- Items policies
CREATE POLICY "Anyone can view active items"
  ON items FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Item images policies
CREATE POLICY "Anyone can view item images"
  ON item_images FOR SELECT
  USING (true);

CREATE POLICY "Users can insert images for their items"
  ON item_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_images.item_id
      AND items.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their items"
  ON item_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = item_images.item_id
      AND items.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they received"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);
