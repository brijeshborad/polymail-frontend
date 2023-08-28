import {
    Button,
    Flex,
    Heading, Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay, useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import React, {ChangeEvent, useState} from "react";
import {Toaster} from "@/components/common";
import {createProjects} from "@/redux/projects/action-reducer";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import withAuth from "@/components/withAuth";


function CreateNewProject(props: any) {
    const dispatch = useDispatch();
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    const [projectName, setProjectName] = useState<string>('');
    const {onClose} = useDisclosure();

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
                    <ModalHeader fontSize={'13px'} color={'#08162F'} borderBottom={'1px solid rgba(0, 0, 0, 0.1)'}>Create
                        project
                    </ModalHeader>
                    <ModalCloseButton top={'13px'} right={'17px'} className={styles.closeIcon}/>
                    <ModalBody padding={'12px 16px 16px'}>
                        <div className={styles.addProjectMember}>
                            <Heading as='h6' size='xs' mb={2}>Add Project Name</Heading>
                            <Flex direction={'column'} gap={6}>
                                <Flex align={'center'} position={"relative"} className={styles.emailAddress}
                                      padding={'6px 8px 6px 16px'} width={'100%'}>
                                    <Input p={0} h={'auto'} border={0} placeholder='Enter Project Name' size='md'
                                           onChange={handleChange}/>
                                </Flex>
                                <Flex align={'space-between'}>
                                    <Button className={styles.addMemberButton} backgroundColor={'#000000'} borderRadius={8}
                                            width={'fit-content'} onClick={() => addNewProject()}
                                            color={'#ffffff'} minWidth={'120px'} size='sm'> Add </Button>

                                    <Button className={styles.addMemberButton} backgroundColor={'#000000'} borderRadius={8} ml={2}
                                            width={'fit-content'} onClick={() => onClose()}
                                            color={'#ffffff'} minWidth={'120px'} size='sm'> Cancel </Button>
                                </Flex>
                            </Flex>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>

        </>
    )
}

export default withAuth(CreateNewProject);
