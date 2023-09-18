import {ContentState} from "draft-js";
let htmlToDraft: any = null;
if (typeof window === 'object') {
  htmlToDraft = require('html-to-draftjs').default;
}

export function getPlainTextFromHtml(value: string) {
  if (htmlToDraft) {
    return ContentState.createFromBlockArray(htmlToDraft(value)).getPlainText()
  }
  return value;
}
