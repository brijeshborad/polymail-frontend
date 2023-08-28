import React, {useEffect} from "react";
import withAuth from "@/components/withAuth";
import {Badge, Button, Flex, Heading, Text} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {BlueStarIcon, DragIcon, LockIcon} from "@/icons";
import {useDispatch, useSelector} from "react-redux";
import {StateType} from "@/types";
import {getAllProjects} from "@/redux/projects/action-reducer";
import {useRouter} from "next/router";


function Index() {
    const {projects} = useSelector((state: StateType) => state.projects);
    const router = useRouter();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getAllProjects());

    }, [dispatch])


    return (
        <>
            <Flex direction={'column'} gap={7} maxWidth={'935px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'}
                  className={styles.projectListPage}>
                <Flex align={'center'} justify={'space-between'}>
                    <Heading as='h4' fontSize={'24px'} fontWeight={600} color={'#08162F'}>Projects <Badge
                        backgroundColor={'rgba(8, 22, 47, 0.04)'} fontSize={'14px'} color={'#08162F'}
                        padding={'3px 6px'}>4</Badge></Heading>
                    <Button className={styles.createProjectButton} color={'#ffffff'} backgroundColor={'#000000'}
                            h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'} padding={'10px 20px'}>Create
                        Project</Button>
                </Flex>
                <Flex align={'center'} direction={'column'} gap={3}>
                    {projects && projects.length > 0 && projects.map((project, index) => (
                        <Flex key={index+1} width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'}
                              justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8}
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
        </>
    )
}

export default withAuth(Index);
