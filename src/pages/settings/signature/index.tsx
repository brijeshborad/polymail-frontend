import styles from "@/styles/setting.module.css";
import {Button, Flex, GridItem, Heading, Text} from "@chakra-ui/react";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {RichTextEditor} from "@/components/common";
import {updateAccountDetails} from "@/redux/accounts/action-reducer";
import Index from "@/pages/settings";

export default function Signature() {

    const [emailBody, setEmailBody] = useState<string>('');
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    useEffect(() => {
        // Add signature to email body
        if (selectedAccount && selectedAccount.signature) {
            setEmailBody(selectedAccount.signature);
        }
    }, [selectedAccount])


    const sendToDraft = (value: string) => {
        setEmailBody(value)
    }
    useEffect(() => {
    }, [emailBody])

    const submit = () => {
        if (emailBody) {
            if (selectedAccount && selectedAccount.id) {
                dispatch(updateAccountDetails({signature: emailBody, id: selectedAccount.id}));
            }
        }
    }

    return (
        <div>
            <Index />

            <GridItem w='100%'>
                <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                    <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                        <Heading as='h4' size='lg' gap={1}> Signature </Heading>
                        <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                            here.</Text>
                    </Flex>

                    <Flex direction={"column"} className={styles.SettingDetails}>
                        <Flex direction={"column"} className={styles.settingSignature} gap={10}>
                            <Flex direction={"column"} gap={2} className={styles.profileAccount}>
                                <Text fontSize={'14px'}>Email Signature</Text>

                                <RichTextEditor className={styles.replyMessageArea} initialUpdated={true} hideToolBar={true}
                                                placeholder='Add Your Email Signature'
                                                value={emailBody} onChange={(e) => sendToDraft(e)}/>

                                <Flex align={'center'} gap={3} className={styles.settingSignatureIcon}>
                                    <FileIcon/>
                                    <LinkIcon/>
                                    <TextIcon/>
                                    <EmojiIcon/>
                                </Flex>
                            </Flex>


                            <Flex direction={"column"} className={styles.SettingDetails}>
                                Preview
                            </Flex>

                            <iframe srcDoc={emailBody} />
                            <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                <Button className={styles.settingSave} onClick={submit}>Save</Button>
                                <Button className={styles.settingCancel}>Cancel</Button>
                            </Flex>
                        </Flex>                    </Flex>
                </Flex>
            </GridItem>

        </div>
    )
}

