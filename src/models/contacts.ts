export interface Contacts {
  _id?: string,
  userId?: string,
  accountId?: string,
  email: EmailAddress
}

export interface EmailAddress {
  email?: string,
  name?: string
}
