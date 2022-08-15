DROP TABLE military_regulatorymissions;
CREATE TABLE military_regulatorymissions (
  eroc VARCHAR(2) CONSTRAINT military_eroc_pk PRIMARY KEY
  ,engineer_reporting_org_name VARCHAR(100) 
  ,usace_district_code VARCHAR(5)
  ,district_mission VARCHAR(50)
  ,military_area_of_resp text
);

COMMENT ON COLUMN military_regulatorymissions.eroc IS 'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN military_regulatorymissions.engineer_reporting_org_name IS 'The name of a US Army Corps of  Engineers organization or office.';
COMMENT ON COLUMN military_regulatorymissions.usace_district_code IS 'A unique five-digit code for each District referenced in SDSFIE.';
COMMENT ON COLUMN military_regulatorymissions.district_mission IS 'A Mission in the U.S. Army Corps of Engineers responding to changing defense requirements and plays an integral part in the development of the country.';
COMMENT ON COLUMN military_regulatorymissions.military_area_of_resp IS 'The geospatial coordinates of the boundary or area of responsibility (AOR) for each District containing a Military mission. ';