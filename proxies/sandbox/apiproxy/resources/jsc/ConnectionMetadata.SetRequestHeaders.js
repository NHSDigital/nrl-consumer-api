/*
 * This script reads a mocked (hard-coded, thanks APIGEE...) Custom Attribute which
 * in the non-sandbox environments comes from an APIGEE app. These are sent to the API
 * as the `NHSD-Connection-Metadata` header.
 *
 * The Http Header 'NHSD-End-User-Organisation-ODS' is expected.
 */

//---- CHANGE AVAILABLE POINTER TYPES FOR EACH ORGANISATION HERE ----//
const nrlPointers = {
  RJ11: [
    "https://snomed.info/ict|887701000000100",
    "https://snomed.info/ict|861421000000109",
    "https://snomed.info/ict|736253002",
  ],
};
//-------------------------------------------------------------------//

(function () {
  var odsCode = context.getVariable(
    "request.header.NHSD-End-User-Organisation-ODS"
  );
  if (!odsCode || odsCode.trim().length === 0) {
    context.setVariable("badRequest", true);
    return;
  }

  var nrlPointerTypes = nrlPointers[odsCode];
  if (!nrlPointerTypes) {
    context.setVariable("badRequest", true);
    return;
  }

  var connectionMetadata = {
    "nrl.ods-code": odsCode,
    "nrl.pointer-types": nrlPointerTypes,
  };
  context.targetRequest.headers["NHSD-Connection-Metadata"] =
    connectionMetadata;
})();
