import { ChangeEvent, ClipboardEvent, KeyboardEvent } from "react";

export declare type RecipientsValue = { items: string[], value: string };
export declare type RecipientsType = { cc: RecipientsValue, bcc: RecipientsValue, recipients: RecipientsValue };

export declare type MessageRecipientsType = {
  emailRecipients: RecipientsType,
  handleKeyDown: (_e: KeyboardEvent, _type: string) => void,
  handleChange: (_e: ChangeEvent, _type: string) => void,
  handlePaste: (_e: ClipboardEvent, _type: string) => void,
  handleItemDelete: (_item: string, _type: string) => void
}