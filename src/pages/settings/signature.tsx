import styles from "@/styles/setting.module.css";
import {Button, Flex, Heading, Text} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {RichTextEditor} from "@/components/common";
import {updateAccountDetails} from "@/redux/accounts/action-reducer";
import withAuth from "@/components/auth/withAuth";
import {getPlainTextFromHtml} from "@/utils/editor-common-functions";
import SettingsLayout from "@/pages/settings/settings-layout";
import {accountService, globalEventService} from "@/services";


function Signature() {

    const [signature, setSignature] = useState<string>('');
    const [isSignatureUpdate, setIsSignatureUpdate] = useState<boolean>(false);

    const {selectedAccount, account} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    useEffect(() => {
        // Add signature to email body
        if (selectedAccount && selectedAccount.signature) {
            setSignature(selectedAccount.signature);
        }
    }, [selectedAccount])


    useEffect(() => {
        if (account) {
            accountService.setSelectedAccount({...account});
            setIsSignatureUpdate(false);
        }
    }, [dispatch, account])


    const addSignature = (value: string) => {
        if (selectedAccount && selectedAccount.signature) {
            let currentEmailBody: string = getPlainTextFromHtml(value);
            let currentAccountSignature: string = getPlainTextFromHtml(selectedAccount.signature);
            if (currentEmailBody.trim().length) {
                if (value.trim() !== currentAccountSignature.trim()) {
                    setIsSignatureUpdate(true);
                }
            }
        }
        setSignature(value)
    }


    const submit = () => {
        if (signature) {
            if (selectedAccount && selectedAccount.id) {
                dispatch(updateAccountDetails({
                    toaster: {
                        success: {
                            desc: 'Signature updated successfully',
                            title: 'Signature updated',
                            type: 'success'
                        },
                    },
                    body: {
                        signature: signature,
                        id: selectedAccount.id
                    }
                }));
            }
        }
    }


    const cancelButtonClick = () => {
        if (selectedAccount && selectedAccount.signature) {
            globalEventService.fireEvent({data: {body: selectedAccount.signature}, type: 'editor.forceUpdate'});
            setSignature(selectedAccount.signature);
            setIsSignatureUpdate(false);
        }
    }

    return (
        <SettingsLayout>
            <Flex className={styles.settingPageBox} direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                    <Heading as='h4' size='lg' gap={1}> Signature </Heading>
                    <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                        here.</Text>
                </Flex>

                <Flex direction={"column"} className={styles.SettingDetails}>
                    <Flex direction={"column"} className={styles.settingSignature} gap={10}>
                        <Flex direction={"column"} gap={2} className={styles.profileAccount}>
                            <Text fontSize={'14px'}>Email Signature</Text>

                            <RichTextEditor className={`${styles.emailSignature} email-signature`}
                                            placeholder='Add Your Email Signature'
                                            value={signature} onChange={(e) => addSignature(e)}/>
                        </Flex>


                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <Text fontSize={'14px'}>Preview</Text>
                            <div className={styles.signaturePreview}>
                                <span
                                    dangerouslySetInnerHTML={{__html: `<p style="margin-bottom: 12px">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p> ${signature}`}}/>
                            </div>
                        </Flex>
                        {isSignatureUpdate && <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                            <Button className={styles.settingSave} onClick={submit}>Save</Button>
                            <Button className={styles.settingCancel} onClick={cancelButtonClick}>Cancel</Button>
                        </Flex>}

                    </Flex>
                </Flex>
            </Flex>
        </SettingsLayout>
    )
}


export default withAuth(Signature)
