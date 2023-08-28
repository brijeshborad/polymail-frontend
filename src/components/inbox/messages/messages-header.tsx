import styles from "@/styles/Inbox.module.css";
import {Button, Flex, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip} from "@chakra-ui/react";
import {ChevronDownIcon, ChevronUpIcon, CloseIcon, WarningIcon} from "@chakra-ui/icons";
import {ArchiveIcon, BlueStarIcon, FolderIcon, StarIcon, TimeSnoozeIcon, TrashIcon, EnvelopeIcon} from "@/icons";
import React, {useEffect} from "react";
import {Project, Thread} from "@/models";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";

export function MessagesHeader({onClose, inboxMessages, index, showPreNextMessage, herderType}: MessageHeaderTypes) {
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {isLoading} = useSelector((state: StateType) => state.messages);
    let {projects} = useSelector((state: StateType) => state.projects);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllProjects({}));
    }, [dispatch])

    const updateMailBox = (messageBox: string) => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(selectedThread) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);

                let body = {
                    mailboxes: ['']
                };
                let data = selectedThread.mailboxes || [];
                if (selectedThread.mailboxes?.includes(messageBox)) {

                    let newData = data.filter((item: string) => item !== messageBox)
                    body.mailboxes = [
                            ...newData
                        ]

                } else {
                    body.mailboxes = [
                            ...data,
                            messageBox
                        ]

                }
                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body?.mailboxes || []
                };
                dispatch(updateThreadState({threads: currentThreads, selectedThread: currentThreads[index1], success: true}));
                dispatch(updateThreads({id: selectedThread.id, body}));
            }
        }
    }

    const addThreadToProject = (item: Project) => {
        let body = {
            project: item.id
        };
        if (selectedThread && selectedThread.id) {
            dispatch(updateThreads({id: selectedThread.id, body}));
        }
    }

    return (
        <Flex direction={'column'}>
            <div style={{flex: 'none'}}>
                <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                      marginBottom={'15'} padding={'12px 20px'}>
                    <Flex alignItems={'center'} gap={2}>
                        <div className={styles.closeIcon} onClick={() => onClose()}><CloseIcon/>
                        </div>
                        <div className={`${styles.actionIcon} ${index === 0 ? styles.disabled : ''}`}
                             onClick={() => showPreNextMessage('up')}>
                            <ChevronUpIcon/>
                        </div>
                        <div
                            className={`${styles.actionIcon} ${inboxMessages && inboxMessages?.length - 1 !== index ? '' : styles.disabled}`}
                            onClick={() => showPreNextMessage('down')}>
                            <ChevronDownIcon/>
                        </div>

                    </Flex>

                    <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>
                        {!isLoading && <Text className={styles.totalMessages}>
                            {index ? index + 1 : 1} / {inboxMessages && inboxMessages.length}
                        </Text>}
                        {/*<Button className={styles.addToProject} leftIcon={<FolderIcon/>}>Add to*/}
                        {/*    Project <span*/}
                        {/*        className={styles.RightContent}>⌘P</span></Button>*/}
                        {herderType === 'inbox' && <Menu>
                            {/*<MenuButton className={styles.allInboxes} backgroundColor={'#ffffff'}*/}
                            {/*            borderRadius={'50px'} border={'1px solid rgba(8, 22, 47, 0.14)'}*/}
                            {/*            fontSize={'14px'} lineHeight={'1'} height={'auto'} as={Button}*/}
                            {/*            rightIcon={<ChevronDownIcon/>}> All Inboxes </MenuButton>*/}

                            <MenuButton className={styles.addToProject} as={Button} leftIcon={<FolderIcon/>}>Add to Project <span className={styles.RightContent}>⌘P</span></MenuButton>
                            <MenuList>
                                {projects && !!projects.length && (projects || []).map((item: Project, index: number) => (
                                    <MenuItem key={index} onClick={() => addThreadToProject(item)}>{item.name}</MenuItem>

                                ))

                                }
                            </MenuList>
                        </Menu>}

                        <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('ARCHIVE')}>
                                <ArchiveIcon/>
                            </div>
                        </Tooltip>
                        <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('TRASH')}>
                                <TrashIcon/>
                            </div>
                        </Tooltip>
                        <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('SNOOZE')}>
                                <TimeSnoozeIcon/>
                            </div>
                        </Tooltip>

                        <Tooltip label='Mark as unread' placement='bottom' bg='gray.300' color='black'>
                            <div className={styles.envelopeIcon} onClick={() => updateMailBox('UNREAD')}>
                                <EnvelopeIcon/>
                            </div>
                        </Tooltip>

                        <Tooltip
                            label={(selectedThread?.mailboxes || []).includes('STARRED') ? 'Starred' : 'Not Starred'}
                            placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('STARRED')}>
                                {(selectedThread?.mailboxes || []).includes('STARRED') && <BlueStarIcon/>}
                                {!(selectedThread?.mailboxes || []).includes('STARRED') && <StarIcon/>}
                            </div>
                        </Tooltip>

                        <Tooltip
                            label={(selectedThread?.mailboxes || []).includes('SPAM') ? 'Spammed' : 'Mark As Spam'}
                            placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('SPAM')}>
                                <WarningIcon className={styles.colorGray}/>
                            </div>
                        </Tooltip>
                    </Flex>
                </Flex>
            </div>
        </Flex>
    )
}
