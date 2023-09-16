import { Badge, Box, Drawer, DrawerContent, Flex, Text, useDisclosure } from '@chakra-ui/react';
import styles from '@/styles/Home.module.css';
import React from 'react';
import { EnergyIcon } from '@/icons';
import { CloseIcon } from '@chakra-ui/icons';

export const FeedSidebar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef(null);
    return (
        <>
            <Flex align={'center'} justify={'center'} className={styles.notificationIcon} onClick={onOpen}>
                <EnergyIcon />
                <Badge>3</Badge>
            </Flex>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                {/* <DrawerOverlay /> */}

                <DrawerContent>
                    <Box borderLeft="1px solid #F3F4F6" height="100vh">
                        {/* Header */}
                        <Box height="65px" borderBottom="1px solid #F3F4F6" padding="12px 16px" display="flex" justifyContent="space-between" alignItems="center">
                            <Flex align={'center'} justify={'center'} className={styles.feedIcon}>
                                <EnergyIcon />
                                <Badge>3</Badge>
                            </Flex>

                            <Box
                                onClick={onClose}
                                height="20px"
                                width="61px"
                                borderRadius="34px"
                                backgroundColor=" var(--alias-bg-subtle)"
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                cursor="pointer">
                                <CloseIcon color="#6B7280" boxSize={2} />
                                <Text fontSize="12px" ms="3px">
                                    Close
                                </Text>
                            </Box>
                        </Box>
                        {/* Content */}
                        <Box padding="12px 16px">
                            <FeedComponent isRead={true} />
                            <FeedComponent isRead={true} />
                            <FeedComponent isRead={true} detail={true} />
                            <FeedComponent detail={true} />
                            <FeedComponent detail={true} />
                        </Box>
                    </Box>
                </DrawerContent>
            </Drawer>
        </>
    );
};
interface FeedComponentProps {
    detail?: Boolean;
    isRead?: Boolean;
}
const FeedComponent: React.FC<FeedComponentProps> = ({ detail, isRead }) => {
    return (
        <Box padding="12px" background={isRead && 'var(--alias-bg-subtle)'} border={'1px solid var(--alias-bg-subtle)'} borderRadius="8px" marginBottom="8px">
            <Flex>
                <Box flex={1}>
                    <Text fontSize="13px">
                        <b>3 members</b> are composing a reply
                    </Text>
                    <Text color="#6B7280" fontSize="13px">
                        Now · Temporibus ea omnis
                    </Text>
                </Box>
                <Box width="30px" marginLeft="8px" alignItems="center" display="flex">
                    <Flex>
                        {['yellow', 'pink', 'lightGray']?.map(item => (
                            <Box key={item} height="17px" width="17px" borderRadius="100%" border="2px solid #28C07D" background={item} marginLeft="-8px"></Box>
                        ))}
                    </Flex>
                </Box>
            </Flex>
            {detail && (
                <Box>
                    <Box borderTop="1px solid #E5E7EB" marginTop="12px" paddingTop="12px" lineHeight="16px">
                        <Text fontSize={'12px'}>Here we can use some AI magic to have a short overview about what John has answered.</Text>
                    </Box>
                    <Box
                        height="26px"
                        width="fit-content"
                        borderRadius="34px"
                        backgroundColor="white"
                        border="1px solid #E5E7EB"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        padding="0px 6px"
                        marginTop="12px"
                        cursor="pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="4" y="3" width="12" height="14" rx="2" fill="#266DF0" />
                            <rect x="6" y="6" width="7.2" height="1.2" rx="0.6" fill="white" />
                            <rect x="6" y="8.39844" width="3.6" height="1.2" rx="0.6" fill="white" />
                            <rect x="6" y="10.8008" width="4.8" height="1.2" rx="0.6" fill="white" />
                        </svg>
                        <Text fontSize="12px" ms="3px">
                            Annual Report.doc
                        </Text>
                    </Box>
                </Box>
            )}
        </Box>
    );
};
