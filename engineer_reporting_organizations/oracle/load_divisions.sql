SET DEFINE OFF;
DELETE FROM divisions;

INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','H0','Great Lakes and Ohio River Division','CELRDOR');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','A0','Huntsville Engineering and Support Center',NULL);
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','B0','Mississippi Valley Division','CEMVD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','E0','North Atlantic Division','CENAD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','G0','Northwestern Division','CENWD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','J0','Pacific Ocean Division','CEPOD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','K0','South Atlantic Division','CESAD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','L0','South Pacific Division','CESPD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','M0','Southwestern Division','CESWD');
INSERT INTO divisions (hq_eroc,reports_to,eroc,division,usace_division_code) VALUES ('S0','Headquarters','N0','Trans Atlantic Division','CETAD');

COMMIT;