import styles2 from "@/styles/common.module.css";
import styles from "@/styles/Inbox.module.css";
import {Box, Flex, Image, Menu, MenuButton, MenuItem, MenuList, Text} from "@chakra-ui/react";
import {Time} from "@/components/common";
import {DotIcon} from "@/icons";
import {StateType, ThreadListItemProps} from "@/types";
import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {MAILBOX_UNREAD} from "@/utils/constants";
import {Project, UserProjectOnlineStatus} from "@/models";
import {keyNavigationService} from "@/services";
import Tooltip from "../common/Tooltip";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {useRouter} from "next/router";
import {clearDebounce, debounce} from "@/utils/common.functions";


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
                <Flex align={"center"} justify={'space-between'}>
                    <Flex align={"center"} className={styles.senderDetails} gap={1}>
                        {props?.thread?.from?.name || props?.thread?.from?.email}
                    </Flex>
                    {(props?.thread?.projects || []).length > 0 && (
                    //If customeOpenEvent Is there must pass both the Params: customeOpenHandelEvent, isOpenEvent
                      <Flex justifyContent={'flex-start'} flexGrow={1}>
                            <Menu isOpen={isEmojiOpen}>
                                <Tooltip label='List all' placement='bottom' customeOpenHandelEvent isOpenEvent={isToolTipOpen}>
                                    <MenuButton
                                        display={'flex'}
                                        as={Flex}
                                        fontWeight={600}
                                        backgroundColor={'#fff'}
                                        className='emoji-dropdown'
                                        padding={'0 8px'}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setIsEmojiOpen(true);
                                            //close tooltip
                                            setIsToolTipOpen(false);

                                        }}
                                        cursor={'pointer'}
                                        rounded={'md'}
                                        onMouseEnter={() => {
                                            //open tooltip
                                            setIsToolTipOpen(true);
                                            if (isEmojiOpen) {
                                                clearDebounce(props?.thread.id);
                                            }
                                        }}
                                        onMouseLeave={() => {
                                            //open tooltip
                                            setIsToolTipOpen(false);
                                            if (isEmojiOpen) {
                                                debounce(() => {
                                                    setIsEmojiOpen(false)
                                                }, 100, props?.thread.id)
                                            }
                                        }}
                                    >
                                        <Flex justifyContent={'flex-start'} alignItems={'center'}
                                              className='thread-emojis'>
                                            {props?.thread?.projects?.slice(0, 5).map((p, index) => {
                                                return (
                                                    <span key={index} className='emoji'>{p.emoji}</span>
                                                )
                                            })}
                                            {(props?.thread?.projects || []).length > 5 && (
                                                <span className={styles.projectsLength}
                                                      style={{height: '14px', marginLeft: 0}}>
                                    {`+${(props?.thread?.projects || []).length - 5}`}
                                  </span>
                                            )}
                                            <ChevronDownIcon className='icon'/>
                                        </Flex>
                                    </MenuButton>
                                </Tooltip>

                                <MenuList className={`${styles.addToProjectList} drop-down-list`} zIndex={'overlay'}
                                          onMouseEnter={() => {
                                              if (isEmojiOpen) {
                                                  clearDebounce(props?.thread.id);
                                              }
                                          }}
                                          onMouseLeave={() => {
                                              if (isEmojiOpen) {
                                                  debounce(() => {
                                                      setIsEmojiOpen(false)
                                                  }, 100, props?.thread.id)
                                              }
                                          }}>
                                    <div className={'add-to-project-list'}>
                                        {props?.thread?.projects?.map(project => (
                                            <MenuItem gap={2} key={project.id} onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                goToProject(project)
                                            }}>
                                                {project.emoji} {project.name}
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuList>
                            </Menu>
                        </Flex>
                    )}
                    <Flex alignItems={'center'} className={styles2.receiveTime} justify={'flex-end'}>
                        {isClicked &&
                        <DotIcon marginRight={'5px'} className={`readThreadIcon`} color={props.thread.snooze ? '#FF5E2C' :'#9ca3af'}/>}
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
