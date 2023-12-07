import {MessageBoxLoader} from "@/components/messages/message-view/message-box-loader";
import React, {useCallback, useState} from "react";
import {useSelector} from "react-redux";
import {StateType} from "@/types";
import {Flex, Heading, Text} from "@chakra-ui/react";
import styles from "@/styles/Inbox.module.css";
import {debounce} from "@/utils/common.functions";
import dynamic from "next/dynamic";
import {MuteIcon} from "@/icons";
import {useAllLoader} from "@/hooks/all-loader.hook";

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
                        {showReplyBox && <MessageReplyBox isProjectView={isProjectView}/>}
                    </>}
                </Flex>
                }
            </>}
        </>
    )
}
