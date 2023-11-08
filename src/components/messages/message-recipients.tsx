import {
    Flex,
    Heading
} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {Chip, Toaster} from "@/components/common";
import {MessageRecipientsType, RecipientsType} from "@/types/props-types/message-recipients.type";
import {MessageRecipient} from "@/models/message";
import {ChangeEvent, useEffect, useState} from "react";
import {isEmail} from "@/utils/common.functions";
import {AutoComplete} from "@/components/common/auto-complete";

const blankRecipientValue: MessageRecipient = {
    name: '',
    email: ''
}

export default function MessageRecipients({emailRecipients: values, updateValues}: MessageRecipientsType) {
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
            let value = emailRecipients[type as keyof RecipientsType].value.email.trim();
            if (value) {
                evt.preventDefault();
            }

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
        if (evt.key === "Backspace") {
            if (!evt.target.value) {
                evt.preventDefault();
                let items = [...emailRecipients[type as keyof RecipientsType].items];
                if (items.length > 0) {
                    handleItemDelete(items[items.length - 1].email, type);
                }
            }
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
                    <AutoComplete value={emailRecipients.recipients.value.email} placeholder={``}
                                  handleChange={(e) => handleChange(e, 'recipients')}
                                  openAutoComplete={emailRecipients.recipients.value.email.length > 0}
                                  handleKeyDown={(e) => handleKeyDown(e, 'recipients')}
                                  handlePaste={(e) => handlePaste(e, 'recipients')}
                                  handleAutoCompleteSelect={(e) => handleAutoCompleteSelect(e, 'recipients')}/>
                </Flex>
            </Flex>
            <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                         color={'#374151'}>Cc:</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                    {!!emailRecipients?.cc?.items?.length && emailRecipients.cc.items.map((item: MessageRecipient, i: number) => (
                        <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'cc')}/>
                    ))}
                    <AutoComplete value={emailRecipients.cc.value.email} placeholder={``}
                                  handleChange={(e) => handleChange(e, 'cc')}
                                  openAutoComplete={emailRecipients.cc.value.email.length > 0}
                                  handleKeyDown={(e) => handleKeyDown(e, 'cc')}
                                  handlePaste={(e) => handlePaste(e, 'cc')}
                                  handleAutoCompleteSelect={(e) => handleAutoCompleteSelect(e, 'cc')}/>
                </Flex>
            </Flex>
            <Flex width={'100%'} gap={2} padding={'4px 16px'} className={styles.replyBoxCC}>
                <Heading as={'h6'} fontSize={'13px'} paddingTop={1} fontWeight={500} lineHeight={1}
                         color={'#374151'}>Bcc:</Heading>
                <Flex alignItems={'center'} wrap={'wrap'} width={'100%'} gap={1}>
                    {!!emailRecipients?.bcc?.items?.length && emailRecipients.bcc.items.map((item: MessageRecipient, i: number) => (
                        <Chip text={item.email} key={i} click={() => handleItemDelete(item.email!, 'bcc')}/>
                    ))}
                    <AutoComplete value={emailRecipients.bcc.value.email} placeholder={``}
                                  handleChange={(e) => handleChange(e, 'bcc')}
                                  openAutoComplete={emailRecipients.bcc.value.email.length > 0}
                                  handleKeyDown={(e) => handleKeyDown(e, 'bcc')}
                                  handlePaste={(e) => handlePaste(e, 'bcc')}
                                  handleAutoCompleteSelect={(e) => handleAutoCompleteSelect(e, 'bcc')}/>
                </Flex>
            </Flex>
        </Flex>
    )
}
