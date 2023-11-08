import withAuth from "@/components/auth/withAuth";
import {EmojiMenu, Toaster} from "@/components/common";
import {
    editProjects,
    getProjectMembers,
    getProjectMembersInvites,
    updateProjectMemberRole
} from "@/redux/projects/action-reducer";
import styles from "@/styles/project.module.css";
import {StateType} from "@/types";
import {PROJECT_ROLES} from "@/utils/constants";
import {CloseIcon, SmallAddIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {
    Button,
    Flex,
    Heading, IconButton, Input, Menu, MenuButton, MenuItem, MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, useDisclosure
} from "@chakra-ui/react";
import Image from "next/image";
import React, {ChangeEvent, useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {commonService, projectService} from "@/services";
import {addItemToGroup, deleteMemberFromProject, deleteMemberShipFromProject} from "@/redux/memberships/action-reducer";
import RemoveRecordModal from "@/components/common/delete-record-modal";
import {AutoComplete} from "@/components/common/auto-complete";
import {InviteMember, Project, TeamMember} from "@/models";


function EditProject() {
    const dispatch = useDispatch();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {showEditProjectModal, passThroughProject} = useSelector((state: StateType) => state.commonApis);
    const [projectName, setProjectName] = useState<string>('');
    const [membersInputs, setMembersInput] = useState<{ input: string; role: string }>({
        input: '',
        role: 'member'
    });
    const [projectEmoji, setProjectEmoji] = useState<string>('');

    const {
        editProjectSuccess,
        invitees: invitessFromApi,
        members: membersFromApi
    } = useSelector((state: StateType) => state.projects);
    const {isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose} = useDisclosure()
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitees, setInvitees] = useState<InviteMember[]>([]);
    const [autoCompleteOpen, setAutoCompleteOpen] = useState<boolean>(false);

    useEffect(() => {
        if (passThroughProject) {
            setProjectName(passThroughProject.name || '');
            setProjectEmoji(passThroughProject.emoji || '');
            setMembers(passThroughProject.accounts || []);
            setInvitees(passThroughProject.invites || []);
            console.log(passThroughProject);
            if (!passThroughProject.accounts || passThroughProject.accounts.length <= 0) {
                dispatch(getProjectMembers({
                    body: {projectId: passThroughProject?.id},
                    afterSuccessAction: (inviteData: any) => {
                        let {projects} = projectService.getProjectState();
                        let finalProjects = [...(projects || [])];
                        let projectData = finalProjects.findIndex((item: Project) => item.id === passThroughProject.id);
                        if (projectData !== -1) {
                            finalProjects[projectData] = {
                                ...finalProjects[projectData],
                                accounts: inviteData
                            }
                            projectService.setProjectState({projects: finalProjects});
                        }
                    }
                }));
            }
            if (!passThroughProject.invites || passThroughProject.invites.length <= 0) {
                dispatch(getProjectMembersInvites({
                    body: {
                        projectId: passThroughProject?.id
                    },
                    afterSuccessAction: (inviteData: any) => {
                        let {projects} = projectService.getProjectState();
                        let finalProjects = [...(projects || [])];
                        let projectData = finalProjects.findIndex((item: Project) => item.id === passThroughProject.id);
                        if (projectData !== -1) {
                            finalProjects[projectData] = {
                                ...finalProjects[projectData],
                                invites: inviteData
                            }
                            projectService.setProjectState({projects: finalProjects});
                        }
                    }
                }));
            }
        }
    }, [dispatch, passThroughProject])

    const handleChange = (event: ChangeEvent | any) => {
        setProjectName(event.target.value);
    }

    const emojiChange = (item: string) => {
        setProjectEmoji(item);
    }

    useEffect(() => {
        if (editProjectSuccess) {
            projectService.setProjectState({editProjectSuccess: false})
            commonService.toggleEditProjectModel(false, false);
        }
    }, [editProjectSuccess])


    const editProject = () => {
        if (projectName.length === 0) {
            Toaster({desc: 'Please enter the project\'s name', title: 'Project name is required!', type: 'error'})
            return;
        }

        dispatch(editProjects({
            body: {
                projectId: passThroughProject?.id,
                name: projectName,
                emoji: projectEmoji,
            },
            toaster: {
                success: {
                    desc: "Project edited successfully",
                    title: "Success",
                    type: 'success'
                },
            },
            afterSuccessAction: () => {
                setProjectName('');
                setProjectEmoji('');
            }
        }));
    }

    useEffect(() => {
        if (invitessFromApi) {
            setInvitees(invitessFromApi);
        }
        if (membersFromApi) {
            setMembers(membersFromApi);
        }
    }, [invitessFromApi, membersFromApi])

    const addNewMembers = () => {
        if (!membersInputs.input) {
            Toaster({desc: 'Please add member\'s email', title: 'Add member\'s email required!', type: 'error'})
            return;
        }
        setMembersInput({role: 'member', input: ''})
        if (selectedAccount && selectedAccount.email && passThroughProject && passThroughProject.id) {
            let reqBody = {
                fromEmail: selectedAccount.email,
                toEmails: [membersInputs.input],
                roles: [membersInputs.role],
                groupType: 'project',
                groupId: passThroughProject?.id
            }

            dispatch(addItemToGroup({
                toaster: {
                    success: {
                        title: 'Member added successfully',
                        desc: passThroughProject?.name || '',
                        type: 'success'
                    }
                },
                body: reqBody,
                afterSuccessAction: (invite: any) => {
                    projectService.addOrUpdateProjectMemberOrInvites('add', 'invite', invite[0], passThroughProject);
                }
            }))
        }
    }

    const updateProjectMemberRoleData = (role: string, memberEmail: any) => {
        if (passThroughProject && passThroughProject.id && memberEmail && memberEmail.id) {
            let body = {
                role: role
            }
            dispatch(updateProjectMemberRole({
                body: {
                    projectId: passThroughProject.id,
                    accountId: memberEmail.id,
                    body: body
                }
            }))
        }
    }

    const openModel = (item: any) => {
        setSelectedMember(item)
        onDeleteModalOpen()
    }

    const removeMemberFromProject = () => {
        if (selectedMember) {
            if (selectedMember?.invite) {
                projectService.addOrUpdateProjectMemberOrInvites('delete', 'invite', selectedMember, passThroughProject);
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
                if (passThroughProject && passThroughProject.id && selectedMember?.id) {
                    projectService.addOrUpdateProjectMemberOrInvites('delete', 'member', selectedMember, passThroughProject);
                    dispatch(deleteMemberFromProject({
                        body: {id: passThroughProject.id, accountId: selectedMember.id}, toaster: {
                            success: {
                                desc: 'Member is removed form project successfully',
                                title: 'Remove member form project',
                                type: 'success'
                            }
                        }
                    }));
                }
            }
        }
        onDeleteModalClose()
    }


    return (
        <Modal isOpen={!!showEditProjectModal} onClose={() => {
            setMembers([]);
            setInvitees([]);
            commonService.toggleEditProjectModel(false, false)
        }}
               isCentered>
            <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
            <ModalContent maxWidth={'480px'} borderRadius={'12px'} className={styles.projectMemberModal}>
                <ModalHeader padding={'12px 14px'} fontSize={'13px'} color={'#374151'}
                             borderBottom={'1px solid #F3F4F6'}>
                    Edit project
                </ModalHeader>
                <ModalCloseButton top={'9px'} right={'12px'} className={styles.closeIcon}/>
                <ModalBody padding={'20px 12px 12px'}>
                    <Flex direction={'column'} gap={4}>
                        <Flex align={'center'} gap={4}>
                            <Menu>
                                <MenuButton className={styles.emojiModalButton} as={IconButton}
                                            backgroundColor={'#F9FAFB'}
                                            color={'#374151'} cursor={'pointer'} fontSize={'24px'} minW={'48px'}
                                            w={'48px'} h={'48px'} borderRadius={'50%'} alignItems={'center'}
                                            justifyContent={'center'}>{projectEmoji ? projectEmoji :
                                    <SmallAddIcon/>} </MenuButton>
                                <MenuList className={'drop-down-list'}>
                                    {/*
                                        <Flex padding={3} borderBottom={'1px solid #F3F4F6'}>
                                            <InputGroup>
                                                <InputLeftElement h={'29px'} w={'30px'} fontSize={'13px'} color={'#6B7280'} pointerEvents='none'>
                                                    <Search2Icon/>
                                                </InputLeftElement>
                                                <Input className={styles.emojiSearchBar} backgroundColor={'#F3F4F6'} borderRadius={20} fontSize={'14px'}
                                                       fontWeight={500} h={'auto'} lineHeight={1} type='tel'
                                                       border={0} padding={'5px 15px 5px 30px'} placeholder='Search emoji' />
                                            </InputGroup>
                                        </Flex>*/}
                                    {/* <Grid templateColumns='repeat(10, 1fr)' maxH={'175px'} overflow={'auto'} gap={2}
                                          padding={3}>
                                        {emojiArray.map((item: string, index: number) => (
                                            <GridItem w='100%' key={index} onClick={() => emojiChange(item)}>
                                                <MenuItem className={'emoji-modal-icon'}> {item} </MenuItem>
                                            </GridItem>
                                        ))}
                                    </Grid> */}

                                    <EmojiMenu onChange={emojiChange}/>
                                </MenuList>
                            </Menu>

                            <Input className={styles.projectSearchBar} value={projectName} onChange={handleChange}
                                   autoFocus={true}
                                   borderColor={'#E5E7EB'} borderRadius={8} backgroundColor={'#FFFFFF'}
                                   fontSize={'13px'} padding={'10px 16px'} lineHeight={1} height={'auto'}
                                   placeholder='Project name'/>
                        </Flex>

                        <div className={styles.addProjectMember}>
                            <Heading as='h6' fontSize={'16px'} color={'#374151'} letterSpacing={'-0.13px'}
                                     lineHeight={1} fontWeight={500} mb={2}>Add Members (optional)</Heading>
                            <Flex align={'center'} gap={'14px'}>
                                <Flex align={'center'} position={"relative"} borderRadius={'8px'}
                                      padding={'10px 10px 10px 16px'} width={'100%'} backgroundColor={'#ffffff'}
                                      border={'1px solid #E5E7EB'}>
                                    <AutoComplete value={membersInputs.input} placeholder={`Name or email address`}
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
                                        <MenuButton className={styles.memberRoleDropDown} minWidth={'65px'}
                                                    fontSize={'12px'} lineHeight={1}
                                                    color={'#374151'} backgroundColor={'transparent'} h={'auto'}
                                                    padding={0} as={Button}
                                                    textTransform={'capitalize'}
                                                    rightIcon={<TriangleDownIcon/>}> {membersInputs.role} </MenuButton>
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
                                        fontSize={'14px'} onClick={() => addNewMembers()}
                                        borderRadius={'8px'} minW={'52px'} height={'auto'} lineHeight={'1'}
                                        color={'#FFFFFF'} padding={'11px 12px'}>Add</Button>
                            </Flex>
                        </div>
                        <Flex direction={'column'} className={styles.manageMemberDropDown}>
                            {members && !!members.length && members.map((member, index) => (
                                <Flex align={'center'} justifyContent={"space-between"} borderRadius={'5px'} gap={2}
                                      pr={3} key={index}
                                      className={styles.projectMember}>
                                    <Flex align={'center'} gap={3} padding={'8px 12px'} fontSize={'13px'}
                                          color={'#0a101d'}>
                                        <div className={styles.imgWrapper}>
                                            {member.avatar && member.avatar.url ?
                                                <Image src={member.avatar.url} width="36" height="36"
                                                       alt=""/> : null}
                                        </div>
                                        {member.name}
                                    </Flex>
                                    <Flex align={'center'} gap={1}>
                                        <Menu>
                                            <MenuButton className={styles.memberDropDown}
                                                        fontSize={'12px'}
                                                        color={'#374151'} textTransform={'capitalize'}
                                                        backgroundColor={'#FFFFFF'} h={'auto'}
                                                        border={'1px solid #D1D5DB'}
                                                        borderRadius={'50px'} fontWeight={500}
                                                        as={Button} rightIcon={<TriangleDownIcon/>}>
                                                {member.role}
                                            </MenuButton>
                                            <MenuList className={`drop-down-list`}>
                                                {PROJECT_ROLES.map((role, roleIndex) => {
                                                    return <MenuItem
                                                        onClick={() => {
                                                            projectService.addOrUpdateProjectMemberOrInvites('update', 'invite', {
                                                                ...member,
                                                                role
                                                            }, passThroughProject);
                                                            updateProjectMemberRoleData(role, member)
                                                        }}
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
                                <Flex align={'center'} justifyContent={'space-between'} borderRadius={5} pr={3} gap={3}
                                      key={index}
                                      className={styles.projectMember}>
                                    <Flex align={'center'} gap={3} padding={'8px 12px'} fontSize={'13px'}
                                          color={'#0a101d'}>
                                        <div style={{background: 'transparent'}} className={styles.imgWrapper}>
                                            {/*<Image src="/image/user.png" width="36" height="36" alt=""/>*/}
                                        </div>
                                        {invite?.invite?.toEmail}
                                    </Flex>
                                    <Flex align={'center'} gap={1}>
                                        <Menu>
                                            <MenuButton className={styles.memberDropDown}
                                                        fontSize={'12px'}
                                                        color={'#374151'} textTransform={'capitalize'}
                                                        backgroundColor={'#FFFFFF'} h={'auto'}
                                                        border={'1px solid #D1D5DB'}
                                                        borderRadius={'50px'} fontWeight={500}
                                                        as={Button} rightIcon={<TriangleDownIcon/>}>
                                                {invite?.role}
                                            </MenuButton>
                                            <MenuList className={`drop-down-list`}>
                                                {PROJECT_ROLES.map((role, roleIndex) => {
                                                    return <MenuItem
                                                        onClick={() => {
                                                            projectService.addOrUpdateProjectMemberOrInvites('update', 'invite', {
                                                                ...invite,
                                                                role
                                                            }, passThroughProject);
                                                            updateProjectMemberRoleData(role, invite)
                                                        }}
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
                        </Flex>

                        <Flex align={'center'} justify={'flex-end'} pt={4} borderTop={'1px solid #F3F4F6'} gap={3}>
                            <Button className={styles.cancelModalButton} border={'1px solid #374151'}
                                    backgroundColor={'#FFFFFF'} borderRadius={8}
                                    onClick={() => commonService.toggleEditProjectModel(false, false)} fontSize={'14px'}
                                    height={'auto'} lineHeight={1} padding={'10px 12px'}
                                    color={'#374151'}> Cancel </Button>

                            <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} borderRadius={8}
                                    onClick={() => editProject()} fontSize={'14px'} height={'auto'} lineHeight={1}
                                    padding={'11px 12px'}
                                    color={'#ffffff'}> Save Project </Button>
                        </Flex>
                    </Flex>

                </ModalBody>
            </ModalContent>

            <RemoveRecordModal onOpen={onDeleteModalOpen} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose}
                               confirmDelete={removeMemberFromProject}
                               modelTitle={'Are you sure you want to remove member from project?'}/>
        </Modal>


    )
}

export default withAuth(EditProject);
