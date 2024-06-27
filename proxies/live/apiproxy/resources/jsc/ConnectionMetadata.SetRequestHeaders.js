/*
 * This script reads a Custom Attribute from the APIGEE app and sends it to the API
 * as the `NHSD-Connection-Metadata` header.
 *
 * The Http Header 'NHSD-End-User-Organisation-ODS' is expected.
 * The Custom Attribute `nrl-ods-<ods_code>` is transformed from:
 *
 * e.g.
 *
 * HTTP Request Header          = ods_code: RJ11
 * APIGEE App Custom Attribute  = nrl-ods-RJ11: http://snomed.info/sct|736253001\nhttp://snomed.info/sct|736253002\n
 *
 * Http Response Header = NHSD-Connection-Metadata:
 *  {
 *      "nrl.ods-code": "RJ11",
 *      "nrl.pointer-types": [
 *          "http://snomed.info/sct|736253001",
 *          "http://snomed.info/sct|736253002"
 *      ]
 *  }
 */

(function () {
  // Read the 'NHSD-End-User-Organisation-ODS' header
  var odsCode = context.getVariable(
    "request.header.NHSD-End-User-Organisation-ODS"
  );
  if (!odsCode || odsCode.trim().length === 0) {
    //This will trigger RaiseFault.400MissingODSHeader.xml - see proxies/default.xml in the DefaultFaultRules
    return;
  }

  var nrlAppID = context.getVariable("app.nrl-app-id");

  var odsCodeExtension = context.getVariable(
    "request.header.NHSD-End-User-Organisation"
  );

  // Build the response
  var connectionMetadata = {
    "nrl.ods-code": odsCode,
    "nrl.ods-code-extension": odsCodeExtension,
    "nrl.app-id": nrlAppID
  };
  context.targetRequest.headers["NHSD-Connection-Metadata"] =
    connectionMetadata;
})();
