import {Badge, Box, Flex, Heading, Slide, Text, useDisclosure, useOutsideClick} from '@chakra-ui/react';
import styles from '@/styles/Home.module.css';
import React, {useEffect, useState} from 'react';
import {EnergyIcon} from '@/icons';
import {CloseIcon} from '@chakra-ui/icons';
import dynamic from 'next/dynamic'
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {ActivityFeed} from "@/models/activityFeed";
import {globalEventService} from "@/services";
import Tooltip from "@/components/common/Tooltip";
import {markActivityAsRead} from "@/redux/common-apis/action-reducer";
import dayjs from "dayjs";

const FeedComponent = dynamic(
    () => import('./feedComponent').then((mod) => mod.FeedComponent)
)

export const FeedSidebar = () => {
    const {isOpen, onToggle} = useDisclosure();
    const btnRef = React.useRef(null);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {activityFeed} = useSelector((state: StateType) => state.commonApis);
    const dispatch = useDispatch();
    const [feeds, setFeeds] = useState<ActivityFeed[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [lastActiveRead, setLastActivityRead] = useState<number>(0);
    useOutsideClick({
        ref: btnRef,
        handler: () => isOpen ? onToggle() : null,
    })

    useEffect(() => {
        setUnreadCount(feeds.filter((t: ActivityFeed) => !t.isRead).length);
    }, [feeds])

    useEffect(() => {
        if (typeof incomingEvent === 'object' && incomingEvent.type) {
            if (incomingEvent.type === 'activity.new') {
                globalEventService.blankEvent();
                let currentFeeds: ActivityFeed[] = [...feeds];
                currentFeeds.push({
                    projectId: incomingEvent.data.ProjectID,
                    created: incomingEvent.data.Created,
                    title: incomingEvent.data.Title,
                    subtitle: incomingEvent.data.Subtitle,
                    body: incomingEvent.data.Body,
                    avatar: {...incomingEvent.data.Avatar, url: incomingEvent.data.Avatar.URL},
                    // username: userDetails && userDetails.id === newMessage.data.UserID ? 'You' : newMessage.data.Username,
                    username: incomingEvent.data.Username,
                    isRead: userDetails ? !dayjs(incomingEvent.data.Created).isAfter(dayjs(userDetails.activitiesRead)) : false,
                })
                setFeeds([...currentFeeds]);
            }
        }
    }, [feeds, incomingEvent, userDetails])

    useEffect(() => {
        if (activityFeed && activityFeed.length > 0 && userDetails) {
            setFeeds([...activityFeed.map(item => {
                let finalItem = {...item};
                // finalItem.username = userDetails && userDetails.id === item.userId ? 'You' : item.username;
                finalItem.username = item.username;
                finalItem.isRead = userDetails ? !dayjs(item.created).isAfter(dayjs(userDetails.activitiesRead)) : false;
                return finalItem
            })]);
        }
    }, [activityFeed, userDetails]);

    function getLastActivityFeed() {
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
                          onToggle();
                          getLastActivityFeed();
                          markAllAsRead();
                      }}>
                    <EnergyIcon fill={unreadCount > 0 ? '#fff' : '#08162F'}/>
                    {unreadCount > 0 ? (<Badge>{unreadCount}</Badge>) : null}
                </Flex>
            </Tooltip>
            <Slide in={isOpen} direction="right"
                   style={{
                       zIndex: 10, maxWidth: '20rem', maxHeight: '100vh', background: '#ffffff',
                       boxShadow: 'var(--chakra-shadows-lg)', transition: 'all .05s'
                   }} ref={btnRef}>
                {/* <DrawerOverlay /> */}
                <Box borderLeft="1px solid #F3F4F6" display={'flex'} flexDirection={'column'} h={'100%'} maxH="100vh" overflowY={'scroll'}>
                    {/* Header */}
                    <Box height="65px" borderBottom="1px solid #F3F4F6" padding="12px 16px" display="flex"
                         justifyContent="space-between" alignItems="center" position={'sticky'} top={0}
                         background={'#fff'}>
                        <Box
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onToggle();
                                setLastActivityRead(-1)
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

                        <Flex align={'center'} justify={'center'}>
                            <Text fontStyle="bold" fontSize={'14px'}>Updates</Text>
                        </Flex>
                    </Box>
                    <Box padding="12px 16px" flex={1} display={'flex'} flexDirection={'column'}>
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
                                        <FeedComponent feedData={t} close={onToggle}
                                                       markFeedAsRead={() => markFeedAsRead(index)}/>
                                        {(lastActiveRead === index) &&
                                        <Flex align={'center'} marginBottom={'8px'}>
                                            <Text fontSize={'13px'} color={'red'} display={'flex'}
                                                  alignItems={'center'}>New</Text>
                                            <hr style={{
                                                width: '100%',
                                                marginLeft: '5px',
                                                borderColor: 'red',
                                                marginTop: '3px'
                                            }}/>
                                        </Flex>}
                                    </React.Fragment>
                                )
                            })}
                        {feeds.length <= 0 && <Flex align={'center'} justify={'center'} flex={1}>
                            <Heading as='h3' size='md' color={'rgba(0, 0, 0, 0.2)'}>No Updates</Heading>
                        </Flex>}

                    </Box>
                </Box>
            </Slide>
        </>
    );
};
