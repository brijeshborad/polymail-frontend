import styles from "@/styles/Inbox.module.css";
import {
    Button,
    Flex,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text,
    Tooltip,
    Input,
    InputGroup,
    InputLeftElement, useDisclosure, Heading
} from "@chakra-ui/react";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CloseIcon,
    WarningIcon,
    SearchIcon,
    SmallAddIcon,
} from "@chakra-ui/icons";
import {
    ArchiveIcon,
    BlueStarIcon,
    FolderIcon,
    StarIcon,
    TimeSnoozeIcon,
    TrashIcon,
    EnvelopeIcon,
    DisneyIcon,
    MenuIcon
} from "@/icons";
import React, {useCallback, useEffect, useState} from "react";
import {Project, Thread} from "@/models";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";
import CreateNewProject from "@/components/project/create-new-project";
import {updateMessage, updateMessageState} from "@/redux/messages/action-reducer";
import {Toaster} from "@/components/common";

export function MessagesHeader({
                                   closeCompose,
                                   inboxMessages,
                                   index,
                                   showPreNextMessage,
                                   herderType
                               }: MessageHeaderTypes) {
    const {selectedThread, threads, updateSuccess} = useSelector((state: StateType) => state.threads);
    const {isLoading, selectedMessage} = useSelector((state: StateType) => state.messages);
    let {projects} = useSelector((state: StateType) => state.projects);

    const dispatch = useDispatch();
    const {isOpen, onOpen, onClose} = useDisclosure();
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

                switch (messageBox) {
                    case "INBOX":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["ARCHIVE", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        currentThreads.splice(index1, 1)
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "TRASH":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "ARCHIVE"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        currentThreads.splice(index1, 1)
                        dispatch(updateMessageState({selectedMessage: null}));
                        break;
                    case "ARCHIVE":
                        if (selectedThread.mailboxes?.includes(messageBox)) {
                            return
                        }
                        body.mailboxes = body.mailboxes.filter((item: string) => !["INBOX", "TRASH"].includes(item))
                        body.mailboxes = [...body.mailboxes, messageBox]
                        currentThreads.splice(index1, 1)
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
            <Flex gap={2} align={'center'} justify={'space-between'} padding={'16px 20px 12px'} borderBottom={'1px solid #E5E7EB'}>
                <Flex gap={1}>
                    <Heading as='h6' fontSize={'15px'} color={'#0A101D'} fontWeight={600}>{inboxMessages && inboxMessages.length && index && inboxMessages[index]?.subject || '(no subject)'}</Heading>
                </Flex>

                <Flex gap={3} align={'center'}>
                    {herderType === 'inbox' && <Menu>
                        <MenuButton className={styles.addToProject} leftIcon={<FolderIcon/>} borderRadius={'50px'}
                                    backgroundColor={'#2A6FFF'} color={'#FFFFFF'} as={Button}
                                    boxShadow={'0 0 3px 0 rgba(38, 109, 240, 0.12)'} padding={'4px 4px 4px 8px'}
                                    fontSize={'12px'} fontWeight={500} h={'fit-content'}>Add to Project <span className={styles.RightContent}>⌘P</span></MenuButton>
                        <MenuList className={`${styles.addToProjectList} drop-down-list`}>

                            <div className={'dropdown-searchbar'}>
                                <InputGroup>
                                    <InputLeftElement h={'27px'} pointerEvents='none'>
                                        <SearchIcon/>
                                    </InputLeftElement>
                                    <Input placeholder='Search project' />
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

                    <Flex className={styles.mailBoxHeaderIcon} align={'center'} gap={'10px'}>
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
                    </Flex>
                </Flex>
            </Flex>

            {/*<Flex direction={'column'}>*/}
            {/*    <div style={{flex: 'none'}}>*/}
            {/*        <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}*/}
            {/*              borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}*/}
            {/*              marginBottom={'15'} padding={'12px 20px'}>*/}
            {/*            <Flex alignItems={'center'} gap={2}>*/}
            {/*                <div className={styles.closeIcon} onClick={() => closeCompose()}><CloseIcon/>*/}
            {/*                </div>*/}
            {/*                <div className={`${styles.actionIcon} ${index === 0 ? styles.disabled : ''}`}*/}
            {/*                     onClick={() => showPreNextMessage('up')}>*/}
            {/*                    <ChevronUpIcon/>*/}
            {/*                </div>*/}
            {/*                <div*/}
            {/*                    className={`${styles.actionIcon} ${inboxMessages && inboxMessages?.length - 1 !== index ? '' : styles.disabled}`}*/}
            {/*                    onClick={() => showPreNextMessage('down')}>*/}
            {/*                    <ChevronDownIcon/>*/}
            {/*                </div>*/}

            {/*            </Flex>*/}

            {/*            <Flex alignItems={'center'} gap={3} className={styles.headerRightIcon}>*/}
            {/*                {!isLoading && <Text className={styles.totalMessages}>*/}
            {/*                    {index ? index + 1 : 1} / {inboxMessages && inboxMessages.length}*/}
            {/*                </Text>}*/}
            {/*                /!*<Button className={styles.addToProject} leftIcon={<FolderIcon/>}>Add to*!/*/}
            {/*                /!*    Project <span*!/*/}
            {/*                /!*        className={styles.RightContent}>⌘P</span></Button>*!/*/}
            {/*                {herderType === 'inbox' && <Menu>*/}
            {/*                    /!*<MenuButton className={styles.allInboxes} backgroundColor={'#ffffff'}*!/*/}
            {/*                    /!*            borderRadius={'50px'} border={'1px solid rgba(8, 22, 47, 0.14)'}*!/*/}
            {/*                    /!*            fontSize={'14px'} lineHeight={'1'} height={'auto'} as={Button}*!/*/}
            {/*                    /!*            rightIcon={<ChevronDownIcon/>}> All Inboxes </MenuButton>*!/*/}

            {/*                    <MenuButton className={styles.addToProject} as={Button} leftIcon={<FolderIcon/>}>Add to Project <span className={styles.RightContent}>⌘P</span></MenuButton>*/}
            {/*                    <MenuList className={`${styles.addToProjectList} drop-down-list`}>*/}

            {/*                        <div className={'dropdown-searchbar'}>*/}
            {/*                            <InputGroup>*/}
            {/*                                <InputLeftElement h={'27px'} pointerEvents='none'>*/}
            {/*                                    <SearchIcon/>*/}
            {/*                                </InputLeftElement>*/}
            {/*                                <Input placeholder='Search project' />*/}
            {/*                            </InputGroup>*/}
            {/*                        </div>*/}

            {/*                        {projects && !!projects.length && (projects || []).map((item: Project, index: number) => (*/}
            {/*                            <MenuItem gap={2} key={index} onClick={() => addThreadToProject(item)}>*/}
            {/*                                <DisneyIcon/> {item.name}*/}
            {/*                            </MenuItem>*/}

            {/*                        ))}*/}

            {/*                        <div className={styles.addNewProject}>*/}
            {/*                            <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}*/}
            {/*                                    justifyContent={'flex-start'} onClick={onOpen}>*/}
            {/*                                <div className={styles.plusIcon}>*/}
            {/*                                    <SmallAddIcon/>*/}
            {/*                                </div>*/}
            {/*                                Create New Project*/}
            {/*                            </Button>*/}
            {/*                        </div>*/}
            {/*                    </MenuList>*/}
            {/*                </Menu>}*/}

            {/*                <Tooltip label='Archive' placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div onClick={() => updateMailBox('ARCHIVE')}>*/}
            {/*                        <ArchiveIcon/>*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}
            {/*                <Tooltip label='Trash' placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div onClick={() => updateMailBox('TRASH')}>*/}
            {/*                        <TrashIcon/>*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}
            {/*                <Tooltip label='Snooze' placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div onClick={() => updateMailBox('SNOOZE')}>*/}
            {/*                        <TimeSnoozeIcon/>*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}

            {/*                <Tooltip label='Mark as unread' placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div className={styles.envelopeIcon} onClick={() => updateMailBox('UNREAD')}>*/}
            {/*                        <EnvelopeIcon/>*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}

            {/*                <Tooltip*/}
            {/*                    label={(selectedThread?.mailboxes || []).includes('STARRED') ? 'Starred' : 'Not Starred'}*/}
            {/*                    placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div onClick={() => updateMailBox('STARRED')}>*/}
            {/*                        {(selectedThread?.mailboxes || []).includes('STARRED') && <BlueStarIcon/>}*/}
            {/*                        {!(selectedThread?.mailboxes || []).includes('STARRED') && <StarIcon/>}*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}

            {/*                <Tooltip*/}
            {/*                    label={(selectedThread?.mailboxes || []).includes('SPAM') ? 'Spammed' : 'Mark As Spam'}*/}
            {/*                    placement='bottom' bg='gray.300' color='black'>*/}
            {/*                    <div onClick={() => updateMailBox('SPAM')}>*/}
            {/*                        <WarningIcon className={styles.colorGray}/>*/}
            {/*                    </div>*/}
            {/*                </Tooltip>*/}

            {/*                <div>*/}
            {/*                    <Menu>*/}
            {/*                        <MenuButton className={styles.menuIcon} backgroundColor={'transparent'} h={'auto'} minWidth={'auto'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>*/}
            {/*                        </MenuButton>*/}
            {/*                        <MenuList className={'drop-down-list'}>*/}
            {/*                            {selectedMessage && (*/}
            {/*                                <MenuItem onClick={() => setScope(selectedMessage.scope === 'visible' ? 'hidden' : 'visible')}>*/}
            {/*                                    {selectedMessage.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}*/}
            {/*                                </MenuItem>*/}
            {/*                            )}*/}
            {/*                        </MenuList>*/}
            {/*                    </Menu>*/}
            {/*                </div>*/}


            {/*            </Flex>*/}
            {/*        </Flex>*/}
            {/*    </div>*/}

            {/*    <CreateNewProject onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>*/}

            {/*</Flex>*/}
        </>

    )
}
