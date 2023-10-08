import styles from "@/styles/setting.module.css";
import {
    Flex,
    Heading,
    Text,
    TableContainer,
    Table,
    Thead,
    Tr,
    Th,
    Tbody,
    Td,
    Button, Input
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import withAuth from "@/components/auth/withAuth";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {Organization} from "@/models";
import {editOrganization} from "@/redux/organizations/action-reducer";
import {CloseIcon, CheckIcon} from "@chakra-ui/icons";
import {TrashIcon, EditIcon} from "@/icons";
import {isDomain} from "@/utils/common.functions";
import SettingsLayout from "@/pages/settings/settings-layout";
import {organizationService} from "@/services";


function Preferences() {
    const {
        selectedOrganization,
        isOrganizationAddOrRemoveSuccess
    } = useSelector((state: StateType) => state.organizations);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isAddingDomain, setIsAddingDomain] = useState<boolean>(false);
    const [domains, setDomains] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isDomainValid, setIsDomainValid] = useState<boolean>(true);
    const [currentEditIndex, setCurrentEditIndex] = useState<number | null>(null);

    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedOrganization) {
            setOrganization(selectedOrganization)
            if (selectedOrganization?.preferences && selectedOrganization?.preferences?.approvedDomains) {
                setDomains(selectedOrganization?.preferences?.approvedDomains || []);
            }
        }
    }, [selectedOrganization])


    useEffect(() => {
        if (isOrganizationAddOrRemoveSuccess) {
            organizationService.setOrganizationState({isOrganizationAddOrRemoveSuccess: false})
            setInputValue('');
            setIsDomainValid(true)
            setIsAddingDomain(false);
            setCurrentEditIndex(null)
        }
    }, [dispatch, isOrganizationAddOrRemoveSuccess])


    const submit = (type: string, index: number = 0) => {
        if (organization && organization.id) {
            let domainArray = [...domains];
            if (type === 'add' || type === 'edit') {
                if (!isDomain(inputValue)) {
                    setIsDomainValid(false);
                    return;
                }
            }
            setIsDomainValid(true);
            if (type === 'add') {
                domainArray.push(inputValue);
            } else if (type === 'edit') {
                domainArray[currentEditIndex!] = inputValue;
            } else {
                domainArray.splice(index, 1);
            }
            let body = {
                preferences: {
                    approvedDomains: domainArray,
                },
                id: organization.id
            }
            dispatch(editOrganization({body: body}));
        }
    }


    function editValue(index: number) {
        setInputValue(domains[index]);
        setIsAddingDomain(true);
        setCurrentEditIndex(index);
    }


    return (
        <SettingsLayout>
            <Flex direction={'column'} h={'100%'} padding={'50px 40px 40px'}>
                <Flex direction={'column'} pb={8} mb={8} borderBottom={'1px solid #D9D9D9'}>
                    <Heading as='h4' size='lg' gap={1}> Approved Domains </Heading>
                    <Text fontSize='sm' className={styles.settingSubTitle}>Add or remove auto-approved domains
                        here.</Text>
                </Flex>

                <Flex direction={"column"} className={styles.SettingDetails}>
                    <div className={styles.memberTable}>
                        <Flex alignItems={'center'} justify={'space-between'} gap={4} padding={'20px 24px'}>
                            <Heading as='h4' fontSize={'18px'} fontWeight={600}
                                     color={'#101828'}>Approved Domains</Heading>

                            {!isAddingDomain &&
                            <Button className={styles.inviteMemberButton} fontSize={'14px'}
                                    onClick={() => setIsAddingDomain(true)}
                                    backgroundColor={'black'} color={'white'} height={'auto'}
                                    padding={'10px 20px'}>Add Domains</Button>}
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
                                <Tbody>
                                    {domains.length > 0 && domains.map((item: string, index: number) => (
                                        <Tr key={index + 1}>
                                            <Td>{currentEditIndex === index ?
                                                <div>
                                                    <Input value={inputValue}
                                                           onChange={(e) => setInputValue(e.target.value)}/>
                                                    {!isDomainValid &&
                                                    <Text fontSize={'11px'} fontWeight={600} color={'crimson'}>Please
                                                        enter valid domain</Text>}
                                                </div>
                                                :
                                                <p> {item} </p>
                                            }
                                            </Td>
                                            <Td>
                                                {currentEditIndex === index ?
                                                    <Flex gap={3}>
                                                        <Button height={'auto'} padding={'6.5px'}
                                                                color={'#374151'}
                                                                minWidth={'auto'} fontSize={'13px'}
                                                                onClick={() => submit('edit')}><CheckIcon/></Button>
                                                        <Button height={'auto'} padding={'6.5px'}
                                                                color={'#374151'}
                                                                minWidth={'auto'} fontSize={'13px'}
                                                                onClick={() => {
                                                                    setInputValue('');
                                                                    setIsDomainValid(true)
                                                                    setIsAddingDomain(false);
                                                                    setCurrentEditIndex(null)
                                                                }}><CloseIcon/></Button>
                                                    </Flex> :
                                                    <Flex gap={3}>
                                                        <Button height={'auto'} padding={'5px'}
                                                                minWidth={'auto'}
                                                                onClick={() => editValue(index)}><EditIcon/></Button>
                                                        <Button height={'auto'} padding={'5px'}
                                                                minWidth={'auto'}
                                                                onClick={() => submit('remove', index)}><TrashIcon/></Button>
                                                    </Flex>}
                                            </Td>
                                        </Tr>
                                    ))}
                                    {(isAddingDomain && currentEditIndex === null) && (
                                        <Tr>
                                            <Td>
                                                <div>
                                                    <Input value={inputValue}
                                                           onChange={(e) => setInputValue(e.target.value)}/>
                                                    {!isDomainValid &&
                                                    <Text fontSize={'11px'} fontWeight={600} color={'crimson'}>Please
                                                        enter valid domain</Text>}
                                                </div>
                                            </Td>
                                            <Td>
                                                <Flex gap={3}>
                                                    <Button height={'auto'} padding={'6.5px'}
                                                            color={'#374151'}
                                                            minWidth={'auto'} fontSize={'13px'}
                                                            onClick={() => submit('add')}><CheckIcon/></Button>
                                                    <Button height={'auto'} padding={'6.5px'}
                                                            color={'#374151'}
                                                            minWidth={'auto'} fontSize={'13px'}
                                                            onClick={() => {
                                                                setInputValue('');
                                                                setIsDomainValid(true)
                                                                setIsAddingDomain(false);
                                                            }}><CloseIcon/></Button>
                                                </Flex>
                                            </Td>
                                        </Tr>
                                    )}
                                </Tbody>
                            </Table>
                        </TableContainer>

                    </div>

                </Flex>
            </Flex>
        </SettingsLayout>
    )
}

export default withAuth(Preferences)
