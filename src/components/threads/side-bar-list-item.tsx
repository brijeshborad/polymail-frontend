import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Box, Flex, Image, Tooltip} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DisneyIcon, DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import {useSelector} from "react-redux";
import React, {useEffect, useRef, useState} from "react";
import {MAILBOX_UNREAD} from "@/utils/constants";
import {UserProjectOnlineStatus} from "@/models";
import {keyNavigationService} from "@/services";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
    const ref = useRef(null);
    const {
        multiSelection,
        updateSuccess,
        error,
        isThreadFocused,
        selectedThread
    } = useSelector((state: StateType) => state.threads);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis)

    useEffect(() => {
        setIsSelected((multiSelection || [])?.includes(props.thread.id!));
    }, [multiSelection, props.thread.id]);

    useEffect(() => {
        if (isThreadFocused) {
            if (props.thread.id === selectedThread?.id) {
                setIsClicked(false)
            }
        }
    }, [isThreadFocused, props.thread.id, selectedThread?.id])

    useEffect(() => {
        setIsClicked((props.thread.mailboxes || []).includes(MAILBOX_UNREAD));
    }, [props.thread, updateSuccess, error])

    useEffect(() => {
        if (selectedThread && selectedThread.id === props.thread.id) {
            props.onSelect(ref)
        }
        // eslint-disable-next-line
    }, [selectedThread])

    return (
        <>
            <Box
                ref={ref}
                onClick={(e) => {
                    props.onClick(e)
                    keyNavigationService.setKeyNavigationState({target: 'threads'});
                }}
                className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''}`}
            >
                <Flex align={"center"} justify={'space-between'}>
                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                        <DisneyIcon/> {props?.thread?.from?.name || props?.thread?.from?.email}
                    </Flex>
                    <Flex alignItems={'center'} className={styles2.receiveTime} justify={'flex-end'}>
                        {isClicked &&
                        <DotIcon marginRight={'5px'} className={`readThreadIcon`} color={'#9ca3af'}/>}
                        <Time time={props.thread.latestMessage} isShowFullTime={false} showTimeInShortForm={false}/>
                    </Flex>
                </Flex>
                <div className={styles.mailMessage}>
                    <Flex alignItems={'center'} justifyContent={'space-between'}>
                        {props.thread.subject || "(no subject)"}
                        <Flex alignItems={'center'} justifyContent={'end'} className={'member-images subheader-images'}>
                            {(onlineUsers && props.thread && onlineUsers['threads'][props.thread.id!] || [])
                                .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, 5)
                                .map((item: UserProjectOnlineStatus, index: number) => (
                                        <Tooltip label={item.name} placement='bottom' bg='gray.300' color='black'
                                                 key={index}>
                                            <div className={'member-photo'}
                                                 style={{background: '#000', border: `2px solid #${item.color}`}}>
                                                {item.avatar && <Image src={item.avatar} width="24" height="24"
                                                                       alt=""/>}
                                            </div>
                                        </Tooltip>
                                    )
                                )
                            }
                        </Flex>
                    </Flex>
                </div>
            </Box>
        </>
    )
}
