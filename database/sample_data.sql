-- Insert sample data for the voting system

-- Election Types
INSERT INTO election_types (id, name) VALUES 
  ('e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Student Council'),
  ('e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 'Department Representatives'),
  ('e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 'Club Officers');

-- Departments
INSERT INTO departments (id, name) VALUES 
  ('d1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 'Computer Science'),
  ('d2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 'Engineering'),
  ('d3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 'Business Administration');

-- Users (Admin and Voters)
INSERT INTO users (id, student_id, name, email, role, department_id) VALUES 
  ('a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', 'ADMIN001', 'Admin User', 'admin@example.com', 'admin', NULL),
  ('u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 'CS001', 'John Doe', 'john@example.com', 'voter', 'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a'),
  ('u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a', 'CS002', 'Jane Smith', 'jane@example.com', 'voter', 'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a'),
  ('u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 'ENG001', 'Bob Johnson', 'bob@example.com', 'voter', 'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a'),
  ('u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 'BUS001', 'Alice Brown', 'alice@example.com', 'voter', 'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a');

-- Positions
INSERT INTO positions (id, election_type_id, name, display_order) VALUES 
  ('p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'President', 1),
  ('p2b5a2p0-5p2a-4c2a-8c2a-2p2a2p2a2p2a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Vice President', 2),
  ('p3b5a3p0-5p3a-4c3a-8c3a-3p3a3p3a3p3a', 'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 'Secretary', 3),
  ('p4b5a4p0-5p4a-4c4a-8c4a-4p4a4p4a4p4a', 'e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 'Department Representative', 1);

-- Elections (Active, Completed, and Draft)
INSERT INTO elections (id, title, description, status, end_date, election_type_id, department_id, created_by, show_results) VALUES 
  (
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'Student Council Election 2023', 
    'Vote for your student council representatives for the academic year 2023-2024.', 
    'active', 
    NOW() + INTERVAL '7 days', 
    'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e2b5a2e1-5e2a-4c2a-8c2a-2e2a2e2a2e2a', 
    'Computer Science Department Representatives', 
    'Vote for your CS department representatives.', 
    'active', 
    NOW() + INTERVAL '5 days', 
    'e2b5a2e0-5e2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e3b5a3e1-5e3a-4c3a-8c3a-3e3a3e3a3e3a', 
    'Club Officers Election', 
    'Vote for your club officers for the upcoming year.', 
    'draft', 
    NOW() + INTERVAL '14 days', 
    'e3b5a3e0-5e3a-4c3a-8c3a-3c3a3c3a3c3a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    FALSE
  ),
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'Previous Student Council Election', 
    'Results of the previous student council election.', 
    'completed', 
    NOW() - INTERVAL '30 days', 
    'e1b5a1e0-5e1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a',
    TRUE
  );

-- Candidates
INSERT INTO candidates (id, election_id, position_id, user_id, department_id, name, info) VALUES 
  (
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'John Doe', 
    'Experienced leader with a vision for improving student life.'
  ),
  (
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u2b5a2u0-5u2a-4c2a-8c2a-2u2a2u2a2u2a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'Jane Smith', 
    'Dedicated to creating an inclusive campus environment.'
  ),
  (
    'c3b5a3c0-5c3a-4c3a-8c3a-3c3a3c3a3c3a', 
    'e1b5a1e1-5e1a-4c1a-8c1a-1e1a1e1a1e1a', 
    'p2b5a2p0-5p2a-4c2a-8c2a-2p2a2p2a2p2a', 
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    'Bob Johnson', 
    'Focused on improving academic resources and support.'
  ),
  (
    'c4b5a4c0-5c4a-4c4a-8c4a-4c4a4c4a4c4a', 
    'e2b5a2e1-5e2a-4c2a-8c2a-2e2a2e2a2e2a', 
    'p4b5a4p0-5p4a-4c4a-8c4a-4p4a4p4a4p4a', 
    'u1b5a1u0-5u1a-4c1a-8c1a-1u1a1u1a1u1a', 
    'd1b5a1d0-5d1a-4c1a-8c1a-1d1a1d1a1d1a', 
    'John Doe', 
    'Advocating for CS curriculum improvements.'
  );

-- Sample votes with blockchain hashes
INSERT INTO votes (election_id, position_id, user_id, candidate_id, department_id, block_hash, transaction_hash) VALUES 
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    'd2b5a2d0-5d2a-4c2a-8c2a-2d2a2d2a2d2a', 
    '0x8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b', 
    '0x4bfc7ccd4b4741a031d5af7e1a1029d718a1f57649d933d96ce4c87e51f11d8e'
  ),
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    'd3b5a3d0-5d3a-4c3a-8c3a-3d3a3d3a3d3a', 
    '0x7d9fa1c22c4a30c3f7130f16fcb6b4e65a3876a2f79778e55a592eae8f7c0a2f', 
    '0x3e8cc75157b16b3a7a67139e8c1db24a3d2747eb5f1511bbbf0ff9fcd3855e3c'
  );

-- Sample election results
INSERT INTO election_results (election_id, position_id, candidate_id, department_id, total_votes, department_votes, department_eligible_voters, department_percentage, is_winner) VALUES 
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'c1b5a1c0-5c1a-4c1a-8c1a-1c1a1c1a1c1a', 
    NULL, 
    1, 
    0, 
    0, 
    0, 
    TRUE
  ),
  (
    'e4b5a4e1-5e4a-4c4a-8c4a-4e4a4e4a4e4a', 
    'p1b5a1p0-5p1a-4c1a-8c1a-1p1a1p1a1p1a', 
    'c2b5a2c0-5c2a-4c2a-8c2a-2c2a2c2a2c2a', 
    NULL, 
    1, 
    0, 
    0, 
    0, 
    FALSE
  );

-- Sample system logs
INSERT INTO system_logs (event_type, user_id, details) VALUES 
  ('USER_LOGIN', 'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', 'Admin user logged in'),
  ('ELECTION_CREATED', 'a1b5a1a0-5a1a-4c1a-8c1a-1a1a1a1a1a1a', 'Created Student Council Election 2023'),
  ('VOTE_CAST', 'u3b5a3u0-5u3a-4c3a-8c3a-3u3a3u3a3u3a', 'Vote cast in Previous Student Council Election'),
  ('VOTE_CAST', 'u4b5a4u0-5u4a-4c4a-8c4a-4u4a4u4a4u4a', 'Vote cast in Previous Student Council Election');
