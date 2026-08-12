# Security & Observability Pipeline

This template provides a fully automated CI/CD pipeline for dynamically instrumenting your applications with **OpenTelemetry**, collecting logs and metrics via **Grafana Alloy**, running **k6** performance benchmarks, and executing automated **Wazuh** security scans. 

When you adopt this pipeline into your own project, there are a few environment variables and GitHub Secrets you MUST configure to make it work.

---

## 1. Workflow Environment Variables (`env` block)
Before running the pipeline, open the `.github/workflows/vapt-scan.yml` file and update the variables at the top of the file under the `env:` block to match your specific project:

* **`TARGET_IP` & `TARGET_URL`**: The IP address and HTTP URL of your staging/sandbox environment (e.g., `3.235.156.255`).
* **`APP_SERVICE_NAME`**: The name of your project (e.g., `crm-backend`). This is highly critical! This tag groups all of your traces, logs, and metrics together inside Grafana Cloud.
* **`APP_RUNTIME`**: Set to `node` for Node.js, `python` for Python apps, or `none` if you want to skip OpenTelemetry auto-instrumentation.
* **`APP_RESTART_COMMAND`**: The command used to restart your application after OpenTelemetry environment variables are injected. (e.g., `pm2 restart my-awesome-app --update-env`).

---

## 2. Dynamic Grafana Credentials
To prevent developers from having to juggle 7 different Grafana URLs, User IDs, and passwords, this pipeline uses a **Dynamic Fetching Script**. 

At runtime, the pipeline reaches out to the Grafana Cloud API, looks up your specific stack, and dynamically resolves the URLs and User IDs for Prometheus, Loki, and Tempo automatically. It then generates a configuration file (`config.alloy`) and provisions it directly onto your server. **Because of this, you only need to provide two Grafana secrets to authenticate the entire pipeline!**

---

## 3. GitHub Secrets Configuration
You must configure the following **Secrets** in your GitHub Repository settings (`Settings > Secrets and variables > Actions`):

### Infrastructure Secrets
* **`SERVER_SSH_KEY`**: The raw PEM private key required to SSH into your `TARGET_IP` sandbox server.
* **`WAZUH_INDEXER_PASSWORD`**: The password to authenticate with the Wazuh security indexer.

### Grafana Observability Secrets
* **`GRAFANA_STACK_SLUG`**: Your exact Grafana Cloud stack identifier (e.g., `generousmagnolia1320`). You can find this in your Grafana Cloud URL.
* **`GRAFANA_API_KEY`**: A Grafana Cloud **Access Policy Token**. 
  * *Important:* This single token is used both to fetch the stack details from the API *and* to actively push metrics/logs. When creating this token in Grafana Cloud, you **must** ensure it has the following scopes:
    * `stacks:read`
    * `metrics:write`
    * `logs:write`
    * `traces:write`

### General Security Scan Secrets (SonarQube, DefectDojo, Postman)
If your pipeline extends the general security template, you will also need these secrets generated from their respective web dashboards:
* **`SONAR_HOST_URL`** & **`SONAR_TOKEN`** (For Static Code Analysis)
* **`DEFECTDOJO_URL`**, **`DEFECTDOJO_API_KEY`**, **`DEFECTDOJO_PRODUCT_ID`**, **`DEFECTDOJO_ENGAGEMENT_ID`** (For Vulnerability Management)
* **`POSTMAN_API_KEY`**, **`COLLECTION_UID`** (For DAST/API Scans)