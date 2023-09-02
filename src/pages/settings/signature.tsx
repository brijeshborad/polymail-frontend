import styles from "@/styles/setting.module.css";
import {Button, Flex, Grid, GridItem, Heading, Text} from "@chakra-ui/react";
import {EmojiIcon, FileIcon, LinkIcon, TextIcon} from "@/icons";
import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {RichTextEditor, Toaster} from "@/components/common";
import {updateAccountDetails, updateAccountState} from "@/redux/accounts/action-reducer";
import Index from "@/pages/settings/index";
import withAuth from "@/components/withAuth";

function Signature() {

    const [signature, setSignature] = useState<string>('');
    const {selectedAccount, account, success} = useSelector((state: StateType) => state.accounts);
    const dispatch = useDispatch();

    useEffect(() => {
        // Add signature to email body
        if (selectedAccount && selectedAccount.signature) {
            setSignature(selectedAccount.signature);
        }
    }, [selectedAccount])

    useEffect(() => {
        if (account && success) {
            dispatch(updateAccountState({selectedAccount: {...account}}));
            Toaster({desc: 'Signature updated successfully',title: 'Signature updated', type: 'success'})
        }
    }, [dispatch, account, success])


    const addSignature = (value: string) => {
        setSignature(value)
    }

    const submit = () => {
        if (signature) {
            if (selectedAccount && selectedAccount.id) {
                dispatch(updateAccountDetails({signature: signature, id: selectedAccount.id}));
            }
        }
    }

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
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

                                    <RichTextEditor className={styles.emailSignature} initialUpdated={true} hideToolBar={true}
                                                    placeholder='Add Your Email Signature'
                                                    value={signature} onChange={(e) => addSignature(e)}/>

                                    <Flex align={'center'} gap={3} className={styles.settingSignatureIcon}>
                                        <FileIcon/>
                                        <LinkIcon/>
                                        <TextIcon/>
                                        <EmojiIcon/>
                                    </Flex>
                                </Flex>


                                <Flex direction={"column"} className={styles.SettingDetails}>
                                    <Text fontSize={'14px'}>Preview</Text>
                                    <div className={styles.signaturePreview}>
                                        <span dangerouslySetInnerHTML={{__html: `<p style="margin-bottom: 12px">Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.</p> ${signature}`}} />
                                    </div>
                                </Flex>


                                <Flex align={'center'} gap={2} mt={10} className={styles.settingButton}>
                                    <Button className={styles.settingSave} onClick={submit}>Save</Button>
                                    <Button className={styles.settingCancel}>Cancel</Button>
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

        </div>
    )
}


export default withAuth(Signature)
