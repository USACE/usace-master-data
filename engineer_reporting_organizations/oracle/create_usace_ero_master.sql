DROP TABLE usace_ero_master;
CREATE TABLE usace_ero_master(
  eroc                         VARCHAR2(2)
  ,ero_type                    VARCHAR2(10)
  ,parent_eroc                 VARCHAR2(2)
  ,agency_code                 VARCHAR2(10)
  ,agency_symbol               VARCHAR2(7)
  ,engineer_reporting_org_name VARCHAR2(100)
  ,alt_name                    VARCHAR2(100)
  ,ero_shortname               VARCHAR2(50)
  ,ero_formalname              VARCHAR2(50)
  ,oconus                      VARCHAR2(1)
  ,reports_to                  VARCHAR2(50)
  ,hq_eroc                     VARCHAR2(2)
  ,div_eroc                    VARCHAR2(2)
  ,usace_division_code         VARCHAR2(10)
  ,usace_district_code         VARCHAR2(5)
);

ALTER TABLE usace_ero_master ADD CONSTRAINT eroc_pk PRIMARY KEY (eroc);

COMMENT ON COLUMN usace_ero_master.ero_type IS 'The type of US Army Corps of  Engineers (USACE) Engineer Reporting Organization';
COMMENT ON COLUMN usace_ero_master.parent_eroc IS 'The EROC, or unique two-digit code, that each organization reports to.';
COMMENT ON COLUMN usace_ero_master.eroc IS 'A unique two-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE.';
COMMENT ON COLUMN usace_ero_master.agency_code IS 'A unique three-digit code for each District, Division, Field Operating Activity (FOA), or HQUSACE. Construction of office symbols and commonly used letter designators to create office symbols by the Records Manager in the US Army Corps of Engineers after receipt of a signed permanent order from RMO. From ER 25-59-1';
COMMENT ON COLUMN usace_ero_master.agency_symbol IS 'A unique five-digit code representing the office symbol for the District, Division, Field Operating Activity (FOA), or HQUSACE. Construction of office symbols and commonly used letter designators to create office symbols by the Records Manager in the US Army Corps of Engineers after receipt of a signed permanent order from RMO. From ER 25-59-1';
COMMENT ON COLUMN usace_ero_master.engineer_reporting_org_name IS 'The name of a US Army Corps of  Engineers organization or office.';
COMMENT ON COLUMN usace_ero_master.alt_name IS 'An alternative name for an Engineer Reporting Organization for the US Army Corps of Engineers';
COMMENT ON COLUMN usace_ero_master.ero_shortname IS 'The shortened name of the Engineer Reporting Organization name for the US Army Corps of Engineers';
COMMENT ON COLUMN usace_ero_master.ero_formalname IS 'The full formal name of the Engineer Reporting Organization name for the US Army Corps of Engineers';
COMMENT ON COLUMN usace_ero_master.oconus IS 'Organization or office located outside the continential United States';
COMMENT ON COLUMN usace_ero_master.reports_to IS 'The Engineer Reporting Organization (ERO) name the lower ranking organization reports to.';
COMMENT ON COLUMN usace_ero_master.hq_eroc IS 'A unique two-digit code for HQUSACE.';
COMMENT ON COLUMN usace_ero_master.div_eroc IS 'A unique two-digit code for each Division.';
COMMENT ON COLUMN usace_ero_master.usace_division_code IS 'A unique five-digit code for each Division referenced in SDSFIE.';
COMMENT ON COLUMN usace_ero_master.usace_district_code IS 'A unique five-digit code for each District referenced in SDSFIE.';