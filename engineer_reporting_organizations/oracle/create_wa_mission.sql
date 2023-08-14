CREATE TABLE wa_mission (
  eroc                          VARCHAR2(2)
  ,engineer_reporting_org_name  VARCHAR2(60)
  ,district_mission             VARCHAR2(60)
);

ALTER TABLE wa_mission ADD CONSTRAINT eroc_wa_mission_pk PRIMARY KEY (eroc);

COMMENT ON COLUMN wa_mission.eroc IS 'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN wa_mission.engineer_reporting_org_name IS 'The name of a US Army Corps of  Engineers organization or office.';
COMMENT ON COLUMN wa_mission.district_mission IS 'A mission of US Army Corps of Engineers environmental programs which support the warfighter and military installations worldwide as well as USACE public recreation facilities throughout the country. DOD is responsible for the environmental restoration (cleanup) of properties that were formerly owned by, leased to, or otherwise possessed by the United States and under the jurisdiction of the Secretary of Defense prior to October 1986. Such properties are known as Formerly Used Defense Sites or FUDS. USACE is cleaning up sites with contamination resulting from the Nation’s early atomic energy program under the Formerly Utilized Sites Remedial Action Program (FUSRAP).';