import RemoveRecordModal from "@/components/common/delete-record-modal";
import { Message } from "@/components/messages";
import { InviteMember, Project, TeamMember, Thread, UserProjectOnlineStatus } from "@/models";
import {
    addItemToGroup, deleteMemberFromProject, deleteMemberShipFromProject
} from "@/redux/memberships/action-reducer";
import {
    getProjectMembers,
    getProjectMembersInvites,
    updateProjectMemberRole, updateProjectState
} from "@/redux/projects/action-reducer";
import { updateLastMessage } from "@/redux/socket/action-reducer";
import styles from "@/styles/project.module.css";
import { StateType } from "@/types";
import { debounceInterval, isEmail } from "@/utils/common.functions";
import { PROJECT_ROLES } from "@/utils/constants";
import { ChevronDownIcon, CloseIcon, TriangleDownIcon } from "@chakra-ui/icons";
import {
    Badge,
    Button,
    Flex,
    Grid, GridItem,
    Heading, IconButton,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Text, Tooltip, useDisclosure
} from "@chakra-ui/react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import dynamic from 'next/dynamic';
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
const ThreadsSideBar = dynamic(
    () => import('@/components/threads').then((mod) => mod.ThreadsSideBar)
)
dayjs.extend(customParseFormat)


let displayOnlineMembersData: UserProjectOnlineStatus[] = [];

