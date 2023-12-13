import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Box, Flex, Text} from "@chakra-ui/react";
import {Time, UsersOnline} from "@/components/common";
import {DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {MAILBOX_UNREAD} from "@/utils/constants";
import {keyNavigationService} from "@/services";
import Tooltip from "../common/Tooltip";
import {AttachmentIcon} from "@chakra-ui/icons";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
    const {
        multiSelection,
        updateSuccess,
        error,
        isThreadFocused,
        selectedThread
    } = useSelector((state: StateType) => state.threads);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);

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

    function buildSentNameAndTooltip() {
        let to: any = props?.thread?.latestSentMessage?.to || [];
        let othersText = 'Me to ';
        if (to.length > 0) {
            othersText += to[0].name || to[0].email;
        }
        if (to.length > 1) {
            othersText += ` and ${to.length - 1} others`
        }
        return (
            <Tooltip label={<>
                <Flex direction={'column'}>
                    Sent to:
                    {to.map((t: any, index: number) => (
                        <Text key={index}>{t?.name ? <>
                            {t?.name || ''}
                            {t?.email ? <>{' <' + t?.email + '>'}</> : ''}
                        </> : <>{t?.email || ''}</>}</Text>
                    ))}
                </Flex>
            </>} placement={'bottom'}>
                <Text style={{display: 'block'}} whiteSpace={'nowrap'} maxWidth={'250px'}
                      noOfLines={1}>{othersText}</Text>
            </Tooltip>
        )
    }

    return (
        <>
            <Box
                ref={(ref) => {
                    if (props.thread.id) {
                        props.threadsRef.current[props.thread.id!] = ref
                    }
                }}
                onClick={(e) => {
                    props.onClick(e)
                    keyNavigationService.setKeyNavigationState({target: 'threads'});
                }}
                className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''} main-thread-list`}
            >
                <Flex align={"center"} justify={'space-between'} gap={2}>
                    <Flex align={"center"} className={styles.senderDetails} noOfLines={1} gap={1}>
                        {props.thread?.tab === 'SENT' ? buildSentNameAndTooltip() :
                            <Tooltip label={props?.thread?.from?.email} placement={'bottom'}>
                                {props?.thread?.from?.name || props?.thread?.from?.email}
                            </Tooltip>}
                    </Flex>
                    {(props?.thread?.projects || []).length > 0 && (
                        <Tooltip label={
                            <Flex flexDir={'column'}>
                                {props?.thread?.projects?.map((p, index) => {
                                    return (
                                        <span key={index}
                                              style={{marginBottom: props.thread!.projects!.length! - 1 === index ? 0 : '5px'}}
                                              className='emoji'>
                                        {p.emoji} {p.name}
                                    </span>
                                    )
                                })}
                            </Flex>
                        } placement={'bottom'}>
                            <Flex justifyContent={'flex-start'} alignItems={'center'}
                                  className='thread-emojis' marginRight={'auto'}>
                                {props?.thread?.projects?.slice(0, 3).map((p, index) => {
                                    return (
                                        <span key={index} className='emoji'>{p.emoji}</span>
                                    )
                                })}
                                {(props?.thread?.projects || []).length > 3 && (
                                    <span className={styles.projectsLength}
                                          style={{height: '14px', marginLeft: 0}}>
                                    {`+${(props?.thread?.projects || []).length - 3}`}
                                  </span>
                                )}
                            </Flex>
                        </Tooltip>
                    )}
                    <Flex alignItems={'center'} className={styles2.receiveTime} justify={'flex-end'}>
                        {isClicked &&
                        <DotIcon marginRight={'5px'} className={`readThreadIcon`}
                                 color={props.thread.snooze ? '#FF5E2C' : '#9ca3af'}/>}
                        {props.thread.attachments && props.thread.attachments?.length > 0 && <AttachmentIcon className={styles2.attachMentIcon} />}
                        <Time time={props.thread.latestMessage} isShowFullTime={false} showTimeInShortForm={false}/>
                    </Flex>
                </Flex>
                <div className={styles.mailMessage}>
                    <Flex alignItems={'center'} justifyContent={'space-between'}>
                        <Text lineHeight={'18px'} noOfLines={1}> {props.thread.subject || "(no subject)"}</Text>
                        <Flex alignItems={'center'} justifyContent={'end'} className={'member-images subheader-images'}>
                            <UsersOnline type={'threads'} itemId={props.thread.id!}/>
                        </Flex>
                    </Flex>
                </div>
            </Box>
        </>
    )
}
