import {
    Badge,
    Button,
    Flex,
    Grid, GridItem,
    Heading,
    Input,
    Menu,
    MenuButton,
    MenuItem,
    MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import React, {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/router";
import {StateType} from "@/types";
import {ChevronDownIcon} from "@chakra-ui/icons";
import styles from "@/styles/project.module.css";
import {ThreadsSideBar} from "@/components/threads";
import {
    getProjectById,
    getProjectMembers,
    getProjectMembersInvites,
    updateProjectMemberRole
} from "@/redux/projects/action-reducer";
import {
    addItemToGroup,
    updateMembershipState
} from "@/redux/memberships/action-reducer";
import {Project} from "@/models";
import {PROJECT_ROLES} from "@/utils/constants";
import {isEmail} from "@/utils/common.functions";
import {getAllThreads} from "@/redux/threads/action-reducer";
import {Message} from "@/components/messages";

function ProjectInbox() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {members, project, invitees} = useSelector((state: StateType) => state.projects);
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);

    const [size, setSize] = useState<number>(0);
    const [allowAdd, setAllowAdd] = useState<boolean>(false);
    const [membersInputs, setMembersInput] = useState<{ input: string, role: string }>({
        input: '',
        role: 'member'
    });

    const router = useRouter();

    const dispatch = useDispatch();

    useEffect(() => {
        if (router.query.project) {
            let projectId = router.query.project as string;
            dispatch(getProjectById({id: projectId}));
            dispatch(getProjectMembers({projectId: projectId}));
            dispatch(getProjectMembersInvites({projectId: projectId}));
            dispatch(getAllThreads({project: projectId, enriched: true, resetState: true}));
        }
    }, [router.query.project, dispatch])

    useEffect(() => {
        if (membershipSuccess) {
            dispatch(updateMembershipState({success: false}));
            let projectId = router.query.project as string;
            dispatch(getProjectMembersInvites({projectId: projectId}));
            setMembersInput({input: '', role: 'member'});
        }
    }, [dispatch, membershipSuccess, router.query.project])

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
            dispatch(addItemToGroup(reqBody))
        }
    }, [dispatch, membersInputs, selectedAccount]);

    const updateProjectMemberRoleData = (role: string) => {
        if (project && project.id && selectedAccount && selectedAccount.id) {
            let body = {
                role: role
            }
            dispatch(updateProjectMemberRole({projectId: project.id, accountId: selectedAccount.id, body}))
        }

    };

    return (
        <>
            <Flex direction={'column'} padding={'28px 40px 16px'} className={styles.projectPage}
                  backgroundColor={'#FCFCFD'} height={'100%'} flex={1}>

                <Flex align={'center'} justify={'space-between'} gap={4} paddingBottom={6}
                      borderBottom={'1px solid rgba(8, 22, 47, 0.12)'}>
                    <Flex align={'center'} gap={2}>
                        <div className={styles.imgWrapper}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <Heading as='h4' fontSize={'24px'} color={'#08162F'}>{project && project.name}</Heading>
                        <Badge color={'#000000'} fontSize={'14px'} fontWeight={'600'} backgroundColor={'#E9E9E9'}
                               padding={'3px 6px'} borderRadius={'4px'}
                               lineHeight={'1.19'}>{threads && threads?.length || 0} threads</Badge>
                    </Flex>
                    <Flex align={'center'} gap={1}>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <div className={styles.userImage}>
                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                        </div>
                        <Button className={styles.manageMembers} onClick={onOpen} ml={2} backgroundColor={'#000000'}
                                color={'#ffffff'} lineHeight={'1'} fontSize={'14px'} borderRadius={'8px'}
                                height={'auto'} padding={'12px 16px'}> Manage Members</Button>
                    </Flex>
                </Flex>

                <Grid className={styles.mailGrid} templateColumns='30% auto' paddingTop={8} gap={6} flex={1}>
                    <GridItem w='100%' flex={1}>
                        {((size < 991 && !selectedThread) || size > 991) &&
                        <ThreadsSideBar />
                        }
                    </GridItem>
                    <GridItem w='100%' flex={1}>
                        {((size < 991 && selectedThread) || size > 991) && <Message/>}
                    </GridItem>
                </Grid>
            </Flex>

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth={'480px'} className={styles.projectMemberModal}>
                    <ModalHeader fontSize={'13px'} color={'#08162F'} borderBottom={'1px solid rgba(0, 0, 0, 0.1)'}>Project
                        Members</ModalHeader>
                    <ModalCloseButton top={'13px'} right={'17px'} className={styles.closeIcon}/>
                    <ModalBody padding={'12px 16px 16px'}>

                        <div className={styles.addProjectMember}>
                            <Heading as='h6' size='xs' mb={2}>Add Members</Heading>
                            <Flex align={'center'} gap={1}>
                                <Flex align={'center'} position={"relative"} className={styles.emailAddress}
                                      padding={'6px 8px 6px 16px'} width={'100%'}>
                                    <Input p={0} h={'auto'} onChange={(e) => {
                                        membersInputs.input = e.target.value;
                                        setMembersInput({...membersInputs})
                                    }} border={0} value={membersInputs.input}
                                           placeholder='Name or Email Address' size='xs'/>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'transparent'}
                                                    textTransform={'capitalize'}
                                                    minWidth={'70px'} padding={0} height={'auto'} fontSize={'13px'}
                                                    color={'rgba(0,0,0, 0.5)'} as={Button}
                                                    rightIcon={<ChevronDownIcon/>}> {membersInputs.role} </MenuButton>
                                        <MenuList>
                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                if (membersInputs.role !== role) {
                                                    return <MenuItem onClick={() => {
                                                        membersInputs.role = role;
                                                        setMembersInput({...membersInputs})
                                                    }} textTransform={'capitalize'} key={roleIndex}>
                                                        {role}
                                                    </MenuItem>
                                                }
                                                return null
                                            })}
                                        </MenuList>
                                    </Menu>
                                </Flex>
                                <Button isDisabled={!allowAdd}
                                        className={styles.addMemberButton} backgroundColor={'#000000'}
                                        borderRadius={8}
                                        color={'#ffffff'} minWidth={'120px'} size='sm'
                                        onClick={() => inviteAccountToProject(project)}>
                                    Add
                                </Button>
                            </Flex>
                        </div>
                        <Flex direction={'column'} gap={4} pt={4}>
                            {members && !!members.length && members.map((member, index) => (
                                <Flex key={index + 1} align={'center'} justify={'space-between'} gap={4}>
                                    <Flex align={'center'} gap={2}>
                                        <div className={styles.addMemberImage}>
                                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                                        </div>
                                        <Text fontSize='sm' color={'#000000'}>{member.name}</Text>
                                    </Flex>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                    borderRadius={4} padding={'2px 4px '} height={'auto'}
                                                    textTransform={'capitalize'}
                                                    fontSize={'12px'}
                                                    color={'#000000'} as={Button}
                                                    rightIcon={
                                                        <ChevronDownIcon/>}> {member.role} </MenuButton>
                                        <MenuList>
                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                if (member.role !== role) {
                                                    return <MenuItem textTransform={'capitalize'}  onClick={() => updateProjectMemberRoleData(role)} key={roleIndex}>
                                                        {role}
                                                    </MenuItem>
                                                }
                                                return null
                                            })}
                                            <MenuItem
                                                onClick={() => updateProjectMemberRoleData('deactivated')}>{member.userId === userDetails?.id ? 'Leave' : 'Remove'}</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                            ))}
                            {invitees && !!invitees.length && invitees.map((invite, index) => (
                                <Flex key={index + 1} align={'center'} justify={'space-between'} gap={4}>
                                    <Flex align={'center'} gap={2}>
                                        <div className={styles.addMemberImage}>
                                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                                        </div>
                                        <Text fontSize='sm' color={'#000000'}>{invite?.invite?.toEmail}</Text>
                                    </Flex>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                    borderRadius={4} padding={'2px 4px '} height={'auto'}
                                                    textTransform={'capitalize'}
                                                    fontSize={'12px'}
                                                    color={'#000000'} as={Button}
                                                    rightIcon={
                                                        <ChevronDownIcon/>}> {invite.role} </MenuButton>
                                        <MenuList>
                                            {PROJECT_ROLES.map((role, roleIndex) => {
                                                if (invite.role !== role) {
                                                    return <MenuItem textTransform={'capitalize'} key={roleIndex}>
                                                        {role}
                                                    </MenuItem>
                                                }
                                                return null
                                            })}
                                            <MenuItem>Delete</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                            ))}
                        </Flex>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default ProjectInbox;
