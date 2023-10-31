import {
    Badge,
    Button,
    Flex, IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton, MenuItem,
    MenuList,
    Skeleton, Text, useDisclosure
} from "@chakra-ui/react";
import Tooltip from "@/components/common/Tooltip";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {ChevronDownIcon, CloseIcon, SearchIcon, SmallAddIcon, TriangleDownIcon} from "@chakra-ui/icons";
import inboxStyles from "@/styles/Inbox.module.css";
import {commonService, messageService, projectService, socketService, threadService} from "@/services";
import Router, {useRouter} from "next/router";
import {MailIcon, MenuIcon} from "@/icons";
import {InviteMember, Project, TeamMember, UserProjectOnlineStatus} from "@/models";
import {PROJECT_ROLES} from "@/utils/constants";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {addItemToGroup, deleteMemberFromProject, deleteMemberShipFromProject} from "@/redux/memberships/action-reducer";
import {
    getProjectMembers,
    getProjectMembersInvites, removeProject,
    updateProjectMemberRole,
    updateProjectState
} from "@/redux/projects/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import {debounceInterval, isEmail} from "@/utils/common.functions";
import {getMemberStatusCache} from "@/utils/cache.functions";

export function ProjectHeader() {
    const router = useRouter();
    const dispatch = useDispatch();
    const searchRef = useRef<HTMLInputElement | null>(null);

    const [membersInputs, setMembersInput] = useState<{ input: string, role: string }>({
        input: '',
        role: 'member'
    });
    const [maxShowingMembers, setMaxShowingMembers] = useState<number>(5);
    const [isManagerMembersOpen, setIsManagerMembersOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false)
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [loadedFirstTime, setIsLoadedFirstTime] = useState<boolean>(false);

    const {onlineUsers, isLoading} = useSelector((state: StateType) => state.commonApis);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {projects} = useSelector((state: StateType) => state.projects);
    const {members, project, invitees} = useSelector((state: StateType) => state.projects);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {success} = useSelector((state: StateType) => state.memberships);
    const {isLoading: threadIsLoading} = useSelector((state: StateType) => state.threads);

    const inviteAccountToProject = useCallback((item: Project | null) => {
        if (selectedAccount && selectedAccount.email && membersInputs.input.length > 0) {
            let reqBody = {
                fromEmail: selectedAccount.email,
                toEmails: [membersInputs.input],
                roles: [membersInputs.role],
                groupType: 'project',
                groupId: item?.id
            }
            dispatch(addItemToGroup({body: reqBody}))

            let projectId = router.query.project as string;
            dispatch(getProjectMembersInvites({body: {projectId: projectId}}));
            setMembersInput({input: '', role: 'member'});
        }
    }, [dispatch, membersInputs, selectedAccount, router.query.project]);

    const updateProjectMemberRoleData = (role: string, member: any) => {
        if (project && project.id && member && member.id) {
            let body = {
                role: role
            }
            dispatch(updateProjectMemberRole({
                body: {
                    projectId: project.id,
                    accountId: member.id,
                    body: body
                }
            }))
        }

    };

    const openModel = (item: any, type: string) => {
        setActionType(type)
        if (type === 'leave') {
            setSelectedMember(item)
        }
        onDeleteModalOpen()
    }

    const capitalizeFLetter = (value: string) => {
        return value[0].toUpperCase() + value.slice(1)
    }

    function focusSearch() {
        setTimeout(() => {
            if (searchRef.current) {
                searchRef.current?.focus();
            }
        }, 300)
    }

    const removeMemberFromProject = () => {
        if (selectedMember) {
            if (selectedMember?.invite) {
                dispatch(deleteMemberShipFromProject({
                    body: {id: selectedMember.id}, toaster: {
                        success: {
                            desc: 'Membership is removed form project successfully',
                            title: 'Remove membership form project',
                            type: 'success'
                        }
                    }
                }));
            } else {
                if (project && project.id && selectedMember?.id) {
                    dispatch(deleteMemberFromProject({
                        body: {id: project.id, accountId: selectedMember.id}, toaster: {
                            success: {
                                desc: 'Member is removed form project successfully',
                                title: 'Remove member form project',
                                type: 'success'
                            }
                        },
                        afterSuccessAction: () => {
                            let projectData = (projects || []).filter((item: Project) => item.id !== project.id);
                            dispatch(updateProjectState({projects: projectData}))
                            Router.push(`/projects`);

                        }
                    }));
                }
            }
        } else {
            if (projectData && projectData.id) {
                dispatch(removeProject({
                        body: {
                            projectId: projectData.id
                        },
                        toaster: {
                            success: {
                                desc: 'Project removed successfully',
                                title: 'Success',
                                type: 'success'
                            }
                        }
                    }
                ))
            }
        }
        onDeleteModalClose()
    }

    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsManagerMembersOpen(false)
            setIsProjectDropdownOpen(false);
        }
    }, [incomingEvent]);

    useEffect(() => {
        if (project && !threadIsLoading && !isLoading) {
            setIsLoadedFirstTime(true);
        }
    }, [project, threadIsLoading, isLoading]);

    useEffect(() => {
        if (searchValue.length > 0) {
            setFilteredProjects((projects || []).filter((item: Project) => item.name?.toLowerCase().includes(searchValue.toLowerCase())));
        } else {
            setFilteredProjects((projects || []));
        }
    }, [searchValue, projects])

    useEffect(() => {
        setFilteredProjects((projects || []));
    }, [projects])

    useEffect(() => {
        let projectData = (projects || []).filter((item: Project) => item.id === project?.id)
        setProjectData(projectData[0])

    }, [projects, project])

    useEffect(() => {
        if (router.query.project) {
            const interval = debounceInterval(() => {
                let projectId = router.query.project as string;
                socketService.fireProjectViewActivity(selectedAccount?.userId, projectId);
            }, 5000);
            return () => clearInterval(interval);
        }
        return undefined
    }, [router.query.project, selectedAccount?.userId]);

    useEffect(() => {
        if (router.query.project) {
            let projectId = router.query.project as string;

            if (projects) {
                const targetProject = projects.find(p => p.id === projectId)
                if (targetProject) {
                    commonService.updateUserOnlineStatusProject(targetProject);
                }
                dispatch(updateProjectState({
                    project: targetProject
                }))
            }

            dispatch(getProjectMembers({
                body: {
                    projectId: projectId
                }
            }));
            dispatch(getProjectMembersInvites({body: {projectId: projectId}}));
        }
        return () => {
            commonService.removeAllOtherOnlineStatusForUserProject({...getMemberStatusCache()}, [], 'me')
        }
    }, [router.query.project, projects, dispatch])

    useEffect(() => {
        if (membersInputs) {
            let alreadyInvitedMembers = (invitees || []).map(t => t?.invite?.toEmail);
            setAllowAdd(!!(membersInputs.input.trim() && isEmail(membersInputs.input.trim()) && !alreadyInvitedMembers.includes(membersInputs.input)));
        }
    }, [invitees, membersInputs])


    useEffect(() => {
        if (success && selectedMember && selectedMember?.id) {
            if (selectedMember && selectedMember?.invite) {
                let data = (invitees || []).filter((item: InviteMember) => item.id !== selectedMember.id);
                projectService.setInvitees(data);
            } else {
                let data = (members || []).filter((item: TeamMember) => item.id !== selectedMember.id);
                projectService.setMembers(data);
            }
            setSelectedMember(null);
        }
    }, [success, selectedMember, invitees, members])

    return (
        <>
            <Flex align={'center'} justify={'space-between'} gap={4} padding={'16px 40px 15px'}
                  borderBottom={'1px solid #F3F4F6'} backgroundColor={'#FFFFFF'}>
                <Flex align={'center'} gap={2}>
                    {!loadedFirstTime ? (
                        <>
                            <Skeleton
                                startColor='#F3F4F6' endColor='#f3f3f3'
                                height={'40px'}
                                borderRadius={'8px'}
                                border={'1px solid #E5E7EB'}
                                width={'40px'}
                            />
                            <Skeleton
                                startColor='#F3F4F6' endColor='#f3f3f3'
                                height={'40px'}
                                borderRadius={'8px'}
                                border={'1px solid #E5E7EB'}
                                width={'380px'}
                            />
                            <Skeleton
                                startColor='#F3F4F6' endColor='#f3f3f3'
                                height={'23px'}
                                borderRadius={'8px'}
                                border={'1px solid #E5E7EB'}
                                width={'90px'}
                            />
                        </>
                    ) : (
                        <>
                            <Menu isOpen={isProjectDropdownOpen} autoSelect={false}
                                  onClose={() => setIsProjectDropdownOpen(false)}>
                                <Tooltip label='Show all projects' placement='bottom'>
                                    <MenuButton
                                        onClick={() => {
                                            setIsProjectDropdownOpen(!isProjectDropdownOpen);
                                            focusSearch();
                                        }}
                                        display={'flex'}
                                        as={Flex}
                                        fontSize={'24px'} color={'#08162F'}
                                        fontWeight={600}
                                        backgroundColor={'#fff'}
                                        className={styles.projectNameDropdown}
                                        padding={'0 8px'}
                                        cursor={'pointer'}
                                        rounded={'md'}
                                    >
                                        {project?.emoji ? project.emoji :
                                            <Image src="/image/user.png" width="24" height="24" alt=""/>}
                                        <span
                                            style={{marginLeft: 12}}>{project && project.name ? project.name : ''}</span>
                                        <ChevronDownIcon/>
                                    </MenuButton>
                                </Tooltip>

                                <MenuList className={`${inboxStyles.addToProjectList} drop-down-list`}
                                          zIndex={'overlay'}>
                                    <div className={'dropdown-searchbar'}>
                                        <InputGroup>
                                            <InputLeftElement h={'27px'} pointerEvents='none'>
                                                <SearchIcon/>
                                            </InputLeftElement>
                                            <Input ref={searchRef} autoFocus value={searchValue}
                                                   onChange={(e) => setSearchValue(e.target.value)}
                                                   placeholder='Search project'/>
                                        </InputGroup>
                                    </div>
                                    <div className={inboxStyles.backToInbox}>
                                        <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                                justifyContent={'flex-start'}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    threadService.pageChange();
                                                    projectService.pageChange();
                                                    messageService.pageChange();
                                                    Router.push('/inbox')
                                                }}>
                                            <div style={{marginRight: 8}}>
                                                <MailIcon/>
                                            </div>
                                            Back to inbox
                                        </Button>
                                    </div>
                                    <div className={'add-to-project-list'}>
                                        {filteredProjects && !!filteredProjects.length && (filteredProjects || []).map((project: Project) => {
                                            return (
                                                <MenuItem gap={2} key={project.id}
                                                          onClick={() => {
                                                              if (router.query.project !== project.id) {
                                                                  threadService.pageChange(false);
                                                                  projectService.pageChange();
                                                                  messageService.pageChange();
                                                                  setIsLoadedFirstTime(false);
                                                                  router.push(`/projects/${project.id}`)
                                                              }
                                                          }}>
                                                    {project.emoji} {project.name}
                                                </MenuItem>
                                            )
                                        })}
                                    </div>
                                    <div className={inboxStyles.addNewProject}>
                                        <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                                justifyContent={'flex-start'}
                                                onClick={() => commonService.toggleCreateProjectModel(true, true)}>
                                            <div className={inboxStyles.plusIconBlack} style={{marginRight: 8}}>
                                                <SmallAddIcon/>
                                            </div>
                                            Create New Project
                                        </Button>
                                    </div>
                                </MenuList>
                            </Menu>
                            <Badge textTransform={'none'} color={'#000000'} fontSize={'14px'} fontWeight={'600'}
                                   backgroundColor={'#E9E9E9'} marginBottom={'-2px'}
                                   padding={'3px 6px'} borderRadius={'4px'}
                                   lineHeight={'1.19'}>{members && members.length === 1 ? `1 member` : `${members && members.length} members`}</Badge>
                        </>
                    )}
                </Flex>

                {loadedFirstTime && <Flex align={'center'} gap={1}>
                    {project && onlineUsers && (onlineUsers['projects'][project.id!] || [])
                        .filter((t: UserProjectOnlineStatus) => t.isOnline).slice(0, maxShowingMembers)
                        .map((item: UserProjectOnlineStatus, index: number) => (
                            <Tooltip label={item.name || ''} placement='bottom' key={index}>
                                <div className={styles.userImage} style={{border: `2px solid #${item.color}`}}>
                                    {item.avatar && <Image src={item.avatar} width="36" height="36" alt=""/>}
                                </div>
                            </Tooltip>
                        ))}

                    <Text fontSize={'sm'} textDecoration={'underline'} cursor={'pointer'}
                          onClick={() => setMaxShowingMembers(maxShowingMembers + 5)}>
                        {project && onlineUsers && (onlineUsers['projects'][project.id!] || []).length > maxShowingMembers ? `+${(onlineUsers['projects'][project.id!] || []).length - maxShowingMembers}more` : ''}
                    </Text>

                    <Menu isOpen={isManagerMembersOpen} onClose={() => setIsManagerMembersOpen(false)}>
                        {({onClose}) => (
                            <>
                                <Tooltip label={'Manage members'} placement={'bottom'}>
                                    <MenuButton
                                        onClick={() => setIsManagerMembersOpen(!isManagerMembersOpen)}
                                        as={Button} className={styles.manageMembers} ml={2} backgroundColor={'#000000'}
                                        color={'#ffffff'} lineHeight={'1'} fontSize={'14px'} borderRadius={'8px'}
                                        height={'auto'} padding={'11px 16px'}
                                    >
                                        Share
                                    </MenuButton>
                                </Tooltip>
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

                                    <Flex direction={'column'} pb={4}>
                                        {members && !!members.length && members.map((member, index) => (
                                            <Flex align={'center'} gap={2} pr={3} key={index}
                                                  className={styles.projectMember}>
                                                <MenuItem>
                                                    <div className={styles.imgWrapper}>
                                                        {member.avatar && member.avatar.url ?
                                                            <Image src={member.avatar.url} width="36" height="36"
                                                                   alt=""/> : null}
                                                    </div>
                                                    {member.name}
                                                </MenuItem>
                                                <Flex align={'center'} gap={1}>
                                                    <Menu>
                                                        <MenuButton className={styles.memberDropDown}
                                                                    fontSize={'12px'}
                                                                    color={'#374151'} textTransform={'capitalize'}
                                                                    backgroundColor={'#FFFFFF'} h={'auto'}
                                                                    border={'1px solid #D1D5DB'}
                                                                    borderRadius={'50px'}
                                                                    as={Button} rightIcon={<TriangleDownIcon/>}>
                                                            {member.role}
                                                        </MenuButton>
                                                        <MenuList className={`drop-down-list`}>
                                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                                return <MenuItem
                                                                    onClick={() => updateProjectMemberRoleData(role, member)}
                                                                    textTransform={'capitalize'} key={roleIndex}>
                                                                    {role}
                                                                </MenuItem>
                                                            })}
                                                        </MenuList>
                                                    </Menu>
                                                    <IconButton className={styles.closeIcon}
                                                                onClick={() => openModel(member, 'leave')}
                                                                cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                padding={0}
                                                                minWidth={'1px'} aria-label='Add to friends'
                                                                icon={<CloseIcon/>}/>
                                                </Flex>
                                            </Flex>
                                        ))}
                                        {invitees && !!invitees.length && invitees.map((invite, index) => (
                                            <Flex align={'center'} pr={3} gap={3} key={index}
                                                  className={styles.projectMember}>
                                                <MenuItem>
                                                    <div style={{background: '#000'}} className={styles.imgWrapper}>
                                                        {/*<Image src="/image/user.png" width="36" height="36" alt=""/>*/}
                                                    </div>
                                                    {invite?.invite?.toEmail}
                                                </MenuItem>
                                                <Flex align={'center'} gap={1}>
                                                    <Menu>
                                                        <MenuButton className={styles.memberDropDown}
                                                                    fontSize={'12px'}
                                                                    color={'#374151'} textTransform={'capitalize'}
                                                                    backgroundColor={'#FFFFFF'} h={'auto'}
                                                                    border={'1px solid #D1D5DB'}
                                                                    borderRadius={'50px'}
                                                                    as={Button} rightIcon={<TriangleDownIcon/>}>
                                                            {invite.role}
                                                        </MenuButton>
                                                        <MenuList className={`drop-down-list`}>
                                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                                return <MenuItem
                                                                    onClick={() => updateProjectMemberRoleData(role, invite)}
                                                                    textTransform={'capitalize'} key={roleIndex}>
                                                                    {role}
                                                                </MenuItem>
                                                            })}
                                                        </MenuList>
                                                    </Menu>
                                                    <IconButton className={styles.closeIcon}
                                                                onClick={() => openModel(invite, 'leave')}
                                                                cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                padding={0}
                                                                minWidth={'1px'} aria-label='Add to friends'
                                                                icon={<CloseIcon/>}/>
                                                </Flex>
                                            </Flex>
                                        ))}
                                    </Flex>
                                </MenuList>
                            </>
                        )}
                    </Menu>

                    <Menu isLazy>
                        <MenuButton
                            className={`${styles.projectListDropDownButton} ${styles.projectListMenuButton} `}
                            border={'1px solid #374151'} borderRadius={8} marginLeft={2} backgroundColor={'#FFFFFF'}
                            h={'auto'} fontSize={12} minW={'1px'} padding={'10px 11px'} as={Button}>
                            <MenuIcon/>
                        </MenuButton>
                        <MenuList minW={'126px'} className={'drop-down-list'}>
                            <MenuItem>Mark as read</MenuItem>
                            <MenuItem onClick={() => commonService.toggleEditProjectModel(true, false, project)}>Edit
                                project</MenuItem>
                            <MenuItem onClick={() => openModel(selectedAccount, 'leave')}>Leave project</MenuItem>

                            {(projectData?.projectMeta?.userId === selectedAccount?.userId) &&
                            <MenuItem className={'delete-button'} onClick={() => openModel(project, 'remove')}>Delete
                                project</MenuItem>}
                        </MenuList>
                    </Menu>
                </Flex>}
            </Flex>
            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeMemberFromProject}
                               modelTitle={`Are you sure you want to ${actionType === 'remove' ? 'remove member' : 'leave'} from project?`}/>
        </>
    )
}
