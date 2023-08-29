import styles from "@/styles/setting.module.css";
import {
    Flex,
    GridItem,
    Heading,
    Text,
    Grid,
    IconButton,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td, MenuItem, MenuButton, MenuList, Menu
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import Index from "@/pages/settings/index";
import withAuth from "@/components/withAuth";
// import {
//     updateOrganizationState
// } from "@/redux/organizations/action-reducer";
import { useSelector} from "react-redux";
import {StateType} from "@/types";
// import {Toaster} from "@/components/common";
import {Organization} from "@/models";
import {MenuIcon} from "@/icons";

function Preferences() {

    // const {isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose} = useDisclosure();
    // const {isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose} = useDisclosure();
    const {
        selectedOrganization
    } = useSelector((state: StateType) => state.organizations);
    // const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    // const [organizationName, setOrganizationName] = useState<any>([{
    //     domain: '',
    //     name: ''
    // }]);
    // const [organizationId, setOrganizationId] = useState<Organization | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);

    // const handleChange = (event: ChangeEvent | any) => {
    //     setOrganizationName(prevState => {
    //         return {
    //             ...prevState,
    //             domain: [...selectedOrganization.preferences.approvedDomains, event.target.value]
    //         }
    //     });
    // }

    useEffect(() => {
        if (selectedOrganization) {
            setOrganization(selectedOrganization)
        }
    }, [selectedOrganization])

    // useEffect(() => {
    //     if (selectedOrganization) {
    //         if (selectedOrganization.name) {
    //             setOrganizationName({name: selectedOrganization.name})
    //         }
    //
    //         if (selectedOrganization.preferences && selectedOrganization.preferences.approvedDomains && selectedOrganization.preferences.approvedDomains.length) {
    //             setOrganizationName(prevState => {
    //                 return {
    //                     ...prevState,
    //                     domain: [...selectedOrganization.preferences.approvedDomains]
    //                 }
    //             });
    //         }
    //     }
    // }, [selectedOrganization])

    // const createOrganization = () => {
    //     if (organizationName.length === 0) {
    //         Toaster({desc: 'Please enter the organization\'s name', title: 'Add Preferences', type: 'error'})
    //         return;
    //     }
    //     if (!selectedAccount) {
    //         Toaster({desc: 'Your account is not created', title: 'Add Account', type: 'error'})
    //         return;
    //     }
    //     if (selectedAccount) {
    //         let body = {
    //             name: organizationName,
    //             accountId: selectedAccount.id,
    //
    //         }
    //         if (selectedOrganization && selectedOrganization.id) {
    //             const updatedBody = {
    //                 ...body,
    //                 id: selectedOrganization.id,
    //                 preferences: {
    //                     approvedDomains: organizationName.domain.split(',')
    //                 }
    //
    //             };
    //             console.log('updatedBody' , updatedBody)
    //             dispatch(editOrganization(updatedBody));
    //             setOrganizationId(null)
    //
    //         } else {
    //             dispatch(addOrganization(body));
    //         }
    //         onEditClose()
    //     }
    // }
    //
    // const cancelModal = (type: string) => {
    //     setOrganizationId(null)
    //
    //     onEditClose()
    //
    // }

    // useEffect(() => {
    //     if (success && organizationId && organizationId.id) {
    //         let data = (organizations || []).filter((item: Organization) => item.id !== organizationId.id)
    //         dispatch(updateOrganizationState({organizations: data}));
    //         setOrganizationId(null)
    //
    //     }
    // }, [success, organizationId, dispatch])

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
                                <Heading as='h4' size='lg' gap={1}> Preferences </Heading>
                                <Text fontSize='sm' className={styles.settingSubTitle}>Manage your team and preferences
                                    here.</Text>
                            </Flex>

                            <Flex direction={"column"} className={styles.SettingDetails}>
                                <div className={styles.memberTable}>
                                    <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                                        <Heading as='h4' fontSize={'18px'} fontWeight={600}
                                                 color={'#101828'}>Preferences</Heading>
                                        {/*<Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={onEditOpen}*/}
                                        {/*        backgroundColor={'black'} color={'white'} height={'auto'}*/}
                                        {/*        padding={'10px 20px'}>Edit Organization</Button>*/}
                                    </Flex>

                                    <TableContainer>
                                         <Table variant='simple'>
                                             <Thead>
                                                 <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'} borderTop={'1px solid #EAECF0'}>
                                                     <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'}>Approved Domains</Th>
                                                     <Th color={'#475467'} textTransform={'none'} fontWeight={500} lineHeight={'1.5'} width={'64px'} padding={4}/>
                                                 </Tr>
                                             </Thead>
                                             <Tbody>
                                                {organization && organization.preferences && organization.preferences.approvedDomains?.length > 0 && organization.preferences.approvedDomains.map((item: string, index: number) => (
                                                    <Tr key={index + 1}>
                                                        <Td><p> {item} </p></Td>
                                                        <Td padding={4}>
                                                            <Menu>
                                                                <MenuButton className={styles.OptionButton} as={IconButton} aria-label='Options' icon={<MenuIcon />} variant='outline' padding={0} height={'32px'} minWidth={'32px'} border={'0'}/>
                                                                <MenuList>
                                                                    <MenuItem>Edit</MenuItem>
                                                                    <MenuItem >Delete</MenuItem>
                                                                </MenuList>
                                                            </Menu>
                                                        </Td>
                                                    </Tr>
                                                ))}
                                           </Tbody>
                                   </Table>
                                </TableContainer>

                                </div>

                            </Flex>
                        </Flex>
                    </GridItem>
                </Grid>
            </div>

    )
}

export default withAuth(Preferences)
