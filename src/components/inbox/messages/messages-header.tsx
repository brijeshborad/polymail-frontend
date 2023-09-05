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
    InputLeftElement, useDisclosure
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
import React, {useCallback, useEffect} from "react";
import {Project, Thread} from "@/models";
import {updateThreads, updateThreadState} from "@/redux/threads/action-reducer";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType, MessageHeaderTypes} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";
import CreateNewProject from "@/components/project/create-new-project";
import {updateMessage} from "@/redux/messages/action-reducer";

export function MessagesHeader({
                                   closeCompose,
                                   inboxMessages,
                                   index,
                                   showPreNextMessage,
                                   herderType
                               }: MessageHeaderTypes) {
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {isLoading, selectedMessage} = useSelector((state: StateType) => state.messages);
    let {projects} = useSelector((state: StateType) => state.projects);

    const dispatch = useDispatch();
    const {isOpen, onOpen, onClose} = useDisclosure();


    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);


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
                    return
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
                dispatch(updateThreadState({
                    threads: currentThreads,
                    selectedThread: currentThreads[index1],
                    success: true
                }));
                dispatch(updateThreads({id: selectedThread.id, body}));
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
        <Flex direction={'column'}>
            <div style={{flex: 'none'}}>
                <Flex justifyContent={'space-between'} wrap={'wrap'} align={'center'}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.1)'}
                      marginBottom={'15'} padding={'12px 20px'}>
                    <Flex alignItems={'center'} gap={2}>
                        <div className={styles.closeIcon} onClick={() => closeCompose()}><CloseIcon/>
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

                            <div>
                                <Menu>
                                    <MenuButton className={styles.menuIcon} backgroundColor={'transparent'} h={'auto'} minWidth={'auto'} padding={'0'} as={Button} rightIcon={<MenuIcon />}>
                                    </MenuButton>
                                    <MenuList className={'drop-down-list'}>
                                        {selectedMessage && (
                                            <MenuItem onClick={() => setScope(selectedMessage.scope === 'visible' ? 'hidden' : 'visible')}>
                                                {selectedMessage.scope === 'visible' ? 'Hide from project members' : 'Show to project members'}
                                            </MenuItem>
                                        )}
                                    </MenuList>
                                </Menu>
                            </div>


                    </Flex>
                </Flex>
            </div>

            <CreateNewProject onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>

        </Flex>
    )
}
