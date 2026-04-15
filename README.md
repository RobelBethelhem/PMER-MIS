<<<<<<< HEAD
# Welcome to your Lovable project

TODO: Document your project here
=======
# PMER-MIS (Impact Tracker)

## System Overview

ERCS (Ethiopian Red Cross Society) wants a secure, scalable, user-friendly digital system that will:

- **Digitize all planning** (strategic → annual → quarterly → activity level)
- **Enable real-time monitoring** and performance tracking
- **Automatically consolidate data** from HQ and all branches/regions
- **Integrate financial budgeting & expenditure** with programmatic results
- **Generate automated dashboards**, analytics, and donor-ready reports
- **Improve accountability**, transparency, and results-based management

## A. Strategic & Operational Planning Module

**Goal:** Digitize planning from strategic level down to branch activities.

**Key Features:**

* **Multi-Level Planning Hierarchy**
  * Strategic Plan → Annual Operational Plan (AOP) → Project → Activity Plan
  * Branch-level + HQ-level hierarchy
  * Project tagging (Donor + Sector)
* **Annual Operational Plan (AOP) Builder**
  * Standardized AOP templates
  * Target setting per indicator
  * Budget linkage to activities
  * Automatic roll-up to national plan
* **Quarterly Planning Tool**
  * Carry-forward of annual targets
  * Activity scheduling calendar
  * Planned vs Actual comparison
* **Logframe Integration**
  * Link activities → outputs
  * Link outputs → outcomes
  * Link outcomes → strategic priorities
* **Resource Allocation**
  * Human resource tagging
  * Budget allocation mapping
  * (Optional future) Vehicle/resource allocation
* **Gantt Chart Functionality**
  * Visual timeline of activities
  * Delayed activity alerts
  * Milestone tracking

## B. Indicator & Performance Monitoring Module

**Goal:** Real-time performance tracking with automated alerts.

**Key Features:**

1. **Indicator Registry (Centralized library)**
   * Standardized indicator taxonomy (Output / Outcome / Impact)
   * Mandatory disaggregation fields (Sex, Age group, Disability, etc.)
   * Embedded calculation logic
2. **Data Entry Forms**
   * Monthly branch-level entry
   * Auto-validation checks + mandatory fields
   * Error detection alerts
3. **Target vs Achievement Tracking**
   * Auto-calculation of achievement %
   * Graphical comparison
   * Mandatory variance explanation box (if <80%)
4. **Performance Dashboards**
   * HQ Dashboard
   * Branch Dashboard
   * Sector Dashboard
   * Donor Dashboard
5. **Traffic Light System**
   * Green: ≥90%
   * Yellow: 70–89%
   * Red: <70%
6. **Underperformance Alerts (real-time notifications)**

## C. Budget & Financial Tracking Module

**Goal:** Full integration of finance with programmatic data.

**Key Features:**

* **Budget Entry** (linked to finance module)
* **Budget vs Expenditure tracking**
  * Budget lines by activity
  * Multi-donor allocation capability
  * Monthly expenditure upload
* **Burn rate % calculation**
  * Budget absorption rate
  * Variance analysis
  * Financial forecast to year-end
* **Cost Efficiency Metrics**
  * Cost per beneficiary
  * Cost per output
  * Budget utilization by branch

## D. Data Aggregation & Consolidation Module

**Goal:** National-level real-time view without double-counting.

**Key Features:**

* **Automatic consolidation** of branch submissions
* **Prevent/flag duplicate entries**
* **National-level real-time aggregation**
* **Advanced filtering:**
  * By Region / Zone
  * By Program / Sector
  * By Donor
  * By Indicator
  * By Time Period

## 2.3 User Classes & Characteristics

| Role | Description | Number (est.) |
| --- | --- | --- |
| **Super Admin (ICT)** | Full system control | 2–3 |
| **PMER HQ Admin** | National oversight & approval | 5–8 |
| **Branch Admin** | Branch-level management | 1 per branch |
| **Data Entry Officer** | Monthly data entry | Multiple |
| **Finance Officer** | Budget & expenditure entry | Multiple |
| **Read-only Management User** | View-only (HQ, Donor, Program Lead) | Variable |

## 3.1.1 Strategic & Operational Planning Module (Implementation Details)

**Doctypes to create:**
* Strategic Plan
* Annual Operational Plan (AOP)
* Project
* Activity
* Quarterly Plan

**Key Requirements:**
* **Hierarchical linking:** Strategic Plan → AOP → Project → Activity → Quarterly Plan
* **AOP Builder** with standardized templates
* **Target setting per indicator** (linked to Indicator Registry)
* **Automatic budget linkage** (child table: Budget Lines)
* **Auto roll-up** to national level
* **Gantt chart view** (using Frappe Gantt or custom Chart)
* **Activity scheduling calendar**
* **Resource tagging** (link to HR Employee)
* **Logframe matrix** (child tables: Activities → Outputs → Outcomes → Strategic Priorities)

**Workflow:** Draft → Submitted → Reviewed → Approved → Published
>>>>>>> e0b16a6 (commit)
