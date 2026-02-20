-- Allow everyone to read all investigators
DROP POLICY IF EXISTS "Keepers view all, Players view own" ON investigators;

CREATE POLICY "Keepers view all, Players view own"
  ON investigators FOR SELECT
  USING (true);

-- Ensure people can see session links
DROP POLICY IF EXISTS "People can see session links" ON session_characters;

CREATE POLICY "People can see session links"
  ON session_characters FOR SELECT
  USING (true);
