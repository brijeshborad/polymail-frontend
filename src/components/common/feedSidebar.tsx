import {Badge, Box, Drawer, DrawerContent, Flex, Text, useDisclosure} from '@chakra-ui/react';
import styles from '@/styles/Home.module.css';
import React, {useEffect, useState} from 'react';
import {EnergyIcon} from '@/icons';
import {CloseIcon} from '@chakra-ui/icons';
import dynamic from 'next/dynamic'
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {ActivityFeed} from "@/models/activityFeed";
import {ACTIVITY_FEED_EVENT_TYPES} from "@/utils/constants";
import {globalEventService, socketService} from "@/services";
import Tooltip from "@/components/common/Tooltip";
import {markActivityAsRead} from "@/redux/common-apis/action-reducer";
import dayjs from "dayjs";
import {getAllProjects} from "@/redux/projects/action-reducer";

const FeedComponent = dynamic(
    () => import('./feedComponent').then((mod) => mod.FeedComponent)
)

export const FeedSidebar = () => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    // const [selectedMenu, setSelectedMenu] = React.useState('Disney Launch');
    const btnRef = React.useRef(null);
    const {newMessage} = useSelector((state: StateType) => state.socket);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {activityFeed} = useSelector((state: StateType) => state.commonApis);
    const dispatch = useDispatch();
    const [feeds, setFeeds] = useState<ActivityFeed[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [lastActiveRead, setLastActivityRead] = useState<number>(0);

    useEffect(() => {
        if (newMessage && newMessage.name === 'Activity') {
            socketService.updateSocketMessage(null);
            if (ACTIVITY_FEED_EVENT_TYPES.includes(newMessage.data.Type)) {
                if (newMessage.data.Type === 'ThreadShared' || newMessage.data.Type === 'ProjectInvite' || newMessage.data.Type === 'MemberJoined') {
                    globalEventService.fireEvent({
                        type: 'show-notification',
                        data: {
                            title: `${newMessage.data.Username} ${newMessage.data.Title}`,
                            data: {
                                body: newMessage.data.Subtitle,
                                tag: `${newMessage.data.Type}-${newMessage.data.Created}`
                            }
                        }
                    })
                }
                if (newMessage.data.Type === 'MemberJoined') {
                    dispatch(getAllProjects({noBlank: true}));
                }
                let currentFeeds: ActivityFeed[] = [...feeds];
                currentFeeds.push({
                    created: newMessage.data.Created,
                    title: newMessage.data.Title,
                    subtitle: newMessage.data.Subtitle,
                    body: newMessage.data.Body,
                    username: newMessage.data.Username,
                    isRead: userDetails ? !dayjs(newMessage.data.Created).isAfter(dayjs(userDetails.activitiesRead)) : false,
                })
                setFeeds([...currentFeeds]);
            }

        }
    }, [newMessage, dispatch, feeds, userDetails])

    useEffect(() => {
        setUnreadCount(feeds.filter((t: ActivityFeed) => !t.isRead).length);
    }, [feeds])

    useEffect(() => {
        if (activityFeed && activityFeed.length > 0 && userDetails) {
            setFeeds([...activityFeed.map(item => {
                let finalItem = {...item};
                finalItem.isRead = userDetails ? !dayjs(item.created).isAfter(dayjs(userDetails.activitiesRead)) : false;
                return finalItem
            })]);
        }
    }, [activityFeed, userDetails]);

    function getLastActivityFeed () {
        let findLastActivityIndex = feeds.sort((a, b) => {
            if (dayjs(b.created!).isBefore(dayjs(a.created))) {
                return -1
            }
            return 0
        }).findLastIndex(t => !t.isRead);
        setLastActivityRead(findLastActivityIndex);
    }

    function markFeedAsRead(index: number) {
        let currentFeeds = [...feeds];
        currentFeeds[index] = {
            ...currentFeeds[index],
            isRead: true
        };
        setFeeds([...currentFeeds]);
    }

    function markAllAsRead() {
        if (feeds.filter(item => !item.isRead).length > 0) {
            dispatch(markActivityAsRead({}));
            let currentFeeds = [...feeds].map(item => {
                let finalItem = {...item};
                finalItem.isRead = true
                return finalItem;
            });
            setFeeds([...currentFeeds]);
        }
    }

    return (
        <>
            <Tooltip label={'Activity Feed'} placement={'bottom'}>
                <Flex align={'center'} cursor={'pointer'} justify={'center'}
                      className={`${styles.notificationIcon} ${unreadCount > 0 ? styles.notificationIconUnRead : ''}`}
                      onClick={() => {
                          onOpen();
                          getLastActivityFeed();
                          markAllAsRead();
                      }}>
                    <EnergyIcon fill={unreadCount > 0 ? '#fff' : '#08162F'}/>
                    {unreadCount > 0 ? (<Badge>{unreadCount}</Badge>) : null}
                </Flex>
            </Tooltip>
            <Drawer isOpen={isOpen} placement="right" onClose={() => {
                onClose();
                setLastActivityRead(0)
            }} finalFocusRef={btnRef}>
                {/* <DrawerOverlay /> */}

                <DrawerContent>
                    <Box borderLeft="1px solid #F3F4F6" maxH="100vh" overflowY={'scroll'}>
                        {/* Header */}
                        <Box height="65px" borderBottom="1px solid #F3F4F6" padding="12px 16px" display="flex"
                             justifyContent="space-between" alignItems="center" position={'sticky'} top={0}
                             background={'#fff'}>
                            <Flex align={'center'} justify={'center'}>
                                <Text fontStyle="bold">Updates</Text>
                            </Flex>

                            <Box
                                onClick={() => {
                                    onClose();
                                    setLastActivityRead(0)
                                }}
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
                            {feeds
                                .sort((a, b) => {
                                    if (dayjs(b.created!).isBefore(dayjs(a.created))) {
                                        return -1
                                    }
                                    return 0
                                })
                                .map((t: ActivityFeed, index: number) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <FeedComponent feedData={t}
                                                           markFeedAsRead={() => markFeedAsRead(index)}/>
                                            {(lastActiveRead === index) &&
                                            <Text marginBottom={'8px'} fontSize={'13px'} color={'red'} display={'flex'} alignItems={'center'}>New
                                                <hr style={{width: '100%', marginLeft: '5px', borderColor: 'red', marginTop: '3px'}}/></Text>}
                                        </React.Fragment>
                                    )
                                })}
                        </Box>
                    </Box>
                </DrawerContent>
            </Drawer>
        </>
    );
};
