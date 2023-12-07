import {Box, Button, createStandaloneToast, Flex, Heading, Text} from "@chakra-ui/react";
import {ToasterProps} from "@/types/props-types/toaster.type";
import styles from "@/styles/Home.module.css";
import {CheckIcon, SmallCloseIcon} from "@chakra-ui/icons";
import React from "react";
import {generateToasterId} from "@/utils/common.functions";

const {toast} = createStandaloneToast()

export function Toaster(props: ToasterProps) {
    let polyToasterId = generateToasterId();
    if (props.id) {
        polyToasterId = props.id;
    }
    if (toast.isActive(`${polyToasterId}`)) {
        return null;
    }
    return (
        toast({
            id: polyToasterId,
            duration: (props.type !== 'reauth') ? 5000 : null,
            isClosable: props.type !== 'reauth',
            render: () => {
                return (
                    <Box
                        display={'flex'} alignItems={'center'} color='#000000' p={3} bg='#FFFFFF'
                        borderRadius={'8px'} border={'1px solid #E5E7EB'}
                        boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'} cursor={props.onClick ? 'pointer' : 'inherit'}
                        onClick={() => props.onClick ? props.onClick() : null}
                        className={styles.mailToaster} padding={'16px'} gap={2}>
                        {(['reauth', 'error']).includes(props.type) ?
                            <div className={`${styles.toastIcon} ${styles.toastCloseIcon}`}>
                                <SmallCloseIcon onClick={() => toast.close(`${props.id ? props.id : polyToasterId}`)}/>
                            </div> :
                            <div className={`${styles.toastIcon} ${styles.toastSuccessIcon}`}>
                                <CheckIcon onClick={() => toast.close(`${props.id ? props.id : polyToasterId}`)}/>
                            </div>
                        }

                        <Flex direction={'column'} gap={'2px'}>
                            <Heading as='h6' fontSize={'15px'} lineHeight={'1.21'} noOfLines={1}>{props.title}</Heading>
                            <Text fontSize='13px' color={'#6B7280'} lineHeight={'1.21'}
                                  noOfLines={1}>{props.desc}</Text>
                        </Flex>

                        {props.type === 'send_confirmation' && (
                            <>
                                <Button className={styles.toasterUndoButton} backgroundColor={'#1F2937'}
                                        color={'#FFFFFF'} fontSize={'13px'} lineHeight={1} height={"fit-content"}
                                        onClick={() => props.undoClick ? props.undoClick('undo') : null}
                                        padding={'5px 12px 6px'} borderRadius={'20px'}>Undo</Button>
                                <Button className={styles.toasterUndoButton} borderRadius={'20px'}
                                        backgroundColor={'#1F2937'} color={'#FFFFFF'} fontSize={'13px'} lineHeight={1}
                                        onClick={() => props.undoClick ? props.undoClick('send-now') : null}
                                        height={"fit-content"} padding={'5px 12px 6px'}>Send Now</Button>
                            </>
                        )}
                        <div style={{marginLeft: 'auto'}}>
                            {props.type === 'undo_changes' && (
                                <>
                                    <Button className={styles.toasterUndoButton} backgroundColor={'#1F2937'}
                                            color={'#FFFFFF'} fontSize={'13px'} lineHeight={1} height={"fit-content"} padding={'5px 12px 6px'}
                                            onClick={() => props.undoUpdateRecordClick ? props.undoUpdateRecordClick() : null}
                                            borderRadius={'20px'} minW={'2px'} w={'fit-content'}>Undo</Button>
                                </>
                            )}
                            {['success', 'error', 'undo_changes'].includes(props.type) && (
                                <Button
                                    className={styles.toasterCloseIcon} ml={2} height={"auto"}
                                    backgroundColor={'transparent'} padding={'0'}
                                    minWidth={'auto'}><SmallCloseIcon
                                    onClick={() => toast.close(`${props.id ? props.id : polyToasterId}`)}/></Button>
                            )}
                        </div>

                    </Box>
                )
            },
            position: 'bottom'
        })
    )
}
