import {MessageBoxLoader} from "@/components/messages/message-view/message-box-loader";
import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Button, Flex, Heading, Text} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {debounce} from "@/utils/common.functions";
import dynamic from "next/dynamic";
import {ArchiveIcon,ForwardIcon, MuteIcon, ReplyIcon, TrashIcon} from "@/icons";
import {useAllLoader} from "@/hooks/all-loader.hook";
import {MAILBOX_ARCHIVE, MAILBOX_TRASH} from "@/utils/constants";
import MessageSchedule from "@/components/messages/message-schedule";

const MessagesHeader = dynamic(() => import('@/components/messages/messages-header').then(mod => mod.MessagesHeader));
const MessageBox = dynamic(() => import('@/components/messages/message-box').then(mod => mod.MessageBox));
const MessageReplyBox = dynamic(() => import('@/components/messages/message-reply-box').then(mod => mod.MessageReplyBox));

export function MessageBoxContent({isProjectView = false}: { isProjectView?: boolean }) {
    const messagesWrapperRef = React.useRef<HTMLDivElement | null | any>(null);

    const {selectedThread} = useSelector((state: StateType) => state.threads);
    const {showMessageBox: isShowingMessageBox, showReplyBox} = useSelector((state: StateType) => state.messages);
    const [showScrollBar, setShowScrollBar] = useState<boolean>(false);

    const isLoaderShow = useAllLoader();

    const handleScroll = useCallback(() => {
        setShowScrollBar(true);
        debounce(() => setShowScrollBar(false), 500, 'MESSAGE_LIST_SCROLLBAR');
    }, [])

    function getMuteStatus() {
        if (selectedThread && selectedThread.mute) {
            return <Flex align={'center'} px={'20px'} pt={'20px'} position={'sticky'} top={0}>
                <MuteIcon color={'#67074A'}/>
                <Text fontSize={'13px'} color={'#67074A'} mt={'1px'}>
                    This conversation has been muted. You will not receive notifications for new messages.
                </Text>
            </Flex>
        }
        return null
    }

    return (
        <>
            {isLoaderShow && <MessageBoxLoader/>}
            {!isLoaderShow && <>
                {!selectedThread && <Flex justifyContent={'center'} alignItems={'center'} flexDir={'column'}
                                          height={'100%'}>
                    <Heading as='h3' size='md' color={'rgba(0, 0, 0, 0.2)'}>Enjoy the beauty of white space.</Heading>
                </Flex>}
                {selectedThread && <Flex flexDir={'column'} height={'100%'}>
                    <MessagesHeader isProjectView={isProjectView}/>
                    {getMuteStatus()}
                    {isShowingMessageBox && <>
                        <Flex ref={messagesWrapperRef} onScroll={handleScroll} padding={'20px'} gap={5}
                              direction={'column'} flex={1}
                              overflowY={'scroll'} overflowX={'hidden'}
                              className={`${styles.messageListScrollBar} ${showScrollBar ? styles.messageScrollBar : ''}`}>
                            <Flex gap={2} direction={'column'} height={'100%'}>
                                <div className={styles.mailBoxMailList}>
                                    <MessageBox/>
                                </div>
                            </Flex>
                        </Flex>

                        <Flex alignItems={'center'} justifyContent={'space-between'} backgroundColor={'#F9FAFB'} padding={3} borderTop={'1px solid #E5E7EB'} className={'replay-mobile-ui'}>
                            <Flex alignItems={'center'} gap={3}>
                                <Button backgroundColor={'#1F2937'} borderRadius={'8px'} padding={'10px 12px'} _hover={{backgroundColor: '#1F2937'}}
                                color={'#FFFFFF'} fontSize={'14px'} fontWeight={'500'} leftIcon={<ReplyIcon />}
                                >Reply</Button>

                                <Button className={'forward-button'} backgroundColor={'transparent'} border={'1px solid #374151'} borderRadius={'8px'}
                                        padding={'10px 12px'} _hover={{backgroundColor: 'transparent'}}
                                        color={'#374151'} fontSize={'14px'} fontWeight={'500'} leftIcon={<ForwardIcon />}
                                >Forward</Button>
                            </Flex>

                            <Flex gap={'3'}>
                                <button className='archive-button-icon mobile-view-icon'>
                                    <ArchiveIcon/>
                                </button>

                                <button className='trash-button-icon mobile-view-icon'>
                                    <TrashIcon/>
                                </button>

                                <div className={'mobile-view-icon'}>
                                    <MessageSchedule date={''} onChange={() => null} />
                                </div>
                            </Flex>
                        </Flex>

                        {showReplyBox && <MessageReplyBox isProjectView={isProjectView}/>}
                    </>}
                </Flex>
                }
            </>}
        </>
    )
}
