import {Box, Button, createStandaloneToast, Flex, Heading, Text} from "@chakra-ui/react";
import {ToasterProps} from "@/types/props-types/toaster.type";
import styles from "@/styles/Home.module.css";
import {CheckIcon, SmallCloseIcon} from "@chakra-ui/icons";
import React/*, {useCallback}*/ from "react";
//import {useDispatch} from "react-redux";
//import {googleAuthLink} from "@/redux/auth/action-reducer";

const {toast} = createStandaloneToast()

export function Toaster(props: ToasterProps) {
    /*
    const dispatch = useDispatch();

    const connectGoogleAccount = useCallback((mode: string) => {
        let body = {
            mode,
            redirectUrl: `${process.env.NEXT_PUBLIC_GOOGLE_AUTH_REDIRECT_URL}/inbox`,
            accountType: "google",
            platform: "web",
            withToken: true
        }
        dispatch(googleAuthLink(body));
    }, [dispatch, toast])
    */

    if (toast.isActive('poly-toast')) {
        return null;
    }
    return (
        toast({
            id: 'poly-toast',
            duration: (props.type !== 'reauth') ? 2500 : null,
            isClosable: (props.type !== 'reauth') ? true : false,
            render: () => {
                // toastRefs.current.push(onClose);
                return (
                    <Box /*onClick={() => (props.type === 'reauth') && connectGoogleAccount('authenticate') } */
                        display={'flex'} alignItems={'center'} color='#000000' p={3} bg='#FFFFFF'
                         borderRadius={'8px'} border={'1px solid #E5E7EB'} boxShadow={'0 0 12px 0 rgba(0,0,0, 0.08)'}
                         className={styles.mailToaster} padding={'16px'} gap={2}>
                        {(['reauth', 'error']).includes(props.type) ?
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

                        {props.type !== 'reauth' && (
                        <Button
                            className={styles.toasterCloseIcon}
                            ml={'auto'} height={"auto"}
                            backgroundColor={'transparent'} padding={'0'}
                            minWidth={'auto'}><SmallCloseIcon onClick={() => toast.close('poly-toast')}/></Button>
                        )}
                    </Box>
                )
            },
            position: 'bottom-left'
        })
    )
}
