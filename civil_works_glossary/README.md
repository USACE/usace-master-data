# Glossary Tool Suite

This suite of tools and glossary documents support essential technical governance activities such as defining and transforming authoritiave, source-derived glossary terms and definitions into structured glossary documents (SKOS). [glossaries/glossaries.md](Glossaries) Source metadata

Artifact inputs in YAML, JSON, and XML are supported, with automated transformation to SKOS vocabularies tologies in several RDF encoding options, and automated production of reports based on the YAML,JSON,XML sources formats (using customizable Jinja2 templates).

Below is an overview of the tools, and how to use them wihtin modern digital engineering CONOPS. The Glossary Tool Suite (GTS) leverages a set of makefile-based build-rules to support glossary operations including, import, revision, review, validation, and transform of digital model and governance artifacts into human and machine consumable documents. These artifacts are part of a larger governance effort to capture and navigate interconnection Civil Works knowledge as a knowledge graph. Other artifacts such as ontologies, data schema, and datasets also form this knowledge graph.

## Synopsis

A separate document describes the glossary schema, but 

## Civil Works Glossary Operations GlossOps
Civil Works Glosary Operations (CW GlossOps) is an early prototype of Glossary Operations (GlossOps), which is a specialized Model Operations process customized for USACE Civil Works glossary governance activities. Establshing officially sanctioned terms and definitions is an essential goverance activity within any organization, but it is particularly important within large technical organizations. Business operations produce many, highly specialized vocabularies that require precise and agreed upon definitions and interpretation to effectively communicate business functions and ensure continutity of operations.

The glossaries herein are organized by authoritative sources, such as Army, DoD, Federal Regulations, Manuals, Memoranda, Circulars, or other Guidance. Terms and definitions derived from these authoritative sources of truth are often contextual, as they are inherently bound to the source document. The glossaries establish a common understanding for the meanings
of everyday terms used across the business.

Glossary terms and definitions support downstream knowledge engineering activities such as ontology creation and schema elaboration. These activities often involve the bridging of technical
nomenclature found within engineering guidance and policy and process-oriented terminology within foundational regulations and operational guidance documents.

# Overview of Legacy Glossary Practices
Typical glossary sources consist of business level office documents, e.g. Word, PDF, and HTML. These traditional glossary forms have proven to be unsatisfactory within modern, sustainable digital governance activities. These forms are impractical to sufficiently organize, structure, and automate the maintenance of enterprise governance knowledge. Although Office documents are useful for review activities,
they rely too heavily on style conventions that vary widely, are too easily ignored, and difficult to, maintain, validate and automate.

# Tool Summary
loadXL - a one-time utility to consume Excel spreadsheets contained glossary terms and transform into YAML-encoded files, one glossary for each source. Thereafter, glossary revisions should
be applied to these YAML documents, and the intermediate Excel documents archived or discarded.

gloss  - Transcribles a manually revised YAML encoded glossary into a read-only RDF-encoded SKOS document suitable for graph-based processing and analytics, such a building a knowledge graph.

## Tools Overview

### 1. `gloss.py`
`gloss.py` is a Python utility that uses glossary data classes to transform structured source glossary vocabulary documents (YAML) into RDF ontology documents. Glossaries are organized according to the Authoritative Source, and divided into three sections:

About - Context concerning the source of the glossary terms, including links, title, description, and a base namespace URI used to uniquely.

Terms - Glossary terms, definitions, source citations, and alternative terms.

Abbreviations - Abbreviations defined in the source document where the terms are used.

### 2. `jinja.py`
`jinja.py` A Pyton tool to 'render' glossary terms and abbreviations defined within the structured document using a Jinja2 template, resulting to an HTML document. It supports input from YAML, JSON, and XML files and outputs to a specified file or stdout. Jinja2 templates are customizable to generate any text-based document format.

### 3. `make`
Makefiles are used to manage complex build dependencies by defining simple build targets. For example, upon each revision of source glossary document (i.e. yaml), an HTML, DOCX, an PDF version of the document can be automatically generated. Also an ontology derived from , along with document
The `Makefile` provides convenient commands for common tasks, such as generated glossaries and cleaning up generated files.

## CLI Options

### `jinja.py` CLI Options

`jinja.py` is the main entry point for rendering glossaries. It accepts the following command-line options:

- `--input` or `-i`: Path to the input file (YAML, JSON, or XML), or stdin.
- `--type` or `-t`: Type of the input file (`yaml`, `json`, `xml`) [required for stdin].
- `--template` or `-t`: Path to the report template.
- `--output` or `-o`: Output file path.

