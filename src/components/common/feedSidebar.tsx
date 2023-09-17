import { Badge, Box, Drawer, DrawerContent, Flex, Text, useDisclosure } from '@chakra-ui/react';
import styles from '@/styles/Home.module.css';
import React from 'react';
import { EnergyIcon } from '@/icons';
import { CloseIcon } from '@chakra-ui/icons';
import { FeedComponent } from './feedComponent';

export const FeedSidebar = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedMenu, setSelectedMenu] = React.useState('Disney Launch');
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
                        <Box margin="12px 16px" mb="6px" height="36px" display={'flex'} backgroundColor=" var(--alias-bg-subtle)" borderRadius="6px">
                            {['Disney Launch', 'Everything'].map(item => (
                                <Box
                                    key={item}
                                    onClick={() => setSelectedMenu(item)}
                                    color={item === selectedMenu ? 'black' : '#6B7280'}
                                    width="50%"
                                    alignItems={'center'}
                                    display="flex"
                                    justifyContent="center"
                                    backgroundColor={item === selectedMenu ? 'white' : 'var(--alias-bg-subtle)'}
                                    borderRadius="6px"
                                    cursor="pointer"
                                    margin="2px">
                                    <Text fontSize="13px">{item}</Text>
                                </Box>
                            ))}
                        </Box>

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
