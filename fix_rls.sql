-- Drop the existing policies for session_characters
DROP POLICY IF EXISTS "Players can link characters" ON session_characters;
DROP POLICY IF EXISTS "People can see session links" ON session_characters;

-- Let anyone insert if they own the investigator
CREATE POLICY "Players can link characters"
  ON session_characters FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investigators
      WHERE id = investigator_id AND user_id = auth.uid()
    )
  );

-- Keepers can see all links, players can see links they are part of
CREATE POLICY "People can see session links"
  ON session_characters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE id = session_id AND keeper_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM investigators
      WHERE id = investigator_id AND user_id = auth.uid()
    )
    OR
    EXISTS (
      -- As a keeper, I should be able to see links for my sessions
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'KEEPER'
    )
  );