### 4. `loadXL.py`

`loadXL.py` is a script to load data from multiple-sheet Excel files into a structured format suitable for processing by the glossary tools. It's an extension for handling data sources beyond YAML, JSON, and XML.

#### Example Usage

```bash
python jinja.py --input glossaries/CivilWorks/ER-1110-1-1156.yaml --template templates/glossary_template.html --output glossaries/CivilWorks/RDF/ER-1110-1-1156.ttl
```

This command renders the `ER-1110-1-1156.yaml` file using `template.html` and outputs the result to `output.html`.

## Makefile Commands
The `Makefile` includes commands for rendering glossaries and cleaning up.
Here are the key commands:
- `make stage-gloss`: Build glossary documentation, validating each source glossary.
- `make stage-xrdf`: Builds RDF ontolologies and documentation, and ontology verification artifacts.
- `make stage-pkg`: Builds an archive containing source and derived RDF ontolologies and documentation.
- `make clean`: Removes generated files, preserves source documents.

#### Example Usage

```bash
make render
```

This command renders the default glossary using predefined settings in the `Makefile`.

## Example Workflow

1. **Prepare Your Data**: Ensure your glossary data is in one of the supported formats (YAML, JSON, XML) or use `loadXL.py` to convert from Excel.
2. **Prepare Your Template**: Create a Jinja2 template for rendering. The template should be designed to iterate over terms and abbreviations, handling URLs as hyperlinks.
3. **Render Glossary**: Use `jinja.py` to render your glossary with the template.

```bash
python jinja.py --input glossaries/your_glossary.yaml --type yaml --template your_template.html --output your_output.html
```

Replace `your_glossary.yaml`, `your_template.html`, and `your_output.html` with your actual file names.

## Advanced Usage

### Customizing `jinja.py`

To customize `jinja.py` for different inputs or templates, modify the command-line options accordingly. For example, to use JSON input:

```bash
python jinja.py --input glossaries/your_glossary.json --type json --template your_template.html --output your_output.html
```

### Using `loadXL.py`

If your data starts in Excel format, use `loadXL.py` to convert it to a supported format before rendering. Then, render the converted file with `jinja.py`.

```bash
python loadXL.py --input glossary-spreadsheet.xlsx --output sheet-name.yaml
```

# Sample Glossary Documents

