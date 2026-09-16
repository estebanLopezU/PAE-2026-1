# From Registration to Operational Interoperability: An Automated Maturity Assessment of Colombia's X-Road Public Sector Ecosystem

## Abstract
The lack of independent and automated diagnostic tools in the Colombian public sector has created a significant gap in understanding the real maturity of digital interoperability. This article evaluates the operational maturity of the X-Road ecosystem through a technical diagnosis supported by the **X-Road Colombia** project implemented in this repository (FastAPI + React + PostgreSQL + Docker).  

The study operationalizes MinTIC interoperability criteria into measurable indicators and uses an automated assessment approach through an **Interoperability Viewer**. Results show an average maturity score of **2.3/5.0** (SD = 1.1), placing the ecosystem at a **Basic** stage. The **semantic domain** presents the lowest performance (mean = 1.9), while the **technical domain** leads (mean = 3.1). A critical **Registration–Operation Gap** is observed between entities formally registered in X-Road and entities with verifiable services.

This repository provides the technological basis to replicate the assessment workflow, visualize KPIs, and support evidence-based decisions for digital government transformation.

**Keywords:** Interoperability, X-Road, Public Sector, Colombia, Digital Transformation, Digital Maturity, Automated Evaluation.

---

## 1. Introduction
Colombia has prioritized state modernization as a cross-cutting public policy objective to improve operational efficiency and citizen trust. In this context, digital interoperability is a foundational capability that enables heterogeneous public institutions to exchange information securely and effectively.

Following the adoption of X-Road as the interoperability backbone, implementation has progressed unevenly across entities. A subset demonstrates integrated digital services, while many remain in early digitalization stages. This asymmetry limits coordinated state response and integrated public service delivery.

To address this, the project in this repository proposes an automated and verifiable assessment approach, moving beyond purely declarative compliance and enabling evidence-based planning.

### 1.1 Research Contributions
This work contributes:

1. An operational model for measuring interoperability maturity in public entities connected to X-Road.
2. An automated software-based mechanism (Interoperability Viewer) to assess technical, documentary, and operational evidence.
3. A reproducible implementation aligned with the project architecture in this repository.
4. A practical roadmap to improve technical, semantic, organizational, and legal interoperability.

### 1.2 Research Questions
- **RQ1:** What is the current maturity level of interoperability among Colombian public entities connected to X-Road?
- **RQ2:** What gap exists between formal registration and verifiable operational service availability?
- **RQ3:** Which interoperability domains show the largest maturity deficits?
- **RQ4:** How does an automated software approach improve decision-making in digital government?

---

## 2. Project Context and Technical Implementation
This article is grounded in the **PAE 2026** implementation:

- **Frontend:** React + Vite (dashboard and visual analytics).
- **Backend:** FastAPI (REST API and scoring logic).
- **Database:** PostgreSQL (entity and maturity records).
- **Deployment/Execution:** Docker Compose (reproducible multi-service environment).

Relevant execution and architecture details are documented in:

- `README.md`
- `GUIA_EJECUCION.md`

The platform supports:

1. KPI visualization for ecosystem maturity.
2. Service verification workflows.
3. Structured storage of maturity dimensions.
4. Reproducible local execution for testing and demonstration.

---

## 3. Interoperability Maturity Assessment Framework

### 3.1 Domains and Weights
The model operationalizes MinTIC-aligned criteria into four domains:

| Domain | Focus | Weight |
|---|---|---:|
| Technical | Services, APIs, endpoint availability, X-Road usage | 30% |
| Semantic | Data dictionaries, schemas, shared vocabularies | 25% |
| Organizational | Service ownership, SLAs, operational processes | 25% |
| Legal | Data protection, terms, regulatory compliance | 20% |

### 3.2 Maturity Levels
- **Initial (1.0–1.9):** ad-hoc, non-systematic interoperability.
- **Basic (2.0–2.9):** initial structures, limited integration.
- **Intermediate (3.0–3.9):** regular usage, partial process integration.
- **Advanced (4.0–4.9):** standardized and institutionalized interoperability.
- **Optimized (5.0):** continuous improvement with analytics-driven governance.

