import {Box, Button, createStandaloneToast, Flex, Heading, Text} from "@chakra-ui/react";
import {ToasterProps} from "@/types/props-types/toaster.type";
import styles from "@/styles/Home.module.css";
import {CheckIcon, SmallCloseIcon} from "@chakra-ui/icons";
import React from "react";

const {toast} = createStandaloneToast()

export function Toaster(props: ToasterProps) {
    if (toast.isActive('poly-toast')) {
        return null;
    }
    return (
        toast({
            id: 'poly-toast',
            duration: 2500,
            isClosable: true,
            render: () => {
                // toastRefs.current.push(onClose);
                return (
                    <Box display={'flex'} alignItems={'center'} color='#000000' p={3} bg='#FFFFFF'
                         borderRadius={'8px'} border={'1px solid #E5E7EB'} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}
                         className={styles.mailToaster} padding={'16px'} gap={2}>
                        {props.type === 'error' ?
                            <div className={`${styles.toastIcon} ${styles.toastCloseIcon}`}>
                                <SmallCloseIcon onClick={() => toast.close('poly-toast')}/>
                            </div> :
                            <div className={`${styles.toastIcon} ${styles.toastSuccessIcon}`}>
                                <CheckIcon onClick={() => toast.close('poly-toast')}/>
                            </div>
                        }


                        <Flex direction={'column'} gap={'2px'}>
                            <Heading as='h6' fontSize={'15px'} lineHeight={'1.21'}>{props.title}</Heading>
                            <Text fontSize='13px' color={'#6B7280'} lineHeight={'1.21'}>{props.desc}</Text>
                        </Flex>

                        <Button
                            className={styles.toasterCloseIcon}
                            ml={'auto'} height={"auto"}
                            backgroundColor={'transparent'} padding={'0'}
                            minWidth={'auto'}><SmallCloseIcon onClick={() => toast.close('poly-toast')}/></Button>
                        {/*<Button className={styles.toasterUndoButton} ml={'auto'} fontWeight={500} fontSize={'12px'}*/}
                        {/*        borderRadius={'50px'} height={"auto"} color={'#FFFFFF'} backgroundColor={'#1F2937'}*/}
                        {/*        padding={'4px 8px'} minWidth={'auto'}>Undo</Button>*/}
                    </Box>
                )
            },
            position: 'bottom-left'
        })
    )
}
