import React from "react";
import withAuth from "@/components/withAuth";
import {Badge, Flex, Text, Heading, Button} from "@chakra-ui/react";
import styles from "@/styles/project.module.css";
import Image from "next/image";
import {BlueStarIcon, DragIcon, LockIcon} from "@/icons";


function Index() {
    return (
            <>
                <Flex direction={'column'} gap={7} maxWidth={'935px'} padding={'27px 20px'} margin={'0 auto'} w={'100%'}>
                    <Flex align={'center'} justify={'space-between'}>
                        <Heading as='h4' fontSize={'24px'} fontWeight={600} color={'#08162F'}>Projects <Badge backgroundColor={'#E9F0FE'} fontSize={'14px'} color={'#266DF0'} padding={'3px 6px'}>4</Badge></Heading>
                        <Button color={'#ffffff'} backgroundColor={'#266DF0'} h={'auto'} borderRadius={'8px'} fontSize={'14px'} fontWeight={'500'} padding={'10px 20px'}>Create Project</Button>
                    </Flex>
                    <Flex align={'center'} direction={'column'} gap={3}>
                        <Flex width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'} justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8} border={'1px solid rgba(8, 22, 47, 0.14)'}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'} >Handcrafted Frozen Mouse</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'} color={'#08162F'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>5 threads</Badge>
                                <Badge backgroundColor={'rgba(38, 109, 240, 0.1)'} fontSize={'12px'} color={'#266DF0'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>
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
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(38, 109, 240, 0.1)'}>
                                    <BlueStarIcon/>
                                </Flex>
                                <Flex className={styles.dragIcon}>
                                    <DragIcon />
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'} justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8} border={'1px solid rgba(8, 22, 47, 0.14)'}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'} >Disney Launch</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'} color={'#08162F'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>3 threads</Badge>
                                <Badge backgroundColor={'rgba(38, 109, 240, 0.1)'} fontSize={'12px'} color={'#266DF0'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>
                            </Flex>

                            <Flex align={'center'} gap={2}>
                                {/*<Flex className={styles.memberImages}>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        6*/}
                                {/*    </div>*/}
                                {/*</Flex>*/}
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(33, 68, 120, 0.1)'} className={styles.lockIcon}>
                                    <LockIcon />
                                </Flex>
                                <Flex className={styles.borderStar} align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(38, 109, 240, 0.1)'}>
                                    <BlueStarIcon/>
                                </Flex>
                                <Flex className={styles.dragIcon}>
                                    <DragIcon />
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'} justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8} border={'1px solid rgba(8, 22, 47, 0.14)'}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'} >Generic Plastic Car</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'} color={'#08162F'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>8 threads</Badge>
                                {/*<Badge backgroundColor={'rgba(38, 109, 240, 0.1)'} fontSize={'12px'} color={'#266DF0'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>*/}
                            </Flex>

                            <Flex align={'center'} gap={2}>
                                {/*<Flex className={styles.memberImages}>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        6*/}
                                {/*    </div>*/}
                                {/*</Flex>*/}
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(33, 68, 120, 0.1)'} className={styles.lockIcon}>
                                    <LockIcon />
                                </Flex>
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(38, 109, 240, 0.1)'}>
                                    <BlueStarIcon/>
                                </Flex>
                                <Flex className={styles.dragIcon}>
                                    <DragIcon />
                                </Flex>
                            </Flex>
                        </Flex>
                        <Flex width={'100%'} className={styles.projects} cursor={'pointer'} align={'center'} justify={'space-between'} gap={3} padding={5} backgroundColor={'#ffffff'} borderRadius={8} border={'1px solid rgba(8, 22, 47, 0.14)'}>
                            <Flex align={'center'} gap={2}>
                                <div className={styles.projectIcon}>
                                    <Image src="/image/handcraft.png" width="24" height="24" alt=""/>
                                </div>
                                <Text fontSize='md' color={'#08162F'} fontWeight={'600'} >Handcrafted Frozen Mouse</Text>
                                <Badge backgroundColor={'rgba(8, 22, 47, 0.05)'} fontSize={'12px'} color={'#08162F'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>3 threads</Badge>
                                {/*<Badge backgroundColor={'rgba(38, 109, 240, 0.1)'} fontSize={'12px'} color={'#266DF0'} lineHeight={'1'} borderRadius={50} padding={'4px 6px'}>2 updates</Badge>*/}
                            </Flex>

                            <Flex align={'center'} gap={2}>
                                {/*<Flex className={styles.memberImages}>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        <Image src="/image/user.png" width="24" height="24" alt=""/>*/}
                                {/*    </div>*/}
                                {/*    <div className={styles.memberPhoto}>*/}
                                {/*        6*/}
                                {/*    </div>*/}
                                {/*</Flex>*/}
                                <Flex align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(33, 68, 120, 0.1)'} className={styles.lockIcon}>
                                    <LockIcon />
                                </Flex>
                                <Flex className={styles.borderStar} align={'center'} justify={'center'} h={'24px'} w={'24px'} borderRadius={50} backgroundColor={'rgba(38, 109, 240, 0.1)'}>
                                    <BlueStarIcon/>
                                </Flex>
                                <Flex className={styles.dragIcon}>
                                    <DragIcon />
                                </Flex>
                            </Flex>
                        </Flex>
                    </Flex>
                </Flex>
            </>
    )
}

export default withAuth(Index);
