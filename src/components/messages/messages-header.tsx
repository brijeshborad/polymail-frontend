import styles from "@/styles/Inbox.module.css";
import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Tooltip,
    Input,
    InputGroup,
    InputLeftElement, useDisclosure, Heading
} from "@chakra-ui/react";
import {
    SearchIcon,
    SmallAddIcon,
} from "@chakra-ui/icons";
import {
    ArchiveIcon,
    FolderIcon,
    TimeSnoozeIcon,
    TrashIcon,
    DisneyIcon,
    MenuIcon,
    InboxIcon
} from "@/icons";
import React, {useCallback, useEffect, useState} from "react";
import {Project, Thread} from "@/models";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {updateMessage, updateMessageState} from "@/redux/messages/action-reducer";
import {Toaster} from "@/components/common";

export function MessagesHeader({
                                   inboxMessages,
                                   index,
                                   herderType
                               }: MessageHeaderTypes) {
    const {selectedThread, threads, updateSuccess} = useSelector((state: StateType) => state.threads);
    const {selectedMessage} = useSelector((state: StateType) => state.messages);
    let {projects} = useSelector((state: StateType) => state.projects);

    const dispatch = useDispatch();
    const {onOpen} = useDisclosure();
    const [successMessage, setSuccessMessage] = useState<{ desc: string, title: string } | null>(null);


    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);


    useEffect(() => {
        if (updateSuccess && successMessage) {
            Toaster({
                desc: successMessage.desc,
                title: successMessage.title || '',
                type: 'success'
            })
            setSuccessMessage(null)
            dispatch(updateThreadState({updateSuccess: false}));
        }
    }, [updateSuccess, dispatch, successMessage]);


    const updateMailBox = (messageBox: string) => {
        if (selectedThread && selectedThread.id) {
            if (messageBox) {
                let currentThreads = [...threads || []] as Thread[];
                let threadData = {...(selectedThread) || {}} as Thread;
                let index1 = currentThreads.findIndex((item: Thread) => item.id === threadData?.id);

                let body = {
                    mailboxes: selectedThread.mailboxes || []
                };
                let remove_from_list = false
                switch (messageBox) {
                    case "INBOX":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["ARCHIVE", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "TRASH":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "ARCHIVE"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "ARCHIVE":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        remove_from_list = true
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "STARRED":
                    case "UNREAD":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            body.mailboxes = body.mailboxes.filter((item: string) => item !== messageBox)
                        } else {
                            body.mailboxes = [...body.mailboxes, messageBox]
                        }
                        break;
                }

                currentThreads[index1] = {
                    ...currentThreads[index1],
                    mailboxes: body.mailboxes || []
                }

                if (remove_from_list === true) {
                    currentThreads.splice(index1, 1)
                }

                dispatch(updateThreadState({
                    threads: currentThreads,
                    selectedThread: currentThreads[index1],
                    success: true
                }));
                dispatch(updateThreads({id: selectedThread.id, body}));
                setSuccessMessage({
                    desc: 'Thread was moved to ' + messageBox.toLowerCase() + '.',
                    title: selectedThread?.subject || '',
                })
            }
        }
    }

    const setScope = (type: string) => {
        if (selectedMessage && selectedMessage.id) {
            let body = {
                scope: type
            }
            dispatch(updateMessage({id: selectedMessage.id, body}))
        }

    }

    const addThreadToProject = useCallback((item: Project) => {

        if (selectedThread && selectedThread.id) {
            let reqBody = {
                threadIds: [
                    selectedThread.id,
                ],
                roles: [
                    'n/a',
                ],
                groupType: 'project',
                groupId: item.id
            }
            dispatch(addItemToGroup(reqBody));
        }
    }, [dispatch, selectedThread]);

    return (
        <>
            <Flex gap={2} align={'center'} justify={'space-between'} padding={'16px 20px 12px'}
                  borderBottom={'1px solid #E5E7EB'}>
                <Flex gap={1}>
                    <Heading as='h6' fontSize={'15px'} color={'#0A101D'}
                             fontWeight={600}>{inboxMessages && inboxMessages.length && index !== null && inboxMessages[index]?.subject || '(no subject)'}</Heading>
                </Flex>

                <Flex gap={3} align={'center'}>
                    {herderType === 'inbox' && <Menu>
                        <MenuButton className={styles.addToProject} leftIcon={<FolderIcon/>} borderRadius={'50px'}
                                    backgroundColor={'#2A6FFF'} color={'#FFFFFF'} as={Button}
                                    boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'} padding={'4px 4px 4px 8px'}
                                    fontSize={'12px'} fontWeight={500} h={'fit-content'}>Add to Project <span
                            className={styles.RightContent}>⌘P</span></MenuButton>
                        <MenuList className={`${styles.addToProjectList} drop-down-list`}>

                            <div className={'dropdown-searchbar'}>
                                <InputGroup>
                                    <InputLeftElement h={'27px'} pointerEvents='none'>
                                        <SearchIcon/>
                                    </InputLeftElement>
                                    <Input placeholder='Search project'/>
                                </InputGroup>
                            </div>

                            {projects && !!projects.length && (projects || []).map((item: Project, index: number) => (
                                <MenuItem gap={2} key={index} onClick={() => addThreadToProject(item)}>
                                    <DisneyIcon/> {item.name}
                                </MenuItem>

                            ))}

                            <div className={styles.addNewProject}>
                                <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                        justifyContent={'flex-start'} onClick={onOpen}>
                                    <div className={styles.plusIcon}>
                                        <SmallAddIcon/>
                                    </div>
                                    Create New Project
                                </Button>
                            </div>
                        </MenuList>
                    </Menu>}
                    {!(selectedThread?.mailboxes || []).includes("INBOX") && (
                        <Tooltip label='Inbox' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('INBOX')}>
                                <InboxIcon/>
                            </div>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes("ARCHIVE") && (
                        <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('ARCHIVE')}>
                                <ArchiveIcon/>
                            </div>
                        </Tooltip>
                    )}
                    {!(selectedThread?.mailboxes || []).includes("TRASH") && (
                        <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>
                            <div onClick={() => updateMailBox('TRASH')}>
                                <TrashIcon/>
                            </div>
                        </Tooltip>
                    )}
                    <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>
                        <div onClick={() => updateMailBox('SNOOZE')}>
                            <TimeSnoozeIcon/>
                        </div>
                    </Tooltip>
                    <div>
                        <Menu>
                            <MenuButton className={styles.menuIcon} backgroundColor={'transparent'} h={'auto'}
                                        minWidth={'auto'} padding={'0'} as={Button} rightIcon={<MenuIcon/>}>
                            </MenuButton>
                            <MenuList className={'drop-down-list'}>
                                {selectedMessage && (
                                    <MenuItem
                                        onClick={() => setScope(selectedMessage.scope === 'visible' ? 'hidden' : 'visible')}>
                                        {selectedMessage.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                    </MenuItem>
                                )}
                            </MenuList>
                        </Menu>
                    </div>
                </Flex>
            </Flex>
        </>

    )
}
