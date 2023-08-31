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
    Button, Input
} from "@chakra-ui/react";
import React, {ChangeEvent, useCallback, useEffect, useState} from "react";
import Index from "@/pages/settings/index";
import withAuth from "@/components/withAuth";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Organization} from "@/models";
import {editOrganization} from "@/redux/organizations/action-reducer";
import LocalStorageService from "@/utils/localstorage.service";
import {CloseIcon, CheckIcon } from "@chakra-ui/icons";
import {TrashIcon, EditIcon} from "@/icons";
import {debounce} from "@/utils/common.functions";

function Preferences() {
    const {
        selectedOrganization,
        isOrganizationAddOrRemoveSuccess
    } = useSelector((state: StateType) => state.organizations);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [domains, setDomains] = useState<{ items: string[], value: string }>({
        items: [],
        value: ""
    });
    const [visibleInputs, setVisibleInputs] = useState<boolean[]>([]);
    const [isDomainValid, setIsDomainValid] = useState<boolean>(true);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedOrganization) {
            setOrganization(selectedOrganization)
            if (selectedOrganization?.preferences && selectedOrganization?.preferences?.approvedDomains) {
                setDomains({
                    items: selectedOrganization?.preferences?.approvedDomains,
                    value: ''
                });
                setVisibleInputs(Array(selectedOrganization?.preferences?.approvedDomains.length).fill(false));
            }
        }
    }, [selectedOrganization])

    useEffect(() => {
        if (isOrganizationAddOrRemoveSuccess) {
            let orgs = LocalStorageService.updateOrg('get') || null;
            setOrganization(orgs)
            setVisibleInputs(Array(orgs?.preferences?.approvedDomains.length).fill(false));

        }
    }, [isOrganizationAddOrRemoveSuccess, selectedOrganization])

    const isEmail = (email: string) => {
        return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(email);
    }
    const validateDomain = useCallback(() => {
        debounce(() => {
            if (domains && domains.value) {
                setIsDomainValid(isEmail(domains.value))
            }
        }, 300);
    }, [domains])

    useEffect(() => {
        if (domains.items && domains.items.length) {
            validateDomain();
        } else {
            setIsDomainValid(true);
        }
    }, [domains, validateDomain])

    const handleInputChange = (index: number, event: ChangeEvent | any) => {
        let orgValue = [...(organization?.preferences?.approvedDomains || [])];
        orgValue[index] = event.target.value
        setDomains({
            items: orgValue,
            value: event.target.value
        })

    }

    const submit = (type: string, item: any) => {
        if (organization && organization.id) {
            let domainArray = [...domains.items]
                if (type === 'remove') {
                    domainArray = (domainArray || []).filter((i: string) => i !== item)
                }
                let body = {
                    preferences: {
                        approvedDomains: domainArray,
                    },
                    id: organization.id
                }

                setDomains({
                    items: domainArray,
                    value: ''
                })
                dispatch(editOrganization(body));
        }
    }

    const addNewLine = () =>  {
        let sss = JSON.parse(JSON.stringify(organization));
        sss?.preferences?.approvedDomains.push('');
        setOrganization(sss);
        setVisibleInputs([...visibleInputs, true]);
    }

    const editValue = (index: number) => {
        const newVisibleInputs = [...visibleInputs];
        // Toggle the visibility of the input at the specified index
        newVisibleInputs[index] = !newVisibleInputs[index];
        // Set the updated visibleInputs array as the new state
        setVisibleInputs(newVisibleInputs);
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

                                    <Button className={styles.inviteMemberButton} fontSize={'14px'} onClick={addNewLine}
                                            backgroundColor={'black'} color={'white'} height={'auto'}
                                            padding={'10px 20px'}>Add Domains</Button>
                                </Flex>

                                <TableContainer>
                                    <Table variant='simple'>
                                        <Thead>
                                            <Tr backgroundColor={'#F9FAFB'} borderColor={'#EAECF0'}
                                                borderTop={'1px solid #EAECF0'}>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500}
                                                    lineHeight={'1.5'}>Approved Domains</Th>
                                                <Th color={'#475467'} textTransform={'none'} fontWeight={500}
                                                    lineHeight={'1.5'} width={'120px'}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        {(organization && organization.preferences && organization.preferences.approvedDomains?.length > 0) &&
                                            <Tbody>
                                                {organization && organization.preferences && organization.preferences.approvedDomains?.length > 0 && organization.preferences.approvedDomains.map((item: string, index: number) => (
                                                    <Tr key={index + 1}>
                                                        <Td>{visibleInputs[index] ?
                                                            <div>
                                                                <Input
                                                                    defaultValue={item}
                                                                    onChange={(e) => handleInputChange(index, e)}
                                                                />
                                                                {!isDomainValid &&
                                                                <Text fontSize={'11px'} fontWeight={600} color={'crimson'}>Please enter valid domain</Text>}
                                                            </div>
                                                            :
                                                            <p> {item} </p>}
                                                        </Td>
                                                        <Td>
                                                            {!visibleInputs[index] ?
                                                            <Flex gap={3}>
                                                                <Button height={'auto'} padding={'5px'}
                                                                        minWidth={'auto'}
                                                                        onClick={() => editValue(index)}><EditIcon/></Button>
                                                                <Button height={'auto'} padding={'5px'}
                                                                        minWidth={'auto'}
                                                                        onClick={() => submit('remove' ,item!)}><TrashIcon/></Button>
                                                            </Flex> :
                                                                <Flex gap={3}>
                                                                    <Button height={'auto'} padding={'6.5px'} color={'#374151'}
                                                                            minWidth={'auto'} fontSize={'13px'} onClick={() => submit('add-edit', item!)}><CheckIcon/></Button>
                                                                    <Button height={'auto'} padding={'6.5px'} color={'#374151'}
                                                                                  minWidth={'auto'} fontSize={'13px'} onClick={() => submit('remove' ,item!)}><CloseIcon/></Button>
                                                                </Flex>
                                                            }
                                                            </Td>
                                                    </Tr>
                                                ))}
                                            </Tbody>
                                        }
                                    </Table>
                                </TableContainer>

                            </div>

                        </Flex>
                    </Flex>
                </GridItem>
            </Grid>

            {/*<Modal isOpen={isOpen} onClose={() => onClose} isCentered>*/}
            {/*    <ModalOverlay/>*/}
            {/*    <ModalContent maxWidth={'490px'}>*/}
            {/*        <ModalHeader padding={'40px 40px 24px 40px'}>*/}
            {/*            <Heading as='h3' size='md' pb={1} color={'#101828'}>Change Preferences Domains</Heading>*/}
            {/*            <Text fontSize='md' color={'#475467'} fontWeight={'400'}>Add, Edit and Remove Preferences</Text>*/}
            {/*        </ModalHeader>*/}
            {/*        <ModalBody padding={'8px 40px 16px'}>*/}
            {/*            <div className={styles.newPaymentInput}>*/}
            {/*                <Text mb='8px' fontSize={'13px'} fontWeight={500} color={'#000000'}>Domains</Text>*/}


            {/*                <Flex alignItems={'center'} gap={1} wrap={'wrap'} width={'100%'}>*/}
            {/*                    {(domains.items || []).map((item: string | undefined, i: number) => (*/}
            {/*                        <Chip text={item} key={i} click={() => handleItemDelete(item!)}/>*/}
            {/*                    ))}*/}

            {/*                    <Textarea placeholder='Here is a sample placeholder'*/}
            {/*                              value={domainValue}*/}
            {/*                              onKeyDown={handleKeyDown}*/}
            {/*                              onChange={handleChange}/>*/}
            {/*                </Flex>*/}
            {/*            </div>*/}
            {/*        </ModalBody>*/}

            {/*        <ModalFooter className={styles.settingButton} paddingBottom={'40px'}>*/}
            {/*            <Button className={styles.settingCancel} colorScheme='blue' mr={3}*/}
            {/*                    onClick={onClose}> Cancel </Button>*/}
            {/*            <Button className={styles.settingSave} variant='ghost' onClick={() => submit()}>Submit</Button>*/}
            {/*        </ModalFooter>*/}
            {/*    </ModalContent>*/}
            {/*</Modal>*/}
        </div>

    )
}

export default withAuth(Preferences)
