import {
  Button,
  Flex,
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

function ManageMembersModal() {
  const {isOpen, onClose} = useDisclosure();
  const {members, project, invitees} = useSelector((state: StateType) => state.projects);
  const {selectedAccount} = useSelector((state: StateType) => state.accounts);
  const {userDetails} = useSelector((state: StateType) => state.users);
  const {success: membershipSuccess} = useSelector((state: StateType) => state.memberships);

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
                                    <MenuList className={'drop-down-list'}>
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
                                    onClick={() => inviteAccountToProject(project || null)}>
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
                                    <MenuList className={'drop-down-list'}>
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
                                    <MenuList className={'drop-down-list'}>
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

export default ManageMembersModal;
