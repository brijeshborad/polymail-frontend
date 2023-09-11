import {
    Button,
    Flex,
    Heading, Input, Menu, MenuButton, MenuItem, MenuList,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import React, {ChangeEvent, useState} from "react";
import {Toaster} from "@/components/common";
import {createProjects} from "@/redux/projects/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import withAuth from "@/components/auth/withAuth";
import {SmallAddIcon, TriangleDownIcon} from "@chakra-ui/icons";


function CreateNewProjectModal(props: any) {
    const dispatch = useDispatch();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    const [projectName, setProjectName] = useState<string>('');

    const handleChange = (event: ChangeEvent | any) => {
        setProjectName(event.target.value);
    }

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
        props.onClose();
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
                                <Input className={styles.projectSearchBar} borderColor={'#E5E7EB'} borderRadius={8} backgroundColor={'#FFFFFF'} fontSize={'13px'} padding={'10px 16px'} lineHeight={1} height={'auto'} placeholder='Project name' />
                            </Flex>

                            <div className={styles.addProjectMember}>
                                <Heading as='h6' fontSize={'16px'} color={'#374151'} letterSpacing={'-0.13px'} lineHeight={1} fontWeight={500} mb={2}>Add Project Name</Heading>
                                <Flex align={'center'} gap={'14px'}>
                                    <Flex align={'center'} position={"relative"} padding={'10px 10px 10px 16px'} width={'100%'}>
                                        <Input p={0} h={'auto'} fontSize={'13px'} lineHeight={1} letterSpacing={'-0.13px'} border={0} placeholder='Name or email address' size='md'
                                               onChange={handleChange}/>
                                        <Menu isLazy>
                                            <MenuButton className={styles.memberRoleDropDown} minWidth={'65px'}
                                                        fontSize={'12px'} lineHeight={1}
                                                        color={'#374151'}  backgroundColor={'transparent'} h={'auto'}
                                                        padding={0} as={Button} rightIcon={<TriangleDownIcon/>}> Member </MenuButton>
                                            <MenuList className={'drop-down-list'}>
                                                <MenuItem> Member </MenuItem>
                                                <MenuItem> Admin </MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Flex>
                                    <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} fontSize={'14px'}
                                            borderRadius={'8px'} minW={'52px'} height={'auto'} lineHeight={'1'} color={'#FFFFFF'} padding={'11px 12px'}>Add</Button>
                                </Flex>
                            </div>
                            <Flex align={'center'} justify={'flex-end'} pt={4} borderTop={'1px solid #F3F4F6'} gap={3}>
                                <Button className={styles.cancelModalButton} border={'1px solid #374151'}  backgroundColor={'#FFFFFF'} borderRadius={8}
                                        onClick={props.onClose} fontSize={'14px'} height={'auto'} lineHeight={1} padding={'10px 12px'}
                                        color={'#374151'}> Cancel </Button>

                                <Button className={styles.addMemberButton} backgroundColor={'#1F2937'} borderRadius={8}
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
