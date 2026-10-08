# Architecture

This document describes the XRAY-ASSISTANT project architecture.

## Modules

```mermaid
graph TD
    API[API] --> Services
    Services --> DB[(Database)]
    Services --> Models[ML Models]
    Services --> Config[Configuration]
    
    subgraph backend/app
        API
        core[Core]
        db[Database]
        schemas[Schemas]
        subgraph services
            ingest
            gate
            inference
            calibration
            explain
            lungseg
            rules
            longitudinal
            report
            i18n
        end
    end
    
    subgraph ml
        data_ml[data]
        train
        eval
    end
    
    subgraph root_folders
        models/
        config/
        data/raw
        data/processed
        data/demo
        frontend/
        scripts/
        docs/
    end
```

## API Endpoints Planned

- `POST /auth/login`
- `POST /studies` (upload)
- `GET /studies/{id}`
- `GET /studies/{id}/result`
- `GET /studies/{id}/heatmap.png`
- `GET /studies/{id}/uncertainty.png`
- `POST /studies/{id}/compare/{other_id}`
- `GET /studies/{id}/report.pdf`
- `GET /health`
- `GET /models/status`
