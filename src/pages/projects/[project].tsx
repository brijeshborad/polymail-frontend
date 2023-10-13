import RemoveRecordModal from "@/components/common/delete-record-modal";
import {Message} from "@/components/messages";
import {InviteMember, Project, TeamMember, UserProjectOnlineStatus} from "@/models";
import {
    addItemToGroup, deleteMemberFromProject, deleteMemberShipFromProject
} from "@/redux/memberships/action-reducer";
import {
  getProjectMembers,
  getProjectMembersInvites, removeProject,
  updateProjectMemberRole,
  updateProjectState
} from "@/redux/projects/action-reducer";
import styles from "@/styles/project.module.css";
import inboxStyles from "@/styles/Inbox.module.css";
import {StateType} from "@/types";
import {debounceInterval, isEmail} from "@/utils/common.functions";
import {PROJECT_ROLES} from "@/utils/constants";
import {ChevronDownIcon, CloseIcon, SearchIcon, SmallAddIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {
    Badge,
    Button,
    Flex,
    Grid, GridItem,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Skeleton,
    Text, useDisclosure
} from "@chakra-ui/react";
import dynamic from 'next/dynamic';
import Image from "next/image";
import Router, {useRouter} from "next/router";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {MailIcon, MenuIcon} from "@/icons";
import {commonService, messageService, projectService, socketService, threadService} from "@/services";
import Tooltip from "@/components/common/Tooltip";

const ThreadsSideBar = dynamic(
    () => import('@/components/threads').then((mod) => mod.ThreadsSideBar)
)

function ProjectInbox() {
    const searchRef = useRef<HTMLInputElement | null>(null);
    const [searchValue, setSearchValue] = useState<string>('');
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const {members, project, invitees} = useSelector((state: StateType) => state.projects);
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {onlineUsers} = useSelector((state: StateType) => state.commonApis);
    const {success} = useSelector((state: StateType) => state.memberships);
    const { projects } = useSelector((state: StateType) => state.projects);
    const {event: incomingEvent} = useSelector((state: StateType) => state.globalEvents);
    const [isManagerMembersOpen, setIsManagerMembersOpen] = useState<boolean>(false)
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false)

    const [size, setSize] = useState<number>(0);
    const [maxShowingMembers, setMaxShowingMembers] = useState<number>(5);
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const [membersInputs, setMembersInput] = useState<{ input: string, role: string }>({
        input: '',
        role: 'member'
    });
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [projectData,setProjectData] = useState<Project | null>(null);
    const [actionType,setActionType] = useState<string>('');

    const router = useRouter();
    const dispatch = useDispatch();

  useEffect(() => {
      if (incomingEvent === 'iframe.clicked') {
        setIsProjectDropdownOpen(false);
      }
  }, [incomingEvent, setIsProjectDropdownOpen]);

  useEffect(() => {
      setFilteredProjects((projects || []));
  }, [projects, selectedThread])

  useEffect(() => {
    let projectData = (projects || []).filter((item: Project) => item.id === project?.id)
    setProjectData(projectData[0])

  }, [projects, project])
  useEffect(() => {
      if (searchValue.length > 0) {
          setFilteredProjects((projects || []).filter((item: Project) => item.name?.toLowerCase().includes(searchValue.toLowerCase())));
      } else {
          setFilteredProjects((projects || []));
      }
  }, [searchValue, projects])

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
    if(!router.query.thread) return

    const threadFromUrl = threads?.find(t => t.id == router.query.thread)

    if(threadFromUrl) {
      threadService.setSelectedThread(threadFromUrl);
    }
  }, [threads, router.query.thread])


    useEffect(() => {
        if (router.query.project) {
            let projectId = router.query.project as string;

            if(projects) {
              const targetProject = projects.find(p => p.id === projectId)
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
    }, [router.query.project, projects, dispatch])

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


    useEffect(() => {
        if (incomingEvent === 'iframe.clicked') {
            setIsManagerMembersOpen(false)
        }
    }, [incomingEvent]);


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
                          let projectData = (projects || []).filter((item : Project) => item.id !== project.id);
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


    const capitalizeFLetter = (value: string) => {
        return value[0].toUpperCase() + value.slice(1)
    }

    return (
        <>
            <Flex direction={'column'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'} flex={1}>

                <Flex align={'center'} justify={'space-between'} gap={4} padding={'16px 40px 15px'}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.12)'} backgroundColor={'#FFFFFF'}>
                    <Flex align={'center'} gap={2}>
                      {!project ? (
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
                        <Menu isOpen={isProjectDropdownOpen} onClose={() => setIsProjectDropdownOpen(false)}>
                          <Tooltip label='Show all projects' placement='bottom'>
                            <MenuButton
                              onClick={() => {
                                setIsProjectDropdownOpen(!isProjectDropdownOpen)
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
                              {project?.emoji ? project.emoji : <Image src="/image/user.png" width="24" height="24" alt=""/>}
                              <span style={{ marginLeft: 12 }}>{project && project.name ? project.name : 'Loading...'}</span>
                              <ChevronDownIcon />
                            </MenuButton>
                          </Tooltip>

                          <MenuList className={`${inboxStyles.addToProjectList} drop-down-list`} zIndex={'overlay'}>
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
                            <div>
                              <Button className={inboxStyles.backToInbox} backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                      justifyContent={'flex-start'}
                                      onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          threadService.pageChange();
                                          projectService.pageChange();
                                          messageService.pageChange();
                                          Router.push('/inbox')
                                      }}>
                                <div style={{ marginRight: 8 }}>
                                  <MailIcon />
                                </div>
                                Back to inbox
                              </Button>
                            </div>
                            <div className={'add-to-project-list'}>
                                {filteredProjects && !!filteredProjects.length && (filteredProjects || []).map((project: Project) => {
                                  return (
                                    <MenuItem gap={2} key={project.id} onClick={() => router.push(`/projects/${project.id}`)}>
                                        {project.emoji} {project.name}
                                    </MenuItem>
                                  )
                                })}
                            </div>
                            <div>
                                <Button backgroundColor={'transparent'} w={'100%'} borderRadius={0}
                                        justifyContent={'flex-start'}
                                        onClick={() => commonService.toggleCreateProjectModel(true, true)}>
                                    <div className={inboxStyles.plusIconBlack} style={{ marginRight: 8 }}>
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

                    <Flex align={'center'} gap={1}>
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
                                                            <Image src="/image/user.png" width="36" height="36" alt=""/>
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
                                                        <div className={styles.imgWrapper}>
                                                            <Image src="/image/user.png" width="36" height="36" alt=""/>
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
                                <MenuItem onClick={() => commonService.toggleEditProjectModel(true, false, project)}>Edit project</MenuItem>
                                <MenuItem onClick={() => openModel(selectedAccount, 'leave')}>Leave project</MenuItem>

                                {(projectData?.projectMeta?.userId === selectedAccount?.userId) && <MenuItem className={'delete-button'} onClick={() => openModel(project, 'remove')}>Delete project</MenuItem> }
                            </MenuList>
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
                               modelTitle={`Are you sure you want to ${actionType === 'remove' ? 'remove' : 'leave'} member from project?`}/>

        </>
    )
}

export default ProjectInbox;
