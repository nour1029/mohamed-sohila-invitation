/**
 * RSVP endpoint for the wedding invitation.
 *
 * Appends one row per submission to the bound spreadsheet:
 *   Timestamp | Name | Attending | Guests | Song | Children
 *
 * Deploy steps are in apps-script/README.md. Paste this whole file into
 * the Apps Script editor, replacing everything already there.
 */

/** Columns, in order. Changing this changes the sheet's header row too. */
const COLUMNS = ['Timestamp', 'Name', 'Attending', 'Guests', 'Song', 'Children'];

/** Guests can type anything; cap what we store so one paste cannot bloat a row. */
const MAX_FIELD_LENGTH = 500;

function doPost(request) {
  try {
    const payload = JSON.parse(request.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    ensureHeader_(sheet);

    // A leading =, +, - or @ makes a spreadsheet treat text as a formula.
    // These values come from a public form, so neutralise them before they
    // are ever written.
    const clean = (value) => {
      const text = String(value ?? '').trim().slice(0, MAX_FIELD_LENGTH);
      return /^[=+\-@]/.test(text) ? `'${text}` : text;
    };

    sheet.appendRow([
      new Date(),
      clean(payload.name),
      clean(payload.attending),
      clean(payload.guests),
      clean(payload.song),
      clean(payload.children),
    ]);

    return json_({ ok: true });

  } catch (error) {
    // Log it so a failed RSVP is recoverable from the execution log even
    // if the guest never follows up.
    console.error('RSVP failed', error, request && request.postData && request.postData.contents);
    return json_({ ok: false, error: String(error) });
  }
}

/** Lets you open the deployed URL in a browser to confirm it is alive. */
function doGet() {
  return json_({ ok: true, message: 'RSVP endpoint is running.' });
}

function ensureHeader_(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(COLUMNS);
  sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
  sheet.setFrozenRows(1);
}

function json_(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
