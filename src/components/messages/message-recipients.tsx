import {
    Flex,
    Heading,
    Input,
    PopoverBody,
    PopoverContent,
    Popover,
    PopoverAnchor,
    HStack, Text, Box
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {Chip, Toaster} from "@/components/common";
import {MessageRecipientsType, RecipientsType} from "@/types/props-types/message-recipients.type";
import {MessageRecipient} from "@/models/message";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {matchSorter} from "match-sorter";
import {Contacts} from "@/models";
import {ChangeEvent, useEffect, useState} from "react";
import {isEmail} from "@/utils/common.functions";

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

export default function MessageRecipients({emailRecipients: values, updateValues}: MessageRecipientsType) {
    const {contacts} = useSelector((state: StateType) => state.commonApis);
    const [emailRecipients, setEmailRecipients] = useState<RecipientsType | any>({
        cc: {items: [], value: blankRecipientValue},
        bcc: {items: [], value: blankRecipientValue},
        recipients: {items: [], value: blankRecipientValue},
    })

    useEffect(() => {
        if (values) {
            setEmailRecipients(values);
        }
    }, [values])

    function filterContacts(value: string) {
        if (!value) {
            return [];
        }
        let finalContacts: Contacts[] = matchSorter((contacts || []), value, {keys: ['email.email', 'email.name']});
        finalContacts = finalContacts.slice(0, finalContacts.length > 5 ? 5 : finalContacts.length);
        return finalContacts.map((contact: Contacts) => ({email: contact.email.email, name: contact.email.name}));
    }

    const handleChange = (evt: ChangeEvent | any, type: string) => {
        let finalValues = {
            ...emailRecipients,
            [type as keyof RecipientsType]: {
                items: [...(emailRecipients[type as keyof RecipientsType].items || [])],
                value: {
                    name: '',
                    email: evt.target.value
                }
            }
        }
        setEmailRecipients(finalValues);
    };

    const isValid = (email: string, type: string) => {
        let error = null;
        if ((emailRecipients[type as keyof RecipientsType].items || []).map((r: MessageRecipient) => r.email).includes(email)) {
            error = `This email has already been added.`;
        }

        if (!isEmail(email)) {
            error = `This email has not been valid.`;
        }

        if (error) {
            let validationError = {
                desc: error,
                title: 'Email validation error',
                type: 'error'
            }
            Toaster(validationError)
            return false;
        }

        return true;
    }

    const handlePaste = (evt: ClipboardEvent | any, type: string) => {
        evt.preventDefault();

        let paste = evt.clipboardData.getData("text");
        let emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g);

        if (emails) {
            let emailsToBeAdded = emails
                .filter((email: string) => !emailRecipients[type as keyof RecipientsType].items
                    .map((i: MessageRecipient) => i.email)
                    .includes(email))
                .map((email: string) => ({
                    email: email,
                    name: ''
                }))

            let finalValues = {
                ...emailRecipients,
                [type as keyof RecipientsType]: {
                    items: [
                        ...emailRecipients[type as keyof RecipientsType].items,
                        ...emailsToBeAdded
                    ],
                    value: blankRecipientValue
                }
            }
            setEmailRecipients(finalValues);
            updateValues(finalValues);
        }
    };

    const handleKeyDown = (evt: KeyboardEvent | any, type: string) => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = emailRecipients[type as keyof RecipientsType].value.email.trim();

            let emailArray = value.split(',');
            !!emailArray.length && emailArray.map((email: string) => {
                if (email && isValid(email, type)) {
                    let finalValues = {
                        ...emailRecipients,
                        [type as keyof RecipientsType]: {
                            items: [...emailRecipients[type as keyof RecipientsType].items, {
                                name: '',
                                email: email
                            }],
                            value: blankRecipientValue
                        }
                    }
                    setEmailRecipients(finalValues);
                    updateValues(finalValues);
                }
            })
        }
    };

    const handleAutoCompleteSelect = (value: any, type: string) => {
        if (value.email && isValid(value.email, type)) {
            let finalValues = {
                ...emailRecipients,
                [type as keyof RecipientsType]: {
                    items: [...emailRecipients[type as keyof RecipientsType].items, {
                        name: value.name,
                        email: value.email
                    }],
                    value: blankRecipientValue
                }
            }
            setEmailRecipients(finalValues);
            updateValues(finalValues);
        }
    };

    const handleItemDelete = (item: string, type: string) => {
        let finalValues = {
            ...emailRecipients,
            [type as keyof RecipientsType]: {
                items: emailRecipients[type as keyof RecipientsType].items.filter((i: any) => i.email !== item),
                value: blankRecipientValue
            }
        }
        setEmailRecipients(finalValues);
        updateValues(finalValues);
    };

    function renderInputWithAutoComplete(value: string, type: string) {
        let finalContacts = filterContacts(value);
        return (
            <Popover
                autoFocus={false}
                isOpen={value.length > 0 && finalContacts.length > 0}
                closeOnBlur={false}
                isLazy
                lazyBehavior='keepMounted'
                placement={'bottom-start'}
            >
                <HStack flex={1}>
                    <PopoverAnchor>
                        <Input width={'auto'} display='inline-flex' padding={0} height={'20px'} flex={'1 0 auto'}
                               fontSize={'12px'} border={0} className={styles.ccInput}
                               value={value}
                               onKeyDown={(e) => handleKeyDown(e, type)}
                               onChange={(e) => handleChange(e, type)}
                               onPaste={(e) => handlePaste(e, type)}
                               placeholder={`${type}\'s Email`}
                        />
                    </PopoverAnchor>
                </HStack>
                <PopoverContent>
                    <PopoverBody p={0}>
                        {finalContacts.map((contact, index) => (
                            <Box onClick={() => handleAutoCompleteSelect(contact, type)}
                                 className={styles.emailRecipientsAutoComplete} key={index} cursor={'pointer'} px={4}>
                                {contact.name && <Text
                                    title={`${contact.name} <${contact.email}>`}>{contact.name} &#60;{contact.email}&gt;</Text>}
                                {!contact.name && <Text
                                    title={`${contact.email} <${contact.email}>`}>{contact.email} &#60;{contact.email}&gt;</Text>}

                            </Box>
                        ))}
                    </PopoverBody>
                </PopoverContent>
            </Popover>
        )
    }

    return (
        <Flex className={styles.mailRecipientsBox} flex={'none'} backgroundColor={'#FFFFFF'}
              border={'1px solid #E5E7EB'} direction={'column'}
              borderRadius={8}>
            <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                         color={'#374151'}>To:</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                    {!!emailRecipients?.recipients?.items?.length && emailRecipients.recipients.items.map((item: MessageRecipient, i: number) => (
                        <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'recipients')}/>
                    ))}
                    {renderInputWithAutoComplete(emailRecipients.recipients.value.email, 'recipients')}
                </Flex>
            </Flex>
            <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                         color={'#374151'}>Cc:</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                    {!!emailRecipients?.cc?.items?.length && emailRecipients.cc.items.map((item: MessageRecipient, i: number) => (
                        <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'cc')}/>
                    ))}
                    {renderInputWithAutoComplete(emailRecipients.cc.value.email, 'cc')}
                </Flex>
            </Flex>
            <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                         color={'#374151'}>Bcc:</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                    {!!emailRecipients?.bcc?.items?.length && emailRecipients.bcc.items.map((item: MessageRecipient, i: number) => (
                        <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'bcc')}/>
                    ))}
                    {renderInputWithAutoComplete(emailRecipients.bcc.value.email, 'bcc')}
                </Flex>
            </Flex>
        </Flex>
    )
}
