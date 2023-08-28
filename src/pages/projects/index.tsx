import React, {ChangeEvent, useEffect, useState} from "react";
import withAuth from "@/components/withAuth";
import {
    Badge,
    Button,
    Flex,
    Heading,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {BlueStarIcon, DragIcon, LockIcon} from "@/icons";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import { getAllProjects} from "@/redux/projects/action-reducer";
import {useRouter} from "next/router";
// import {isUndefined} from "util";
import {Project} from "@/models";
import {SpinnerUI} from "@/components/common";
import CreateNewProject from "@/components/project/create-new-project";
// import {POSITION_GAP} from "@/utils/common.functions";


function Index() {
    const {isLoading, projects} = useSelector((state: StateType) => state.projects);
    const {isOpen, onOpen, onClose} = useDisclosure();
    const router = useRouter();
    const dispatch = useDispatch();
    // const {selectedAccount} = useSelector((state: StateType) => state.accounts);
    // const {selectedOrganization} = useSelector((state: StateType) => state.organizations);
    // const [projectName, setProjectName] = useState<string>('');

    useEffect(() => {
        dispatch(getAllProjects());

    }, [dispatch])

    const [itemList, setItemList] = useState<Project[]>([]);

    useEffect(() => {
        if (projects && projects.length) {
            setItemList(projects)
        }
    }, [projects])

    const handleDragStart = (index: number, e: ChangeEvent | any) => {
        e.dataTransfer.setData('index', index);
    };

    const handleDragOver = (e: ChangeEvent | any) => {
        e.preventDefault();
    };

    const handleDrop = (e: ChangeEvent | any, dropIndex: number) => {
        // const handleDrop = (items: Project[], index: number, excludedId: Project, e: ChangeEvent | any) => {
        // const filteredItems = isUndefined(excludedId) ? items : items.filter((item) => item.id !== excludedId.id);
        //
        // if (isUndefined(index)) {
        //     const lastItem = filteredItems[filteredItems.length - 1];
        //
        //     return (lastItem ? lastItem.position : 0) + POSITION_GAP;
        // }
        //
        // const prevItem = filteredItems[index - 1];
        // const nextItem = filteredItems[index];
        //
        // const prevPosition = prevItem ? prevItem.position : 0;
        //
        // if (!nextItem) {
        //     return prevPosition + POSITION_GAP;
        // }
        // return e.dataTransfer.setData('index', prevPosition + (nextItem.position - prevPosition) / 2);

        const draggedIndex = +e.dataTransfer.getData('index');
        const draggedItem = itemList[draggedIndex];

        const newItems = (itemList || []).filter((_, index) => index !== draggedIndex);
        newItems.splice(dropIndex, 0, draggedItem);

        setItemList(newItems);
    };

    // const handleChange = (event: ChangeEvent | any) => {
    //     setProjectName(event.target.value);
    // }
    //
    // const addNewProject = () => {
    //     if (projectName.length === 0) {
    //         Toaster({desc: 'Please enter the project\'s name',title: 'Add Project Name', type: 'error'})
    //         return;
    //     }
    //     if (!selectedAccount) {
    //         Toaster({desc: 'Your account is not created',title: 'Add Account', type: 'error'})
    //         return;
    //     }
    //
    //     if (!selectedOrganization) {
    //         Toaster({desc: 'Your organization is not created',title: 'Add Organization', type: 'error'})
    //         return;
    //     }
    //
    //     if (selectedAccount && selectedOrganization) {
    //         let body = {
    //             name: projectName,
    //             accountId: selectedAccount.id,
    //             organizationId: selectedOrganization.id
    //         }
    //         dispatch(createProjects(body));
    //     }
    //     setProjectName('')
    //     onClose()
    // }

    return (
        <>
            <Flex direction={'column'} gap={7} maxWidth={'935px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'}
                  className={styles.projectListPage}>
                <Flex align={'center'} justify={'space-between'}>
                    <Heading as='h4' fontSize={'24px'} fontWeight={600} color={'#08162F'}>Projects <Badge
                        backgroundColor={'rgba(8, 22, 47, 0.04)'} fontSize={'14px'} color={'#08162F'}
                        padding={'3px 6px'}>{projects && projects.length}</Badge></Heading>
                    <Button className={styles.createProjectButton} color={'#ffffff'} backgroundColor={'#000000'} onClick={onOpen}
                            h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'} padding={'10px 20px'}>Create
                        Project</Button>
                </Flex>
                {isLoading && <SpinnerUI/>}
                <Flex align={'center'} direction={'column'} gap={3}>
                    {itemList && itemList.length > 0 && itemList.map((project: Project, index: number) => (
                        <Flex key={index+1} width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'}
                              justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8}
                              draggable
                              onDragStart={(e) => handleDragStart(index, e)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              border={'1px solid rgba(8, 22, 47, 0.14)'} onClick={() => router.push(`/projects/${project.id}`)}>

                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'}>{project.name}</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'}
                                       color={'rgba(8, 22, 47, 0.7)'} lineHeight={'1'} borderRadius={50}
                                       padding={'4px 6px'}>5 threads</Badge>
                                <Badge backgroundColor={'rgba(0, 0, 0, 0.03)'} fontSize={'12px'} color={'#000000'}
                                       lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>
                            </Flex>

                            <Flex align={'center'} gap={2}>
                                <Flex className={styles.memberImages}>
                                    <div className={styles.memberPhoto}>
                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                    </div>
                                    <div className={styles.memberPhoto}>
                                        <Image src="/image/user.png" width="24" height="24" alt=""/>
                                    </div>
                                    <div className={styles.memberPhoto}>
                                        6
                                    </div>
                                </Flex>
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50}
                                      backgroundColor={'rgba(33, 68, 120, 0.1)'}>
                                    <LockIcon/>
                                </Flex>
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50}
                                      backgroundColor={'rgba(8, 22, 47, 0.05)'}>
                                    <BlueStarIcon/>
                                </Flex>
                                <Flex className={styles.dragIcon}>
                                    <DragIcon/>
                                </Flex>
                            </Flex>
                        </Flex>
                    ))}

                </Flex>
            </Flex>

            <CreateNewProject onOpen={onOpen} isOpen={isOpen} onClose={onClose}/>
        </>
    )
}

export default withAuth(Index);