## Source: CFR-33-329-4.yaml
```yaml
about:
    namespace: https://usace-data.com/civil-works/glossary/CFR-33-329-4#
    prefix: CFR-33-329-4
    template: glossary
    title:  Code of Federal Regulations - Title 33, Chapter-II, Part 329, Section-329.4
    source:
        linkType: cfr
        sourceID: CFR-33-329-4
        authoritativeSource: 33 CFR 329.4 Definitions
        glossaryReferences: true
        url: https://www.ecfr.gov/current/title-33/chapter-II/part-329/section-329.4
terms:
- label: Navigable Waters
  definition: Navigable waters of the United States are those waters that are subject
    to the ebb and flow of the tide and/or are presently used, or have been used in
    the past, or may be susceptible for use to transport interstate or foreign commerce.
    A determination of navigability, once made, applies laterally over the entire
    surface of the waterbody, and is not extinguished by later actions or events which
    impede or destroy navigable capacity.
  anchor: '1'
```
```html
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
                background-color: #f0f0f0;
            }
            .container {
                display: flex;
                max-width: 1200px;
                margin: 10px auto;
            }
            .sidebar {
                flex: 1;
                padding: 20px;
                background-color: #e6e6e6;
                height: 100vh;
                width: 100px;
                overflow-y: auto;
                position: sticky;
                top: 0;
            }
            .content {
                flex: 3;
                padding: 20px;
            }
            .about, .source, .term, .abbreviation {
                margin: 5px;
            }
            .about h2, .source h2, .term h2, .abbreviation h2 {
                color: #005a9c;
                margin-top: 10px;
            }
            a {
                color: #005a9c;
                text-decoration: none;
            }
            a:hover {
                text-decoration: underline;
            }
        </style>
        <title>Code of Federal Regulations - Title 33, Chapter-II, Part 329, Section-329.4</title>
    </head>
    <body>
        <div class="container">
            <div class="sidebar">
                <h2>Navigation</h2>
                <ul>
                    <li><a href="#about">About</a></li>
                    <li><a href="#Terms">Terms</a></li>
                    <li><a href="#Navigable Waters">Navigable Waters</a></li>
                    <li><a href="#abbreviations">Abbreviations</a></li>
                    </ul>
            </div>
            <div class="content">
                <h1>Code of Federal Regulations - Title 33, Chapter-II, Part 329, Section-329.4</h1>
                <div id="about" class="about">
                    <h2>About</h2>
                    <p><strong>publisher:</strong> </p>
                    <p><strong>namespace:</strong> https://usace-data.com/civil-works/glossary/CFR-33-329-4#</p>
                    <p><strong>prefix:</strong> CFR-33-329-4</p>
                    <p><strong>template:</strong> glossary</p>
                    <h2><strong>Source</h2>
                    <p2><strong>authoritativeSource:</strong> 33 CFR 329.4 Definitions</p>
                    <p2><strong>description:</strong> </p>
                    <p2><strong>sourceID:</strong> CFR-33-329-4</p>
                        <p><strong>url:</strong> <a href="https://www.ecfr.gov/current/title-33/chapter-II/part-329/section-329.4">https://www.ecfr.gov/current/title-33/chapter-II/part-329/section-329.4</a></p>
                        <p><strong>linkType:</strong> cfr</p>
                        <p><strong>glossaryReferences:</strong> True</p>
                </div>
                <h2>Terms</h2>

                    <div id="Navigable Waters" class="term">
                        <h2>Navigable Waters</h2>
                        <p>Navigable waters of the United States are those waters that are subject to the ebb and flow of the tide and/or are presently used, or have been used in the past, or may be susceptible for use to transport interstate or foreign commerce. A determination of navigability, once made, applies laterally over the entire surface of the waterbody, and is not extinguished by later actions or events which impede or destroy navigable capacity.</p>
                        <p><strong>anchor:</strong> 1</p>
                    </div>
                <h2>Abbreviations</h2>
            </div>
        </div>
    </body>
    </html>
```    
## Source: CFR-33-329-4.ttl
```ttl
@prefix CFR-33-329-4: <https://usace-data.com/civil-works/glossary/CFR-33-329-4#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix pav: <http://purl.org/pav#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix vann: <http://purl.org/vocab/vann/> .
@prefix voaf: <https://lov.linkeddata.es/vocommons/voaf/v2.0/voaf_v2.0.rdf#> .
@prefix wov: <http://www.knowledgesmarts.com/ontologies/wov#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

CFR-33-329-4: a wov:Glossary, owl:Ontology, skos:ConceptScheme, voaf:Vocabulary ;
    rdfs:label "Code of Federal Regulations - Title 33, Chapter-II, Part 329, Section-329.4" ;
    dcterms:created "2024-07-16T04:24:48.339372+00:00"^^xsd:dateTime ;
    dcterms:description "None" ;
    dcterms:publisher "None" ;
    dcterms:rights "MIT" ;
    dcterms:title "Code of Federal Regulations - Title 33, Chapter-II, Part 329, Section-329.4" ;
    pav:ImportedFrom "glossaries/CivilWorks/CFR-33-329-4.yaml" ;
    pav:createdOn "2024-07-16T04:24:48.339372+00:00"^^xsd:dateTime ;
    pav:createdWith "gloss" ;
    pav:wasInfluencedBy "33 CFR 329.4 Definitions" ;
    vann:preferredNamespaceUri "https://usace-data.com/civil-works/glossary/CFR-33-329-4#" ;
    skos:hasTopConcept CFR-33-329-4:Navigable_Waters .

CFR-33-329-4:Navigable_Waters a wov:GlossaryTerm, skos:Concept ;
    rdfs:label "Navigable Waters" ;
    dcterms:bibliographicCitation "https://www.ecfr.gov/current/title-33/chapter-II/part-329/section-329.4" ;
    pav:wasDerivedFrom "glossaries/CivilWorks/CFR-33-329-4.yaml#term[Navigable Waters]" ;
    skos:definition "Navigable waters of the United States are those waters that are subject to the ebb and flow of the tide and/or are presently used, or have been used in the past, or may be susceptible for use to transport interstate or foreign commerce. A determination of navigability, once made, applies laterally over the entire surface of the waterbody, and is not extinguished by later actions or events which impede or destroy navigable capacity." ;
    skos:inScheme CFR-33-329-4: ;
    skos:prefLabel "Navigable Waters" .
```


#
## Troubleshooting

- Ensure all dependencies are installed: `pip install typer pyyaml xmltodict jinja2`.
- Verify file paths and names when encountering file not found errors.
- For custom templates, ensure they match the expected data structure.

## License

This project is MIT licensed. See LICENSE for details.

---