function ProjectInbox() {
    const {members, project, invitees} = useSelector((state: StateType) => state.projects);
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    // const {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);
    const {success} = useSelector((state: StateType) => state.memberships);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [isManagerMembersOpen, setIsManagerMembersOpen] = useState<boolean>(false)
    const {sendJsonMessage, newMessage} = useSelector((state: StateType) => state.socket);
    const {userDetails} = useSelector((state: StateType) => state.users);

    const [size, setSize] = useState<number>(0);
    const [maxShowingMembers, setMaxShowingMembers] = useState<number>(5);
    const [onlineMembersData, setOnlineMemberData] = useState<UserProjectOnlineStatus[]>([]);
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const [membersInputs, setMembersInput] = useState<{ input: string, role: string }>({
        input: '',
        role: 'member'
    });
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [selectedMember, setSelectedMember] = useState<any>(null);

    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        if (newMessage) {
            dispatch(updateLastMessage(null));
            if (newMessage.name === 'Activity' && project) {
                // if (userDetails && userDetails.id !== newMessage.userId) {
                let findThread: Thread | any = (threads || []).find((item: Thread) => item.id === newMessage.data.threadId);
                let updateUserData = false;
                if (newMessage.data.type === 'ViewingThread') {
                    if (findThread && (findThread.projects || []).some((value: Project) => value.id === project!.id)) {
                        updateUserData = true;
                    }
                }
                if (newMessage.data.type === 'ViewingProject') {
                    if (project && project.id === newMessage.data.projectId) {
                        updateUserData = true;
                    }
                }
                if (updateUserData && newMessage.data.userId) {
                    let userAlreadyExists = onlineMembersData.findIndex((item) => item.userId === newMessage.data.userId);
                    if (userAlreadyExists !== -1) {
                        onlineMembersData[userAlreadyExists].isOnline = true;
                        onlineMembersData[userAlreadyExists].lastOnlineStatusCheck = dayjs().format('DD/MM/YYYY hh:mm:ss a').toString();
                    } else {
                        onlineMembersData.push({
                            userId: newMessage.data.userId,
                            isOnline: true,
                            lastOnlineStatusCheck: dayjs().format('DD/MM/YYYY hh:mm:ss a'),
                            avatar: newMessage.data.avatar,
                            color: Math.floor(Math.random() * 16777215).toString(16),
                            name: newMessage.data.name
                        })
                    }
                    setOnlineMemberData([...onlineMembersData])
                }
                // }
            }
        }
    }, [newMessage, dispatch, userDetails, threads, project, onlineMembersData]);

    useEffect(() => {
        displayOnlineMembersData = onlineMembersData;
    }, [onlineMembersData])

    useEffect(() => {
        debounceInterval(() => {
            setOnlineMemberData([...displayOnlineMembersData.map((data) => {
                let finalData = {...data};
                let lastActiveDate = dayjs(finalData.lastOnlineStatusCheck, 'DD/MM/YYYY hh:mm:ss a');
                if (finalData.isOnline && dayjs().diff(lastActiveDate, 'seconds') > 10) {
                    finalData.isOnline = false;
                }
                return finalData;
            })]);
        }, 1000 * 10);
    }, [])


    useEffect(() => {
        if (router.query.project && sendJsonMessage) {
            const interval = debounceInterval(() => {
                console.log('Sending activity event PROJECT');
                let projectId = router.query.project as string;
                sendJsonMessage({
                    userId: selectedAccount?.userId,
                    name: 'Activity',
                    data: {
                        type: "ViewingProject",
                        id: projectId,
                    },
                });
            }, 5000);

            return () => clearInterval(interval);
        }

        return undefined
    }, [router.query.project, selectedAccount?.userId, sendJsonMessage]);

    useEffect(() => {
        if (router.query.project) {
            let projectId = router.query.project as string;
            dispatch(getProjectMembers({
                body: {
                        projectId: projectId
                      }
                }));
            dispatch(getProjectMembersInvites({body:{projectId: projectId}}));
        }
    }, [router.query.project, dispatch])

    // useEffect(() => {
    //     if (membershipSuccess && router.query.project) {
    //         dispatch(updateMembershipState({success: false}));
            
    //     }
    // }, [dispatch, membershipSuccess, router.query.project])

    function updateSize() {
        setSize(window.innerWidth);
    }

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.addEventListener('resize', updateSize);
            updateSize();
        }
        return () => {
            if (typeof window !== "undefined") {
                window.removeEventListener('resize', updateSize)
            }
        };
    }, []);

    useEffect(() => {
        if (membersInputs) {
            let alreadyInvitedMembers = (invitees || []).map(t => t?.invite?.toEmail);
            setAllowAdd(!!(membersInputs.input.trim() && isEmail(membersInputs.input.trim()) && !alreadyInvitedMembers.includes(membersInputs.input)));
        }
    }, [invitees, membersInputs])

    const inviteAccountToProject = useCallback((item: Project | null) => {
        if (selectedAccount && selectedAccount.email && membersInputs.input.length > 0) {
            let reqBody = {
                fromEmail: selectedAccount.email,
                toEmails: [membersInputs.input],
                roles: [membersInputs.role],
                groupType: 'project',
                groupId: item?.id
            }
            dispatch(addItemToGroup({body:reqBody}))

            let projectId = router.query.project as string;
            dispatch(getProjectMembersInvites({body:{projectId: projectId}}));
            setMembersInput({input: '', role: 'member'});
        }
    }, [dispatch, membersInputs, selectedAccount, router.query.project]);


    const updateProjectMemberRoleData = (role: string) => {
        if (project && project.id && selectedAccount && selectedAccount.id) {
            let body = {
                role: role
            }
            dispatch(updateProjectMemberRole({body:{projectId: project.id, accountId: selectedAccount.id, body:body}}))
        }

    };

    const openModel = (item: any) => {
        setSelectedMember(item)
        onDeleteModalOpen()
    }

    const removeMemberFromProject = () => {
        if (selectedMember) {
            if (selectedMember?.invite) {
                dispatch(deleteMemberShipFromProject({body:{id: selectedMember.id},toaster:{
                    success:{
                        desc: 'Membership is removed form project successfully',
                        title: 'Remove membership form project',
                        type: 'success'
                    }
                }}));
            } else {
                if (project && project.id && selectedMember?.id) {
                    dispatch(deleteMemberFromProject({body:{id: project.id, accountId: selectedMember.id},toaster:{
                        success:{
                            desc: 'Member is removed form project successfully',
                            title: 'Remove member form project',
                            type: 'success'
                        }}}));
                }
            }
        }
        onDeleteModalClose()
    }

    const capitalizeFLetter = (value: string) => {
        return value[0].toUpperCase() + value.slice(1)
    }

    useEffect(() => {
        if (success && selectedMember && selectedMember?.id) {
            if (selectedMember && selectedMember?.invite) {
                let data = (invitees || []).filter((item: InviteMember) => item.id !== selectedMember.id);

                dispatch(updateProjectState({invitees: data}));
            } else {
                let data = (members || []).filter((item: TeamMember) => item.id !== selectedMember.id);
                dispatch(updateProjectState({members: data}));
            }

            setSelectedMember(null);
        }
    }, [success, selectedMember, dispatch])

    // useEffect(() => {
    //     if (isProjectRemoveSuccess) {
    //         Toaster({
    //             desc: 'Member is removed form project successfully',
    //             title: 'Remove member form project',
    //             type: 'success'
    //         });
    //     }
    // }, [isProjectRemoveSuccess])


    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsManagerMembersOpen(false)
        }
    }, [incomingEvent]);

    return (
        <>
            <Flex direction={'column'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'} flex={1}>

                <Flex align={'center'} justify={'space-between'} gap={4} padding={'16px 40px 15px'}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.12)'} backgroundColor={'#FFFFFF'}>
                    <Flex align={'center'} gap={2}>
                        <div className={styles.imgWrapper}>
                            {project?.emoji ? project.emoji :
                                <Image src="/image/user.png" width="36" height="36" alt=""/>}
                        </div>
                        <Heading as='h4' fontSize={'24px'} color={'#08162F'}>{project && project.name}</Heading>
                        <Badge textTransform={'none'} color={'#000000'} fontSize={'14px'} fontWeight={'600'}
                               backgroundColor={'#E9E9E9'}
                               padding={'3px 6px'} borderRadius={'4px'}
                               lineHeight={'1.19'}>{members && members.length === 1 ? `1 member` : `${members && members.length} members`}</Badge>
                    </Flex>
                    <Flex align={'center'} gap={1}>
                        {onlineMembersData.filter(t => t.isOnline).slice(0, maxShowingMembers)
                            .map((item, index) => (
                                <Tooltip label={item.name} placement='bottom' bg='gray.300' color='black' key={index}>
                                    <div className={styles.userImage} style={{border: `2px solid #${item.color}`}}>
                                        {item.avatar && <Image src={item.avatar} width="36" height="36" alt=""/>}
                                    </div>
                                </Tooltip>
                            ))}
                        <Text fontSize={'sm'} textDecoration={'underline'} cursor={'pointer'}
                              onClick={() => setMaxShowingMembers(maxShowingMembers + 5)}>
                            {onlineMembersData.length > maxShowingMembers ? `+${onlineMembersData.length - maxShowingMembers}more` : ''}
                        </Text>
                        <Menu isOpen={isManagerMembersOpen} onClose={() => setIsManagerMembersOpen(false)}>
                            {({onClose}) => (
                                <>
                                    <MenuButton
                                        onClick={() => setIsManagerMembersOpen(!isManagerMembersOpen)}
                                        as={Button} className={styles.manageMembers} ml={2} backgroundColor={'#000000'}
                                        color={'#ffffff'} lineHeight={'1'} fontSize={'14px'} borderRadius={'8px'}
                                        height={'auto'} padding={'11px 16px'}
                                    >
                                        Share
                                    </MenuButton>
                                    <MenuList className={`${styles.manageMemberDropDown} drop-down-list`}>
                                        <Flex color={'#374151'} fontWeight={'500'} fontSize={'13px'} padding={'12px'}
                                              justifyContent={'space-between'} alignItems={'center'}
                                              borderBottom={'1px solid #F3F4F6'}>Share {project && project?.name}
                                            <IconButton className={styles.closeIcon} onClick={onClose}
                                                        cursor={'pointer'} backgroundColor={'#FFFFFF'} padding={0}
                                                        minWidth={'1px'} aria-label='Add to friends'
                                                        icon={<CloseIcon/>}/>
                                        </Flex>
                                        <div className={styles.dropDownSearchBar}>
                                            <Text color={'#374151'} fontSize={'13px'} fontWeight={'500'}
                                                  lineHeight={'normal'}
                                                  letterSpacing={'-0.13px'}>Add members</Text>
                                            <Flex align={'center'} gap={3} pt={2}>
                                                <Flex w={'100%'} backgroundColor={'#FFFFFF'}
                                                      border={'1px solid #E5E7EB'}
                                                      borderRadius={8} padding={'10px 10px 10px 16px'}>
                                                    <Input padding={'0'} fontSize={'13px'} border={0} h={'auto'}
                                                           lineHeight={1}
                                                           fontWeight={400} borderRadius={'0'}
                                                           placeholder='Name or email address' onChange={(e) => {
                                                        membersInputs.input = e.target.value;
                                                        setMembersInput({...membersInputs})
                                                    }}/>
                                                    <Menu isLazy>
                                                        <MenuButton className={styles.addMemberDropDownButton}
                                                                    minWidth={'65px'}
                                                                    color={'#374151'} backgroundColor={'transparent'}
                                                                    h={'auto'}
                                                                    padding={0} as={Button}
                                                                    rightIcon={
                                                                        <ChevronDownIcon/>}> {capitalizeFLetter(membersInputs.role)} </MenuButton>
                                                        <MenuList className={'drop-down-list'}>
                                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                                return <MenuItem onClick={() => {
                                                                    membersInputs.role = role;
                                                                    setMembersInput({...membersInputs})
                                                                }} textTransform={'capitalize'} key={roleIndex}>
                                                                    {role}
                                                                </MenuItem>
                                                            })}
                                                        </MenuList>
                                                    </Menu>
                                                </Flex>
                                                <Button className={styles.addMemberButton} backgroundColor={'#1F2937'}
                                                        border={'8px'} color={'#FFFFFF'} padding={'9px 12px'}
                                                        isDisabled={!allowAdd}
                                                        onClick={() => inviteAccountToProject(project || null)}>Add</Button>
                                            </Flex>
                                        </div>

                                        {members && !!members.length && members.map((member, index) => (
                                            <Flex align={'center'} gap={2} pr={3} key={index}>
                                                <MenuItem>
                                                    <div className={styles.imgWrapper}>
                                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                                    </div>
                                                    {member.name}
                                                </MenuItem>
                                                <Flex align={'center'} gap={1}>
                                                    <Menu>
                                                        <MenuButton className={styles.memberDropDown} fontSize={'12px'}
                                                                    color={'#374151'} textTransform={'capitalize'}
                                                                    backgroundColor={'#FFFFFF'} h={'auto'}
                                                                    border={'1px solid #D1D5DB'} borderRadius={'50px'}
                                                                    as={Button} rightIcon={<TriangleDownIcon/>}>
                                                            {member.role}
                                                        </MenuButton>
                                                        <MenuList className={`drop-down-list`}>
                                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                                return <MenuItem
                                                                    onClick={() => updateProjectMemberRoleData(role)}
                                                                    textTransform={'capitalize'} key={roleIndex}>
                                                                    {role}
                                                                </MenuItem>
                                                            })}
                                                        </MenuList>
                                                    </Menu>
                                                    <IconButton className={styles.closeIcon}
                                                                onClick={() => openModel(member)}
                                                                cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                padding={0}
                                                                minWidth={'1px'} aria-label='Add to friends'
                                                                icon={<CloseIcon/>}/>
                                                </Flex>
                                            </Flex>
                                        ))}
                                        {invitees && !!invitees.length && invitees.map((invite, index) => (
                                            <Flex align={'center'} pr={3} gap={3} key={index}>
                                                <MenuItem>
                                                    <div className={styles.imgWrapper}>
                                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                                    </div>
                                                    {invite?.invite?.toEmail}
                                                </MenuItem>
                                                <Flex align={'center'} gap={1}>
                                                    <Menu>
                                                        <MenuButton className={styles.memberDropDown} fontSize={'12px'}
                                                                    color={'#374151'} textTransform={'capitalize'}
                                                                    backgroundColor={'#FFFFFF'} h={'auto'}
                                                                    border={'1px solid #D1D5DB'} borderRadius={'50px'}
                                                                    as={Button} rightIcon={<TriangleDownIcon/>}>
                                                            {invite.role}
                                                        </MenuButton>
                                                        <MenuList className={`drop-down-list`}>
                                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                                return <MenuItem
                                                                    onClick={() => updateProjectMemberRoleData(role)}
                                                                    textTransform={'capitalize'} key={roleIndex}>
                                                                    {role}
                                                                </MenuItem>
                                                            })}
                                                        </MenuList>
                                                    </Menu>
                                                    <IconButton className={styles.closeIcon}
                                                                onClick={() => openModel(invite)}
                                                                cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                padding={0}
                                                                minWidth={'1px'} aria-label='Add to friends'
                                                                icon={<CloseIcon/>}/>
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </MenuList>
                                </>
                            )}
                        </Menu>
                    </Flex>
                </Flex>

                <Grid className={styles.mailGrid} templateColumns='30% auto' padding={'16px 20px 16px'} gap={4}
                      flex={1}>
                    <GridItem w='100%' flex={1}>
                        {((size < 991 && !selectedThread) || size > 991) &&
                        <ThreadsSideBar cachePrefix={`project-${router.query.project}`}/>
                        }
                    </GridItem>
                    <GridItem w='100%' flex={1}>
                        {((size < 991 && selectedThread) || size > 991) && <Message isProjectView={true}/>}
                    </GridItem>
                </Grid>
            </Flex>

            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeMemberFromProject}
                               modelTitle={'Are you sure you want to remove member from project?'}/>

        </>
    )
}

export default ProjectInbox;
