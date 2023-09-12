import {
    Button,
    Flex,
    Heading, IconButton, Input, Menu, MenuButton, MenuItem, MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import React, {ChangeEvent, useEffect, useState} from "react";
import {Toaster} from "@/components/common";
import {createProjects} from "@/redux/projects/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import withAuth from "@/components/auth/withAuth";
import {CloseIcon, SmallAddIcon, TriangleDownIcon} from "@chakra-ui/icons";
import {PROJECT_ROLES} from "@/utils/constants";
import {addItemToGroup, updateMembershipState} from "@/redux/memberships/action-reducer";
import Image from "next/image";


function CreateNewProjectModal(props: any) {
    const dispatch = useDispatch();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    const [projectName, setProjectName] = useState<string>('');
    const [membersInputs, setMembersInput] = useState<{ input: string; role: string; memberArray: Array<{ item?: string; memberRole?: string }> }>({
        input: '',
        role: 'member',
        memberArray: []
    });
    const {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);
    const {createProjectSuccess, project} = useSelector((state: StateType) => state.projects);


    const handleChange = (event: ChangeEvent | any) => {
        setProjectName(event.target.value);
    }

    useEffect(() => {
        if (createProjectSuccess) {
            if (selectedAccount && selectedAccount.email && membersInputs.memberArray && membersInputs.memberArray?.length > 0 && project && project.id) {
                let reqBody = {
                    fromEmail: selectedAccount.email,
                    toEmails: (membersInputs.memberArray || []).map((data: any) => data.item),
                    roles: (membersInputs.memberArray || []).map((data: any) => data.memberRole),
                    groupType: 'project',
                    groupId: project?.id
                }
                dispatch(addItemToGroup(reqBody))
            }
        }
    }, [createProjectSuccess, selectedAccount])

    useEffect(() => {
        if (membershipSuccess) {
            dispatch(updateMembershipState({success: false}));
            setMembersInput({
                input: '',
                role: 'member',
                memberArray: [{
                    item: '',
                    memberRole: ''
                }]

            });
            props.onClose();

        }
    }, [dispatch, membershipSuccess])

    const addNewProject = () => {
        if (projectName.length === 0) {
            Toaster({desc: 'Please enter the project\'s name',title: 'Add Project Name', type: 'error'})
            return;
        }
        if (!selectedAccount) {
            Toaster({desc: 'Your account is not created',title: 'Add Account', type: 'error'})
            return;
        }

        if (!selectedOrganization) {
            Toaster({desc: 'Your organization is not created',title: 'Add Organization', type: 'error'})
            return;
        }

        if (selectedAccount && selectedOrganization) {
            let body = {
                name: projectName,
                accountId: selectedAccount.id,
                organizationId: selectedOrganization.id
            }
            dispatch(createProjects(body));
        }
        setProjectName('')
    }

    const addNewMembers = () => {
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
                return { ...member, memberRole: role };
            }
            return member;
        });


        setMembersInput({
            ...membersInputs,
            memberArray: updatedMemberArray,
        });
    }
    return (
        <>
            <Modal isOpen={props.isOpen} onClose={props.onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth={'480px'} className={styles.projectMemberModal}>
                    <ModalHeader fontSize={'13px'} color={'#374151'} borderBottom={'1px solid #F3F4F6'}>
                        Create project
                    </ModalHeader>
                    <ModalCloseButton top={'13px'} right={'17px'} className={styles.closeIcon}/>
                    <ModalBody padding={'20px 12px 12px'}>
                        <Flex direction={'column'} gap={4}>
                            <Flex align={'center'} gap={4}>
                                <Flex backgroundColor={'#F9FAFB'} color={'#374151'} fontSize={'24px'} w={'48px'} h={'48px'} borderRadius={'50%'} align={'center'} justify={'center'}>
                                    <SmallAddIcon/>
                                </Flex>
                                <Input className={styles.projectSearchBar} onChange={handleChange} borderColor={'#E5E7EB'} borderRadius={8} backgroundColor={'#FFFFFF'} fontSize={'13px'} padding={'10px 16px'} lineHeight={1} height={'auto'} placeholder='Project name' />
                            </Flex>

                            <div className={styles.addProjectMember}>
                                <Heading as='h6' fontSize={'16px'} color={'#374151'} letterSpacing={'-0.13px'} lineHeight={1} fontWeight={500} mb={2}>Add Members</Heading>
                                <Flex align={'center'} gap={'14px'}>
                                    <Flex align={'center'} position={"relative"} borderRadius={'8px'} padding={'10px 10px 10px 16px'} width={'100%'} backgroundColor={'#ffffff'} border={'1px solid #E5E7EB'}>
                                        <Input p={0} h={'auto'} borderRadius={0} fontSize={'13px'} lineHeight={1} letterSpacing={'-0.13px'} border={0} placeholder='Name or email address' size='md'
                                               value={membersInputs.input}
                                               onChange={(e) => {
                                                   membersInputs.input = e.target.value;
                                                   setMembersInput({...membersInputs})
                                               }}/>
                                        <Menu isLazy>
                                            <MenuButton className={styles.memberRoleDropDown} minWidth={'65px'}
                                                        fontSize={'12px'} lineHeight={1}
                                                        color={'#374151'}  backgroundColor={'transparent'} h={'auto'}
                                                        padding={0} as={Button} rightIcon={<TriangleDownIcon/>}> Member </MenuButton>
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
                                    <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} fontSize={'14px'} onClick={() => addNewMembers()}
                                            isDisabled={!membersInputs.input}
                                            borderRadius={'8px'} minW={'52px'} height={'auto'} lineHeight={'1'} color={'#FFFFFF'} padding={'11px 12px'}>Add</Button>
                                </Flex>
                            </div>
                            {membersInputs.memberArray  && !!membersInputs.memberArray.length && membersInputs.memberArray.map((member,index) => (
                                <Flex justify={'space-between'} align={'center'} pr={3} key={index}>
                                    <Flex align={'center'} gap={2} color={'#0A101D'} fontSize={'13px'} letterSpacing={'-0.13px'}>
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
                                                    return <MenuItem onClick={() => updateProjectMemberRoleData(role, member)}
                                                        textTransform={'capitalize'} key={roleIndex}>
                                                        {role}
                                                    </MenuItem>
                                                })}
                                            </MenuList>
                                        </Menu>
                                        <IconButton className={styles.closeIcon}
                                                    cursor={'pointer'} backgroundColor={'#FFFFFF'} padding={0}
                                                    minWidth={'1px'} aria-label='Add to friends'  onClick={() => handleItemDelete(member.item!)}
                                                    icon={<CloseIcon/>}/>
                                    </Flex>
                                </Flex>
                            ))}
                            <Flex align={'center'} justify={'flex-end'} pt={4} borderTop={'1px solid #F3F4F6'} gap={3}>
                                <Button className={styles.cancelModalButton} border={'1px solid #374151'}  backgroundColor={'#FFFFFF'} borderRadius={8}
                                        onClick={props.onClose} fontSize={'14px'} height={'auto'} lineHeight={1} padding={'10px 12px'}
                                        color={'#374151'}> Cancel </Button>

                                <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} borderRadius={8} isDisabled={projectName.length === 0}
                                        onClick={() => addNewProject()} fontSize={'14px'} height={'auto'} lineHeight={1} padding={'11px 12px'}
                                        color={'#ffffff'}> Create Project </Button>
                            </Flex>
                        </Flex>

                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    )
}

export default withAuth(CreateNewProjectModal);
