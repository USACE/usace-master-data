DROP TABLE environmentmissions_fusrap;
CREATE TABLE environmentmissions_fusrap (
  eroc VARCHAR(2) CONSTRAINT fudsrap_eroc_pk PRIMARY KEY
  ,engineer_reporting_org_name VARCHAR(100) 
  ,usace_district_code VARCHAR(5)
  ,district_mission VARCHAR(50)
  ,fusrap_area_of_responsibility text
);

COMMENT ON COLUMN environmentmissions_fusrap.eroc IS 'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN environmentmissions_fusrap.engineer_reporting_org_name IS 'The name of a US Army Corps of  Engineers organization or office.';
COMMENT ON COLUMN environmentmissions_fusrap.usace_district_code IS 'A unique five-digit code for each District referenced in SDSFIE.';
COMMENT ON COLUMN environmentmissions_fusrap.district_mission IS 'A mission of US Army Corps of Engineers environmental programs which support the warfighter and military installations worldwide as well as USACE public recreation facilities throughout the country. DOD is responsible for the environmental restoration (cleanup) of properties that were formerly owned by, leased to, or otherwise possessed by the United States and under the jurisdiction of the Secretary of Defense prior to October 1986. Such properties are known as Formerly Used Defense Sites or FUDS. USACE is cleaning up sites with contamination resulting from the Nations early atomic energy program under the Formerly Utilized Sites Remedial Action Program (FUSRAP).';
COMMENT ON COLUMN environmentmissions_fusrap.fusrap_area_of_responsibility IS 'The geospatial coordinates of the boundary or area of responsibility (AOR) for each District containing a FUSRAP environment mission. ';