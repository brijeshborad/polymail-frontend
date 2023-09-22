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
import {Chip} from "@/components/common";
import {MessageRecipientsType} from "@/types/props-types/message-recipients.type";
import {MessageRecipient} from "@/models/message";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {matchSorter} from "match-sorter";
import {Contacts} from "@/models";

export default function MessageRecipients({
                                              emailRecipients,
                                              handleKeyDown,
                                              handleChange,
                                              handlePaste,
                                              handleItemDelete,
                                              handleAutoCompleteSelect
                                          }: MessageRecipientsType) {
    const {contacts} = useSelector((state: StateType) => state.commonApis);

    function filterContacts(value: string) {
        if (!value) {
            return [];
        }
        let finalContacts: Contacts[] = matchSorter((contacts || []), value, {keys: ['email.email', 'email.name']});
        finalContacts = finalContacts.slice(0, finalContacts.length > 5 ? 5 : finalContacts.length);
        return finalContacts.map((contact: Contacts) => ({email: contact.email.email, name: contact.email.name}));
    }

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
                <HStack>
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
                                {contact.name && <Text title={`${contact.name} <${contact.email}>`}>{contact.name} &#60;{contact.email}&gt;</Text>}
                                {!contact.name && <Text title={`${contact.email} <${contact.email}>`}>{contact.email} &#60;{contact.email}&gt;</Text>}

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
