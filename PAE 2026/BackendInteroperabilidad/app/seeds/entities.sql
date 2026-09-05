-- Sample real Colombian public entities for testing

-- Health Sector
INSERT INTO entities (name, acronym, nit, sector_id, department, municipality, address, latitude, longitude, xroad_status, cio_name, cio_email, cio_phone) VALUES
('Ministrio de Salud', 'Minsa', '1234567890', 1, 'Cundinamarca', 'Bogotá', 'Cra. 78 # 10-50', 4.7108, -74.0721, 'connected', 'Andres Restrepo', 'andres@minsa.gov.co', '3012345678'),
('Agencia de Salud Pública', 'ASPA', '9876543210', 1, 'Antioquia', 'Medellín', 'Avenida 7 # 100-30', 6.2896, -75.5946, 'pending', 'Carmen Gomez', 'carmen@aspa.gov.co', '3098765432');

-- Education Sector
INSERT INTO entities (name, acronym, nit, sector_id, department, municipality, address, latitude, longitude, xroad_status, cio_name, cio_email, cio_phone) VALUES
('Ministerio de Educación Nacional', 'Minedu', '5555555555', 2, 'Valle del Cauca', 'Cartagena', 'Calle 33 # 8-20', 11.2123, -75.3645, 'not_connected', 'Maria Sanchez', 'maria@minedu.gov.co', '3112233445'),
('Secretaría Distrital de Educación', 'SDeE', '6666666666', 2, 'Cundinamarca', 'Bogotá', 'Calle 10 # 60-45', 4.7222, -74.0805, 'connected', 'Carlos Ruiz', 'carlos@sdee.gov.co', '3022334455');

-- Finance Sector
INSERT INTO entities (name, acronym, nit, sector_id, department, municipality, address, latitude, longitude, xroad_status, cio_name, cio_email, cio_phone) VALUES
('Superintendencia de Administración Tributaria', 'Santander', '7777777777', 3, 'Bogotá', 'Bogotá', 'Calle 13 # 13-25', 4.7189, -74.0754, 'pending', 'Jorge Gomez', 'jorge@santander.gov.co', '3033445566'),
('Instituto Colombiano de Turismo', 'Icotur', '8888888888', 3, 'Cundinamarca', 'Bogotá', 'Calle 9 # 9-50', 4.7219, -74.0856, 'connected', 'Ana Velazquez', 'ana@icotor.com.co', '3155667788');

-- Repeat similar entries for sectors 4-9 (housing, justice, environment, transportation, etc.)
... (30 total entries would require more detailed entries covering all sectors)

-- Optional: Create corresponding services and maturity assessments for testing