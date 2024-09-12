CREATE TABLE districts (
	eroc	              VARCHAR2(2)
	,div_eroc	          VARCHAR2(2)
	,division	          VARCHAR2(200)
	,district	          VARCHAR2(200)
	,usace_district_code  VARCHAR2(5)
);

ALTER TABLE districts ADD CONSTRAINT eroc_districts_pk PRIMARY KEY (eroc);

COMMENT ON COLUMN districts.eroc IS  'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN districts.div_eroc IS  'A unique two-digit code for a US Army Corps of Engineers Division.';
COMMENT ON COLUMN districts.division IS  'The name of the US Army Corps of Engineers Division';
COMMENT ON COLUMN districts.district IS  'The name of the US Army Corps of Engineers District';
COMMENT ON COLUMN districts.usace_district_code IS  'A unique five-digit code for each District referenced in SDSFIE.';