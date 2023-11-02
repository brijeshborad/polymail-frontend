import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Box, Button, Flex, Image, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {MAILBOX_UNREAD} from "@/utils/constants";
import {MessageAttachments, Project, UserProjectOnlineStatus} from "@/models";
import {keyNavigationService} from "@/services";
import Tooltip from "../common/Tooltip";
import {AttachmentIcon} from "@chakra-ui/icons";
import {useRouter} from "next/router";
import {clearDebounce, debounce} from "@/utils/common.functions";
import {DefaultExtensionType, defaultStyles, FileIcon} from "react-file-icon";
import {getAttachmentDownloadUrl} from "@/redux/messages/action-reducer";


export function ThreadsSideBarListItem(props: ThreadListItemProps) {
    const router = useRouter()

    const {
        multiSelection,
        updateSuccess,
        error,
        isThreadFocused,
        selectedThread
    } = useSelector((state: StateType) => state.threads);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const [isEmojiOpen, setIsEmojiOpen] = useState<boolean>(false);
    const [isToolTipOpen, setIsToolTipOpen] = useState<boolean>(false);
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis)
    const [isAttachmentOpen, setIsAttachmentOpen] = useState<boolean>(false);
    const [isAttachmentToolTipOpen, setIsAttachmentToolTipOpen] = useState<boolean>(false);
    const dispatch = useDispatch();

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

    const goToProject = (project: Project) => {
        router.push(`/projects/${project.id}`)
    }

    function showExtensionImages(item: string | undefined) {
        if (item) {
            const parts = item.split('.');
            if (parts.length > 1) {
                const extension: string = parts[parts.length - 1];
                return extension;
            }
        }
        return 'pdf'
    }

    function attachmentsMenu() {
        return <Menu isOpen={isAttachmentOpen}>
            <Tooltip label='List attachments' placement='bottom' customeOpenHandelEvent
                     isOpenEvent={isAttachmentToolTipOpen}>
                <MenuButton
                    className={`${styles.tabListAttachmentButton} emoji-dropdown`} minWidth={'1px'} padding={'2px 6px'}
                    cursor={'pointer'}
                    backgroundColor={'inherit !important'} height={'auto'} outline={"none"}
                    _focusVisible={{boxShadow: 'none'}} _hover={{background: 'none'}} _active={{background: 'none'}}
                    fontSize={'13px'} color={'#6B7280'} as={Button} mx={1}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAttachmentOpen(true)
                        //close tooltip
                        setIsAttachmentToolTipOpen(false);

                    }}
                    onMouseEnter={() => {
                        setIsAttachmentToolTipOpen(true);
                        if (isAttachmentOpen) {
                            clearDebounce(props.thread.id + 'attachments');
                        }
                    }}
                    onMouseLeave={() => {
                        setIsAttachmentToolTipOpen(false);
                        debounce(() => {
                            setIsAttachmentOpen(false)
                        }, 200, props.thread.id + 'attachments')
                    }}
                >
                    <Flex alignItems={'center'}>
                        <AttachmentIcon/>
                    </Flex>
                </MenuButton>
            </Tooltip>
            <MenuList
                className={`${styles.tabListDropDown} drop-down-list`}
                onMouseEnter={() => {
                    if (isAttachmentOpen) {
                        clearDebounce(props.thread.id + 'attachments');
                    }
                }}
                onMouseLeave={() => {
                    debounce(() => {
                        setIsAttachmentOpen(false)
                    }, 100, props.thread.id + 'attachments')
                }}
            >
                {(props.thread.attachments || []).map((item: MessageAttachments, i: number) => (
                    <MenuItem gap={2} key={i} className={'attachment-icon'} onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        downloadImage(item)
                    }}>
                        <FileIcon
                            extension={showExtensionImages(item.filename) as DefaultExtensionType}
                            {...defaultStyles[showExtensionImages(item.filename) as DefaultExtensionType]}
                        /> {item.filename}
                    </MenuItem>
                ))}

            </MenuList>

        </Menu>
    }

    const downloadImage = (item: MessageAttachments) => {
        dispatch(getAttachmentDownloadUrl({body: {id: item.messageId, attachment: item.id}}));
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
                className={`${styles.mailDetails} ${isSelected ? styles.mailDetailsSelected : ''}`}
            >
                <Flex align={"center"} justify={'space-between'} gap={2}>
                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                        {props?.thread?.from?.name || props?.thread?.from?.email}
                    </Flex>
                    {(props?.thread?.projects || []).length > 0 && (
                        <Tooltip label={
                            <Flex flexDir={'column'}>
                                {props?.thread?.projects?.map((p, index) => {
                                    return (
                                        <span key={index} style={{marginBottom: '5px'}} className='emoji'>
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
                        {props.thread.attachments && props.thread.attachments?.length > 0 && attachmentsMenu()}
                        <Time time={props.thread.latestMessage} isShowFullTime={false} showTimeInShortForm={false}/>
                    </Flex>
                </Flex>
                <div className={styles.mailMessage}>
                    <Flex alignItems={'center'} justifyContent={'space-between'}>
                        <Text noOfLines={1}> {props.thread.subject || "(no subject)"}</Text>
                        <Flex alignItems={'center'} justifyContent={'end'} className={'member-images subheader-images'}>
                            {(onlineUsers && props.thread && onlineUsers['threads'][props.thread.id!] || [])
                                .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, 5)
                                .map((item: UserProjectOnlineStatus, index: number) => (
                                        <Tooltip label={item.name || ''} placement='bottom'
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