[//]: # (comment hidden from rendering)

## Codebase Organization:
- **Directories**:
  - **build-rules/**: Contains Makefile rules for building different components.
  - **data/**: Contains Excel sources for glossary terms.
  - **glossaries/**: Organized glossaries by authoritative sources.
  - **ns/**: Namespace related Python files.
  - **schema/**: Contains schema definitions for glossaries.
  - **tests/**: Contains test modules.
  - **tools/**: Tools related to glossary operations.
  - **util/**: Utility scripts for various tasks.

- **Files**:
  - **Makefile**: Contains build rules for the project.
  - **README.md**: Detailed information about the project, its purpose, and tools.
  - **config.ini**: Configuration file for the project.
  - **requirements.txt**: Lists the required Python libraries for the project.
  - **setup.cfg, setup.py**: Setup configuration for the project.
  - **tox.ini**: Configuration file for tox testing (planned)
  - **ruff.toml, ruff_defaults.toml**: Configuration files for the project.

## Python Imports
The tool suite requires importing additional python modules via `python -m pip install` or `pip install`. 
Each dependency is listed once along with its common usage context within projects, where applicable:

- `dicttoxml`: Converts Python dictionaries to XML.
- `jinja2`: A modern and designer-friendly templating language for Python, modelled after Django’s templates.
- `pandas`: Powerful data manipulation library.
- `pydantic`: Data parsing and validation using Python type annotations.
- `rdflib`: Reading and writing RIFF files.
- `requests`: Allows you to send HTTP requests easily.
- `rfc3986`: RFC 3986 compliance.
- `rico`: HTML formatting library used to generate YAML documents from Excel sheets (replace with jinja template?)
- `typer`: Command-line interface creation toolkit.
- `urllib`: Parses URLs and file paths.
- `urllib3`: An improved version of `urllib`.

# Using Digital Glossaries to establish Authoritative Source of Truth
The glossary tool suite follows DoD Instruction 5000.97 Digital Engineering policy, procedures and practice establishes the Authoritative Source of Truth (ASOT) for Civil Works digital engineering practices.

- Automated tools to apply ModelOps to digital model governance
- Derive digital knowledge thread artifacts from ASOT.
- Integrate with other knowledge knowledges such as ontologies and data schema.
- Support robust data schema containing ASOT terms, descriptions, data types, and validation constraints.

The Civil Works Digital Glossary supports the Army's organizational adoption of digital threads, digital artifacts, ASOT (Authoritative Sources of Truth), and DoD Digital Engineering Fundamentals and DoD Instruction 5000.97 - Digital Engineering Strategy, and , summarized below:

1. **Core Activities**: DoD Organizations should incorporate core activities throughout the life cycle to realize the benefits derived from the goals described in the 2018 DoD Digital Engineering Strategy¹.
2. **Use of Models**: DoD Organizations should establish and follow formalized plans, methodologies, and accepted standards for the development and use of models as a continuum throughout the life cycle¹.
3. **Authoritative Sources of Truth (ASOT)**: Organizations should define and establish ASOT for the intended engineering and stakeholder activities. The ASOT should be used to access, share, and exchange models and data so they may be used in support of engineering activities and to form digital artifacts¹.
4. **Digital Engineering Ecosystem (DEE)**: DoD Organizations should establish and sustain a DEE that interconnects the infrastructure, environment, and methodology. The DEE should enhance the capability to collaborate across organizations, engineering disciplines, and physical locations¹.
5. **Innovation and Continuous Improvement**: Organizations should foster an environment that supports innovation and should establish a systematic DE/MS maturation approach to drive continuous improvements in the establishment and use of the DE/MS in practice and promotes continuous prototyping and experimentation¹.
6. **Workforce Development**: DoD Organizations should understand the digital knowledge, skills, and abilities needed for each occupational discipline. Organizations should train or acquire their personnel appropriately to address the knowledge gaps and expertise needed (1).

The adoption of digital threads, digital artifacts, ASOT, and Digital Engineering in an organization facilitates a systematic, repeatalbe approach to digital governance, continuous improvement, and workforce development to successfully implement complex information systems composed of many hundreds or thousands of independently information and knowledge resources.

(1) Department of Defense (DoD) Digital Engineering Fundamentals, [link (PDF)](https://ac.cto.mil/wp-content/uploads/2022/03/DE-Fundamentals-2022.pdf)

(2) DoD DIGITAL ENGINEERING WORKING GROUP, [link (PDF)](https://ac.cto.mil/wp-content/uploads/2019/06/DE-Fundamentals.pdf)

(3) DoDI Instruction 5000.97 - Digital Engineering [link (PDF)](https://www.esd.whs.mil/Portals/54/Documents/DD/issuances/dodi/500097p.PDF)
