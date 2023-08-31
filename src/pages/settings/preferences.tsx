import styles from "@/styles/setting.module.css";
import {
    Flex,
    GridItem,
    Heading,
    Text,
    Grid,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Button,
    useDisclosure,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    Textarea, ModalFooter, Modal
} from "@chakra-ui/react";
import React, {ChangeEvent, useEffect, useState} from "react";
import Index from "@/pages/settings/index";
import withAuth from "@/components/withAuth";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Organization} from "@/models";
import {Chip} from "@/components/common";
import {editOrganization} from "@/redux/organizations/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";

function Preferences() {
    const {
        selectedOrganization,
        isOrganizationAddOrRemoveSuccess
    } = useSelector((state: StateType) => state.organizations);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [domains, setDomains] = useState<{ items: [], value: string }>({
        items: [],
        value: ""
    });
    const [domainValue, setDomainValue] = useState("");

    const {isOpen, onOpen, onClose} = useDisclosure();
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedOrganization) {
            setOrganization(selectedOrganization)
            if (selectedOrganization?.preferences && selectedOrganization?.preferences?.approvedDomains) {
                setDomains({
                    items: selectedOrganization?.preferences?.approvedDomains,
                    value: ''
                })
            }
        }
    }, [selectedOrganization])

    useEffect(() => {
        if (isOrganizationAddOrRemoveSuccess) {
            let orgs = LocalStorageService.updateOrg('get') || null;
            setOrganization(orgs)
        }
    }, [isOrganizationAddOrRemoveSuccess, selectedOrganization])

    const handleItemDelete = (item: string) => {
        setDomains((prevState) => ({
                items: prevState.items.filter(i => i !== item),
                value: ''
        }));
    };

    const handleChange = (event: ChangeEvent | any) => {
        setDomains((prevState) => ({
            items: [...(prevState.items || [])],
            value: event.target.value
        }))
        setDomainValue(event.target.value)
    };

    const handleKeyDown = (evt: KeyboardEvent | any) => {
        if (["Enter", "Tab"].includes(evt.key)) {
            evt.preventDefault();
            let value = domains.value.trim();
            let domainArray = value.split(',');
            domainArray.map(item => {
                setDomains((prevState) => ({
                    items: [...prevState.items, item],
                    value: ''
                }));
            })
            setDomainValue('')

        }
    };

    const submit = () => {
        if (organization && organization.id) {
             let body = {
                 preferences: {
                     approvedDomains: domains.items,
                 },
                 id: organization.id
             }
            dispatch(editOrganization(body));
            onClose()
        }
    }
    return (
        <div className={styles.setting}>
            <Grid templateColumns='232px auto' gap={6} h={'100%'} minHeight={'calc(100vh - 65px)'}>
                <GridItem w='100%' className={styles.settingSideBar} padding={'40px 30px 40px 40px'}
                          borderRight={'1px solid #E1E3E6'}>
                    <Index/>
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

                                    <Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={onOpen}
                                            backgroundColor={'black'} color={'white'} height={'auto'}
                                            padding={'10px 20px'}>Edit Domains</Button>
                                </Flex>

                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'}
                                                borderTop={'1px solid #EAECF0'}>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500}
                                                    lineHeight={'1.5'}>Approved Domains</Th>
                                                {/*<Th color={'#475467'} textTransform={'none'} fontWeight={500}*/}
                                                {/*    lineHeight={'1.5'} width={'64px'} padding={4}/>*/}
                                            </Tr>
                                        </Thead>
                                        {(organization && organization.preferences && organization.preferences.approvedDomains?.length > 0) ?
                                            <Tbody>
                                                {organization && organization.preferences && organization.preferences.approvedDomains?.length > 0 && organization.preferences.approvedDomains.map((item: string, index: number) => (
                                                    <Tr key={index + 1}>
                                                        <Td><p> {item} </p></Td>
                                                        {/*<Td padding={4}>*/}
                                                        {/*    <Menu>*/}
                                                        {/*        <MenuButton className={styles.OptionButton}*/}
                                                        {/*                    as={IconButton}*/}
                                                        {/*                    aria-label='Options' icon={<MenuIcon/>}*/}
                                                        {/*                    variant='outline' padding={0}*/}
                                                        {/*                    height={'32px'}*/}
                                                        {/*                    minWidth={'32px'} border={'0'}/>*/}
                                                        {/*        <MenuList>*/}
                                                        {/*            <MenuItem>Edit</MenuItem>*/}
                                                        {/*            <MenuItem>Delete</MenuItem>*/}
                                                        {/*        </MenuList>*/}
                                                        {/*    </Menu>*/}
                                                        {/*</Td>*/}
                                                    </Tr>
                                                ))}
                                            </Tbody> : <Tbody>

                                                <Tr>
                                                    <Td>No Data Found</Td>
                                                </Tr>
                                            </Tbody>
                                        }
                                    </Table>
                                </TableContainer>

                            </div>

                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

            <Modal isOpen={isOpen} onClose={() => onClose} isCentered>
                <ModalOverlay/>
                <ModalContent maxWidth={'490px'}>
                    <ModalHeader padding={'40px 40px 24px 40px'}>
                        <Heading as='h3' size='md' pb={1} color={'#101828'}>Change Preferences Domains</Heading>
                        <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Add, Edit and Remove Preferences</Text>
                    </ModalHeader>
                    <ModalBody padding={'8px 40px 16px'}>
                        <div className={styles.newPaymentInput}>
                            <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Domains</Text>


                            <Flex alignItems={'center'} gap={1} wrap={'wrap'} width={'100%'}>
                                {(domains.items || []).map((item: string | undefined, i: number) => (
                                    <Chip text={item} key={i} click={() => handleItemDelete(item!)}/>
                                ))}

                                <Textarea placeholder='Here is a sample placeholder'
                                          value={domainValue}
                                          onKeyDown={handleKeyDown}
                                          onChange={handleChange}/>
                            </Flex>
                        </div>
                    </ModalBody>

                    <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>
                        <Button className={styles.settingCancel} colorScheme='blue' mr={3}
                                onClick={onClose}> Cancel </Button>
                        <Button className={styles.settingSave} variant='ghost' onClick={() => submit()}>Submit</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>

    )
}

export default withAuth(Preferences)
