DROP TABLE cw_regulatorymissions;
CREATE TABLE cw_regulatorymissions (
  eroc VARCHAR(2) CONSTRAINT cw_reg_eroc_pk PRIMARY KEY
  ,engineer_reporting_org_name VARCHAR(100) 
  ,usace_district_code VARCHAR(5)
  ,district_mission VARCHAR(50)
  ,civil_works_area_of_resp text
  ,regulatory_area_of_resp text
);

COMMENT ON COLUMN cw_regulatorymissions.eroc IS 'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN cw_regulatorymissions.engineer_reporting_org_name IS 'The name of a US Army Corps of  Engineers organization or office.';
COMMENT ON COLUMN cw_regulatorymissions.usace_district_code IS 'A unique five-digit code for each District referenced in SDSFIE.';
COMMENT ON COLUMN cw_regulatorymissions.district_mission IS 'A Mission within USACE to serve the public by providing quality, responsive service to the Nation; develop and maintain the Nations water resources; support commercial navigation, restore, protect and manage aquatic ecosystems; flood risk management; provide engineer and technical services in an environmentally sustainable, economic and technically sound manner with a focus on public safety and collaborative partnerships.';
COMMENT ON COLUMN cw_regulatorymissions.civil_works_area_of_resp IS 'The geospatial coordinates of the Civil Works boundary or area of responsibility (AOR) for each District containing a Civil Works mission. ';
COMMENT ON COLUMN cw_regulatorymissions.regulatory_area_of_resp IS 'The geospatial coordinates of the regulatory boundary or area of responsibility (AOR) for each District containing a Civil Works mission. ';