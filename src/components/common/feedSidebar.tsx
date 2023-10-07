import {Badge, Box, Drawer, DrawerContent, Flex, Text, useDisclosure} from '@chakra-ui/react';
import styles from '@/styles/Home.module.css';
import React, {useEffect, useState} from 'react';
import {EnergyIcon} from '@/icons';
import {CloseIcon} from '@chakra-ui/icons';
import dynamic from 'next/dynamic'
import {updateLastMessage} from "@/redux/socket/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {ActivityFeed} from "@/models/activityFeed";

const FeedComponent = dynamic(
    () => import('./feedComponent').then((mod) => mod.FeedComponent)
)

export const FeedSidebar = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    // const [selectedMenu, setSelectedMenu] = React.useState('Disney Launch');
    const btnRef = React.useRef(null);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const dispatch = useDispatch();
    const [feeds, setFeeds] = useState<ActivityFeed[]>([]);

    useEffect(() => {
        if (newMessage && newMessage.name === 'Activity') {
            dispatch(updateLastMessage(null));
            if (['ThreadShared'].includes(newMessage.data.type)) {
                console.log('----', feeds, newMessage);
                let currentFeeds: ActivityFeed[] = [...feeds];
                if (currentFeeds.length > 0) {
                    currentFeeds.unshift({
                        created: newMessage.data.created,
                        title: newMessage.data.title,
                        subtitle: newMessage.data.subtitle,
                        body: newMessage.data.body,
                        isRead: false,
                    })
                } else {
                    currentFeeds.push({
                        created: newMessage.data.created,
                        title: newMessage.data.title,
                        subtitle: newMessage.data.subtitle,
                        body: newMessage.data.body,
                        isRead: false,
                    })
                }
                setFeeds([...currentFeeds]);
            }

        }
    }, [newMessage, dispatch, feeds])

    function markFeedAsRead(index: number) {
        let currentFeeds = [...feeds];
        currentFeeds[index] = {
            ...currentFeeds[index],
            isRead: true
        };
        setFeeds([...currentFeeds]);
    }

    return (
        <>
            <Flex align={'center'} cursor={'pointer'} justify={'center'} className={styles.notificationIcon}
                  onClick={onOpen}>
                <EnergyIcon/>
                <Badge>{feeds.filter((t: ActivityFeed) => !t.isRead).length}</Badge>
            </Flex>
            <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
                {/* <DrawerOverlay /> */}

                <DrawerContent>
                    <Box borderLeft="1px solid #F3F4F6" maxH="100vh" overflowY={'scroll'}>
                        {/* Header */}
                        <Box height="65px" borderBottom="1px solid #F3F4F6" padding="12px 16px" display="flex"
                             justifyContent="space-between" alignItems="center" position={'sticky'} top={0} background={'#fff'}>
                            <Flex align={'center'} justify={'center'}>
                                <Text fontStyle="bold">Updates</Text>
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
                                <CloseIcon color="#6B7280" boxSize={2}/>
                                <Text fontSize="12px" ms="3px">
                                    Close
                                </Text>
                            </Box>
                        </Box>
                        {/* Content */}
                        {/*<Box margin="12px 16px" mb="6px" height="36px" display={'flex'}*/}
                        {/*     backgroundColor=" var(--alias-bg-subtle)" borderRadius="6px">*/}
                        {/*    {['Disney Launch', 'Everything'].map(item => (*/}
                        {/*        <Box*/}
                        {/*            key={item}*/}
                        {/*            onClick={() => setSelectedMenu(item)}*/}
                        {/*            color={item === selectedMenu ? 'black' : '#6B7280'}*/}
                        {/*            width="50%"*/}
                        {/*            alignItems={'center'}*/}
                        {/*            display="flex"*/}
                        {/*            justifyContent="center"*/}
                        {/*            backgroundColor={item === selectedMenu ? 'white' : 'var(--alias-bg-subtle)'}*/}
                        {/*            borderRadius="6px"*/}
                        {/*            cursor="pointer"*/}
                        {/*            margin="2px">*/}
                        {/*            <Text fontSize="13px">{item}</Text>*/}
                        {/*        </Box>*/}
                        {/*    ))}*/}
                        {/*</Box>*/}

                        <Box padding="12px 16px">
                            {feeds.map((t: ActivityFeed, index: number) => (
                                <FeedComponent key={index} feedData={t} markFeedAsRead={() => markFeedAsRead(index)}/>
                            ))}
                            {/*<FeedComponent isRead={true}/>*/}
                            {/*<FeedComponent isRead={true} detail={true}/>*/}
                            {/*<FeedComponent detail={true}/>*/}
                            {/*<FeedComponent detail={true}/>*/}
                        </Box>
                    </Box>
                </DrawerContent>
            </Drawer>
        </>
    );
};
