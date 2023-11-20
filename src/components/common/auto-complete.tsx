import {Box, HStack, Input, Popover, PopoverAnchor, PopoverBody, PopoverContent, Text} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {Contacts} from "@/models";
import {matchSorter} from "match-sorter";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {useEffect, useRef, useState} from "react";

export function AutoComplete({
                                 value,
                                 placeholder,
                                 handleChange, handleKeyDown,
                                 handlePaste, handleAutoCompleteSelect,
                                 openAutoComplete
                             }: {
    value: string, placeholder: string, handleChange: (_e: any) => void, openAutoComplete: boolean
    handleKeyDown: (_e: any) => void, handlePaste: (_e: any) => void, handleAutoCompleteSelect: (_e: any) => void
}) {
    const {contacts} = useSelector((state: StateType) => state.commonApis);
    const [finalContacts, setFinalContact] = useState<any>([]);
    const inputRef = useRef<HTMLInputElement | null>(null);

    function filterContacts(value: string) {
        if (!value) {
            return [];
        }
        let finalContacts: Contacts[] = matchSorter((contacts || []), value, {keys: ['email.email', 'email.name']});
        finalContacts = finalContacts.slice(0, finalContacts.length > 5 ? 5 : finalContacts.length);
        return finalContacts.map((contact: Contacts) => ({email: contact.email.email, name: contact.email.name}));
    }

    useEffect(() => {
        setFinalContact(filterContacts(value));
    }, [value])

    return (
        <Popover
            autoFocus={false}
            isOpen={openAutoComplete && finalContacts.length > 0}
            closeOnBlur={false}
            isLazy
            lazyBehavior='keepMounted'
            placement={'bottom-start'}
        >
            <HStack flex={1}>
                <PopoverAnchor>
                    <Input width={'100%'} display='inline-flex' lineHeight={1} letterSpacing={'-0.13px'} padding={0}
                           height={'20px'} flex={'1 0 auto'}
                           fontSize={'13px'} border={0} className={styles.ccInput}
                           value={value} ref={inputRef}
                           onKeyDown={(e) => handleKeyDown(e)}
                           onChange={(e) => handleChange(e)}
                           onPaste={(e) => handlePaste(e)}
                           placeholder={placeholder}
                    />
                </PopoverAnchor>
            </HStack>
            <PopoverContent>
                <PopoverBody p={0}>
                    {finalContacts.map((contact: any, index: number) => (
                        <Box onClick={() => {
                            handleAutoCompleteSelect(contact)
                            if (inputRef && inputRef.current) {
                                inputRef.current?.focus()
                            }
                        }} className={styles.emailRecipientsAutoComplete} key={index} cursor={'pointer'} px={4}>
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