### 3.3 Maturity Index
For each entity \(i\):

\[
M_i = 0.30T_i + 0.25S_i + 0.25O_i + 0.20L_i
\]

Where:

- \(T_i\): Technical score (0–5)
- \(S_i\): Semantic score (0–5)
- \(O_i\): Organizational score (0–5)
- \(L_i\): Legal score (0–5)

---

## 4. Data and Methodological Notes
The broader ecosystem includes over one hundred registered entities. For analytical consistency, a curated subset with minimum verifiable evidence was used for quantitative scoring.

Method stages:

1. **Data collection:** registry, public documentation, and service metadata.
2. **Validation:** cross-checking against transparency portals and endpoint verification.
3. **Operationalization:** translating policy criteria into executable indicators.
4. **Automated processing:** scoring via software modules.
5. **Synthesis:** descriptive statistical analysis and gap identification.

---

## 5. Results Summary

### 5.1 Global Maturity
- Mean maturity: **2.3/5.0** (Basic).
- Standard deviation: **1.1**.

### 5.2 Registration–Operation Gap
The project confirms a critical misalignment between formal enrollment and operational availability. In repository documentation, this appears as a strong contrast between total registered entities and entities with publicly verifiable services.

### 5.3 Domain Performance
- **Technical:** strongest performance (mean ≈ 3.1).
- **Semantic:** weakest performance (mean ≈ 1.9).
- **Organizational and Legal:** intermediate levels with substantial improvement opportunities.

These results indicate that technological deployment alone is insufficient without semantic and governance maturity.

---

## 6. Discussion
Findings reinforce a central conclusion: **registration is not equivalent to interoperability readiness**. Public entities may appear digitally integrated in formal catalogs while lacking evidence of active, consumable services.

The implemented platform helps close this visibility gap by:

1. Automating evidence collection and scoring.
2. Reducing assessment time compared to manual reviews.
3. Providing transparent and repeatable diagnostics.
4. Enabling prioritization of interventions by domain and entity profile.

---

## 7. Strategic Roadmap

### Short-term (0–6 months)
- Enforce minimum semantic artifacts (dictionaries, schemas, metadata).

### Medium-term (6–18 months)
- Implement automated service monitoring for all registered entities.
- Certify operational availability beyond formal registry status.

### Long-term (18–36 months)
- Integrate predictive analytics for interoperability degradation and service dependency risks.

---

## 8. Threats to Validity
- Scope limited to Colombian public-sector X-Road context.
- Results represent a time-bound snapshot and require longitudinal updates.
- Automated extraction may include residual error despite validation checks.
- Evidence-based scoring does not replace deep performance or penetration testing.

---

## 9. Conclusions and Future Work
The ecosystem shows a meaningful technical foundation but insufficient semantic and organizational consolidation. The repository implementation demonstrates that automated diagnostics can reveal gaps that are not visible in administrative self-reporting.

Future work:

1. Extend coverage to additional territorial entities.
2. Add real-time service availability alerts.
3. Compare results with other X-Road countries.
4. Run a longitudinal 2026–2028 evolution study.

---

## References (selected)
1. MinTIC. *Marco de Interoperabilidad para Gobierno Digital* (ed. 2025).  
2. X-Road. *X-Road 8 “Spaceship”* (2026).  
3. Agencia Nacional Digital (AND). *Datos y documentación pública de interoperabilidad* (2025).  
4. Wahyuni, H. *Maturity of data interoperability cross-organizations in E-Government* (2024).  
5. Okan, A.A. *Exploring the Landscape of e-Government Maturity Models* (2024).  

---

## Note on Scope Extension (September 2026)

Beyond the interoperability assessment described in this article, the platform was extended into a multi-platform digital government suite: an entry portal (port 3000), **GOVStake 360** — an AI-driven stakeholder management system for public-sector interest groups (ports 3002/8002) — and **AgentGD**, an OpenRouter-powered AI assistant embedded in both dashboards that queries the live databases. Both microservices implement hardened security: database-backed users with bcrypt hashing, role-based access control, brute-force lockout, and access auditing.
