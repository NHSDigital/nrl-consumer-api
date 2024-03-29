import os
from uuid import uuid4

import pytest
import requests
import urllib.parse


@pytest.mark.skip(reason="Disabled by NRLF-397, re-enabled by NRLF-398")
@pytest.mark.smoketest
def test_status_endpoint(nhsd_apim_proxy_url, status_endpoint_auth_headers):
    resp = requests.get(
        nhsd_apim_proxy_url + "/_status", headers=status_endpoint_auth_headers
    )
    status_json = resp.json()
    assert resp.status_code == 200
    assert status_json["status"] == "pass"
    assert status_json["checks"]['healthcheck']["responseCode"] == 200
    assert status_json["checks"]['healthcheck']["outcome"] == {"message": "OK"}


@pytest.mark.skip(reason="Producing inconsistent results due to race condition with APIGEE API & NHS Login")
@pytest.mark.smoketest
@pytest.mark.nhsd_apim_authorization({"access": "application", "level": "level3"})
@pytest.mark.parametrize(
    ["ods_code", "expected"],
    [
        [
            "RJ11",
            200,
        ],
        [
            "",
            400,
        ],
        [
            "VALID_ODS_CODE_BUT_NOT_GRANTED",
            403,
        ],
    ],
)
def test_smoke(
    ods_code: str,
    expected: int,
    nhsd_apim_proxy_url,
    nhsd_apim_auth_headers,
    _apigee_app_base_url,
    _create_test_app,
):

    headers = {
        "accept": "application/json; version=1.0",
        "x-correlation-id": f"SMOKE:{uuid4()}-odsCode_{ods_code}-expected_{expected}",
        "x-request-id": f"{uuid4()}",
        "NHSD-End-User-Organisation-ODS": ods_code,
        **nhsd_apim_auth_headers,
    }

    patient_id = urllib.parse.quote("https://fhir.nhs.uk/Id/nhs-number|9278693472")
    url = f"{nhsd_apim_proxy_url}/FHIR/R4/DocumentReference?subject.identifier={patient_id}"
    created_app_name = _create_test_app["name"]

    # key value map addition
    apigee_update_url = f"{_apigee_app_base_url}/{created_app_name}"
    key_value_pairs = {
        "attributes": [
            {
                "name": "nrl-ods-RJ11",
                "value": "http://snomed.info/sct|736253001\nhttp://snomed.info/sct|736253002",
            }
        ],
    }

    update_response = requests.put(
        apigee_update_url,
        json=key_value_pairs,
        headers={"Authorization": f"Bearer {os.environ['APIGEE_ACCESS_TOKEN']}"},
    )
    update_response.raise_for_status()

    response = requests.get(url, headers=headers)

    assert response.status_code == expected, response.text
