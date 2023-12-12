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
import {MailIcon, MemberInviteIcon, MenuIcon, ShareIcon} from "@/icons";
import {Project, TeamMember} from "@/models";
import {PROJECT_ROLES} from "@/utils/constants";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {
    addItemToGroup,
    deleteMemberFromProject,
    deleteMemberShipFromProject
} from "@/redux/memberships/action-reducer";
import {
    removeProject,
    updateProjectMemberRole,
    updateProjectState
} from "@/redux/projects/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import {debounceInterval, isEmail} from "@/utils/common.functions";
import {
    getMemberStatusCache,
    getProjectLoadedFirstTime,
    setProjectLoadedFirstTime
} from "@/utils/cache.functions";
import {AutoComplete} from "@/components/common/auto-complete";
import {UsersOnline} from "@/components/common";

export function ProjectHeader() {
    const router = useRouter();
    const dispatch = useDispatch();
    const searchRef = useRef<HTMLInputElement | null>(null);

    const [membersInputs, setMembersInput] = useState<{ input: string, role: string }>({
        input: '',
        role: 'member'
    });
    const [isManagerMembersOpen, setIsManagerMembersOpen] = useState<boolean>(false)
    const [searchValue, setSearchValue] = useState<string>('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false)
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [actionType, setActionType] = useState<string>('');
    const [loadedFirstTime, setIsLoadedFirstTime] = useState<boolean>(getProjectLoadedFirstTime());
    const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);

    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const {projects, members, project, invitees} = useSelector((state: StateType) => state.projects);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
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
            dispatch(addItemToGroup({
                body: reqBody,
                afterSuccessAction: (invite: any) => {
                    let memberType = invite[0].invite ? 'invite' : 'member';
                    projectService.addOrUpdateProjectMemberOrInvites('add', memberType, invite[0]);
                }
            }));
            setMembersInput({input: '', role: 'member'});
        }
    }, [dispatch, membersInputs, selectedAccount]);

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
        setSelectedMember(item)
        onDeleteModalOpen()
    }

    const deleteProject = () => {
        setActionType('Are you sure you want to delete this project?')
        setSelectedMember(null)
        onDeleteModalOpen()
    }

    const leaveProject = () => {
        if (projectData) {
            setActionType('Are you sure you want to leave this project?')
            let myAccount = projectData.accounts.find((item: TeamMember) => item.userId === selectedAccount?.userId);
            if (myAccount) {
                setSelectedMember(myAccount)
                onDeleteModalOpen()
            }
        }
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
                projectService.addOrUpdateProjectMemberOrInvites('delete', 'invite', selectedMember);
                dispatch(deleteMemberShipFromProject({
                    body: {id: selectedMember.id}, toaster: {
                        success: {
                            desc: project?.emoji + " " + project?.name,
                            title: 'Removed ' + selectedMember.name,
                            type: 'success'
                        }
                    }
                }));
            } else {
                if (project && project.id && selectedMember?.id) {
                    projectService.addOrUpdateProjectMemberOrInvites('delete', 'member', selectedMember);
                    dispatch(deleteMemberFromProject({
                        body: {id: project.id, accountId: selectedMember.id}, toaster: {
                            success: {
                                desc: project?.emoji + " " + project?.name,
                                title: 'Removed ' + selectedMember.name + ' from project',
                                type: 'success'
                            }
                        },
                        afterSuccessAction: () => {
                            if (selectedAccount && selectedMember.userId === selectedAccount.userId) {
                                let projectData = (projects || []).filter((item: Project) => item.id !== project.id);
                                projectService.setProjectState({projects: projectData, project: null})
                                Router.push(`/inbox`);
                            }
                        }
                    }));
                }
            }
        } else {
            if (project && project.id) {
                dispatch(removeProject({
                        body: {
                            projectId: project.id
                        },
                        toaster: {
                            success: {
                                desc: 'Project has been deleted',
                                title: project.emoji + " " + project.name,
                                type: 'success'
                            }
                        }
                    }
                ))
                let filteredProjects = (projects || []).filter((item: Project) => item.id !== projectData?.id);
                projectService.setProjectState({projects: filteredProjects, project: null});
                Router.push(`/inbox`);
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
        if (!getProjectLoadedFirstTime()) {
            if (!threadIsLoading && projects && projects.length > 0) {
                setProjectLoadedFirstTime(true);
                setIsLoadedFirstTime(true);
            }
        }
    }, [threadIsLoading, projects]);

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
                    dispatch(updateProjectState({
                        project: targetProject,
                        members: targetProject.accounts,
                        invitees: targetProject.invites
                    }))
                }
            }
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

    function showDeleteIcon() {
        let showDelete = false;
        if (selectedAccount && project) {
            let findMe: TeamMember | undefined = project.accounts.find((t: TeamMember) => t.email === selectedAccount.email);
            if (findMe && findMe.role === 'admin') {
                showDelete = true;
            }
        }
        return showDelete;
    }

    return (
        <>
            <Flex align={'center'} justify={'space-between'} className={styles.projectHeader} gap={4}>
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
                                        {project && <>
                                            {project?.emoji}
                                            <span style={{marginLeft: 12}}>
                                                {project && project.name ? project.name : ''}
                                            </span>
                                            <ChevronDownIcon/>
                                        </>}
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
                                                                  // projectService.pageChange();
                                                                  messageService.pageChange();
                                                                  router.replace(`/projects/${project.id}`, undefined, {shallow: true});
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
                            {project && members &&
                            <Badge textTransform={'none'} className={styles.projectMembers} color={'#0556FF'}
                                   fontSize={'14px'} fontWeight={'600'}
                                   backgroundColor={'#EBF2FF'} marginBottom={'-2px'}
                                   padding={'3px 6px'} borderRadius={'4px'}
                                   lineHeight={'1.19'}>{members && members.length === 1 ? `1 member` : `${members && members.length} members`}</Badge>}
                        </>
                    )}
                </Flex>

                {(loadedFirstTime && project) && <Flex align={'center'} gap={1}>
                    {project &&
                    <UsersOnline type={'projects'} itemId={project.id!} className={styles.userImage} imageSize={'36'}
                                 showTotal={true}/>}
                    <Menu isOpen={isManagerMembersOpen} onClose={() => setIsManagerMembersOpen(false)}>
                        {({onClose}) => (
                            <>
                                <Tooltip label={'Share'} placement={'bottom'} customClass={'manageMembersTooltip'}>
                                    <MenuButton onClick={() => setIsManagerMembersOpen(!isManagerMembersOpen)}
                                                as={Button}
                                                className={styles.manageMembers}>
                                        <ShareIcon color={'#ffffff'}/>
                                        <span className={styles.manageMembersText}>Share</span>
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
                                                <AutoComplete value={membersInputs.input}
                                                              placeholder={`Name or email address`}
                                                              openAutoComplete={autoCompleteOpen}
                                                              handleChange={(e) => {
                                                                  setAutoCompleteOpen(true)
                                                                  membersInputs.input = e.target.value;
                                                                  setMembersInput({...membersInputs})
                                                              }}
                                                              handleKeyDown={() => null}
                                                              handlePaste={() => null}
                                                              handleAutoCompleteSelect={(e) => {
                                                                  setAutoCompleteOpen(false)
                                                                  membersInputs.input = e.email;
                                                                  setMembersInput({...membersInputs})
                                                              }}/>

                                                <Menu isLazy>
                                                    <MenuButton className={styles.addMemberDropDownButton}
                                                                color={'#374151'} backgroundColor={'transparent'}
                                                                h={'auto'} _active={{background: 'none'}}
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
                                                    {!showDeleteIcon() && <Text fontSize={'13px'} color={'#374151'}
                                                                                textTransform={'capitalize'}>{member.role}</Text>}
                                                    {showDeleteIcon() &&
                                                    <>
                                                        <Menu>
                                                            <MenuButton
                                                                className={`${styles.memberDropDown} ${styles.memberRoleButton}`}
                                                                fontSize={'12px'}
                                                                color={'#374151'} textTransform={'capitalize'}
                                                                backgroundColor={'#FFFFFF'} h={'auto'}
                                                                border={'1px solid #D1D5DB'}
                                                                borderRadius={'50px'}
                                                                as={Button} rightIcon={<TriangleDownIcon/>}>
                                                                {member.role}
                                                            </MenuButton>
                                                            <MenuList
                                                                className={`drop-down-list ${styles.memberRoleDropdownList}`}>
                                                                {PROJECT_ROLES.map((role, roleIndex) => {
                                                                    return <MenuItem
                                                                        onClick={() => {
                                                                            projectService.addOrUpdateProjectMemberOrInvites('update', 'member', {
                                                                                ...member,
                                                                                role
                                                                            });
                                                                            updateProjectMemberRoleData(role, member)
                                                                        }}
                                                                        textTransform={'capitalize'} key={roleIndex}>
                                                                        {role}
                                                                    </MenuItem>
                                                                })}
                                                            </MenuList>
                                                        </Menu>
                                                        <IconButton className={styles.closeIcon}
                                                                    onClick={() => openModel(member, `Are you sure you want to ${selectedAccount?.userId === member.userId ? 'leave' : 'remove member'} from project?`)}
                                                                    cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                    padding={0}
                                                                    minWidth={'1px'} aria-label='Add to friends'
                                                                    icon={<CloseIcon/>}/>
                                                    </>
                                                    }
                                                </Flex>
                                            </Flex>
                                        ))}
                                        {invitees && !!invitees.length && invitees.map((invite, index) => (
                                            <Flex align={'center'} pr={3} gap={3} key={index}
                                                  className={styles.projectMember}>
                                                <MenuItem>
                                                    <Tooltip label={'Invitation Pending'} placement={'bottom'}>
                                                        <div style={{
                                                            background: '#F3F4F6',
                                                            border: '1px solid #F3F4F6',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                             className={styles.imgWrapper}>
                                                            <MemberInviteIcon/>
                                                            {/*<Image src="/image/user.png" width="36" height="36" alt=""/>*/}
                                                        </div>
                                                    </Tooltip>
                                                    {invite?.invite?.toEmail}
                                                </MenuItem>
                                                <Flex align={'center'} gap={1}>
                                                    {!showDeleteIcon() && <Text fontSize={'13px'} color={'#374151'}
                                                                                textTransform={'capitalize'}>{invite.role}</Text>}
                                                    {showDeleteIcon() &&
                                                    <>
                                                        <Menu>
                                                            <MenuButton
                                                                className={`${styles.memberDropDown} ${styles.memberRoleButton}`}
                                                                fontSize={'12px'}
                                                                color={'#374151'} textTransform={'capitalize'}
                                                                backgroundColor={'#FFFFFF'} h={'auto'}
                                                                border={'1px solid #D1D5DB'}
                                                                borderRadius={'50px'}
                                                                as={Button} rightIcon={<TriangleDownIcon/>}>
                                                                {invite.role}
                                                            </MenuButton>
                                                            <MenuList
                                                                className={`drop-down-list ${styles.memberRoleDropdownList}`}>
                                                                {PROJECT_ROLES.map((role, roleIndex) => {
                                                                    return <MenuItem
                                                                        onClick={() => {
                                                                            projectService.addOrUpdateProjectMemberOrInvites('update', 'invite', {
                                                                                ...invite,
                                                                                role
                                                                            });
                                                                            updateProjectMemberRoleData(role, invite)
                                                                        }}
                                                                        textTransform={'capitalize'} key={roleIndex}>
                                                                        {role}
                                                                    </MenuItem>
                                                                })}
                                                            </MenuList>
                                                        </Menu>
                                                        <IconButton className={styles.closeIcon}
                                                                    onClick={() => openModel(invite, 'Are you sure you want to remove member?')}
                                                                    cursor={'pointer'} backgroundColor={'#FFFFFF'}
                                                                    padding={0}
                                                                    minWidth={'1px'} aria-label='Add to friends'
                                                                    icon={<CloseIcon/>}/>
                                                    </>
                                                    }
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
                            <MenuItem onClick={() => projectService.markProjectAsRead(project.id!)}>Mark as
                                read</MenuItem>
                            <MenuItem onClick={() => commonService.toggleEditProjectModel(true, false, project)}>Edit
                                project</MenuItem>
                            <MenuItem
                                onClick={() => leaveProject()}>Leave
                                project</MenuItem>

                            {(projectData?.projectMeta?.userId === selectedAccount?.userId) &&
                            <MenuItem className={'delete-button'}
                                      onClick={() => deleteProject()}>Delete
                                project</MenuItem>}
                        </MenuList>
                    </Menu>
                </Flex>}
            </Flex>
            {isDeleteModalOpen &&
            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeMemberFromProject}
                               modelTitle={actionType}/>}
        </>
    )
}
