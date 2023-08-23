import styles from "@/styles/setting.module.css";
import {Button, Flex, Text} from "@chakra-ui/react";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {RichTextEditor} from "@/components/common";
import {updateAccountDetails} from "@/redux/accounts/action-reducer";

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
            </Flex>
        </div>
    )
}

