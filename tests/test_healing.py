import pytest
from backend.app.services.longitudinal.healing import HealingService

@pytest.fixture
def service():
    return HealingService()

def test_unsupported_site(service):
    res = service.estimate_healing_time("unknown_site", {})
    assert res.get("error") == "no prior available"
    assert "unknown_site" in res.get("site")
    assert "exploratory" not in res # because it returned error

def test_supported_site_exploratory_flag(service):
    res = service.estimate_healing_time("tibial_shaft", {})
    assert res.get("exploratory") is True
    assert "estimate_range_weeks" in res
    
def test_all_priors_have_doi(service):
    priors = service.config.get("priors", {})
    for key, val in priors.items():
        assert "doi" in val, f"Prior {key} is missing a DOI"
        assert val["doi"], f"Prior {key} has an empty DOI"
