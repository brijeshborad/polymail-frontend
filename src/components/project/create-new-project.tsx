import withAuth from "@/components/auth/withAuth";
import { Toaster } from "@/components/common";
import { updateCommonState } from "@/redux/common-apis/action-reducer";
import { addItemToGroup } from "@/redux/memberships/action-reducer";
import { createProjects, updateProjectState } from "@/redux/projects/action-reducer";
import styles from "@/styles/project.module.css";
import { StateType } from "@/types";
import { emojiArray } from "@/utils/common.functions";
import { PROJECT_ROLES } from "@/utils/constants";
import { CloseIcon, SmallAddIcon, TriangleDownIcon } from "@chakra-ui/icons";
import {
    Button,
    Flex, Grid, GridItem,
    Heading, IconButton, Input, Menu, MenuButton, MenuItem, MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import Image from "next/image";
import Router from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {threadService} from "@/services";


function CreateNewProjectModal() {
    const dispatch = useDispatch();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    const {showCreateProjectModal, shouldRedirectOnCreateProject} = useSelector((state: StateType) => state.commonApis);
    const [projectName, setProjectName] = useState<string>('');
    const [membersInputs, setMembersInput] = useState<{ input: string; role: string; memberArray: Array<{ item?: string; memberRole?: string }> }>({
        input: '',
        role: 'member',
        memberArray: []
    });
    const [projectEmoji, setProjectEmoji] = useState<string>('');

    const {createProjectSuccess, project} = useSelector((state: StateType) => state.projects);
    const {selectedThread} = useSelector((state: StateType) => state.threads);

    const handleChange = (event: ChangeEvent | any) => {
        setProjectName(event.target.value);
    }

    const emojiChange = (item: string) => {
        setProjectEmoji(item);
    }

    useEffect(() => {
        if (createProjectSuccess) {
            dispatch(updateProjectState({createProjectSuccess: false}))
            if (project && selectedThread) {
                threadService.addThreadToProject(project, null, false);
            }
            if (selectedAccount && selectedAccount.email && membersInputs.memberArray && membersInputs.memberArray?.length > 0 && project && project.id) {
                let reqBody = {
                    fromEmail: selectedAccount.email,
                    toEmails: (membersInputs.memberArray || []).map((data: any) => data.item),
                    roles: (membersInputs.memberArray || []).map((data: any) => data.memberRole),
                    groupType: 'project',
                    groupId: project?.id
                }
                dispatch(addItemToGroup({
                    toaster: {
                        success: {
                            desc: 'Thread was added to ' + project.name?.toLowerCase() + '.',
                            title: selectedThread?.subject || '',
                            type: 'success'
                        }
                    },
                    body: reqBody
                }))

                setMembersInput({
                    input: '',
                    role: 'member',
                    memberArray: []
                });
                if (shouldRedirectOnCreateProject && project) {
                    Router.push(`/projects/${project.id!}`)
                }
            } else {
                if (shouldRedirectOnCreateProject && project) {
                    Router.push(`/projects/${project.id!}`);
                }
            }
            dispatch(updateCommonState({showCreateProjectModal: false, shouldRedirectOnCreateProject: false}))
        }
    }, [dispatch, createProjectSuccess, selectedAccount, membersInputs.memberArray, project, shouldRedirectOnCreateProject])


    const addNewProject = () => {
        if (projectName.length === 0) {
            Toaster({desc: 'Please enter the project\'s name', title: 'Project name is required!', type: 'error'})
            return;
        }
        if (!selectedAccount) {
            Toaster({desc: 'Your account is not created', title: 'Account is required!', type: 'error'})
            return;
        }

        if (!selectedOrganization) {
            Toaster({desc: 'Your organization is not created', title: 'Organization is required!', type: 'error'})
            return;
        }

        if (selectedAccount && selectedOrganization) {
            dispatch(createProjects({
                body: {
                    name: projectName,
                    accountId: selectedAccount.id,
                    organizationId: selectedOrganization.id,
                    emoji: projectEmoji,
                },
                toaster: {
                    success: {
                    desc: "New project added successfully",
                    title: "Success",
                    type: 'success'},
                },
            }));
        }
        setProjectName('');
        setProjectEmoji('');
    }

    const addNewMembers = () => {
        if (!membersInputs.input) {
            Toaster({desc: 'Please add member\'s email', title: 'Add member\'s email required!', type: 'error'})
            return;
        }
        setMembersInput(prevState => ({
                ...prevState,
                memberArray: [
                    {
                        item: membersInputs.input,
                        memberRole: membersInputs.role
                    },
                    ...prevState.memberArray,
                ],
                input: '',
            })
        )
    }

    const handleItemDelete = (item: string) => {
        setMembersInput((prevState) => ({
            ...prevState,
            memberArray: prevState.memberArray?.filter(i => i.item !== item),
        }));
    };

    const updateProjectMemberRoleData = (role: string, memberEmail: any) => {
        const updatedMemberArray = membersInputs.memberArray?.map((member) => {
            if (member.item === memberEmail.item) {
                return {...member, memberRole: role};
            }
            return member;
        });


        setMembersInput({
            ...membersInputs,
            memberArray: updatedMemberArray,
        });
    }

    return (
        <Modal isOpen={!!showCreateProjectModal} onClose={() => dispatch(updateCommonState({
            showCreateProjectModal: false,
            shouldRedirectOnCreateProject: false
        }))} isCentered>
            <ModalOverlay backgroundColor={'rgba(229, 231, 235, 0.50)'} backdropFilter={'blur(16px)'}/>
            <ModalContent maxWidth={'480px'} borderRadius={'12px'} className={styles.projectMemberModal}>
                <ModalHeader padding={'12px 14px'} fontSize={'13px'} color={'#374151'}
                             borderBottom={'1px solid #F3F4F6'}>
                    Create project
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
                                    <Grid templateColumns='repeat(10, 1fr)' maxH={'175px'} overflow={'auto'} gap={2}
                                          padding={3}>
                                        {emojiArray.map((item: string, index: number) => (
                                            <GridItem w='100%' key={index} onClick={() => emojiChange(item)}>
                                                <MenuItem className={'emoji-modal-icon'}> {item} </MenuItem>
                                            </GridItem>
                                        ))}
                                    </Grid>
                                </MenuList>
                            </Menu>

                            <Input className={styles.projectSearchBar} onChange={handleChange}
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
                                    <Input p={0} h={'auto'} borderRadius={0} fontSize={'13px'} lineHeight={1}
                                           letterSpacing={'-0.13px'} border={0} placeholder='Name or email address'
                                           size='md'
                                           value={membersInputs.input}
                                           onChange={(e) => {
                                               membersInputs.input = e.target.value;
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
                        {membersInputs.memberArray && !!membersInputs.memberArray.length && membersInputs.memberArray.map((member, index) => (
                            <Flex justify={'space-between'} align={'center'} pr={3} key={index}>
                                <Flex align={'center'} gap={2} color={'#0A101D'} fontSize={'13px'}
                                      letterSpacing={'-0.13px'}>
                                    <div className={styles.imgWrapper}>
                                        <Image src="/image/user.png" width="36" height="36" alt=""/>
                                    </div>
                                    {member.item}
                                </Flex>
                                <Flex align={'center'} gap={1}>
                                    <Menu>
                                        <MenuButton className={styles.memberDropDown} fontSize={'12px'}
                                                    color={'#374151'} textTransform={'capitalize'}
                                                    backgroundColor={'#FFFFFF'} h={'auto'} p={'5px 10px'}
                                                    border={'1px solid #D1D5DB'} borderRadius={'50px'}
                                                    as={Button} rightIcon={<TriangleDownIcon/>}>
                                            {member.memberRole}
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
                                                cursor={'pointer'} backgroundColor={'#FFFFFF'} padding={0}
                                                minWidth={'1px'} aria-label='Add to friends'
                                                onClick={() => handleItemDelete(member.item!)}
                                                icon={<CloseIcon/>}/>
                                </Flex>
                            </Flex>
                        ))}
                        <Flex align={'center'} justify={'flex-end'} pt={4} borderTop={'1px solid #F3F4F6'} gap={3}>
                            <Button className={styles.cancelModalButton} border={'1px solid #374151'}
                                    backgroundColor={'#FFFFFF'} borderRadius={8}
                                    onClick={() => dispatch(updateCommonState({
                                        showCreateProjectModal: false,
                                        shouldRedirectOnCreateProject: false
                                    }))} fontSize={'14px'} height={'auto'} lineHeight={1} padding={'10px 12px'}
                                    color={'#374151'}> Cancel </Button>

                            <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} borderRadius={8}
                                    onClick={() => addNewProject()} fontSize={'14px'} height={'auto'} lineHeight={1}
                                    padding={'11px 12px'}
                                    color={'#ffffff'}> Create Project </Button>
                        </Flex>
                    </Flex>

                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default withAuth(CreateNewProjectModal);
