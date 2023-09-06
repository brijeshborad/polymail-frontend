import styles from "@/styles/setting.module.css";
import {
    Button,
    Checkbox,
    Flex, GridItem,
    Heading, IconButton, Menu, MenuButton, MenuItem, MenuList,
    Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay,
    Table,
    TableContainer,
    Tbody,
    Td,
    Text, Textarea,
    Th,
    Thead,
    Tr, useDisclosure, Image, Grid, Input
} from "@chakra-ui/react";
import React, {ChangeEvent, useEffect, useState} from "react";
import Index from "@/pages/settings/index";
import {MenuIcon, TextIcon} from "@/icons";
import withAuth from "@/components/auth/withAuth";
import {getOrganizationMembers, updateOrganizationMemberRole} from "@/redux/organizations/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import dayjs from "dayjs";
import { TeamMember} from "@/models";
import {ChevronDownIcon} from "@chakra-ui/icons";
import {PROJECT_ROLES} from "@/utils/constants";

function Members() {
    const {isOpen: InviteModelIsOpen, onOpen:InviteModelOnOpen, onClose: InviteModelOnClose} = useDisclosure();
    const { isOpen: isEditOpen , onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
   const {members, organizations, updateMemberRoleSuccess} = useSelector((state: StateType) => state.organizations);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const {userDetails} = useSelector((state: StateType) => state.users);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const [organizationName, setOrganizationName] = useState<{ name: string, role: string }>({
        name: '',
        role: 'member'
    });

    const dispatch = useDispatch();

    useEffect(() => {
        if(organizations && organizations.length > 0 && organizations[0].id) {
            dispatch(getOrganizationMembers({orgId:organizations[0].id}));
        }
    },[dispatch, organizations])

    useEffect(() => {
        if (updateMemberRoleSuccess && members && members.length) {
            let index1 = (members || []).findIndex((item: TeamMember) => item.id === selectedMember?.id);
            setSelectedMember(members[index1])
        }
    }, [updateMemberRoleSuccess, members])

    const handleChange = (event: ChangeEvent | any) => {
        setOrganizationName(prevState => ({
            ...prevState,
            name: event.target.value,
        }))
    }
    const openEditModel = (item: any) => {
        setSelectedMember({...item});
        onEditOpen()
    }

    const updateOrganizationMemberRoleData = (role: string, item: any) => {
       setOrganizationName(prevState => ({
            ...prevState,
            role: role
        }));
        setSelectedMember({
            ...item,
            role: role
        });

    };

    const onSubmit = () => {
        if (organizations && organizations[0] && organizations[0].id && selectedAccount && selectedAccount.id) {
            let body = {
                role: organizationName.role,
                name: organizationName.name || selectedMember?.name
            }
            dispatch(updateOrganizationMemberRole({organizationId: organizations[0].id, accountId: selectedAccount.id, body}));
        }

        onEditClose();
    }

    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index />
                </GridItem>
                <GridItem w='100%'>
                    <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                        <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                            <Heading as='h4' size='lg' gap={1}> Members </Heading>
                            <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                here.</Text>
                        </Flex>

                        <Flex direction={"column"} className={styles.SettingDetails}>
                            <div className={styles.memberTable}>
                                <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                                    <Heading as='h4' fontSize={'18px'} fontWeight={600} color={'#101828'}>Team members</Heading>
                                    <Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={InviteModelOnOpen} backgroundColor={'black'} color={'white'} height={'auto'} padding={'10px 20px'}>Invite</Button>
                                </Flex>
                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'} borderTop={'1px solid #EAECF0'}>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'400px'}><Checkbox marginRight={3} className={styles.tableCheckBox} />Name</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Status</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Role</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Email address</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Join date</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'64px'} padding={4}/>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {members && members.length > 0 && members.map((member, index) => (
                                                <Tr key={index + 1}>
                                                    <Td>
                                                        <Flex gap={3} align={'center'}>
                                                            <Checkbox className={styles.tableCheckBox} />
                                                            <div className={styles.tableUserImage}>
                                                                <Image src="/image/user.png" width="40" height="40" alt=""/>
                                                            </div>
                                                            <Text fontSize='sm' fontWeight={500} color={'#101828'}>{member.name}</Text>
                                                        </Flex>
                                                    </Td>
                                                    <Td><div className={styles.statusButton}> {member.status} </div></Td>
                                                    <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>{member.role}</Text></Td>
                                                    <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>{member.email}</Text></Td>
                                                    <Td><Text fontSize='sm' fontWeight={400} color={'#475467'}>{member.created ? dayjs(member.created).format('MM/DD/YYYY') : ''}</Text></Td>
                                                    <Td padding={4}>
                                                        <Menu>
                                                            <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                            <MenuList>
                                                                <MenuItem onClick={() => openEditModel(member)}>Edit</MenuItem>
                                                                <MenuItem>Delete</MenuItem>
                                                            </MenuList>
                                                        </Menu>
                                                    </Td>
                                                </Tr>
                                            ))}

                                        </Tbody>
                                    </Table>
                                </TableContainer>
                            </div>

                            <Modal isOpen={InviteModelIsOpen} onClose={() => InviteModelOnClose} closeOnOverlayClick={false} isCentered>
                                <ModalOverlay />
                                <ModalContent maxWidth={'490px'}>
                                    <ModalHeader padding={'40px 40px 24px 40px'}>
                                        <Heading as='h3' size='lg' pb={1} color={'#101828'}>Invite members</Heading>
                                        <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Invite team members to Polymail</Text>
                                    </ModalHeader>
                                    <ModalBody padding={'8px 40px 16px'}>
                                        <div className={styles.newPaymentInput}>
                                            <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Email Address</Text>
                                            <Textarea placeholder='Here is a sample placeholder' />
                                            <Flex align={'center'} gap={1} marginTop={'14px'}>
                                                <TextIcon/>
                                                <Text fontSize={'13px'} fontWeight={500} color={'#000000'}>Copy Link</Text>
                                            </Flex>
                                        </div>
                                    </ModalBody>

                                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                                        <Button className={styles.settingCancel} colorScheme='blue' mr={3} onClick={InviteModelOnClose}> Cancel </Button>
                                        <Button className={styles.settingSave} variant='ghost'>Send Invite</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>

                            <Modal isOpen={isEditOpen} onClose={onEditClose}  isCentered>
                                <ModalOverlay />
                                <ModalContent maxWidth={'490px'} className={styles.inviteMemberModal}>
                                    <ModalHeader padding={'40px 40px 24px 40px'}>
                                        <Heading as='h3' size='lg' pb={1} color={'#101828'}>Edit members</Heading>
                                        <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Edit polyMail member</Text>
                                    </ModalHeader>
                                    <ModalBody padding={'8px 40px 16px'}>
                                        <Flex gap={2} align={'flex-end'}>
                                            <div className={styles.newPaymentInput}>
                                                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Name</Text>
                                                <Input placeholder='Here is a sample placeholder' defaultValue={selectedMember?.name} onChange={handleChange}/>
                                            </div>
                                            <Menu>
                                                <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                            borderRadius={4} minWidth={'90px'}
                                                            textTransform={'capitalize'}
                                                            fontSize={'12px'}
                                                            color={'#000000'} as={Button}
                                                            rightIcon={
                                                                <ChevronDownIcon/>}> {selectedMember?.role} </MenuButton>
                                                <MenuList>
                                                    {PROJECT_ROLES.map((role, roleIndex) => {
                                                        if (selectedMember?.role !== role) {
                                                            return <MenuItem textTransform={'capitalize'} onClick={() => updateOrganizationMemberRoleData(role, selectedMember)} key={roleIndex}>
                                                                {role}
                                                            </MenuItem>
                                                        }
                                                        return null
                                                    })}
                                                    <MenuItem onClick={() => updateOrganizationMemberRoleData('deactivated', selectedMember)}>{selectedMember?.userId === userDetails?.id ? 'Leave' : 'Remove'}</MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Flex>
                                    </ModalBody>

                                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                                        <Button className={styles.settingCancel} colorScheme='blue' mr={3} onClick={onEditClose}> Cancel </Button>
                                        <Button className={styles.settingSave} variant='ghost' onClick={() => onSubmit()}>Save</Button>
                                    </ModalFooter>
                                </ModalContent>
                            </Modal>
                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>
        </div>

    )
}

export default withAuth(Members)