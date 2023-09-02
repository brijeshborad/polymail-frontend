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
import {ProjectThreads} from "@/components/project";
import {getProjectById, getProjectMembers} from "@/redux/projects/action-reducer";
import {getAllThreads} from "@/redux/threads/action-reducer";;
import {ProjectMessage} from "@/components/project/project-message";
import {addItemToGroup} from "@/redux/memberships/action-reducer";
import {Project} from "@/models";


function ProjectInbox() {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const {members, project} = useSelector((state: StateType) => state.projects);
    const {selectedThread, threads} = useSelector((state: StateType) => state.threads);
    const {selectedAccount} = useSelector((state: StateType) => state.accounts);

    const [size, setSize] = useState<number>(0);

    const router = useRouter();

    const dispatch = useDispatch();

    useEffect(() => {
        if (router.query.project) {
            let projectId = router.query.project as string;
            dispatch(getProjectById({ id: projectId}));
            dispatch(getProjectMembers({projectId: projectId}));
            dispatch(getAllThreads({ project: projectId, enriched: true, resetState: true}));
        }
    }, [dispatch, router.query.project])

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

    const inviteAccountToProject = useCallback( (item: Project | null) => {
        if (selectedAccount && selectedAccount.email) {
            let reqBody = {
                fromEmail: selectedAccount.email,
                toEmail: "",
                role: "member",
                groupType: 'project',
                groupId: item?.id
            }
            dispatch(addItemToGroup(reqBody))
        }
    }, [dispatch, selectedAccount]);

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
                               padding={'3px 6px'} borderRadius={'4px'} lineHeight={'1.19'}>{threads && threads.length} threads</Badge>
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
                    {((size < 991 && !selectedThread) || size > 991) &&
                    <ProjectThreads/>
                    }
                    <GridItem w='100%' flex={1}>
                        {((size < 991 && selectedThread) || size > 991) && <ProjectMessage/>}
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
                                    <Input p={0} h={'auto'} border={0} placeholder='Name or Email Address' size='xs'/>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'transparent'}
                                                    minWidth={'70px'} padding={0} height={'auto'} fontSize={'13px'}
                                                    color={'rgba(0,0,0, 0.5)'} as={Button}
                                                    rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                        <MenuList>
                                            <MenuItem>Admin</MenuItem>
                                        </MenuList>
                                    </Menu>
                                </Flex>
                                <Button className={styles.addMemberButton} backgroundColor={'#000000'} borderRadius={8}
                                        color={'#ffffff'} minWidth={'120px'} size='sm' onClick={() => inviteAccountToProject(project)}> 
                                        Add 
                                </Button>
                            </Flex>
                        </div>
                        <Flex direction={'column'} gap={4} pt={4}>
                            {members && !!members.length && members.map((member, index) => (
                                <Flex key={index+1} align={'center'} justify={'space-between'} gap={4}>
                                    <Flex align={'center'} gap={2}>
                                        <div className={styles.addMemberImage}>
                                            <Image src="/image/user.png" width="36" height="36" alt=""/>
                                        </div>
                                        <Text fontSize='sm' color={'#000000'}>{member.name}</Text>
                                    </Flex>
                                    <Menu>
                                        <MenuButton className={styles.memberButton} backgroundColor={'#E9E9E9'}
                                                    borderRadius={4} padding={'2px 4px '} height={'auto'}
                                                    fontSize={'12px'}
                                                    color={'#000000'} as={Button}
                                                    rightIcon={<ChevronDownIcon/>}> Member </MenuButton>
                                        <MenuList>
                                            <MenuItem>Remove</MenuItem>
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
