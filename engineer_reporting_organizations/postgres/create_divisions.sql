CREATE TABLE divisions (
	eroc	              character varying(2)
	,hq_eroc	          character varying(2)
	,reports_to	          character varying(200)
	,division	          character varying(200)
	,usace_division_code  character varying(5)
);

ALTER TABLE divisions ADD CONSTRAINT eroc_divisions_pk PRIMARY KEY (eroc);


COMMENT ON COLUMN divisions.eroc IS  'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN divisions.hq_eroc IS  'A unique two-digit code for HQUSACE.';
COMMENT ON COLUMN divisions.reports_to IS  'The Engineer Reporting Organization (ERO) name the lower ranking organization reports to.';
COMMENT ON COLUMN divisions.division IS  'The name of the US Army Corps of Engineers Division';
COMMENT ON COLUMN divisions.usace_division_code IS  'A unique five-digit code for each Division referenced in SDSFIE.';