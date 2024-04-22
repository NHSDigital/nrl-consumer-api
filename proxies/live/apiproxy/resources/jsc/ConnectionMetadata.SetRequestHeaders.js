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

  var enableAuthorizationLookup = context.getVariable(
    "app.enable-authorization-lookup"
  );

  if (enableAuthorizationLookup == "true") {
    enableAuthorizationLookup = true;
  } else if (enableAuthorizationLookup === null) {
    enableAuthorizationLookup = false;
  } else {
    //This will trigger RaiseFault.403NoPointers.xml - see targets/target.xml
    return;
  }

  var pointerTypes = [];
  // Read the associated `nrl-ods-<ods_code>` custom attribute from the APIGEE app
  var nrlPointerTypes = context.getVariable("app.nrl-ods-" + odsCode);

  if (
    (enableAuthorizationLookup === true && nrlPointerTypes) ||
    (enableAuthorizationLookup === false && !nrlPointerTypes)
  ) {
    //This will trigger RaiseFault.403NoPointers.xml - see targets/target.xml
    return;
  }

  if (nrlPointerTypes) {
    // Convert it into a complex object
    var lines = nrlPointerTypes.split(/\s+/);

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line && line.trim().length !== 0) {
        pointerTypes.push(line);
      }
    }
  }

  var odsCodeExtension = context.getVariable(
    "request.header.NHSD-End-User-Organisation"
  );

  // Build the response
  var connectionMetadata = {
    "nrl.ods-code": odsCode,
    "nrl.ods-code-extension": odsCodeExtension,
    "nrl.pointer-types": pointerTypes,
    "nrl.enable-authorization-lookup": enableAuthorizationLookup,
  };
  context.targetRequest.headers["NHSD-Connection-Metadata"] =
    connectionMetadata;
})();
